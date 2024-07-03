import { Paragraph } from '@/components/Typography/Paragraph'
import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { LuUsers } from 'react-icons/lu'

export const JoinACommunity = () => (
  <div className="flex justify-center align-center">
    <div className="w-[506px] flex align-middle items-center flex-col">
      <div
        style={{
          boxShadow: '0px 0px 16.4px 0px rgba(123,87,252,0.68)',
          padding: 17,
          borderRadius: '30%',
          backgroundColor: 'white',
        }}
      >
        <LuUsers size={48} color="#665EF6" />
      </div>
      <Header className="mt-[42px] mb-[8px]">Join a Community</Header>
      <Paragraph variant="light" className="text-center pb-[40px] text-[20px]">
        You&apos;re not currently part of any communities. Join a community to connect with like-minded
        individuals, participate in discussions, and gain access to exclusive content.
      </Paragraph>
      <Button>Explore Communities</Button>
    </div>
  </div>
)
