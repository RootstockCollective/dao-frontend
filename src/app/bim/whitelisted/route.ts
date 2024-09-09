import { BuilderOffChainInfo } from '@/app/bim/types'

export async function GET() {
  const builders: BuilderOffChainInfo[] = [
    {
      name: 'Builder 1',
      joiningData: '2024-06-01',
      status: 'KYC Under Review',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x1234567890',
    },
    {
      name: 'Builder 2',
      joiningData: '2022-01-02',
      status: 'KYC Approved',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x2345678901',
    },
    {
      name: 'Builder 3',
      joiningData: '2022-01-03',
      status: 'Whitelisted',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x3456789012',
    },

    {
      name: 'Builder 4',
      joiningData: '2022-01-04',
      status: 'In progress',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x4567890123',
    },
    {
      name: 'Builder 5',
      joiningData: '2022-01-05',
      status: 'Whitelisted',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x5678901234',
    },
    {
      name: 'Builder 6',
      joiningData: '2022-01-06',
      status: 'In progress',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x6789012345',
    },
    {
      name: 'Builder 7',
      joiningData: '2022-01-07',
      status: 'Whitelisted',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x7890123456',
    },
    {
      name: 'Builder 8',
      joiningData: '2022-01-08',
      status: 'In progress',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x8901234567',
    },
    {
      name: 'Builder 9',
      joiningData: '2022-01-09',
      status: 'Whitelisted',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x9012345678',
    },
    {
      name: 'Builder 10',
      joiningData: '2022-01-10',
      status: 'In progress',
      proposalDescription: 'Lorem ipsum dolor sit amet',
      address: '0x0123456789',
    },
  ]

  return Response.json(builders)
}
