export function cleanTitle(title: string): string {
    if (!title) return "";

    // 1️⃣ Drop the course-code prefix (first word) when title has more than one word.
    //    "AQA Day 0" → "Day 0"; single-word titles like "AQA" stay untouched.
    let cleaned = title.includes(" ")
      ? title.slice(title.indexOf(" ") + 1)
      : title;

    // 2️⃣ Remove module/week/day codes: M1, M1W1, M1W1D1, M1 W1 D1, M1W1:D1, etc.
    cleaned = cleaned
      .replace(/\bM\d+(\s*W\d+)?(\s*D\d+)?\b[:\-]?\s*/gi, "")
      .trim();

    // 3️⃣ Collapse duplicate spaces
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

    // 4️⃣ Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }