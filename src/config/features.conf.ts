const features = {
  user_flags: 'Allows users to enable certain flags',
  v2_rewards: 'Brings voting to builders',
  v3_design: 'Use the new v3 koto-based design',
  the_graph: 'Use the graph protocol for data collection',
} as const

export type Feature = keyof typeof features
export const getFeatures = (): Feature[] => [...Object.keys(features)] as Feature[]
