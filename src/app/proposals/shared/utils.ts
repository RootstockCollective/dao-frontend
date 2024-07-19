export interface EventArgumentsParameter {
  args: {
    description: string
    proposalId: bigint
    voteStart: bigint
    voteEnd: bigint
    proposer: string
    targets: string[]
    values: bigint[]
  }
  timeStamp: string
}

export const getEventArguments = ({
  args: { description, proposalId, proposer, targets, values },
  timeStamp,
}: EventArgumentsParameter) => ({
  name: description.split(';')[0],
  proposer,
  description: description.split(';')[1],
  proposalId: proposalId.toString(),
  Starts: new Date(parseInt(timeStamp, 16) * 1000).toISOString().split('T')[0],
  transferTo: targets[0] ?? '',
  transferToValue: values[0] ?? '',
})
