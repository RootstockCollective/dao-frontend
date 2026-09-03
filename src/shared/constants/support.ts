/**
 * Predefined support ticket topics shown in the support modal and validated
 * server-side. Single source of truth shared by the client form and the
 * `/api/support/ticket` route.
 */
export const SUPPORT_TOPICS = ['Connecting my wallet', 'Staking', 'Proposals', 'Rewards', 'Other'] as const

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]
