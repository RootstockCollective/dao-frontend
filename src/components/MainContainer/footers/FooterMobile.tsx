import { GithubIcon, TelegramIcon, TwitterXIcon } from '@/components/Icons'
import { BUILD_ID, ENV, GITHUB_ORG } from '@/lib/constants'

export function FooterMobile() {
  return (
    <footer className="flex flex-col space-y-6 py-6 text-sm border-t border-dark-gray text-warm-gray w-[90%] mx-auto">
      <div className=" flex flex-row justify-around items-center">
        <a
          href={`https://github.com/${GITHUB_ORG}/dao-frontend/commit/${BUILD_ID}`}
          className="hover:underline"
          target="_blank"
          data-testid="BuildIDLink"
        >
          Build ID: {BUILD_ID ? BUILD_ID.slice(0, 7) : ''} ({ENV})
        </a>
        <a
          href="https://wiki.rootstockcollective.xyz/RootstockCollective-FAQ-1031ca6b0b02808c95d3dcb5a0074f4b"
          className="hover:underline"
          target="_blank"
          data-testid="FAQsLink-mobile"
        >
          FAQs
        </a>
        <a
          href="https://wiki.rootstockcollective.xyz"
          className="hover:underline"
          target="_blank"
          data-testid="WhitepaperLink-mobile"
        >
          Whitepaper
        </a>
      </div>

      {/* Bottom: Social icons */}
      <div className="flex flex-row justify-center items-center space-x-3">
        <a href="https://x.com/rootstockcoll" target="_blank" data-testid="TwitterLink">
          <TwitterXIcon size={'1.4em'} />
        </a>
        <a href={`https://github.com/${GITHUB_ORG}`} target="_blank" data-testid="GithubLink">
          <GithubIcon size={'1.5em'} />
        </a>
        <a href="https://t.me/rootstockcollective" target="_blank" data-testid="TelegramLink">
          <TelegramIcon size={'1.5em'} />
        </a>
      </div>
    </footer>
  )
}
