import { TokenImage } from '@/components/TokenImage'
import { BaseTypography } from '@/components/Typography/Typography'
import { RBTC, RIF } from '@/lib/tokens'
import { ArrowRight } from 'lucide-react'

const rbtcImage = <TokenImage symbol={RBTC} size={26} className="inline-block mt-[-0.2rem]" />
const rifImage = <TokenImage symbol={RIF} size={24} className="inline-block mt-[-0.2rem]" />

// Export args directly for reuse
export const getRbtcArgs = {
  title: <span>GET {rbtcImage} RBTC</span>,
  description: "You need it to pay the DAO's gas fees",
  buttonText: 'Get RBTC',
  buttonOnClick: () => console.log('Get RBTC clicked!'),
}

export const getRifArgs = {
  title: <span>GET {rifImage} RIF</span>,
  description: "You need it to take part in the DAO's activities",
  buttonText: 'Get RIF',
  buttonOnClick: () => console.log('Get RIF clicked!'),
}

export const stakeRifArgs = {
  title: <span>STAKE {rifImage} RIF</span>,
  description: "Stake RIF so you can take part in Rootstock Collective's governance",
  buttonText: 'Stake RIF',
  buttonOnClick: () => console.log('Stake RIF clicked!'),
}

export const voteArgs = {
  title: 'VOTE',
  description: 'Vote on your first proposal... lorem ipsum dolor sit amet consectetur',
  buttonText: 'See proposals',
  buttonOnClick: () => console.log('See proposals clicked!'),
}

export const backArgs = {
  title: 'BACK',
  description: 'Back Builders... lorem ipsum dolor sit amet consectetur adipiscing elit',
  buttonText: 'See all Builders',
  buttonOnClick: () => console.log('See all Builders clicked!'),
}

export const submitKycArgs = {
  title: 'TAKE THE NEXT STEP',
  description: 'Your application to become a Builder is in progress. Submit your KYC now to speed things up.',
  buttonText: 'Submit KYC',
  buttonOnClick: () => console.log('Submit KYC clicked!'),
}

export const startBuildingArgs = {
  title: 'START BUILDING',
  description: 'You are now a Collective Builder, congratulations! Create a proposal or apply for a grant.',
  buttonText: 'See all Builders',
  buttonOnClick: () => console.log('See all Builders clicked!'),
}

export const currentCycleEndingSoonArgs = {
  title: 'CURRENT CYCLE ENDING SOON',
  description: (
    <BaseTypography size="sm" className="flex items-center gap-1">
      Learn how cycles work <ArrowRight />
    </BaseTypography>
  ),
  buttonOnClick: () => console.log('Learn more clicked!'),
  rightContent: (
    <BaseTypography variant="h1" className="text-white">
      23h 59m
    </BaseTypography>
  ),
}

export const cycleJustEndedArgs = {
  title: 'CYCLE JUST ENDED',
  description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
  buttonText: 'Claim Rewards',
  buttonOnClick: () => console.log('Claim Rewards clicked!'),
}

export const stepsListArgs = {
  title: 'TITLE ONLY IF NEEDED',
  description: (
    <div>
      <BaseTypography size="sm" className="mb-3">
        Lorem ipsum dolor sit amet consectetur adipiscing elit
      </BaseTypography>
      <ul className="space-y-2 list-disc list-inside">
        <li>
          <BaseTypography size="sm">
            step 1... lorem ipsum dolor sit amet, consectetur adipiscing elit
          </BaseTypography>
        </li>
        <li>
          <BaseTypography size="sm">
            step 2... proin suscipit scelerisque ipsum placerat velit sed quam
          </BaseTypography>
        </li>
        <li>
          <BaseTypography size="sm">step 3... venenatis, non commodo risus fringilla</BaseTypography>
        </li>
      </ul>
    </div>
  ),
  buttonText: 'CTA label',
  buttonOnClick: () => console.log('CTA label clicked!'),
}
