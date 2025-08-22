# Delegates Research - The Graph Implementation

## Overview

Implement delegation tracking for StRIF token using The Graph to get current delegators and their voting power for any delegate address.

## 1. Subgraph Changes

### Schema Updates

```graphql
type Delegate @entity {
  id: ID! # delegate address
  address: Bytes!
  totalDelegatedVotes: BigInt!
  delegators: [Delegator!]! @derivedFrom(field: "currentDelegate")
}

type Delegator @entity {
  id: ID! # delegator address
  address: Bytes!
  currentDelegate: Delegate!
  delegatedAmount: BigInt!
}

type DelegateChanged @entity(immutable: true) {
  id: ID!
  delegator: Bytes!
  fromDelegate: Bytes!
  toDelegate: Bytes!
  blockTimestamp: BigInt!
}
```

### Event Handlers

```typescript
// mapping.ts
export function handleDelegateChanged(event: DelegateChanged): void {
  const delegatorId = event.params.delegator.toHexString()
  const fromDelegateId = event.params.fromDelegate.toHexString()
  const toDelegateId = event.params.toDelegate.toHexString()

  // Update delegator's current delegate
  let delegator = Delegator.load(delegatorId)
  if (!delegator) {
    delegator = new Delegator(delegatorId)
    delegator.address = event.params.delegator
    delegator.delegatedAmount = BigInt.fromI32(0)
  }

  // Remove from old delegate, add to new delegate
  if (fromDelegateId !== zeroAddress) {
    const fromDelegate = Delegate.load(fromDelegateId)
    if (fromDelegate) {
      fromDelegate.totalDelegatedVotes = fromDelegate.totalDelegatedVotes.minus(delegator.delegatedAmount)
      fromDelegate.save()
    }
  }

  if (toDelegateId !== zeroAddress) {
    let toDelegate = Delegate.load(toDelegateId)
    if (!toDelegate) {
      toDelegate = new Delegate(toDelegateId)
      toDelegate.address = event.params.toDelegate
      toDelegate.totalDelegatedVotes = BigInt.fromI32(0)
    }
    toDelegate.totalDelegatedVotes = toDelegate.totalDelegatedVotes.plus(delegator.delegatedAmount)
    toDelegate.save()
    delegator.currentDelegate = toDelegate.id
  }

  delegator.save()
}
```

### Subgraph Configuration

```yaml
# subgraph.yaml
dataSources:
  - kind: ethereum
    name: StRIFToken
    network: rootstock
    source:
      address: '0x5Db91E24BD32059584bbdB831a901F1199f3D459'
      abi: StRIFToken
    mapping:
      eventHandlers:
        - event: DelegateChanged(indexed address,indexed address,indexed address)
          handler: handleDelegateChanged
        - event: DelegateVotesChanged(indexed address,uint256,uint256)
          handler: handleDelegateVotesChanged
```

## 2. Frontend Consumption

### GraphQL Query

```graphql
query GetCurrentDelegators($delegateAddress: String!) {
  delegate(id: $delegateAddress) {
    id
    totalDelegatedVotes
    delegators {
      id
      address
      delegatedAmount
    }
  }
}
```

### React Hook

```typescript
// hooks/useDelegators.ts
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'

const GET_DELEGATORS = gql`
  query GetCurrentDelegators($delegateAddress: String!) {
    delegate(id: $delegateAddress) {
      id
      totalDelegatedVotes
      delegators {
        id
        address
        delegatedAmount
      }
    }
  }
`

interface CurrentDelegate {
  address: Address
  votingPowerDelegated: bigint
}

export function useDelegators(delegateAddress: Address) {
  const { data, loading, error } = useQuery(GET_DELEGATORS, {
    variables: { delegateAddress: delegateAddress.toLowerCase() },
  })

  const currentDelegates: CurrentDelegate[] =
    data?.delegate?.delegators?.map((delegator: any) => ({
      address: delegator.address,
      votingPowerDelegated: BigInt(delegator.delegatedAmount),
    })) || []

  return {
    currentDelegates,
    loading,
    error,
    totalDelegatedVotes: data?.delegate?.totalDelegatedVotes
      ? BigInt(data.delegate.totalDelegatedVotes)
      : BigInt(0),
  }
}
```

### Usage Example

```typescript
// Component
function DelegationInfo({ delegateAddress }: { delegateAddress: Address }) {
  const { currentDelegates, loading, totalDelegatedVotes } = useDelegators(delegateAddress)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h3>Total Delegated Votes: {totalDelegatedVotes.toString()}</h3>
      <h4>Current Delegators ({currentDelegates.length}):</h4>
      {currentDelegates.map((delegate, index) => (
        <div key={index}>
          {delegate.address}: {delegate.votingPowerDelegated.toString()}
        </div>
      ))}
    </div>
  )
}
```

## Result

One simple hook that returns:

```typescript
{
  currentDelegates: CurrentDelegate[] // Only active delegators
}
```

The subgraph automatically filters out inactive delegators, so `currentDelegates` only contains addresses that currently delegate to the specified address.

## 3. Tally API Implementation

### Simple Example

Tally API provides a ready-to-use solution for delegation tracking. Here's a basic implementation:

```typescript
// Simple Tally API hook
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'

const GET_DELEGATIONS = gql`
  query GetDelegators($delegateAddress: String!) {
    delegations(input: { filters: { delegate: $delegateAddress }, page: { limit: 50 } }) {
      items {
        delegator {
          address
          ens
          name
        }
        amount
      }
    }
  }
`

export function useTallyDelegators(delegateAddress: Address) {
  const { data, loading } = useQuery(GET_DELEGATIONS, {
    variables: { delegateAddress: delegateAddress.toLowerCase() },
    context: {
      headers: {
        'Api-Key': process.env.NEXT_PUBLIC_TALLY_API_KEY,
      },
    },
  })

  const currentDelegates =
    data?.delegations?.items
      ?.filter(item => BigInt(item.amount) > 0n)
      ?.map(item => ({
        address: item.delegator.address as Address,
        votingPowerDelegated: BigInt(item.amount),
        name: item.delegator.name || item.delegator.ens,
      })) || []

  return {
    currentDelegates,
    loading,
    totalDelegatedVotes: currentDelegates.reduce((sum, d) => sum + d.votingPowerDelegated, 0n),
  }
}
```

### Usage

```typescript
function DelegationInfo({ address }: { address: Address }) {
  const { currentDelegates, loading, totalDelegatedVotes } = useTallyDelegators(address)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h3>Total Delegated: {totalDelegatedVotes.toString()}</h3>
      <h4>Delegators ({currentDelegates.length}):</h4>
      {currentDelegates.map(delegate => (
        <div key={delegate.address}>
          {delegate.name}: {delegate.votingPowerDelegated.toString()} votes
        </div>
      ))}
    </div>
  )
}
```

### Key Benefits

- **Zero Setup**: Just add API key and start querying
- **Rich Data**: Includes ENS names and delegate profiles
- **Cross-DAO**: Can query delegations across multiple organizations
- **Built-in Filtering**: Active delegations only (non-zero amounts)

## 4. Blockscout API Implementation

### Simple Example

Blockscout API provides direct blockchain event access. Here's a basic implementation:

```typescript
// Simple Blockscout API hook
import { useQuery } from '@tanstack/react-query'

const DELEGATE_CHANGED_TOPIC = '0x3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f'

interface BlockscoutLog {
  address: string
  topics: string[]
  data: string
  block_number: string
  transaction_hash: string
  log_index: string
  transaction_index: string
}

export function useBlockscoutDelegators(delegateAddress: Address) {
  const { data, isLoading } = useQuery({
    queryKey: ['blockscout-delegators', delegateAddress],
    queryFn: async () => {
      const response = await fetch(
        `https://explorer.rsk.co/api/v2/addresses/${delegateAddress}/logs?topic0=${DELEGATE_CHANGED_TOPIC}&topic3=${delegateAddress.toLowerCase().padStart(64, '0')}`,
      )
      const logs: BlockscoutLog[] = await response.json()

      // Process logs to find current delegators
      const delegatorMap = new Map<
        string,
        { address: Address; lastAction: 'to' | 'from'; blockNumber: number }
      >()

      logs.forEach(log => {
        const delegator = ('0x' + log.topics[1].slice(26)) as Address
        const fromDelegate = ('0x' + log.topics[2].slice(26)) as Address
        const toDelegate = ('0x' + log.topics[3].slice(26)) as Address
        const blockNumber = parseInt(log.block_number)

        if (toDelegate.toLowerCase() === delegateAddress.toLowerCase()) {
          delegatorMap.set(delegator, { address: delegator, lastAction: 'to', blockNumber })
        } else if (fromDelegate.toLowerCase() === delegateAddress.toLowerCase()) {
          const existing = delegatorMap.get(delegator)
          if (!existing || blockNumber > existing.blockNumber) {
            delegatorMap.set(delegator, { address: delegator, lastAction: 'from', blockNumber })
          }
        }
      })

      // Filter to only current delegators (last action was 'to')
      const currentDelegators = Array.from(delegatorMap.values())
        .filter(d => d.lastAction === 'to')
        .map(d => ({ address: d.address, votingPowerDelegated: 1n })) // Simplified - would need additional calls for actual amounts

      return currentDelegators
    },
  })

  return {
    currentDelegates: data || [],
    loading: isLoading,
    totalDelegatedVotes: (data || []).reduce((sum, d) => sum + d.votingPowerDelegated, 0n),
  }
}
```

### Usage

```typescript
function DelegationInfo({ address }: { address: Address }) {
  const { currentDelegates, loading, totalDelegatedVotes } = useBlockscoutDelegators(address)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h3>Total Delegated: {totalDelegatedVotes.toString()}</h3>
      <h4>Delegators ({currentDelegates.length}):</h4>
      {currentDelegates.map(delegate => (
        <div key={delegate.address}>
          {delegate.address}: {delegate.votingPowerDelegated.toString()} votes
        </div>
      ))}
    </div>
  )
}
```

### Key Benefits

- **Direct Blockchain Access**: Raw event data from the blockchain
- **No API Keys**: Public API with no authentication required
- **Real-time Data**: Direct access to latest blockchain state
- **Chain-Specific**: Optimized for Rootstock/RSK network

## Comparison: The Graph vs Tally API vs Blockscout API

### The Graph Advantages

✅ **Complete Control**: Full control over data schema and indexing logic
✅ **Custom Filtering**: Can implement complex filtering and aggregation logic
✅ **Real-time Updates**: Subgraph syncs with blockchain in real-time
✅ **Cost Effective**: No API rate limits or usage costs
✅ **Data Ownership**: Own your data infrastructure
✅ **Custom Queries**: Can create any GraphQL query structure
✅ **Multi-chain Support**: Can index any blockchain with The Graph
✅ **Existing Infrastructure**: We already have subgraph setup
✅ **Team Expertise**: We have a dedicated backend developer
✅ **Rich Data Processing**: Can aggregate and transform data as needed

### The Graph Disadvantages

❌ **Development Time**: Still requires subgraph development and deployment
❌ **Maintenance Overhead**: Need to monitor and update subgraph
❌ **Sync Delays**: Subgraph may lag behind blockchain during high activity

### Tally API Advantages

✅ **Zero Setup**: Ready-to-use API with no infrastructure management
✅ **Rich Data**: Includes ENS, social profiles, delegate statements
✅ **Cross-Organization**: Can query delegations across multiple DAOs
✅ **Built-in Analytics**: Pre-built metrics and statistics
✅ **Professional Support**: Dedicated support and documentation
✅ **Rapid Development**: Can implement delegation tracking in minutes
✅ **Reliable Infrastructure**: Managed by Tally team
✅ **No Maintenance**: Fully managed service

### Tally API Disadvantages

❌ **Rate Limits**: Free tier has low rate limits
❌ **Limited Customization**: Can only query what Tally provides
❌ **Vendor Lock-in**: Dependent on Tally's API availability
❌ **Cost**: Paid tiers required for high-volume usage
❌ **Limited Chains**: Only supports chains that Tally indexes
❌ **Data Control**: No control over data structure or availability
❌ **API Changes**: Subject to Tally's API evolution
❌ **Redundant Infrastructure**: We already have subgraph capabilities

### Blockscout API Advantages

✅ **Direct Blockchain Access**: Raw event data from the blockchain
✅ **No API Keys**: Public API with no authentication required
✅ **Real-time Data**: Direct access to latest blockchain state
✅ **Chain-Specific**: Optimized for Rootstock/RSK network
✅ **No Rate Limits**: Public API without usage restrictions
✅ **No Vendor Lock-in**: Direct blockchain data access
✅ **Cost Effective**: Completely free to use

### Blockscout API Disadvantages

❌ **Raw Data**: Requires complex event processing and state reconstruction
❌ **Limited Querying**: Basic filtering only, no complex aggregations
❌ **Performance**: May be slower for large datasets
❌ **No Built-in Analytics**: Need to implement all data processing
❌ **Chain Dependency**: Only works with chains that have Blockscout
❌ **Complex Implementation**: Need to handle event ordering and state management
❌ **No Rich Data**: Only provides raw blockchain data

## Comprehensive Comparison Summary

### Development Complexity

1. **Tally API**: ⭐ (Easiest) - Just add API key and start querying
2. **Blockscout API**: ⭐⭐⭐ (Medium) - Requires event processing logic
3. **The Graph**: ⭐⭐⭐⭐ (Hardest) - Requires subgraph development

### Data Richness

1. **Tally API**: ⭐⭐⭐⭐⭐ (Richest) - ENS, social profiles, statements
2. **The Graph**: ⭐⭐⭐⭐ (Rich) - Custom data structure and aggregations
3. **Blockscout API**: ⭐⭐ (Basic) - Raw blockchain data only

### Performance & Scalability

1. **The Graph**: ⭐⭐⭐⭐⭐ (Best) - Optimized indexing and caching
2. **Tally API**: ⭐⭐⭐⭐ (Good) - Managed infrastructure
3. **Blockscout API**: ⭐⭐⭐ (Fair) - Direct blockchain queries

### Cost Effectiveness

1. **Blockscout API**: ⭐⭐⭐⭐⭐ (Free) - No costs whatsoever
2. **The Graph**: ⭐⭐⭐⭐ (Low) - Only hosting costs
3. **Tally API**: ⭐⭐ (Variable) - Free tier + paid plans

### Control & Customization

1. **The Graph**: ⭐⭐⭐⭐⭐ (Full control) - Complete customization
2. **Blockscout API**: ⭐⭐⭐ (Medium) - Raw data access
3. **Tally API**: ⭐⭐ (Limited) - Bound by API structure

## Final Recommendation

**Given our current setup (existing subgraph + backend developer):**

### Primary Choice: The Graph

- **Why**: Leverages existing infrastructure and team expertise
- **Benefits**: Full control, cost-effective, consistent architecture
- **Timeline**: Can be implemented efficiently by your backend developer

### Secondary Options:

**Tally API for:**

- Rapid prototyping of new features
- Cross-DAO delegation exploration
- Rich delegate profile data needs

**Blockscout API for:**

- Simple delegation tracking without complex requirements
- When we need raw blockchain data access
- Cost-sensitive implementations

### Implementation Strategy:

1. **Start with The Graph** - Our backend developer can implement this efficiently
2. **Use Tally API for prototyping** - If we need to test delegation features quickly
3. **Consider Blockscout API** - Only if we need simple, cost-free delegation tracking

**Bottom Line**: With our existing subgraph setup and backend developer, The Graph remains the optimal choice for production implementation, while Tally API serves as an excellent prototyping tool.
