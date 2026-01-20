export const formatDateforInput = (dateString) => {
  // Handle cases where input is already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Try different separator patterns
  const patterns = [
    // DD-MM-YYYY or MM-DD-YYYY (we'll assume DD-MM-YYYY by default)
    /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/,
    // YYYY-MM-DD with other separators
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/,
    // Month name formats (like "Jan 25, 2022")
    /^([a-zA-Z]{3,}) (\d{1,2}), (\d{4})$/,
    // Timestamps or other ISO formats
    /^(\d{4})-(\d{2})-(\d{2})T/
  ];

  for (const pattern of patterns) {
    const match = dateString.match(pattern);
    if (match) {
      let day, month, year;

      if (pattern === patterns[0]) {
        // DD-MM-YYYY or MM-DD-YYYY
        // This is ambiguous - assuming DD-MM-YYYY
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        year = match[3];
      } else if (pattern === patterns[1]) {
        // YYYY-MM-DD with other separators
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      } else if (pattern === patterns[2]) {
        // Month name format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = match[1].substring(0, 3);
        const monthIndex = monthNames.findIndex((m) => m.toLowerCase() === monthName.toLowerCase());
        if (monthIndex === -1) continue;

        month = String(monthIndex + 1).padStart(2, '0');
        day = match[2].padStart(2, '0');
        year = match[3];
      } else if (pattern === patterns[3]) {
        // ISO format
        const date = new Date(dateString);
        year = String(date.getFullYear());
        month = String(date.getMonth() + 1).padStart(2, '0');
        day = String(date.getDate()).padStart(2, '0');
      }

      return `${year}-${month}-${day}`;
    }
  }

  // If no pattern matched, try creating a Date object
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If all else fails, return the original string or throw an error
  console.warn(`Could not parse date string: ${dateString}`);
  return dateString;
};
