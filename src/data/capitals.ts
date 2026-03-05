// Curated capitals map for news feed countries
// Extendable structure for adding new countries

export interface CapitalInfo {
  countryCode: string
  countryName: string
  capitalName: string
  lat: number
  lng: number
}

/**
 * Curated capitals for countries with active news feeds
 * Add new entries here as new feeds are added
 */
export const CAPITALS: CapitalInfo[] = [
  {
    countryCode: 'US',
    countryName: 'United States',
    capitalName: 'Washington D.C.',
    lat: 38.8951,
    lng: -77.0364,
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    capitalName: 'London',
    lat: 51.5074,
    lng: -0.1278,
  },
]

/**
 * Quick lookup map by country code
 */
export const capitalsByCode: Map<string, CapitalInfo> = new Map(
  CAPITALS.map((c) => [c.countryCode.toLowerCase(), c])
)

/**
 * Quick lookup map by country name
 */
export const capitalsByName: Map<string, CapitalInfo> = new Map(
  CAPITALS.map((c) => [c.countryName.toLowerCase(), c])
)

/**
 * Get capital coordinates by country code
 */
export function getCapitalByCode(code: string): CapitalInfo | undefined {
  return capitalsByCode.get(code.toLowerCase())
}

/**
 * Get capital coordinates by country name
 */
export function getCapitalByName(name: string): CapitalInfo | undefined {
  return capitalsByName.get(name.toLowerCase())
}
