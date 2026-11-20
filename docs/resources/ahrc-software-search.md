# AHRC Research Software and Data Search

Search AHRC-funded software, technical products, research databases and models recorded in UKRI Gateway to Research. Useful repository and DOI links will be highlighted in the results. 

This is a proof-of-concept tool, using [v3 of the Gateway to Research (GTR) API](https://gtr.ukri.org/find-research-and-innovation/getting-started-with-the-gtr-api), which allows developers to get the data used to show content on [https://gtr.ukri.org/](https://gtr.ukri.org/). For feedback, contact <ccpahc@durham.ac.uk>.

<div id="gtr-search-app">

  <form id="gtr-search-form">

    <div class="gtr-search-fields">

      <div>
        <label for="gtr-query">Free text</label>
        <input
          id="gtr-query"
          type="search"
          placeholder="Software, workflow, database, project or topic"
        >
      </div>

      <div>
        <label for="gtr-limit">Total result limit</label>
        <select id="gtr-limit">
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100" selected>100</option>
          <option value="250">250</option>
        </select>

        <div class="gtr-hint">
          Caps list results and detail requests.
        </div>
      </div>

    </div>

    <fieldset>
      <legend>Outcome types</legend>

      <div class="gtr-checks">

        <label>
          <input
            id="gtr-software-type"
            type="checkbox"
            checked
          >
          Software and Technical Product
        </label>

        <label>
          <input
            id="gtr-database-type"
            type="checkbox"
            checked
          >
          Research Database and Model
        </label>

      </div>

      <div
        id="gtr-type-error"
        class="gtr-hint"
        aria-live="polite"
      >
        Select one or both outcome types.
      </div>

    </fieldset>

    <div class="gtr-actions">

      <button
        id="gtr-search-button"
        type="submit"
      >
        Search outcomes
      </button>

      <button
        id="gtr-clear-button"
        type="button"
      >
        Clear
      </button>

    </div>

  </form>

  <div
    id="gtr-status"
    role="status"
    aria-live="polite"
  ></div>

  <div id="gtr-summary"></div>

  <div id="gtr-sort-controls" hidden>

    <label for="gtr-sort-by">
      Sort results
    </label>

    <select id="gtr-sort-by">
      <option value="outcome">Outcome date</option>
      <option value="start">Grant start</option>
      <option value="end">Grant end</option>
    </select>

    <select
      id="gtr-sort-order"
      aria-label="Sort order"
    >
      <option value="desc">Newest first</option>
      <option value="asc">Oldest first</option>
    </select>

  </div>

  <div id="gtr-results"></div>

</div>