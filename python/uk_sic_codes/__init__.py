"""Fast, zero-dependency UK SIC 2007 code lookup, search, and validation.

Built by BORSCH.AI — https://borsch.ai
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from .data import CODES, DIVISION_TO_SECTION, SECTIONS

__version__ = "1.0.0"
__all__ = [
    "SICCode",
    "SICSection",
    "lookup",
    "search",
    "validate",
    "list_section",
    "list_division",
    "tree",
    "sections",
    "count",
]


@dataclass(frozen=True, slots=True)
class SICCode:
    code: str
    description: str
    section: str
    section_name: str
    division: str
    group: str
    class_code: str


@dataclass(frozen=True, slots=True)
class SICSection:
    letter: str
    name: str
    divisions: list[str]
    codes: list[str]


def _normalize(raw: str) -> Optional[str]:
    cleaned = re.sub(r"[\s.\-/]", "", raw.strip())
    if not cleaned.isdigit():
        return None
    if len(cleaned) == 4:
        cleaned = "0" + cleaned
    if len(cleaned) != 5:
        return None
    return cleaned


def _build(code: str) -> Optional[SICCode]:
    desc = CODES.get(code)
    if desc is None:
        return None
    div = code[:2]
    sec = DIVISION_TO_SECTION.get(div, "")
    return SICCode(
        code=code,
        description=desc,
        section=sec,
        section_name=SECTIONS.get(sec, ""),
        division=div,
        group=code[:3],
        class_code=code[:4],
    )


def lookup(code: str) -> Optional[SICCode]:
    """Look up a SIC code by its 4 or 5 digit code."""
    n = _normalize(code)
    if n is None:
        return None
    return _build(n)


def search(query: str, limit: int = 20) -> list[SICCode]:
    """Search SIC codes by keyword with relevance scoring."""
    q = query.strip().lower()
    if not q:
        return []

    terms = q.split()
    scored: list[tuple[float, str]] = []

    for code, desc in CODES.items():
        dl = desc.lower()
        score = 0.0
        for term in terms:
            if term in dl:
                score += 1.0
                pattern = r"(?:^|[\s,;:()\-/])" + re.escape(term)
                if re.search(pattern, dl):
                    score += 0.5
                words = re.split(r"[\s,;:()\-/]+", dl)
                if term in words:
                    score += 0.5
        if score > 0:
            scored.append((score, code))

    scored.sort(key=lambda x: (-x[0], x[1]))
    return [_build(code) for _, code in scored[:limit]]


def validate(code: str) -> bool:
    """Check if a string is a valid UK SIC 2007 code."""
    n = _normalize(code)
    return n is not None and n in CODES


def list_section(letter: str) -> list[SICCode]:
    """Get all SIC codes in a section (A-U)."""
    letter = letter.strip().upper()
    if letter not in SECTIONS:
        return []
    return [
        _build(code)
        for code, _ in sorted(CODES.items())
        if DIVISION_TO_SECTION.get(code[:2]) == letter
    ]


def list_division(division: str) -> list[SICCode]:
    """Get all SIC codes in a 2-digit division."""
    div = division.strip().zfill(2)
    if div not in DIVISION_TO_SECTION:
        return []
    return [_build(code) for code in sorted(CODES) if code[:2] == div]


def tree() -> list[SICSection]:
    """Get full hierarchical tree of all sections, divisions, and codes."""
    result = []
    for letter in sorted(SECTIONS):
        divs = sorted({d for d, s in DIVISION_TO_SECTION.items() if s == letter})
        codes = sorted(c for c in CODES if DIVISION_TO_SECTION.get(c[:2]) == letter)
        result.append(SICSection(letter=letter, name=SECTIONS[letter], divisions=divs, codes=codes))
    return result


def sections() -> list[dict[str, str]]:
    """Get all 21 section letters and names."""
    return [{"letter": k, "name": v} for k, v in sorted(SECTIONS.items())]


def count() -> int:
    """Total number of SIC codes in the database."""
    return len(CODES)
