interface Props extends React.PropsWithChildren {
  errorMsg?: string
  dataTestId?: string
}

export function ErrorMessage({ children, errorMsg, dataTestId }: Props) {
  return (
    <div>
      {children}
      {errorMsg && (
        <p className="font-rootstock-sans text-xs text-error/60" data-testid={dataTestId}>
          {errorMsg}
        </p>
      )}
    </div>
  )
}
