#!/usr/bin/env python3
"""
Common resources, functions and data used by the make_* python scripts
"""

import yaml
from schema import Schema, And, Or, Optional, SchemaError

# Path constants
DATA_PATH = "docs/data/hpc-sites.yaml"
IGNORE_PATH = ".lycheeignore"


def validate_sites(sites_data) -> bool:
    """
    Validate sites match schema
    return: boolean
    raises: SchemaError
    """
    site_schema = {
        "name": And(
            str,
            len,
            error="'name' must be a non-empty string.",
        ),
        "url": And(
            str,
            lambda s: s.startswith("http"),
            error="'url' must start with http or https.",
        ),
        "tier": And(
            int,
            lambda n: n > 0,
            error="'tier' must be a positive integer.",
        ),
        "link_check_exclude": Or(
            bool,
            And(
                str,
                lambda s: s in {"path", "domain", "base_url"},
            ),  # type: ignore
            error="'link_check_exclude' must be [True, False, or one of 'path', 'domain', 'base_url'].",
        ),
        Optional("search"): {
            "include": bool,
        },
    }

    sites_schema = Schema(
        {
            "sites": [site_schema],
            Optional("context"): {
                Optional("title"): str,
                Optional("description"): str,
                Optional("background_labels"): [str],
                Optional("look_and_feel"): {
                    Optional("logo"): str,
                    Optional("colors"): {
                        Optional(str): str,  # Allow any colour keys
                    },
                },
            },
        }
    )
    sites_schema.validate(sites_data)
    return sites_schema.is_valid(sites_data)


def load_sites_config(config_path) -> dict:  # pyright: ignore[reportReturnType]
    """Load the structured sites configuration from YAML."""
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    try:
        if validate_sites(config):
            print(f"Data valid: {config_path}")
            return config
    except SchemaError as e:
        raise e


if __name__ == "__main__":
    load_sites_config(DATA_PATH)
