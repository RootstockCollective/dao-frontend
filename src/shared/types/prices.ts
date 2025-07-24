export type Price = {
  price: number
  lastUpdated: string
}

export type GetPricesResult = Record<string, Price | null>
