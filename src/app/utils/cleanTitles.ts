export function cleanTitle(title: string): string {
    if (!title) return "";
  
    // 1️⃣ Remove all possible course/day/week/lesson codes
    // Matches: M1, M1W1, M1W1D1, M1 W1 D1, M1W1:D1, M1W1 - D1, etc.
    let cleaned = title
      .replace(/\bM\d+(\s*W\d+)?(\s*D\d+)?\b[:\-]?\s*/gi, "")
      .trim();
  
    // 2️⃣ Remove duplicate spaces
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  
    // 3️⃣ Capitalize first letter (optional)
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  
    return cleaned;
  }