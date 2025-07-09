interface Props extends React.PropsWithChildren {
  errorMsg?: string
}

export function ErrorMessage({ children, errorMsg }: Props) {
  return (
    <div>
      {children}
      {errorMsg && <p className="font-rootstock-sans text-xs text-error">{errorMsg}</p>}
    </div>
  )
}
