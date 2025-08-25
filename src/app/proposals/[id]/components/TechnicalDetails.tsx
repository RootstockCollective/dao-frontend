import { Header, Paragraph, Span } from '@/components/Typography'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'

interface TechnicalDetailsProps {
  snapshot: bigint | undefined
  proposalId: string
}

export const TechnicalDetails = ({ snapshot, proposalId }: TechnicalDetailsProps) => {
  return (
    <div className="w-full mt-2 bg-bg-80 p-6">
      <Header variant="h3" className="text-lg mb-2">
        TECHNICAL DETAILS
      </Header>
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <Paragraph variant="body-s" className="text-white/70" bold>
            Snapshot - taken at block
          </Paragraph>
          <Paragraph variant="body">{snapshot?.toString() || '—'}</Paragraph>
        </div>
        <div>
          <Paragraph variant="body-s" className="text-white/70" bold>
            Proposal ID
          </Paragraph>
          {proposalId ? <ShortenAndCopy value={proposalId} /> : <Span variant="body">—</Span>}
        </div>
      </div>
    </div>
  )
}
