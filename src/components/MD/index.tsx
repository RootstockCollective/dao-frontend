import Markdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Header, Paragraph } from '../Typography'
import { Link } from '../Link'
import { cn } from '@/lib/utils'
import { Divider } from '../Divider'

const disallowedElements = ['img'] satisfies string[]
const mb = 'mb-6 last:mb-0'

const defaultComponents: Components = {
  p: props => <Paragraph className={mb} variant="body" {...props} />,
  h1: props => <Header variant="h1" className={mb} {...props} />,
  h2: props => <Header variant="h2" className={mb} {...props} />,
  h3: props => <Header variant="h3" className={mb} {...props} />,
  h4: props => <Header variant="h4" className={mb} {...props} />,
  a: ({ href, ...props }) => (
    <Link className={mb} href={href ?? '#'} target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: props => <ul className={cn(mb, 'list-disc list-inside space-y-1')} {...props} />,
  ol: props => <ol className={cn(mb, 'list-decimal list-inside space-y-1')} {...props} />,
  li: props => <li className="ml-4" {...props} />,
  hr: props => <Divider className="my-4" {...props} />,
  code: props => <code className="px-1.5 py-0.5 bg-background-800 rounded text-sm font-mono" {...props} />,
  pre: props => <pre className={cn(mb, 'p-4 bg-background-800 rounded overflow-x-auto')} {...props} />,
  blockquote: props => (
    <blockquote className={cn(mb, 'pl-4 border-l-4 border-accent-500 italic')} {...props} />
  ),
  table: props => (
    <div className={cn(mb, 'w-full overflow-x-auto')}>
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: props => <thead className="border-b border-b-text-60" {...props} />,
  tbody: props => (
    <tbody
      className="[&>tr:hover]:bg-text-80 [&>tr:hover]:text-bg-100 [&>tr]:transition-colors [&>tr]:duration-200"
      {...props}
    />
  ),
  tr: props => <tr className="border-b border-b-bg-60" {...props} />,
  th: props => (
    <th
      className="px-3 md:px-4 pb-3 md:pb-5 text-left font-semibold font-rootstock-sans text-sm"
      {...props}
    />
  ),
  td: props => <td className="px-3 md:px-4 py-3 md:py-5 text-sm md:text-base" {...props} />,
}

export function MD({ children, className, ...props }: Options & { className?: string }) {
  return (
    <div className={cn('text-base text-text-100', className)}>
      <Markdown
        disallowedElements={disallowedElements}
        components={defaultComponents}
        remarkPlugins={[remarkGfm]}
        {...props}
      >
        {children}
      </Markdown>
    </div>
  )
}
