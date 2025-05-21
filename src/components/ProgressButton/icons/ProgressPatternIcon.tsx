export const ProgressPatternIcon: React.FC<{ flip: boolean }> = ({ flip }) => (
  <svg
    width="106"
    height="48"
    viewBox="0 0 106 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={flip ? { transform: 'scaleY(-1)' } : undefined}
  >
    <path d="M0 44C0 46.2091 1.79086 48 4 48H58.2231V0H4C1.79086 0 0 1.79086 0 4V44Z" fill="#66605C" />
    <rect width="12" height="24" transform="matrix(1 0 0 -1 58 24)" fill="#66605C" />
    <rect width="12" height="12" transform="matrix(1 0 0 -1 58 48)" fill="#66605C" />
    <rect width="12" height="12" transform="matrix(1 0 0 -1 70 24)" fill="#66605C" />
    <rect width="12" height="12" transform="matrix(1 0 0 -1 70 36)" fill="#66605C" />
    <rect width="12" height="12" transform="matrix(1 0 0 -1 82 48)" fill="#66605C" />
    <rect width="12" height="12" transform="matrix(1 0 0 -1 94 36)" fill="#66605C" />
  </svg>
)
