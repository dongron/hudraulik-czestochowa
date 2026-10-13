import {describe, expect, it} from 'vitest'

import {formatReviewerName, isShortReviewerName} from './reviewerName'

// Reviewers are shown only as first name + first letter of the last name (spec 007, D6).
describe('formatReviewerName', () => {
  it('shortens first and last name to "First L."', () => {
    expect(formatReviewerName('Angelika Kowalska')).toBe('Angelika K.')
  })

  it('keeps a single-word name as it is', () => {
    expect(formatReviewerName('Filip')).toBe('Filip')
  })

  it('ignores middle names', () => {
    expect(formatReviewerName('Anna Maria Nowak')).toBe('Anna N.')
  })

  it('uses the first letter of a double surname', () => {
    expect(formatReviewerName('Agnieszka Nowak-Kowalska')).toBe('Agnieszka N.')
  })

  it('capitalises lowercase names and keeps Polish letters', () => {
    expect(formatReviewerName('łukasz żak')).toBe('Łukasz Ż.')
  })

  it('trims and collapses whitespace', () => {
    expect(formatReviewerName('  Filip   Wójcik ')).toBe('Filip W.')
  })
})

describe('isShortReviewerName', () => {
  it('accepts a first name with an initial', () => {
    expect(isShortReviewerName('Angelika K.')).toBe(true)
  })

  it('accepts a single first name', () => {
    expect(isShortReviewerName('Filip')).toBe(true)
  })

  it('accepts Polish letters', () => {
    expect(isShortReviewerName('Łukasz Ż.')).toBe(true)
  })

  it('rejects a full surname', () => {
    expect(isShortReviewerName('Angelika Kowalska')).toBe(false)
  })

  it('rejects an initial without a dot', () => {
    expect(isShortReviewerName('Angelika K')).toBe(false)
  })

  it('rejects lowercase names', () => {
    expect(isShortReviewerName('angelika k.')).toBe(false)
  })

  it('rejects an empty name', () => {
    expect(isShortReviewerName('')).toBe(false)
  })
})
