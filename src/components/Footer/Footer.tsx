import { FaGithub, FaSlack, FaXTwitter } from 'react-icons/fa6'

interface Props {
  brand: string
}

export const Footer = ({ brand }: Props) => {
  const year = new Date().getFullYear()
  return (
    <footer className="m-2">
      <div className="w-full p-4 flex items-center justify-between font-bold">
        <div className="flex flex-col">
          <p className="text-xs text-white">
            Built by <span className="text-sm">{brand}</span> 
          </p>
          <span className="text-[0.5rem] text-white opacity-50">
            Copyright © {year} {brand}. All rights reserved.
          </span>
        </div>
        <div className="flex flex-1 justify-center items-center flex-row text-xs">
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
            <FaSlack size={'1.5em'}/>
          </a>
        </div>
      </div>
    </footer>
  )
}
