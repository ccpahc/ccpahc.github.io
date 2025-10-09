"""
Common resources, functions and data used by the make_* python scripts
"""

import yaml

# Path constants
DATA_PATH = "docs/data/hpc-sites.yaml"
IGNORE_PATH = ".lycheeignore"


def load_sites_config(config_path):
    """Load the structured sites configuration from YAML."""
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
    return config
