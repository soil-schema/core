
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
    .split(/[\s\-]+/)
    .map(sentence => sentence.trim())
    .map(sentence => sentence.substring(0, 1).toUpperCase() + sentence.substring(1))
    .join(typeof options.separator == 'string' ? options.separator : ' ');
}

export const sentence = function(path: string | undefined): string {
  if (typeof path == 'undefined') return ''
  return path
    .split('/')
    .filter(sentence => sentence)
    .join(' ');
}