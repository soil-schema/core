
/**
 * Capitalize string.
 * 
 * @param subject 
 * @returns capitalized string
 * @see https://github.com/panzerdp/voca/blob/master/src/case/capitalize.js
 */
export const capitalize = function(subject: string | undefined, options: { separator?: string } = {}): string {
  if (typeof subject == 'undefined') return ''
  if (subject == '') return '';
  return subject
    .toLocaleLowerCase()
    .split(/[\s\-\:]+/)
    .map(sentence => sentence.trim())
    .map(sentence => sentence.substring(0, 1).toUpperCase() + sentence.substring(1))
    .join(typeof options.separator == 'string' ? options.separator : ' ');
}

/**
 * Camelize string.
 * @param str 
 * @returns camelized string.
 */
export const camelize = function(str: string): string {
  return str.split(/[\s\-\_]/g).join(' ').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export const sentence = function(path: string | undefined): string {
  if (typeof path == 'undefined') return ''
  return path
    .split('/')
    .filter(sentence => sentence)
    .join(' ');
}