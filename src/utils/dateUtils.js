/**
 * Formats a date into a readable date & time string.
 * @param {Date|string} date - The date to format. If not provided, returns empty string or current date based on options.
 * @param {Object} [options] - Optional formatting options.
 * @param {boolean} [options.includeTime=true] - Whether to include time in the output.
 * @param {boolean} [options.includeSeconds=false] - Whether to include seconds in the time.
 * @param {boolean} [options.timeOnly=false] - Whether to output only time.
 * @param {boolean} [options.useCurrentIfEmpty=false] - Whether to use current date/time if no date is provided.
 * @param {string} [options.fallback=''] - Fallback value to return if date is invalid/empty.
 * @returns {string} Formatted date-time string or fallback value.
 */

import format from '../config';

export const formatDateTime = (
  date,
  { includeTime = true, includeSeconds = false, timeOnly = false, useCurrentIfEmpty = false, fallback = '' } = {}
) => {
  let dateObj;

  // Handle undefined/null/empty date
  if (!date) {
    if (useCurrentIfEmpty) {
      dateObj = new Date();
    } else {
      return fallback;
    }
  }
  // Handle string time formats like "10:39:20"
  else if (typeof date === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(date)) {
    const [hours, minutes, seconds] = date.split(':').map(Number);
    dateObj = new Date();
    dateObj.setHours(hours, minutes, seconds || 0, 0);
  }
  // Handle Date objects
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Handle other date strings or timestamps
  else {
    dateObj = new Date(date);
  }

  // Check if the date is invalid
  if (isNaN(dateObj.getTime())) {
    return fallback;
  }

  // Parse format patterns from config
  const formatPattern = (pattern, date) => {
    const hours = date.getHours();
    const isPM = hours >= 12;

    const replacements = {
      yyyy: date.getFullYear(),
      yy: String(date.getFullYear()).slice(-2),
      MM: String(date.getMonth() + 1).padStart(2, '0'),
      M: date.getMonth() + 1,
      dd: String(date.getDate()).padStart(2, '0'),
      d: date.getDate(),
      HH: String(hours).padStart(2, '0'), // 24-hour, leading zero
      H: hours, // 24-hour, no leading zero
      hh: String(hours % 12 || 12).padStart(2, '0'), // 12-hour, leading zero
      h: hours % 12 || 12, // 12-hour, no leading zero
      mm: String(date.getMinutes()).padStart(2, '0'),
      m: date.getMinutes(),
      ss: String(date.getSeconds()).padStart(2, '0'),
      s: date.getSeconds(),
      a: isPM ? 'PM' : 'AM'
    };

    return pattern.replace(/(yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|a)/g, (match) => replacements[match] || match);
  };

  // Time only output
  if (timeOnly) {
    let timePattern = format.timeFormat;
    if (!includeSeconds) {
      timePattern = timePattern.replace(/:ss?/g, '');
      timePattern = timePattern.replace(/(^|\s)ss?(\s|$)/g, '$1$2');
      timePattern = timePattern.replace(/::/g, ':').replace(/(\s|^):|:(\s|$)/g, '$1$2');
    }
    return formatPattern(timePattern, dateObj);
  }

  if (includeTime) {
    const dateStr = formatPattern(format.dateFormat, dateObj);

    let timePattern = format.timeFormat;
    if (!includeSeconds) {
      timePattern = timePattern.replace(/[:\\/]?ss?/g, '');
      timePattern = timePattern.replace(/::/g, ':').replace(/:$/, '');
    }

    const timeStr = formatPattern(timePattern, dateObj);
    return `${dateStr} ${timeStr}`;
  } else {
    return formatPattern(format.dateFormat, dateObj);
  }
};
