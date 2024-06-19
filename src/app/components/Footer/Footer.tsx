import { FaGithub, FaSlack, FaXTwitter } from "react-icons/fa6"

interface Props {}

export const Footer = ({}: Props) => {
  const year = new Date().getFullYear()
  return (
    <footer className="m-2 footer">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-white">
            Built by DAO21 Foundation 
          </span>
          <span className="text-xs text-white opacity-50">
            Copyright © {year} DAO21 Foundation. All rights reserved.
          </span>
        </div>
        <ul className="flex flex-wrap items-center mt-3 text-xs font-medium sm:mt-0">
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">
              About RootstockLabs
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">
              Help
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">
              Terms & Conditions
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Documentation
            </a>
          </li>
        </ul>
        <div className="flex flex-wrap items-center">
          <a href="#">
            <FaXTwitter className="me-2" size={'1.5em'} />
          </a>
          <a href="#">
            <FaGithub className="me-2" size={'1.5em'} />
          </a>
          <a href="#">
            <FaSlack size={'1.5em'}/>
          </a>
        </div>
      </div>
    </footer>
  )
}
