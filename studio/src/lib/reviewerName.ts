// Reviewers are stored and shown only as first name + first letter of the last name,
// e.g. "Angelika K." (spec 007, D6). Used by Studio validation and the Google reviews import.

const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase('pl') + word.slice(1)

export function formatReviewerName(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  const first = capitalize(words[0])
  if (words.length === 1) return first

  const initial = words[words.length - 1].charAt(0).toLocaleUpperCase('pl')
  return `${first} ${initial}.`
}

const SHORT_NAME = /^\p{Lu}\p{Ll}+(?: \p{Lu}\.)?$/u

export function isShortReviewerName(name: string): boolean {
  return SHORT_NAME.test(name)
}
