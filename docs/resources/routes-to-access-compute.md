There are a number of ways to access compute that might be relevant to CCP-AHC members. 

Please [contact the CCP-AHC team](../index.md#contact) if you are interested in receiving support in identifying the most suitable.

## Institutional and Regional

Many UK institutions that support teaching and research have some compute provision. This is typically provided by a research IT or "research computing" division if it exists, or by partnerships or the central IT function if it does not. 

CCP-AHC maintains an index of [institutional and regional compute sites](./sites.md). You can perform searches over the public-facing documentation for these sites to find the nearest or most relevant resource.

## National 

In some cases, it will benefit your case to recieve access to a national resource if you have already explored whether your application can make use of [regional or institutional compute](./sites.md).

### National Compute Resources (NCRs)

This information is based on the information made available by [HECBioSim](https://www.hecbiosim.org/access-hpc/ukri-ncrs), which is in turn presentations and other publications from the UKRI DRI team. 

The technical specifications and details of total allocation have been updated [based on information shared by UKRI in the context of its call for new computational communities](https://www.ukri.org/opportunity/uk-compute-roadmap-community-centres-of-excellence/). It is updated as of 19 November 2026 and the information is provided here on a best-effort basis.

#### History

UKRI has funded six National Compute Resources (NCRs) to date: Baskerville, Charger, Cirrus, Isambard 3, Mary Coombs and Zenith. Four are new or expanded systems announced in February 2026 (Cirrus, Charger, Baskerville NCR and Cambridge's Zenith). Isambard 3 and Mary Coombs are existing systems that UKRI folded into the NCR portfolio from April 2026. UKRI covers hardware and five years of service, up to 2031. These can be thought of as replacing the older "Tier 2" systems (e.g. Bede).

#### Access

There are some transitional access routes for former users of ARCHER2 (which is approaching end-of-service). Access to the NCRs will in part be co-ordinated by the new Community Centres of Excellence (CCEs). 

#### Overview of NCRs and capabilities

The NCRs are presented in alphabetical order by name.

| NCR | Host | Processor type | Main compute | Size | Vendor and interconnect | Memory | UKRI allocation per year |
|---|---|---|---|---|---|---|---|
| [Baskerville NCR](https://www.baskerville.ac.uk/) | University of Birmingham | GPU | NVIDIA B200 | 22 GPU nodes, 176 GPUs | Lenovo, liquid-cooled, 400 Gb/s interconnect | 2 TB per node | 1,464,672 GPU hours |
| [Charger NCR](https://www.ucl.ac.uk/life-sciences/news/ucl-host-ps195m-charger-supercomputing-facility-will-power-next-gen-life-sciences-research) | UCL (hosted at DataVita, Scotland) | CPU (x86) | 296 Intel Xeon processors across 148 CPU nodes, plus 8 NVIDIA RTX Pro 6000 visualisation GPUs (~850 additional CPU cores) | 37,888 CPU cores | HPE, 400 Gb/s Slingshot (?) interconnect, Cray storage | 6 GB per core | 315,303,936 core hours |
| [Cirrus NCR](https://www.cirrus.ac.uk/) | University of Edinburgh (EPCC) | CPU only (x86) | AMD EPYC 9825 “Turin”, two processors per node | 640 nodes, 184,320 CPU cores | HPE Cray EX4000, 200 Gb/s Slingshot 11 interconnect | 2.67 GB per core | 1,533,911,040 core hours |
| [Isambard 3 NCR](https://www.bristol.ac.uk/research/centres/bristol-supercomputing/) | University of Bristol (BriCS, with the GW4 universities) | CPU only (Arm) | NVIDIA Grace-Grace processors | 380 nodes, 54,720 CPU cores | HPE Cray XD224, 200 Gb/s interconnect, 2 PB Lustre storage | 1.67 GB per core | 455,379,840 core hours* |
| [Mary Coombs NCR](https://www.hartree.stfc.ac.uk/technologies/mary-coombs/) | STFC Hartree Centre, Daresbury | GPU | NVIDIA H100 | 157 GPU nodes, 628 GPUs | NDR200 InfiniBand interconnect | 0.5 TB per node | 5,226,216 GPU hours* |
| [Zenith NCR](https://docs.hpc.cam.ac.uk/hpc/user-guide/zenith-quickstart.html) | University of Cambridge | GPU | AMD Instinct MI355X, eight GPUs per node | NCR allocation: 28 GPU nodes, 224 GPUs | Dell PowerEdge XE9785L, 400 Gb/s interconnect | 2.3 TB per node | 1,864,128 GPU hours |

\* The UKRI allocation figures are indicative and may be subject to change. [Source](https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fwww.ukri.org%2Fwp-content%2Fuploads%2F2026%2F11%2FUKRI-10112026-OPP1457-UK-Compute-Roadmap-Communities-Centres-of-Excellence-Outline-Stage-Additional-Information.docx&wdOrigin=BROWSELINK) 

### AI Research Resource (AIRR) 

#### Gateway route

Designed for researchers from academia, industry, or other UK organisations, this route supports: first-time users of AI supercomputing resources; testing of (novel) algorithms, code, and workflows; benchmarking of algorithms, code, and workflows before applying for larger AIRR opportunities.

For more details, please read [the guidance available online](https://www.gov.uk/government/publications/ai-research-resource/airr-gateway-route-ukri-guidance).

### UKRI Access to high performance computing facilities (retired)

This opportunity provided an open and flexible route to computational support for high quality projects across the entire UK Research and Innovation (UKRI) remit. Applications that: involve early career researchers; onboard and train new users; significantly push the boundaries in computational research using high performance computing (HPC) in your field are encouraged. 

This application process is purely for compute resource for up to 12 months. No funding is available to successful applicants.

You must be based at a UK research organisation eligible for UKRI funding.

For more details, please read [the guidance available online](https://www.ukri.org/opportunity/access-to-high-performance-computing-facilities-spring-2025/) for a previous iteration of the call. These calls are typically open twice a year.

## International

### Galaxy 

[Galaxy](https://galaxyproject.org) is an infrastructure that provides research computing globally, predominantly through free-to-use services that are motivated by a strong focus on usability and reproducibility. Galaxy is a large project, and there a number of ways to get access to compute via this initative. Perhaps the easiest is to use the free instance at [UseGalaxy.eu](https://usegalaxy.eu/). The Galaxy community is growing and now includes a [Digital Humanities and Social Sciences Special Interest Group](https://galaxyproject.org/community/sig/digital-humanities/) (SIG). 

To get started with Galaxy for DH, you can check out [this tutorial by Daniela Schneider and Rand Zoabi](https://training.galaxyproject.org/training-material/topics/digital-humanities/tutorials/introduction_to_dh/tutorial.html), which is integrated with the compute resources offered by Galaxy. 

### European Open Science Cloud (EOSC) EU Node

The European Commission funds a compute and data storage service called the [EOSC EU Node](https://open-science-cloud.ec.europa.eu/). 

If you require non-commercial compute for more technical users (including Jupyter notebooks with GPUs for researchers), at the moment the Commission is giving away free credits at the time of writing (January 2026). 

Anyone at institutions at countries that are in or associated to Horizon Europe can sign on using their institutional credentials (via eduGAIN). We would appreciate your experience working with this service. Please contact <ccpahc@durham.ac.uk> for more detail. 
