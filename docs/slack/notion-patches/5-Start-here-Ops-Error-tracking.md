### Error tracking and status (Graph vs state-sync)

**State-sync status:**
Call `GET /api/health`. It compares Postgres `LastProcessedBlock` to RPC chain head; if lag > threshold (default 100 blocks), health is false. No built-in dashboard in the app — use the API or add monitoring/alerts.

**Graph status:**
No dedicated health endpoint in the app. If proposals work via fallback, check `X-Source` on `/api/proposals/v1`:

- `source-0` = DB (state-sync)
- `source-1` = The Graph
- `source-2` = Blockscout

If `X-Source` is 1 or 2, DB/Graph failed for that request. If rewards that use Graph fail, suspect Graph outage or lag. See Runbooks → Proposals missing and Runbooks → Rewards incorrect for step-by-step.

**What breaks first if The Graph goes down:**

- **Proposals** survive — Blockscout fallback kicks in.
- **Reward flows** that use The Graph (when state-sync is off or unhealthy) **break**.

Consider adding a simple status page or alerts that call `/api/health` and (if added) a Graph health check.
