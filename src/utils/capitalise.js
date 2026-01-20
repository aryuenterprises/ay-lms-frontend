/**
 * Capitalizes the first letter of each sentence in a string
 * @param {string} str - Input string
 * @returns {string} String with capitalized sentences
 */
export function Capitalise(str) {
  if (!str || typeof str !== 'string') return str || '';

  // Split into sentences (handling common punctuation)
  return str
    .toLowerCase()
    .split(/([.!?]\s+)/)
    .map((sentence, i) => {
      if (i % 2 === 0) {
        // This is a sentence part
        return sentence.length > 0 ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence;
      }
      return sentence; // This is punctuation/space
    })
    .join('');
}

/**
 * Alternative: Capitalize first letter of the entire string
 */
// export function capitaliseFirst(str) {
//   if (!str) return str;
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }
