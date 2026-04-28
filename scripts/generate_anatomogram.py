"""Generate the static BioBody anatomogram substrate.

Usage:
    python -m pip install pyanatomogram==0.1.1
    python scripts/generate_anatomogram.py

The React app consumes the generated SVG as a static asset; PyAnatomogram is
not required at browser runtime.
"""

from pathlib import Path

import pyanatomogram


OUT = Path("public/anatomogram-human.svg")

BASE_STYLE = {
    "fill": "#1f6f92",
    "fill-opacity": "0.16",
    "stroke": "#8feaff",
    "stroke-opacity": "0.22",
    "stroke-width": "0.55",
}

HIGHLIGHTS = {
    "brain": ("#64f0c8", "0.34"),
    "heart": ("#ff6f83", "0.42"),
    "lung": ("#62d7ff", "0.28"),
    "liver": ("#ffad4d", "0.36"),
    "stomach": ("#ffd36a", "0.28"),
    "spleen": ("#b990ff", "0.30"),
    "pancreas": ("#ffd36a", "0.34"),
    "kidney": ("#8fdcff", "0.28"),
    "small intestine": ("#ffd36a", "0.22"),
    "colon": ("#ffd36a", "0.22"),
    "adipose tissue": ("#ff72c8", "0.22"),
    "skeletal muscle": ("#77e7ff", "0.20"),
    "bone marrow": ("#64f0c8", "0.26"),
    "skin": ("#8feaff", "0.12"),
    "breast": ("#ff72c8", "0.26"),
    "thyroid gland": ("#64f0c8", "0.32"),
}


def main() -> None:
    anatomogram = pyanatomogram.Anatomogram("homo_sapiens.male")

    for tissue in anatomogram.get_tissue_names():
        anatomogram.set_tissue_style(tissue, **BASE_STYLE)

    for tissue, (fill, opacity) in HIGHLIGHTS.items():
        anatomogram.set_tissue_style(
            tissue,
            fill=fill,
            **{
                "fill-opacity": opacity,
                "stroke": "#d8fbff",
                "stroke-opacity": "0.46",
                "stroke-width": "0.8",
            },
        )

    anatomogram.save_svg(str(OUT))
    svg = OUT.read_text()
    svg = svg.replace(
        "<svg ",
        '<svg role="img" aria-label="PyAnatomogram homo sapiens anatomical substrate" ',
        1,
    )
    OUT.write_text(
        "<!-- Generated from PyAnatomogram 0.1.1 / EBI Expression Atlas anatomogram SVGs; used as a static visual substrate. -->\n"
        + svg
    )


if __name__ == "__main__":
    main()
