export type Vote = 'for' | 'against' | 'abstain'

export const VOTES_MAP_REVERSE = new Map([
  ['against', 0],
  ['for', 1],
  ['abstain', 2],
])

export const VOTES_MAP = new Map([
  [0, 'against'],
  [1, 'for'],
  [2, 'abstain'],
])
