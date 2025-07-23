import { ProposalDetailTopLeftComponent, ProposalsTopLeftComponent } from './components/topPageHeader/pages'
import { HeaderTitle } from '@/components/Typography'

export const disclaimerModalText = {
  modalTitle: 'DISCLAIMER',
  modalDescription: () => (
    <>
      Please note that interaction with the dApp by any person or entity <br />
      considered a resident, or taxpayer in a prohibited jurisdiction, <br />
      including without limitation the United States of America, <br />
      is forbidden. Please{' '}
      <a
        href="https://wiki.rootstockcollective.xyz/Terms-of-Use-1041ca6b0b028041a0b1de60e2c16f3c"
        target="_blank"
        className="underline cursor-pointer"
      >
        read the terms and conditions
      </a>{' '}
      carefully <br /> before using the RootstockCollective dApp.
    </>
  ),
}

// Define route patterns and their components
export const routePatterns = [
  { pattern: /^\/communities/, component: <HeaderTitle variant="h1">COMMUNITIES</HeaderTitle> },
  { pattern: /^\/proposals\/\d+$/, component: <ProposalDetailTopLeftComponent /> },
  { pattern: /^\/proposals$/, component: <ProposalsTopLeftComponent /> },
  { pattern: /^\/delegate$/, component: <HeaderTitle variant="h1">DELEGATION</HeaderTitle> },
  { pattern: /^\/treasury$/, component: <HeaderTitle variant="h1">TREASURY</HeaderTitle> },
  // Add more patterns as needed
]
