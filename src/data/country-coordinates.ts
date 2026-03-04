// Coordinate delle capitali per il mapping delle news sul globo
// ISO 3166-1 alpha-2 codes -> coordinate geografiche

export interface CountryCoordinate {
  name: string
  lat: number
  lng: number
  capital: string
}

export const countryCoordinates: Record<string, CountryCoordinate> = {
  // Europa
  it: { name: 'Italy', lat: 41.9028, lng: 12.4964, capital: 'Rome' },
  de: { name: 'Germany', lat: 52.5200, lng: 13.4050, capital: 'Berlin' },
  fr: { name: 'France', lat: 48.8566, lng: 2.3522, capital: 'Paris' },
  es: { name: 'Spain', lat: 40.4168, lng: -3.7038, capital: 'Madrid' },
  gb: { name: 'United Kingdom', lat: 51.5074, lng: -0.1278, capital: 'London' },
  nl: { name: 'Netherlands', lat: 52.3676, lng: 4.9041, capital: 'Amsterdam' },
  be: { name: 'Belgium', lat: 50.8503, lng: 4.3517, capital: 'Brussels' },
  ch: { name: 'Switzerland', lat: 46.9480, lng: 7.4474, capital: 'Bern' },
  at: { name: 'Austria', lat: 48.2082, lng: 16.3738, capital: 'Vienna' },
  pt: { name: 'Portugal', lat: 38.7223, lng: -9.1393, capital: 'Lisbon' },
  pl: { name: 'Poland', lat: 52.2297, lng: 21.0122, capital: 'Warsaw' },
  se: { name: 'Sweden', lat: 59.3293, lng: 18.0686, capital: 'Stockholm' },
  no: { name: 'Norway', lat: 59.9139, lng: 10.7522, capital: 'Oslo' },
  dk: { name: 'Denmark', lat: 55.6761, lng: 12.5683, capital: 'Copenhagen' },
  fi: { name: 'Finland', lat: 60.1699, lng: 24.9384, capital: 'Helsinki' },
  gr: { name: 'Greece', lat: 37.9838, lng: 23.7275, capital: 'Athens' },
  ie: { name: 'Ireland', lat: 53.3498, lng: -6.2603, capital: 'Dublin' },
  cz: { name: 'Czech Republic', lat: 50.0755, lng: 14.4378, capital: 'Prague' },
  hu: { name: 'Hungary', lat: 47.4979, lng: 19.0402, capital: 'Budapest' },
  ro: { name: 'Romania', lat: 44.4268, lng: 26.1025, capital: 'Bucharest' },
  ua: { name: 'Ukraine', lat: 50.4501, lng: 30.5234, capital: 'Kyiv' },
  ru: { name: 'Russia', lat: 55.7558, lng: 37.6173, capital: 'Moscow' },

  // Nord America
  us: { name: 'United States', lat: 38.8951, lng: -77.0364, capital: 'Washington D.C.' },
  ca: { name: 'Canada', lat: 45.4215, lng: -75.6972, capital: 'Ottawa' },
  mx: { name: 'Mexico', lat: 19.4326, lng: -99.1332, capital: 'Mexico City' },

  // Sud America
  br: { name: 'Brazil', lat: -15.7942, lng: -47.8822, capital: 'Brasilia' },
  ar: { name: 'Argentina', lat: -34.6037, lng: -58.3816, capital: 'Buenos Aires' },
  co: { name: 'Colombia', lat: 4.7110, lng: -74.0721, capital: 'Bogota' },
  cl: { name: 'Chile', lat: -33.4489, lng: -70.6693, capital: 'Santiago' },
  pe: { name: 'Peru', lat: -12.0464, lng: -77.0428, capital: 'Lima' },
  ve: { name: 'Venezuela', lat: 10.4880, lng: -66.8792, capital: 'Caracas' },

  // Asia
  cn: { name: 'China', lat: 39.9042, lng: 116.4074, capital: 'Beijing' },
  jp: { name: 'Japan', lat: 35.6762, lng: 139.6503, capital: 'Tokyo' },
  kr: { name: 'South Korea', lat: 37.5665, lng: 126.9780, capital: 'Seoul' },
  in: { name: 'India', lat: 28.6139, lng: 77.2090, capital: 'New Delhi' },
  id: { name: 'Indonesia', lat: -6.2088, lng: 106.8456, capital: 'Jakarta' },
  th: { name: 'Thailand', lat: 13.7563, lng: 100.5018, capital: 'Bangkok' },
  vn: { name: 'Vietnam', lat: 21.0285, lng: 105.8542, capital: 'Hanoi' },
  my: { name: 'Malaysia', lat: 3.1390, lng: 101.6869, capital: 'Kuala Lumpur' },
  sg: { name: 'Singapore', lat: 1.3521, lng: 103.8198, capital: 'Singapore' },
  ph: { name: 'Philippines', lat: 14.5995, lng: 120.9842, capital: 'Manila' },
  pk: { name: 'Pakistan', lat: 33.6844, lng: 73.0479, capital: 'Islamabad' },
  bd: { name: 'Bangladesh', lat: 23.8103, lng: 90.4125, capital: 'Dhaka' },
  tw: { name: 'Taiwan', lat: 25.0330, lng: 121.5654, capital: 'Taipei' },
  hk: { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, capital: 'Hong Kong' },

  // Medio Oriente
  ae: { name: 'United Arab Emirates', lat: 24.4539, lng: 54.3773, capital: 'Abu Dhabi' },
  sa: { name: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, capital: 'Riyadh' },
  il: { name: 'Israel', lat: 31.7683, lng: 35.2137, capital: 'Jerusalem' },
  tr: { name: 'Turkey', lat: 39.9334, lng: 32.8597, capital: 'Ankara' },
  ir: { name: 'Iran', lat: 35.6892, lng: 51.3890, capital: 'Tehran' },
  iq: { name: 'Iraq', lat: 33.3152, lng: 44.3661, capital: 'Baghdad' },

  // Africa
  za: { name: 'South Africa', lat: -25.7479, lng: 28.2293, capital: 'Pretoria' },
  eg: { name: 'Egypt', lat: 30.0444, lng: 31.2357, capital: 'Cairo' },
  ng: { name: 'Nigeria', lat: 9.0579, lng: 7.4951, capital: 'Abuja' },
  ke: { name: 'Kenya', lat: -1.2921, lng: 36.8219, capital: 'Nairobi' },
  ma: { name: 'Morocco', lat: 33.9716, lng: -6.8498, capital: 'Rabat' },
  et: { name: 'Ethiopia', lat: 9.0320, lng: 38.7469, capital: 'Addis Ababa' },
  gh: { name: 'Ghana', lat: 5.6037, lng: -0.1870, capital: 'Accra' },
  tz: { name: 'Tanzania', lat: -6.1630, lng: 35.7516, capital: 'Dodoma' },

  // Oceania
  au: { name: 'Australia', lat: -35.2809, lng: 149.1300, capital: 'Canberra' },
  nz: { name: 'New Zealand', lat: -41.2865, lng: 174.7762, capital: 'Wellington' },
}

// Funzione helper per ottenere coordinate da codice paese
export function getCoordinatesByCountryCode(code: string): CountryCoordinate | null {
  return countryCoordinates[code.toLowerCase()] || null
}

// Funzione per trovare coordinate da nome paese
export function getCoordinatesByCountryName(name: string): CountryCoordinate | null {
  const entry = Object.entries(countryCoordinates).find(
    ([, coord]) => coord.name.toLowerCase() === name.toLowerCase()
  )
  return entry ? entry[1] : null
}

// Lista di codici paese supportati da NewsAPI
export const newsApiCountries = [
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn',
  'co', 'cu', 'cz', 'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu',
  'id', 'ie', 'il', 'in', 'it', 'jp', 'kr', 'lt', 'lv', 'ma',
  'mx', 'my', 'ng', 'nl', 'no', 'nz', 'ph', 'pl', 'pt', 'ro',
  'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw',
  'ua', 'us', 've', 'za'
] as const

export type NewsApiCountry = typeof newsApiCountries[number]
