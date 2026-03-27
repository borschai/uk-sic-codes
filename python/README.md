# uk-sic-codes

Fast, zero-dependency UK SIC 2007 code lookup, search, and validation for Python.

> Built by [BORSCH.AI](https://borsch.ai) — UK Business Intelligence Platform
> covering 5.9M companies with AI-powered risk scores and 50M+ government signals.

Also available as an [npm package](https://www.npmjs.com/package/uk-sic-codes) for Node.js/TypeScript.

## Installation

```bash
pip install uk-sic-codes
```

## Quick Start

```python
from uk_sic_codes import lookup, search, validate

# Look up a code
info = lookup("62012")
print(info.description)  # "Business and domestic software development"
print(info.section)       # "J"
print(info.section_name)  # "Information and Communication"

# Search by keyword
results = search("restaurant")
for r in results:
    print(f"{r.code}: {r.description}")

# Validate
validate("62012")  # True
validate("00000")  # False
```

## API

### `lookup(code: str) -> SICCode | None`

Look up a SIC code. Accepts 4 or 5 digit codes (auto-pads). Strips whitespace and punctuation.

```python
lookup("62012")   # SICCode(code="62012", description="Business and domestic software development", ...)
lookup("1110")    # Auto-pads to "01110"
lookup("62.01.2") # Strips dots
lookup("99999")   # Dormant Company
```

### `search(query: str, limit: int = 20) -> list[SICCode]`

Full-text keyword search with relevance scoring. Case-insensitive, multi-word support.

```python
search("software")          # Top 20 results
search("coal mining", 5)    # Top 5 results
```

### `validate(code: str) -> bool`

Check if a string is a valid UK SIC 2007 code.

```python
validate("62012")  # True
validate("00000")  # False
validate("abc")    # False
```

### `list_section(letter: str) -> list[SICCode]`

Get all codes in a section (A-U).

```python
codes = list_section("J")  # All Information & Communication codes
```

### `list_division(division: str) -> list[SICCode]`

Get all codes in a 2-digit division.

```python
codes = list_division("62")  # All IT codes
```

### `tree() -> list[SICSection]`

Full hierarchical tree of all 21 sections with their divisions and codes.

```python
for section in tree():
    print(f"{section.letter}: {section.name} ({len(section.codes)} codes)")
```

### `sections() -> list[dict]`

All 21 section letters and names.

### `count() -> int`

Total number of SIC codes (731).

## Data Types

```python
@dataclass
class SICCode:
    code: str           # 5-digit code, e.g. "62012"
    description: str    # Full description
    section: str        # Section letter (A-U)
    section_name: str   # Section name
    division: str       # 2-digit division
    group: str          # 3-digit group
    class_code: str     # 4-digit class

@dataclass
class SICSection:
    letter: str         # Section letter
    name: str           # Section name
    divisions: list[str]
    codes: list[str]
```

## Data Source

Based on the official ONS UK SIC 2007 condensed classification used by Companies House.
Full company data available at [borsch.ai](https://borsch.ai).

## License

MIT
