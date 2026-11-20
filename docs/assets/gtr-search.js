(() => {
  "use strict";

  const API = "https://gtr.ukri.org/api/v3";

  const TYPE_NAMES = {
    softwareAndTechnicalProduct: "Software and Technical Product",
    researchDatabaseAndModel: "Research Database and Model"
  };

  const PRIORITY_DOMAINS = [
    "github.com",
    "zenodo.org",
    "figshare.com",
    "figshare.org"
  ];

  function initialiseGtrSearch() {
    const root = document.querySelector("#gtr-search-app");

    // This script is loaded site-wide, so do nothing on pages
    // that don't contain the GtR application.
    if (!root) {
      return;
    }

    // Avoid accidentally attaching handlers twice.
    if (root.dataset.initialised === "true") {
      return;
    }

    root.dataset.initialised = "true";

    const get = selector => root.querySelector(selector);

    const form = get("#gtr-search-form");
    const queryInput = get("#gtr-query");
    const limitInput = get("#gtr-limit");

    const softwareType = get("#gtr-software-type");
    const databaseType = get("#gtr-database-type");
    const typeError = get("#gtr-type-error");

    const searchButton = get("#gtr-search-button");
    const clearButton = get("#gtr-clear-button");

    const status = get("#gtr-status");
    const summary = get("#gtr-summary");
    const sortControls = get("#gtr-sort-controls");
    const sortBy = get("#gtr-sort-by");
    const sortOrder = get("#gtr-sort-order");
    const results = get("#gtr-results");

    let controller = null;
    let currentRows = [];

    function setStatus(message, error = false) {
      status.textContent = message;
      status.dataset.error = error ? "true" : "false";
    }

    function selectedTypes() {
      const values = [];

      if (softwareType.checked) {
        values.push("softwareAndTechnicalProduct");
      }

      if (databaseType.checked) {
        values.push("researchDatabaseAndModel");
      }

      return values;
    }

    function buildParams() {
      const params = new URLSearchParams();
      const query = queryInput.value.trim();

      if (query) {
        params.set("query", query);
      }

      // This tool is intentionally restricted to AHRC outcomes.
      params.append("funder", "AHRC");

      // Repeated outcometype parameters are ORed within the facet.
      for (const type of selectedTypes()) {
        params.append("outcometype", type);
      }

      return params;
    }

    async function getJson(url, signal) {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        },
        signal
      });

      if (!response.ok) {
        throw new Error(
          `GtR API request failed (${response.status})`
        );
      }

      return response.json();
    }

    async function fetchOutcomeList(signal) {
      const limit = Math.max(
        20,
        Math.min(500, Number(limitInput.value) || 100)
      );

      // GtR v3 permits up to 100 JSON records per page.
      const size = Math.min(100, limit);
      const baseParams = buildParams();

      const requests = [];

      for (
        let page = 1;
        page <= Math.ceil(limit / size);
        page += 1
      ) {
        const params = new URLSearchParams(baseParams);

        params.set("page", String(page));
        params.set("size", String(size));

        requests.push(
          getJson(
            `${API}/outcomes?${params.toString()}`,
            signal
          )
        );
      }

      // Independent result pages can be fetched concurrently.
      const payloads = await Promise.all(requests);

      const first = payloads[0] || {};

      const total = Number(
        first.paging?.totalSize ??
        first.totals?.find(
          value => value.entity === "Outcome"
        )?.count ??
        0
      );

      const target = Math.min(
        limit,
        total || limit
      );

      const seen = new Set();
      const items = [];

      for (const payload of payloads) {
        for (const item of payload.outcomeList || []) {
          if (items.length >= target) {
            break;
          }

          const key = item.id || item.href;

          if (key && !seen.has(key)) {
            seen.add(key);
            items.push(item);
          }
        }

        if (items.length >= target) {
          break;
        }
      }

      return {
        items,
        total,
        limit
      };
    }

    async function fetchDetails(items, signal) {
      const queue = [...items];
      const detailMap = new Map();

      async function worker() {
        while (queue.length) {
          const item = queue.shift();

          if (!item?.id) {
            continue;
          }

          try {
            const detail = await getJson(
              `${API}/outcomes/${encodeURIComponent(item.id)}`,
              signal
            );

            detailMap.set(item.id, detail);
          } catch (error) {
            if (error.name === "AbortError") {
              throw error;
            }

            // A failed detail request shouldn't destroy the
            // corresponding list result.
            detailMap.set(item.id, null);
          }
        }
      }

      const workerCount = Math.min(
        6,
        items.length
      );

      await Promise.all(
        Array.from(
          { length: workerCount },
          () => worker()
        )
      );

      return detailMap;
    }

    function urlsInText(text) {
      const output = [];

      if (typeof text !== "string") {
        return output;
      }

      const matches =
        text.match(
          /https?:\/\/[^\s<>"'\]\[(){}]+/gi
        ) || [];

      for (let raw of matches) {
        raw = raw.replace(
          /[.,;:!?]+$/,
          ""
        );

        try {
          output.push(
            new URL(raw).href
          );
        } catch {
          // Ignore malformed URLs embedded in text.
        }
      }

      return output;
    }

    function meaningfulFields(item, detail) {
      const outcome =
        detail?.outcomeDetails ||
        detail ||
        {};

      const listItem =
        outcome.outcomeListItem ||
        item ||
        {};

      const common =
        outcome.outcomeCommon ||
        {};

      const fields = [
        listItem.title,
        listItem.description,
        common.supportingURL,
        common.impact
      ];

      // Inspect textual outcome-type-specific fields without
      // recursively harvesting arbitrary href/API fields.
      for (
        const [key, value]
        of Object.entries(outcome)
      ) {
        if (
          !key.endsWith("Detail") ||
          !value ||
          typeof value !== "object"
        ) {
          continue;
        }

        for (
          const field
          of Object.values(value)
        ) {
          if (typeof field === "string") {
            fields.push(field);
          }
        }
      }

      return fields;
    }

    function extractLinks(item, detail) {
      const seen = new Set();
      const output = [];

      for (
        const field
        of meaningfulFields(item, detail)
      ) {
        for (
          const href
          of urlsInText(field)
        ) {
          let url;

          try {
            url = new URL(href);
          } catch {
            continue;
          }

          // Don't surface GtR API plumbing as a research resource.
          if (
            url.hostname === "gtr.ukri.org" &&
            url.pathname.startsWith("/api/")
          ) {
            continue;
          }

          if (seen.has(url.href)) {
            continue;
          }

          seen.add(url.href);

          const host =
            url.hostname
              .toLowerCase()
              .replace(/^www\./, "");

          const priority =
            PRIORITY_DOMAINS.some(
              domain =>
                host === domain ||
                host.endsWith(`.${domain}`)
            );

          const doi =
            host === "doi.org";

          output.push({
            href: url.href,
            host,
            priority,
            doi,
            label:
              priority
                ? host
                : doi
                  ? "DOI"
                  : host
          });
        }
      }

      return output.sort(
        (a, b) =>
          Number(b.priority) -
            Number(a.priority) ||
          Number(b.doi) -
            Number(a.doi) ||
          a.host.localeCompare(b.host)
      );
    }

    function prettyDate(value) {
      if (!value) {
        return null;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return new Intl.DateTimeFormat(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      ).format(date);
    }

    function liveGtrUrl(path) {
      if (!path) {
        return null;
      }

      try {
        return new URL(
          path,
          "https://gtr.ukri.org"
        ).href;
      } catch {
        return null;
      }
    }

    function appendDescription(article, text) {
      if (!text) {
        return;
      }

      const words =
        text.trim().split(/\s+/);

      const section =
        document.createElement("div");

      section.className =
        "gtr-description";

      const paragraph =
        document.createElement("p");

      section.append(paragraph);

      if (words.length <= 50) {
        paragraph.textContent = text;
      } else {
        const preview =
          words
            .slice(0, 50)
            .join(" ") +
          "…";

        paragraph.textContent =
          preview;

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "gtr-description-toggle";

        button.textContent =
          "Show full description";

        button.setAttribute(
          "aria-expanded",
          "false"
        );

        button.addEventListener(
          "click",
          () => {
            const expanded =
              button.getAttribute(
                "aria-expanded"
              ) === "true";

            paragraph.textContent =
              expanded
                ? preview
                : text;

            button.textContent =
              expanded
                ? "Show full description"
                : "Show less";

            button.setAttribute(
              "aria-expanded",
              String(!expanded)
            );
          }
        );

        section.append(button);
      }

      article.append(section);
    }

    function appendMetadata(
      article,
      detail
    ) {
      const outcome =
        detail?.outcomeDetails ||
        {};

      const common =
        outcome.outcomeCommon ||
        {};

      const award =
        detail?.award ||
        {};

      const values = [
        [
          "Funding grant",
          award.projectTitle
        ],
        [
          "Outcome date",
          prettyDate(
            common.outcomeDate
          )
        ],
        [
          "Grant start",
          prettyDate(
            award.startDate
          )
        ],
        [
          "Grant end",
          prettyDate(
            award.endDate
          )
        ],
        [
          "Grant reference",
          award.grantRefNumber
        ]
      ];

      const metadata =
        document.createElement("div");

      metadata.className =
        "gtr-result-meta";

      for (
        const [label, value]
        of values
      ) {
        if (!value) {
          continue;
        }

        const item =
          document.createElement("div");

        const strong =
          document.createElement("strong");

        strong.textContent =
          `${label}: `;

        item.append(
          strong,
          document.createTextNode(value)
        );

        metadata.append(item);
      }

      if (metadata.childNodes.length) {
        article.append(metadata);
      }
    }

    function render(item, detail) {
      const outcome =
        detail?.outcomeDetails ||
        {};

      const listItem =
        outcome.outcomeListItem ||
        item;

      const award =
        detail?.award ||
        {};

      const article =
        document.createElement("article");

      article.className =
        "gtr-result";

      const heading =
        document.createElement("h2");

      heading.textContent =
        listItem?.title ||
        item.title ||
        "Untitled outcome";

      article.append(heading);

      const tags =
        document.createElement("div");

      tags.className =
        "gtr-tags";

      const type =
        listItem?.type ||
        item.type;

      const tagValues = [
        TYPE_NAMES[type] || type,
        "AHRC",
        item.publicationListItem
          ?.publicationType
      ].filter(Boolean);

      for (
        const value
        of tagValues
      ) {
        const tag =
          document.createElement("span");

        tag.className =
          "gtr-tag";

        tag.textContent =
          value;

        tags.append(tag);
      }

      article.append(tags);

      appendMetadata(
        article,
        detail
      );

      appendDescription(
        article,
        listItem?.description ||
        item.description
      );

      const extracted =
        extractLinks(
          item,
          detail
        );

      const featured =
        extracted.filter(
          link =>
            link.priority ||
            link.doi
        );

      const remainder =
        extracted.filter(
          link =>
            !link.priority &&
            !link.doi
        );

      if (featured.length) {
        const links =
          document.createElement("div");

        links.className =
          "gtr-links";

        for (
          const resource
          of featured
        ) {
          const anchor =
            document.createElement("a");

          anchor.className =
            resource.priority
              ? "gtr-chip gtr-chip-priority"
              : "gtr-chip";

          anchor.href =
            resource.href;

          anchor.target =
            "_blank";

          anchor.rel =
            "noopener noreferrer";

          anchor.textContent =
            resource.priority
              ? `★ ${resource.label}`
              : resource.label;

          links.append(anchor);
        }

        article.append(links);
      }

      if (remainder.length) {
        const details =
          document.createElement("details");

        details.className =
          "gtr-other-links";

        const detailsSummary =
          document.createElement("summary");

        detailsSummary.textContent =
          `Other extracted links (${remainder.length})`;

        const list =
          document.createElement("ul");

        for (
          const resource
          of remainder
        ) {
          const itemElement =
            document.createElement("li");

          const anchor =
            document.createElement("a");

          anchor.href =
            resource.href;

          anchor.target =
            "_blank";

          anchor.rel =
            "noopener noreferrer";

          anchor.textContent =
            resource.href;

          itemElement.append(anchor);
          list.append(itemElement);
        }

        details.append(
          detailsSummary,
          list
        );

        article.append(details);
      }

      const actions =
        document.createElement("div");

      actions.className =
        "gtr-card-actions";

      const destinations = [
        [
          "View outcome on Gateway to Research",
          liveGtrUrl(
            listItem?.uiPath ||
            item.uiPath
          )
        ],
        [
          "View funded project",
          liveGtrUrl(
            award.uiPath
          )
        ]
      ];

      for (
        const [label, href]
        of destinations
      ) {
        if (!href) {
          continue;
        }

        const anchor =
          document.createElement("a");

        anchor.className =
          "gtr-card-link";

        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel =
          "noopener noreferrer";

        anchor.textContent =
          `${label} ↗`;

        actions.append(anchor);
      }

      if (actions.childNodes.length) {
        article.append(actions);
      }

      return article;
    }

    function timestamp(row, field) {
      const outcome =
        row.detail?.outcomeDetails ||
        {};

      const award =
        row.detail?.award ||
        {};

      const value =
        field === "outcome"
          ? outcome.outcomeCommon
              ?.outcomeDate
          : field === "start"
            ? award.startDate
            : award.endDate;

      if (!value) {
        return null;
      }

      const valueAsTime =
        Date.parse(value);

      return Number.isNaN(valueAsTime)
        ? null
        : valueAsTime;
    }

    function renderRows() {
      const field =
        sortBy.value;

      const direction =
        sortOrder.value;

      const sorted =
        [...currentRows].sort(
          (a, b) => {
            const first =
              timestamp(a, field);

            const second =
              timestamp(b, field);

            // Missing dates always sort last.
            if (
              first == null &&
              second == null
            ) {
              return 0;
            }

            if (first == null) {
              return 1;
            }

            if (second == null) {
              return -1;
            }

            return direction === "asc"
              ? first - second
              : second - first;
          }
        );

      results.replaceChildren();

      for (const row of sorted) {
        results.append(
          render(
            row.item,
            row.detail
          )
        );
      }
    }

    async function search() {
      const types =
        selectedTypes();

      if (!types.length) {
        typeError.textContent =
          "Select at least one outcome type before searching.";

        typeError.dataset.error =
          "true";

        return;
      }

      typeError.textContent =
        "Select one or both outcome types.";

      typeError.dataset.error =
        "false";

      if (controller) {
        controller.abort();
      }

      controller =
        new AbortController();

      searchButton.disabled =
        true;

      results.replaceChildren();
      summary.textContent = "";
      sortControls.hidden = true;

      setStatus(
        "Fetching AHRC outcome records…"
      );

      try {
        const batch =
          await fetchOutcomeList(
            controller.signal
          );

        setStatus(
          `Inspecting ${batch.items.length} detailed outcome records…`
        );

        const detailMap =
          await fetchDetails(
            batch.items,
            controller.signal
          );

        currentRows =
          batch.items.map(
            item => ({
              item,
              detail:
                detailMap.get(item.id)
            })
          );

        sortControls.hidden =
          !batch.items.length;

        if (batch.items.length) {
          renderRows();
        } else {
          const empty =
            document.createElement(
              "p"
            );

          empty.textContent =
            "No matching outcomes. Try broader search terms or select both outcome types.";

          results.append(empty);
        }

        summary.textContent =
          `Showing ${batch.items.length.toLocaleString()} of ${(batch.total || batch.items.length).toLocaleString()} matches. Hard limit: ${batch.limit}.`;

        setStatus(
          "Search complete."
        );
      } catch (error) {
        if (
          error.name !==
          "AbortError"
        ) {
          setStatus(
            error.message,
            true
          );
        }
      } finally {
        searchButton.disabled =
          false;
      }
    }

    function clear() {
      form.reset();

      // Explicitly restore the defaults.
      softwareType.checked = true;
      databaseType.checked = true;
      limitInput.value = "100";

      if (controller) {
        controller.abort();
        controller = null;
      }

      currentRows = [];

      sortControls.hidden = true;

      results.replaceChildren();

      summary.textContent = "";

      typeError.textContent =
        "Select one or both outcome types.";

      typeError.dataset.error =
        "false";

      setStatus("");
    }

    form.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        search();
      }
    );

    clearButton.addEventListener(
      "click",
      clear
    );

    sortBy.addEventListener(
      "change",
      renderRows
    );

    sortOrder.addEventListener(
      "change",
      renderRows
    );
  }

  // Initial normal page load.
  initialiseGtrSearch();

  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      initialiseGtrSearch();
    });
  }
})();