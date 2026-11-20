(() => {
  "use strict";

  const API = "https://gtr.ukri.org/api/v3";

  const TYPE_NAMES = {
    softwareAndTechnicalProduct: "Software and Technical Product",
    researchDatabaseAndModel: "Research Database and Model"
  };

  const PRIORITY_DOMAINS = [
    "github.com",
    "gitlab.com",
    "zenodo.org",
    "figshare.com",
    "figshare.org",
    "osf.io",
    "codeberg.org"
  ];

  function initialiseGtrSearch() {
    const root = document.querySelector("#gtr-search-app");

    if (!root) {
      return;
    }

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

      params.append("funder", "AHRC");

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
        raw = raw.replace(/[.,;:!?]+$/, "");

        try {
          output.push(new URL(raw).href);
        } catch {
          // Ignore malformed URLs in outcome text.
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

        for (const field of Object.values(value)) {
          if (typeof field === "string") {
            fields.push(field);
          }
        }
      }

      return fields;
    }

    function normaliseResourceUrl(url) {
      const normalised = new URL(url.href);

      normalised.hash = "";

      if (
        normalised.pathname.length > 1 &&
        normalised.pathname.endsWith("/")
      ) {
        normalised.pathname =
          normalised.pathname.slice(0, -1);
      }

      return normalised.href;
    }

    function decodedPathParts(url) {
      return url.pathname
        .split("/")
        .filter(Boolean)
        .map(part => {
          try {
            return decodeURIComponent(part);
          } catch {
            return part;
          }
        });
    }

    function cleanLabelPart(value) {
      return value
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function resourceLabel(url, doi) {
      const host = url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

      const parts = decodedPathParts(url);

      if (host === "github.com") {
        if (parts.length >= 2) {
          return `GitHub · ${parts[0]}/${parts[1]}`;
        }

        return "GitHub";
      }

      if (host === "zenodo.org") {
        const recordIndex = parts.findIndex(
          part =>
            part === "record" ||
            part === "records"
        );

        if (
          recordIndex >= 0 &&
          parts[recordIndex + 1]
        ) {
          return `Zenodo · record ${parts[recordIndex + 1]}`;
        }

        if (parts.length) {
          return `Zenodo · ${cleanLabelPart(parts[parts.length - 1])}`;
        }

        return "Zenodo";
      }

      if (
        host === "figshare.com" ||
        host === "figshare.org" ||
        host.endsWith(".figshare.com") ||
        host.endsWith(".figshare.org")
      ) {
        const articleIndex = parts.findIndex(
          part => part === "articles"
        );

        if (
          articleIndex >= 0 &&
          parts[articleIndex + 1]
        ) {
          return `Figshare · ${cleanLabelPart(
            parts[articleIndex + 1]
          )}`;
        }

        if (parts.length) {
          return `Figshare · ${cleanLabelPart(
            parts[parts.length - 1]
          )}`;
        }

        return "Figshare";
      }

      if (doi) {
        const doiValue =
          url.pathname.replace(/^\/+/, "");

        return doiValue
          ? `DOI · ${doiValue}`
          : "DOI";
      }

      const finalPart = parts[parts.length - 1];

      if (
        finalPart &&
        finalPart.length <= 40 &&
        !/^[0-9a-f-]{30,}$/i.test(finalPart)
      ) {
        return `${host} · ${cleanLabelPart(finalPart)}`;
      }

      return host;
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

          if (
            url.hostname === "gtr.ukri.org" &&
            url.pathname.startsWith("/api/")
          ) {
            continue;
          }

          const normalisedHref =
            normaliseResourceUrl(url);

          if (seen.has(normalisedHref)) {
            continue;
          }

          seen.add(normalisedHref);

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
            href: normalisedHref,
            host,
            priority,
            doi,
            label: resourceLabel(url, doi)
          });
        }
      }

      return output.sort(
        (a, b) =>
          Number(b.priority) -
            Number(a.priority) ||
          Number(b.doi) -
            Number(a.doi) ||
          a.label.localeCompare(b.label)
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

      const words = text.trim().split(/\s+/);

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
          words.slice(0, 50).join(" ") + "…";

        paragraph.textContent = preview;

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "gtr-description-toggle";

        button.textContent =
          "Show more ↓";

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
                ? "Show more ↓"
                : "Show less ↑";

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

    function appendMetadata(article, detail) {
      const outcome =
        detail?.outcomeDetails || {};

      const common =
        outcome.outcomeCommon || {};

      const award =
        detail?.award || {};

      const metadata =
        document.createElement("div");

      metadata.className =
        "gtr-result-meta";

      if (award.projectTitle) {
        const row =
          document.createElement("div");

        const strong =
          document.createElement("strong");

        strong.textContent =
          "Funding grant: ";

        row.append(strong);

        const projectUrl =
          liveGtrUrl(award.uiPath);

        if (projectUrl) {
          const anchor =
            document.createElement("a");

          anchor.href = projectUrl;
          anchor.target = "_blank";
          anchor.rel =
            "noopener noreferrer";

          anchor.textContent =
            `${award.projectTitle} ↗`;

          row.append(anchor);
        } else {
          row.append(
            document.createTextNode(
              award.projectTitle
            )
          );
        }

        metadata.append(row);
      }

      const outcomeDate =
        prettyDate(common.outcomeDate);

      if (outcomeDate) {
        const row =
          document.createElement("div");

        const strong =
          document.createElement("strong");

        strong.textContent =
          "Outcome: ";

        row.append(
          strong,
          document.createTextNode(outcomeDate)
        );

        metadata.append(row);
      }

      const grantStart =
        prettyDate(award.startDate);

      const grantEnd =
        prettyDate(award.endDate);

      if (grantStart || grantEnd) {
        const row =
          document.createElement("div");

        const strong =
          document.createElement("strong");

        strong.textContent =
          "Grant: ";

        let grantPeriod;

        if (grantStart && grantEnd) {
          grantPeriod =
            `${grantStart} – ${grantEnd}`;
        } else if (grantStart) {
          grantPeriod =
            `from ${grantStart}`;
        } else {
          grantPeriod =
            `until ${grantEnd}`;
        }

        row.append(
          strong,
          document.createTextNode(grantPeriod)
        );

        metadata.append(row);
      }

      if (award.grantRefNumber) {
        const row =
          document.createElement("div");

        const strong =
          document.createElement("strong");

        strong.textContent =
          "Reference: ";

        row.append(
          strong,
          document.createTextNode(
            award.grantRefNumber
          )
        );

        metadata.append(row);
      }

      if (metadata.childNodes.length) {
        article.append(metadata);
      }
    }

    function render(item, detail) {
      const outcome =
        detail?.outcomeDetails || {};

      const listItem =
        outcome.outcomeListItem || item;

      const article =
        document.createElement("article");

      article.className =
        "gtr-result";

      const heading =
        document.createElement("h2");

      const title =
        listItem?.title ||
        item.title ||
        "Untitled outcome";

      const outcomeUrl =
        liveGtrUrl(
          listItem?.uiPath ||
          item.uiPath
        );

      if (outcomeUrl) {
        const anchor =
          document.createElement("a");

        anchor.href = outcomeUrl;
        anchor.target = "_blank";
        anchor.rel =
          "noopener noreferrer";

        anchor.textContent =
          `${title} ↗`;

        heading.append(anchor);
      } else {
        heading.textContent = title;
      }

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
        item.publicationListItem
          ?.publicationType
      ].filter(Boolean);

      for (const value of tagValues) {
        const tag =
          document.createElement("span");

        tag.className = "gtr-tag";
        tag.textContent = value;

        tags.append(tag);
      }

      if (tags.childNodes.length) {
        article.append(tags);
      }

      appendMetadata(article, detail);

      appendDescription(
        article,
        listItem?.description ||
        item.description
      );

      const extracted =
        extractLinks(item, detail);

      if (extracted.length) {
        const resourceSection =
          document.createElement("div");

        resourceSection.className =
          "gtr-resources";

        const resourceHeading =
          document.createElement("div");

        resourceHeading.className =
          "gtr-resources-heading";

        resourceHeading.textContent =
          "Resources and links";

        resourceSection.append(
          resourceHeading
        );

        const resourceLinks =
          document.createElement("div");

        resourceLinks.className =
          "gtr-links";

        for (const resource of extracted) {
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

          anchor.title =
            resource.href;

          anchor.textContent =
            resource.priority
              ? `★ ${resource.label}`
              : resource.label;

          resourceLinks.append(anchor);
        }

        resourceSection.append(
          resourceLinks
        );

        article.append(
          resourceSection
        );
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
            document.createElement("p");

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

  initialiseGtrSearch();

  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      initialiseGtrSearch();
    });
  }
})();