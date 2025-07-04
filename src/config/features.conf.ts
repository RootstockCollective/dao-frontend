const USER_FLAGS_FEATURE = 'user_flags'

const features = {
  [USER_FLAGS_FEATURE]: 'Allows users to enable certain flags',
  v2_rewards: 'Brings voting to builders',
  v3_design: 'Use the new v3 koto-based design',
  // TODO: Remove these once we have a feature flag for data source that handles multiple data sources
  use_the_graph: 'Use the graph protocol for data collection',
  use_state_sync: 'Use the state sync for data collection',
  debug_logs: 'Enable debug logs',
} as const

type Feature = keyof typeof features
const getFeatures = (): Feature[] => [...Object.keys(features)] as Feature[]

export { getFeatures, USER_FLAGS_FEATURE, type Feature }
