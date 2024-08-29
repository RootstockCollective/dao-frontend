import { BUILD_ID } from '@/lib/constants'
import { truncate } from '@/lib/utils'
import { FaGithub, FaSlack, FaXTwitter } from 'react-icons/fa6'

interface Props {
  brand?: string
  variant?: 'login' | 'container'
}

const DEFAULT_CONTAINER_CLASS = 'my-4'

const DEFAULT_LOGIN_CLASS = 'absolute'

const VARIANTS = {
  container: DEFAULT_CONTAINER_CLASS,
  login: DEFAULT_LOGIN_CLASS,
}

export const Footer = ({ brand = 'RootstockCollective', variant = 'login' }: Props) => {
  const year = new Date().getFullYear()
  return (
    <footer className={`bottom-4 w-full flex justify-around text-sm ${VARIANTS[variant]}`}>
      <div className="flex flex-col">
        <p className="text-xs text-white">
          Built by <span className="text-sm">{brand}</span>
        </p>
        <span className="text-[0.5rem] text-white opacity-50">
          Copyright © {year} {brand}. All rights reserved.
        </span>
        <span className="text-[0.5rem] text-white opacity-50">
          <a
            href={`https://github.com/rsksmart/dao-frontend/commit${BUILD_ID}'}`}
            className="hover:underline me-4 md:me-6"
            target="_blank"
          >
            Build ID:
            {BUILD_ID ? BUILD_ID.slice(0, 7) : ""}
          </a>
        </span>
      </div>
      <div className="flex justify-center items-center flex-row">
        <a href="#" className="hover:underline me-4 md:me-6">
          About Rootstock Labs
        </a>
        <a href="#" className="hover:underline me-4 md:me-6">
          Help
        </a>
        <a href="#" className="hover:underline me-4 md:me-6">
          Terms & Conditions
        </a>
        <a href="#" className="hover:underline">
          Documentation
        </a>
      </div>
      <div className="flex items-center">
        <a href="#">
          <FaXTwitter className="mr-4" size={'1.5em'} />
        </a>
        <a href="#">
          <FaGithub className="mr-4" size={'1.5em'} />
        </a>
        <a href="#">
          <FaSlack size={'1.5em'} />
        </a>
      </div>
    </footer>
  )
}
