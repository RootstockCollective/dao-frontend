import { BUILD_ID, ENV, GITHUB_ORG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { FaGithub, FaSlack, FaXTwitter } from 'react-icons/fa6'

interface Props {
  brand?: string
  variant?: 'login' | 'container'
}

const DEFAULT_CONTAINER_CLASS = 'm-5'

const DEFAULT_LOGIN_CLASS = 'absolute left-8 w-2/5 '

const VARIANTS = {
  container: DEFAULT_CONTAINER_CLASS,
  login: DEFAULT_LOGIN_CLASS,
}

export const Footer = ({ variant = 'login' }: Props) => (
  <footer className={cn('bottom-4 flex justify-between text-sm opacity-60', VARIANTS[variant])}>
    <div className="flex items-start">
      <a
        href={`https://github.com/${GITHUB_ORG}/dao-frontend/commit/${BUILD_ID}`}
        className="hover:underline me-4 md:me-6"
        target="_blank"
      >
        Build ID: {BUILD_ID ? BUILD_ID.slice(0, 7) : ''} ({ENV})
      </a>
    </div>
    {variant === 'container' && (
      <>
        <div className="flex items-start">
          <a href="#" className="hover:underline me-4 md:me-6">
            FAQs
          </a>
        </div>
        <div className="flex items-start">
          <a href="https://wiki.rootstockcollective.xyz" className="hover:underline me-4 md:me-6">
            Whitepaper
          </a>
        </div>
        <div className="flex items-start">
          <a href="https://gov.rootstockcollective.xyz" className="hover:underline">
            Discourse
          </a>
        </div>
      </>
    )}
    <div className="flex items-start justify-end">
      <a href="https://x.com/rootstockcoll">
        <FaXTwitter className="mr-4" size={'1.5em'} />
      </a>
      <a href={`https://github.com/${GITHUB_ORG}`}>
        <FaGithub className="mr-4" size={'1.5em'} />
      </a>
    </div>
  </footer>
)
