This is an index of public user documentation pages for a number of HPC sites, including many UK-based [Tier 3](https://docs.hpc.qmul.ac.uk/intro/#hpc-tiers) systems. If you would like to propose changes to this list, please [open a pull request](https://github.com/ccpahc/ccpahc.github.io/edit/main/docs/resources/sites.md) or [contact the project team](../index.md#contact).

It also includes a minimum viable product (MVP) for a cross-site full-text search over the documentation pages it knows about.

## Search

Try searching for “PyTorch” to find user guidance for running machine learning models on HPC sites in the UK, search “A100” to see which sites currently advertise this GPU accelerator, or search for “Ollama” to read more about running large-language models (LLMs) on academic HPC.

<script async src="https://cse.google.com/cse.js?cx=24dbd0233935742a7">
</script>
<div class="gcse-search"></div>

### Implementation note

Every week, the links in this page are [checked by a software called Lychee](https://github.com/lycheeverse/lychee). If a broken link is found, [an issue is automatically created](https://github.com/ccpahc/ccpahc.github.io/issues?q=is%3Aissue%20state%3Aopen%20%22Link%20Checker%22) on the repository containing the website sources.

This custom search engine is currently powered by Google's freemium [Programmable Search Engine](https://programmablesearchengine.google.com/). It implements a full-text web search using Google's web index that is restricted to only show results from URLs with prefixes derived from the documentation sites listed below (with some inclusions and exclusions).

Unfortunately, it is not possible to programmatically update the scope of the custom search engine as new sites are added.

## HPC Documentation Sites

{% macro hpc_site_table(sites) %}
| Institution | Documentation URL |
|------------|------------------|
{%- for site in sites %}
| {{ site.name }} | [{{ (( 
            site.url | replace("https://", "") | replace("http://", "") 
        ).split("/")[0]
    ).replace("www.", "", 1) 
}}]({{ site.url }}) |
{%- endfor %}
{% endmacro %}

### HEIs (Tier 3)
{{ hpc_site_table(sites | selectattr("tier", "eq", 3) | list) }}

### Consortia (Tiers 2 and 1)
{{ hpc_site_table(sites | selectattr("tier", "lt", 3) | list) }}

## About this prototype

The motivations behind making this information available in one place are as follows:

- Access to HPC by “non-traditional” users, such as those in the arts, humanities, and culture (AH&C) area starts with interactions with local sites, which are getting harder to discover thanks to the growth of university intranets;
- Often, the user documentation implicitly or explicitly describes software that is commonly used at that site, alongside useful insights gained from supporting that software;
- To facilitate detecting trends in the provision of user-facing documentation, such as the prevalence (at the time of writing) of MkDocs as a static site generator.

