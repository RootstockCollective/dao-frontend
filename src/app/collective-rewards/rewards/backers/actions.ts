'use server'

import axios from 'axios'
import { Address } from 'viem'
import { BackerStakingHistory } from '@/app/collective-rewards/rewards'
import { pool } from '@/lib/db'

type Response = {
  data: {
    backerStakingHistory?: BackerStakingHistory
  }
}

const graphQlQuery = `
    query($backer: Bytes){
        backerStakingHistory(id: $backer) {
            id
            backerTotalAllocation_
            accumulatedTime_
            lastBlockTimestamp_
            gauges_ {
                gauge_
                accumulatedAllocationsTime_
                allocation_
                lastBlockTimestamp_
            }
        }
    }
`

const fetchCrTheGraphEndpoint = `${process.env.THE_GRAPH_URL}/${process.env.THE_GRAPH_API_KEY}/${process.env.THE_GRAPH_ID}`
export async function fetchBackerStakingHistory(backer: Address) {
  const {
    data: { data },
  } = await axios.post<Response>(fetchCrTheGraphEndpoint, {
    query: graphQlQuery,
    variables: {
      backer,
    },
  })

  return data.backerStakingHistory
}


const sqlQuery = `
  SELECT convert_from(bsh.id, 'utf8') AS id, 
  bsh."backerTotalAllocation" AS "backerTotalAllocation_", 
  bsh."accumulatedTime" AS "accumulatedTime_", 
  bsh."lastBlockTimestamp" AS "lastBlockTimestamp_",
  COALESCE(
    json_agg(
      json_build_object('gauge_', convert_from(gsh.gauge, 'utf8'), 
      'accumulatedAllocationsTime_', gsh."accumulatedAllocationsTime",
      'allocation_', gsh."allocation",
      'lastBlockTimestamp_', gsh."lastBlockTimestamp"
      )
    ), 
  '[]') AS gauges_
  FROM "BackerStakingHistory" bsh 
  INNER JOIN "GaugeStakingHistory" gsh ON bsh.id = gsh.backer
  WHERE bsh.id = LOWER($1)::bytea
  GROUP BY bsh.id;
`
export async function fetchBackerStakingHistoryFromDb(backer: Address) {
  const { rows } = await pool.query<BackerStakingHistory>(sqlQuery, [backer])
  return rows[0]
}