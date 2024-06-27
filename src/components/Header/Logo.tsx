import classNames from 'classnames'

export const Logo = ({ className = '', textClassName = '' }) => {
  return (
    <div className={className}>
      <h1 className={classNames('text-4xl font-bold', textClassName)}>
        Rootstock
        <span className="text-primary">Collective</span>
      </h1>
    </div>
  )
}
