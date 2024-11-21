import { Builder } from '../types'

export const isBuilderActive = (builder: Builder) => {
  return (
    builder.stateFlags?.communityApproved && builder.stateFlags?.kycApproved && !builder.stateFlags?.paused
  )
}
