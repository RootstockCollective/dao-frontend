import { UserTopLeftComponent } from './components/topPageHeader/pages'

export const disclaimerModalText = {
  modalTitle: 'DISCLAIMER',
  modalDescription: () => (
    <>
      The RootstockCollective has taken actions in order to prevent <br />
      access to any person located in the prohibited jurisdictions, <br />
      as mentioned in the{' '}
      <a
        href="https://wiki.rootstockcollective.xyz/Terms-of-Use-1041ca6b0b028041a0b1de60e2c16f3c"
        target="_blank"
        className="underline cursor-pointer"
      >
        Terms of Use
      </a>
      , including any person <br />
      located in the United States of America. Please note that <br />
      interaction with the dApp by any person or entity considered <br />
      a resident, or taxpayer in a prohibited jurisdiction, including <br />
      without limitation the United States of America, is forbidden. <br />
      Please{' '}
      <a
        href="https://wiki.rootstockcollective.xyz/Terms-of-Use-1041ca6b0b028041a0b1de60e2c16f3c"
        target="_blank"
        className="underline cursor-pointer"
      >
        read the terms and conditions
      </a>{' '}
      carefully before using <br />
      the RootstockCollective dApp.
    </>
  ),
}

// Define route patterns and their components
export const routePatterns = [
  { pattern: /^(\/|\/user)$/, component: <UserTopLeftComponent /> },
  { pattern: /^\/communities/, component: null },
  // Add more patterns as needed
]
