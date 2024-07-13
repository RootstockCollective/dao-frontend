export interface EventArgumentsParameter {
  args: {
    description: string
    proposalId: bigint
    voteStart: bigint
    voteEnd: bigint
    proposer: string
  }
  timeStamp: string
}

export const getEventArguments = ({
  args: { description, proposalId, proposer },
  timeStamp,
}: EventArgumentsParameter) => ({
  name: description.split(';')[0],
  proposer,
  description: description.split(';')[1],
  proposalId: proposalId.toString(),
  Starts: new Date(parseInt(timeStamp, 16) * 1000).toISOString().split('T')[0],
})
