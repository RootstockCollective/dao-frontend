import type { IconProps } from '@/components/Icons'

interface Props extends IconProps {
  highLighted?: boolean
}

export function BellIcon({ highLighted = true, ...props }: Props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 17.25V18C9 18.7956 9.31607 19.5587 9.87868 20.1213C10.4413 20.6839 11.2044 21 12 21C12.7956 21 13.5587 20.6839 14.1213 20.1213C14.6839 19.5587 15 18.7956 15 18V17.25"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.24939 9.75C5.24939 7.95979 5.96055 6.2429 7.22642 4.97703C8.49229 3.71116 10.2092 3 11.9994 3C13.7896 3 15.5065 3.71116 16.7724 4.97703C18.0382 6.2429 18.7494 7.95979 18.7494 9.75C18.7494 13.1081 19.5275 15.0563 20.1463 16.125C20.212 16.2388 20.2466 16.3679 20.2468 16.4993C20.2469 16.6308 20.2124 16.7599 20.1469 16.8739C20.0814 16.9878 19.9871 17.0825 19.8735 17.1485C19.7598 17.2145 19.6308 17.2495 19.4994 17.25H4.49939C4.36813 17.2492 4.23936 17.214 4.12598 17.1478C4.01259 17.0817 3.91855 16.9869 3.85326 16.8731C3.78797 16.7592 3.75371 16.6301 3.75391 16.4989C3.75411 16.3676 3.78876 16.2387 3.85439 16.125C4.47221 15.0563 5.24939 13.1072 5.24939 9.75Z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {highLighted && <circle cx="18" cy="6" r="4" fill="#F47A2A" />}
    </svg>
  )
}
