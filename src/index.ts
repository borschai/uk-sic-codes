import { CODES, SECTIONS, DIVISION_TO_SECTION } from "./data";

export interface SICCode {
  code: string;
  description: string;
  section: string;
  sectionName: string;
  division: string;
  group: string;
  classCode: string;
}

export interface SICSection {
  letter: string;
  name: string;
  divisions: string[];
  codes: string[];
}

/**
 * Look up a SIC code by its numeric string.
 * Accepts 4 or 5 digit codes (e.g. "6201" or "62012").
 * Returns null if the code is not found.
 */
export function lookup(code: string): SICCode | null {
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  const description = CODES[normalized];
  if (!description) return null;

  const division = normalized.slice(0, 2);
  const section = DIVISION_TO_SECTION[division];
  if (!section) return null;

  return {
    code: normalized,
    description,
    section,
    sectionName: SECTIONS[section] || "",
    division,
    group: normalized.slice(0, 3),
    classCode: normalized.slice(0, 4),
  };
}

/**
 * Search SIC codes by keyword. Returns matching codes sorted by relevance.
 * Case-insensitive. Matches against code descriptions.
 *
 * @param query - Search term (e.g. "restaurant", "software", "mining")
 * @param limit - Maximum number of results (default: 20)
 */
export function search(query: string, limit: number = 20): SICCode[] {
  if (!query || typeof query !== "string") return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [];

  const results: Array<{ entry: SICCode; score: number }> = [];

  for (const [code, description] of Object.entries(CODES)) {
    const lower = description.toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (lower.includes(term)) {
        score += 1;
        // Bonus for word-boundary match
        const wordRegex = new RegExp(`\\b${escapeRegex(term)}`, "i");
        if (wordRegex.test(description)) {
          score += 0.5;
        }
        // Bonus for exact word match
        const exactRegex = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
        if (exactRegex.test(description)) {
          score += 0.5;
        }
      }
    }

    if (score > 0) {
      const division = code.slice(0, 2);
      const section = DIVISION_TO_SECTION[division] || "";
      results.push({
        entry: {
          code,
          description,
          section,
          sectionName: SECTIONS[section] || "",
          division,
          group: code.slice(0, 3),
          classCode: code.slice(0, 4),
        },
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score || a.entry.code.localeCompare(b.entry.code));
  return results.slice(0, limit).map((r) => r.entry);
}

/**
 * Validate whether a string is a valid UK SIC 2007 code.
 * Accepts 4 or 5 digit codes.
 */
export function validate(code: string): boolean {
  const normalized = normalizeCode(code);
  if (!normalized) return false;
  return normalized in CODES;
}

/**
 * Get all codes belonging to a section (A-U).
 */
export function listSection(sectionLetter: string): SICCode[] {
  const letter = sectionLetter.toUpperCase();
  if (!(letter in SECTIONS)) return [];

  const results: SICCode[] = [];
  for (const [code, description] of Object.entries(CODES)) {
    const division = code.slice(0, 2);
    if (DIVISION_TO_SECTION[division] === letter) {
      results.push({
        code,
        description,
        section: letter,
        sectionName: SECTIONS[letter],
        division,
        group: code.slice(0, 3),
        classCode: code.slice(0, 4),
      });
    }
  }
  return results;
}

/**
 * Get all codes belonging to a division (2-digit prefix, e.g. "62" for IT).
 */
export function listDivision(divisionCode: string): SICCode[] {
  const div = divisionCode.padStart(2, "0").slice(0, 2);
  const section = DIVISION_TO_SECTION[div];
  if (!section) return [];

  const results: SICCode[] = [];
  for (const [code, description] of Object.entries(CODES)) {
    if (code.startsWith(div)) {
      results.push({
        code,
        description,
        section,
        sectionName: SECTIONS[section],
        division: div,
        group: code.slice(0, 3),
        classCode: code.slice(0, 4),
      });
    }
  }
  return results;
}

/**
 * Get the full SIC hierarchy: all sections with their codes.
 */
export function tree(): SICSection[] {
  const sectionMap: Record<string, { divisions: Set<string>; codes: string[] }> = {};

  for (const letter of Object.keys(SECTIONS)) {
    sectionMap[letter] = { divisions: new Set(), codes: [] };
  }

  for (const code of Object.keys(CODES)) {
    const division = code.slice(0, 2);
    const section = DIVISION_TO_SECTION[division];
    if (section && sectionMap[section]) {
      sectionMap[section].divisions.add(division);
      sectionMap[section].codes.push(code);
    }
  }

  return Object.entries(SECTIONS).map(([letter, name]) => ({
    letter,
    name,
    divisions: Array.from(sectionMap[letter]?.divisions || []).sort(),
    codes: (sectionMap[letter]?.codes || []).sort(),
  }));
}

/**
 * Get all section letters and names.
 */
export function sections(): Array<{ letter: string; name: string }> {
  return Object.entries(SECTIONS).map(([letter, name]) => ({ letter, name }));
}

/**
 * Get the total number of SIC codes in the database.
 */
export function count(): number {
  return Object.keys(CODES).length;
}

// -- Internal helpers --

function normalizeCode(input: string): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[\s\-\.\/]/g, "");
  if (!/^\d{4,5}$/.test(cleaned)) return null;
  return cleaned.padStart(5, "0");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
