import { Paragraph } from '@/components/Typography/Paragraph'
import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { LuUsers } from 'react-icons/lu'
import { useRouter } from 'next/navigation'

export const JoinACommunity = () => {
  const router = useRouter()
  return (
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
        <Header className="mt-[42px] mb-[8px] text-[24px]">Join a Community</Header>
        <Paragraph variant="normal" className="text-center pb-[40px] text-[16px]">
          You&apos;re not currently part of any communities. Join a community to connect with like-minded
          individuals, participate in discussions, and gain access to exclusive content.
        </Paragraph>
        <Button onClick={() => router.push('/communities')}>Explore Communities</Button>
      </div>
    </div>
  )
}
