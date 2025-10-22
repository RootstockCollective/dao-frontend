import { Paragraph, HeaderTitle } from '@/components/Typography'

export const disclaimerModalText = {
  modalTitle: 'DISCLAIMER',
  modalDescription: (
    <>
      <Paragraph>
        Please note that interaction with the dApp by any person or entity <br />
        considered a resident, or taxpayer in a prohibited jurisdiction, <br />
        including without limitation the United States of America, <br />
        is forbidden. Please{' '}
        <a
          href="https://wiki.rootstockcollective.xyz/Terms-of-Use-1041ca6b0b028041a0b1de60e2c16f3c"
          target="_blank"
          rel="noopener noreferrer"
          className="underline cursor-pointer"
          data-testid="TermsOfUseLink"
        >
          read the terms and conditions
        </a>{' '}
        carefully <br /> before using the RootstockCollective dApp.
      </Paragraph>
      <br />
      <Paragraph>
        The RootstockCollective Foundation does not gather or process any <br />
        personal data from the login credentials when connecting a wallet. <br />
        Please refer to the{' '}
        <a
          href="https://reown.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline cursor-pointer"
          data-testid="ReownPrivacyPolicyLink"
        >
          Reown Privacy Policy
        </a>{' '}
        for more information.
      </Paragraph>
    </>
  ),
}

// Define route patterns and their components
export const routePatterns = [
  //  NFT community pages don't have headers according to the design
  { pattern: /^\/communities\/nft\//, component: null },
  { pattern: /^\/communities/, component: <HeaderTitle variant="h1">COMMUNITIES</HeaderTitle> },
  { pattern: /^\/proposals$/, component: <HeaderTitle variant="h1">PROPOSALS</HeaderTitle> },
  { pattern: /^\/delegate$/, component: <HeaderTitle variant="h1">DELEGATION</HeaderTitle> },
  { pattern: /^\/treasury$/, component: <HeaderTitle variant="h1">TREASURY</HeaderTitle> },
  // Add more patterns as needed
]
