interface SharedGradientProps {
  id: string
}

export const SharedGradient = ({ id }: SharedGradientProps) => (
  <defs>
    <linearGradient id={id} x1="12.001" y1="2.50001" x2="7.71781" y2="21.5363" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFEE3" />
      <stop offset="0.245192" stopColor="#E88DFF" />
      <stop offset="1" stopColor="#FFBE70" />
    </linearGradient>
  </defs>
)
