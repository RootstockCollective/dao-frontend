/** Page size for audit log list + `TablePager` expandable step. */
export const AUDIT_LOG_PAGE_SIZE = 20

/** Must match `LOG_TYPE_LABELS.NAV_UPDATED` in `api/btc-vault/v1/audit-log/action.ts`. */
export const AUDIT_LOG_NAV_UPDATED_ACTION_LABEL = 'NAV updated'

/** Subgraph `detail` boilerplate when `amount` is set — hide from Value/Reason when redundant. */
export const AUDIT_LOG_NAV_EPOCH_DETAIL_RE = /^New epoch \d+$/i
