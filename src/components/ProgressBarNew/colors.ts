// color combinations for progress bar components
export type Color = string
// Type for gradient colors (matches AnimatedTilesProgress expectation)
export type GradientColors = Color | [Color] | [Color, Color] | [Color, Color, Color]

// Default colors for ProgressBar component
export const progressBarColors = ['#4B5CF0', '#F4722A', '#1BC47D']

// Default colors for ProgressButton component (original bg and gray gradient)
export const progressButtonColors = ['#25211E', '#66605C']
