# uk-sic-codes

Fast, zero-dependency UK SIC 2007 code lookup, search, and validation for Node.js and the browser.

> Built by [BORSCH.AI](https://borsch.ai) — UK Business Intelligence Platform
> covering 5.9M companies with AI-powered risk analysis and 50M+ government data signals.

[![npm version](https://img.shields.io/npm/v/uk-sic-codes.svg)](https://www.npmjs.com/package/uk-sic-codes)
[![PyPI version](https://img.shields.io/pypi/v/uk-sic-codes.svg)](https://pypi.org/project/uk-sic-codes/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Also available as a [Python package](https://pypi.org/project/uk-sic-codes/) (`pip install uk-sic-codes`).

## Features

- Complete UK SIC 2007 database (**731 codes**, 21 sections, 88 divisions)
- Fuzzy keyword search with relevance scoring
- Code validation (4 or 5 digit formats)
- Section and division browsing
- Full hierarchical tree
- Zero dependencies
- TypeScript types included
- Works in Node.js and the browser
- ESM and CommonJS support

## Installation

```bash
npm install uk-sic-codes
```

## Quick Start

```typescript
import { lookup, search, validate } from "uk-sic-codes";

// Look up a code
const code = lookup("62012");
// {
//   code: "62012",
//   description: "Business and domestic software development",
//   section: "J",
//   sectionName: "Information and Communication",
//   division: "62",
//   group: "620",
//   classCode: "6201"
// }

// Search by keyword
const results = search("restaurant");
// [
//   { code: "56101", description: "Licenced restaurants", ... },
//   { code: "56102", description: "Unlicenced restaurants and cafes", ... },
//   ...
// ]

// Validate a code
validate("62012"); // true
validate("00000"); // false
```

## API

### `lookup(code: string): SICCode | null`

Look up a SIC code by its numeric string. Accepts 4 or 5 digit codes.

```typescript
lookup("62012");  // Business and domestic software development
lookup("1110");   // Growing of cereals (auto-pads to 01110)
lookup("62.01.2"); // Also works (strips punctuation)
```

### `search(query: string, limit?: number): SICCode[]`

Search codes by keyword. Case-insensitive with relevance scoring.

```typescript
search("software");           // All software-related codes
search("coal mining");        // Multi-word search
search("manufacture", 5);     // Limit to 5 results
```

### `validate(code: string): boolean`

Check if a string is a valid UK SIC 2007 code.

```typescript
validate("62012");  // true
validate("99999");  // true (Dormant Company)
validate("abc");    // false
validate("00000");  // false
```

### `listSection(letter: string): SICCode[]`

Get all codes in a section (A-U).

```typescript
listSection("J");  // All Information and Communication codes
listSection("A");  // All Agriculture codes
```

### `listDivision(code: string): SICCode[]`

Get all codes in a 2-digit division.

```typescript
listDivision("62"); // IT activities (62011, 62012, 62020, 62030, 62090)
listDivision("56"); // Food service (56101, 56102, 56103, ...)
```

### `tree(): SICSection[]`

Get the full hierarchy: all sections with their divisions and codes.

```typescript
const hierarchy = tree();
// [
//   { letter: "A", name: "Agriculture...", divisions: ["01","02","03"], codes: [...] },
//   { letter: "B", name: "Mining...", divisions: ["05","06",...], codes: [...] },
//   ...
// ]
```

### `sections(): Array<{ letter: string; name: string }>`

Get all 21 section letters and names.

```typescript
sections();
// [
//   { letter: "A", name: "Agriculture, Forestry and Fishing" },
//   { letter: "B", name: "Mining and Quarrying" },
//   ...
// ]
```

### `count(): number`

Get the total number of codes in the database.

```typescript
count(); // 731
```

## Types

```typescript
interface SICCode {
  code: string;        // 5-digit code, e.g. "62012"
  description: string; // Full description
  section: string;     // Section letter, e.g. "J"
  sectionName: string; // Section name, e.g. "Information and Communication"
  division: string;    // 2-digit division, e.g. "62"
  group: string;       // 3-digit group, e.g. "620"
  classCode: string;   // 4-digit class, e.g. "6201"
}

interface SICSection {
  letter: string;      // Section letter
  name: string;        // Section name
  divisions: string[]; // 2-digit division codes
  codes: string[];     // All 5-digit codes in this section
}
```

## Data Source

Based on the official [UK SIC 2007 condensed list](https://resources.companieshouse.gov.uk/sic/) published by Companies House and the [Office for National Statistics](https://www.ons.gov.uk/methodology/classificationsandstandards/ukstandardindustrialclassificationofeconomicactivities/uksic2007).

## Need More Company Data?

This package provides SIC code lookup. For full UK company data — search, risk scores, director networks, government signals, and AI-powered analysis across 5.9 million companies — visit [borsch.ai](https://borsch.ai).

## License

MIT
