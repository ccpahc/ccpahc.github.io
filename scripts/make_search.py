#!/usr/bin/env python3
"""
Generate Google Custom Search Engine configuration files from structured data.

This script reads the documentation sites specification hpc-sites.yaml, and generates
the Annotations.xml required by Google's Programmable Search Engine.
"""
import argparse
from urllib.parse import urlparse
from xml.etree.ElementTree import Element, SubElement, tostring, ElementTree
from xml.dom import minidom
from datetime import datetime
from pathlib import Path

import config


def generate_timestamp():
    """
    Generate a timestamp in hex format similar to Google's format.

    Google uses a hex timestamp like 0x00063fed969dc323
    This is approximately: current time in microseconds since epoch
    """
    timestamp = int(datetime.now().timestamp() * 1000000)
    return hex(timestamp)


def url_to_pattern(url):
    """
    Convert a full URL to a Google Custom Search pattern.

    Examples:
        https://example.com/docs/ -> example.com/docs/*
        https://www.example.com/path -> www.example.com/path*
        https://example.com -> example.com/*

    Args:
        url: Full URL string

    Returns:
        URL pattern suitable for Google Custom Search
    """
    parsed = urlparse(url)
    domain = parsed.netloc
    path = parsed.path.rstrip("/")

    if path:
        # If there's a path, use it with wildcard
        return f"{domain}{path}/*"
    else:
        # If no path, just match the whole domain
        return f"{domain}/*"


def create_annotations_xml(sites_config):
    """
    Create the Annotations XML structure from sites configuration.

    Args:
        sites_config: Dictionary containing sites configuration

    Returns:
        ElementTree object with Annotations XML
    """
    root = Element("Annotations")

    for site in sites_config.get("sites", []):
        # Get search configuration with defaults
        search_config = site.get("search", {})
        if isinstance(search_config, dict):
            include = search_config.get("include", True)
        else:
            include = True

        # Skip if not included
        if not include:
            continue

        url = site.get("url")
        if not url:
            print(f"Warning: Site '{site.get('name', 'Unknown')}' has no URL, skipping")
            continue

        # Convert URL to pattern
        url_pattern = url_to_pattern(url)
        original_url = url if not url.endswith("/") else url + "*"
        if not original_url.endswith("*"):
            original_url += "*"

        # Get score if specified
        score = (
            search_config.get("score", 1.0) if isinstance(search_config, dict) else 1.0
        )

        # Create Annotation element
        annotation = SubElement(
            root,
            "Annotation",
            about=url_pattern,
            timestamp=generate_timestamp(),
            score=str(score),
        )

        # Add Label for inclusion
        SubElement(annotation, "Label", name="_include_")

        # Add AdditionalData with original URL
        SubElement(
            annotation, "AdditionalData", attribute="original_url", value=original_url
        )

    return ElementTree(root)


def prettify_xml(elem):
    """Return a pretty-printed XML string."""
    rough_string = tostring(elem, encoding="unicode")
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")


def save_xml_file(tree, output_path, add_xml_declaration=True):
    """
    Save XML tree to file with pretty formatting.

    Args:
        tree: ElementTree object
        output_path: Path to save the XML file
        add_xml_declaration: Whether to include XML declaration
    """
    # Get pretty XML string
    xml_string = prettify_xml(tree.getroot())

    # Write to file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(xml_string)

    print(f"Generated: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate Google Custom Search Engine configuration files"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="docs/data/hpc-sites.yaml",
        help="Path to sites configuration YAML file (default: docs/data/hpc-sites.yaml)",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=".",
        help="Output directory for XML files (default: current directory)",
    )

    args = parser.parse_args()

    # Load configuration
    print(f"Loading configuration from: {args.config}")
    sites_data = config.load_sites_config(args.config)

    # Create output directory if needed
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate files
    annotations_tree = create_annotations_xml(sites_data)
    annotations_path = output_dir / "Annotations.xml"
    save_xml_file(annotations_tree, annotations_path)

    print("\nGeneration complete!")
    print("\nNext steps:")
    print("1. Review the generated XML")
    print("2. Upload to Google Custom Search Engine")


if __name__ == "__main__":
    main()
