import Markdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Header, Paragraph } from '../Typography'
import { Link } from '../Link'
import { cn } from '@/lib/utils'
import { Divider } from '../Divider'

const disallowedElements = ['img'] satisfies string[]

const defaultComponents: Components = {
  p: props => <Paragraph variant="body" {...props} />,
  h1: props => <Header variant="h1" className="mb-2" {...props} />,
  h2: props => <Header variant="h2" className="mb-2" {...props} />,
  h3: props => <Header variant="h3" className="mb-2" {...props} />,
  h4: props => <Header variant="h4" className="mb-2" {...props} />,
  a: ({ href, ...props }) => <Link href={href ?? '#'} target="_blank" rel="noopener noreferrer" {...props} />,
  ul: props => <ul className="my-2 list-disc list-inside space-y-1" {...props} />,
  ol: props => <ol className="my-2 list-decimal list-inside space-y-1" {...props} />,
  li: props => <li className="ml-4" {...props} />,
  hr: props => <Divider className="my-4" {...props} />,
  code: props => <code className="px-1.5 py-0.5 bg-background-800 rounded text-sm font-mono" {...props} />,
  pre: props => <pre className="my-4 p-4 bg-background-800 rounded overflow-x-auto" {...props} />,
  blockquote: props => <blockquote className="my-4 pl-4 border-l-4 border-accent-500 italic" {...props} />,
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
