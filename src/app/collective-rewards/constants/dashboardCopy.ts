/**
 * Shown wherever a USD figure is derived from spot prices rather than the price at
 * distribution. We keep no price history, so a settled cycle is re-valued every time the
 * market moves — which matters most for the all-time and per-cycle figures.
 */
export const SPOT_PRICE_NOTE = 'USD valued at current prices, not the price at distribution'
