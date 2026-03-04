export interface CountryInfo {
  name: string
  capital: string
  population: string
  area: string
  currency: string
  language: string
  continent: string
}

export const countriesData: Record<string, CountryInfo> = {
  'Italy': {
    name: 'Italia',
    capital: 'Roma',
    population: '60.3 milioni',
    area: '301,340 km²',
    currency: 'Euro (EUR)',
    language: 'Italiano',
    continent: 'Europa'
  },
  'Germany': {
    name: 'Germania',
    capital: 'Berlino',
    population: '83.2 milioni',
    area: '357,022 km²',
    currency: 'Euro (EUR)',
    language: 'Tedesco',
    continent: 'Europa'
  },
  'France': {
    name: 'Francia',
    capital: 'Parigi',
    population: '67.4 milioni',
    area: '643,801 km²',
    currency: 'Euro (EUR)',
    language: 'Francese',
    continent: 'Europa'
  },
  'Spain': {
    name: 'Spagna',
    capital: 'Madrid',
    population: '47.4 milioni',
    area: '505,990 km²',
    currency: 'Euro (EUR)',
    language: 'Spagnolo',
    continent: 'Europa'
  },
  'United Kingdom': {
    name: 'Regno Unito',
    capital: 'Londra',
    population: '67.2 milioni',
    area: '242,495 km²',
    currency: 'Sterlina (GBP)',
    language: 'Inglese',
    continent: 'Europa'
  },
  'United States of America': {
    name: 'Stati Uniti',
    capital: 'Washington D.C.',
    population: '331.9 milioni',
    area: '9,833,517 km²',
    currency: 'Dollaro (USD)',
    language: 'Inglese',
    continent: 'Nord America'
  },
  'Canada': {
    name: 'Canada',
    capital: 'Ottawa',
    population: '38.2 milioni',
    area: '9,984,670 km²',
    currency: 'Dollaro Canadese (CAD)',
    language: 'Inglese, Francese',
    continent: 'Nord America'
  },
  'Brazil': {
    name: 'Brasile',
    capital: 'Brasilia',
    population: '214.3 milioni',
    area: '8,515,767 km²',
    currency: 'Real (BRL)',
    language: 'Portoghese',
    continent: 'Sud America'
  },
  'Argentina': {
    name: 'Argentina',
    capital: 'Buenos Aires',
    population: '45.8 milioni',
    area: '2,780,400 km²',
    currency: 'Peso (ARS)',
    language: 'Spagnolo',
    continent: 'Sud America'
  },
  'Japan': {
    name: 'Giappone',
    capital: 'Tokyo',
    population: '125.7 milioni',
    area: '377,975 km²',
    currency: 'Yen (JPY)',
    language: 'Giapponese',
    continent: 'Asia'
  },
  'China': {
    name: 'Cina',
    capital: 'Pechino',
    population: '1.41 miliardi',
    area: '9,596,961 km²',
    currency: 'Yuan (CNY)',
    language: 'Cinese Mandarino',
    continent: 'Asia'
  },
  'India': {
    name: 'India',
    capital: 'Nuova Delhi',
    population: '1.39 miliardi',
    area: '3,287,263 km²',
    currency: 'Rupia (INR)',
    language: 'Hindi, Inglese',
    continent: 'Asia'
  },
  'Australia': {
    name: 'Australia',
    capital: 'Canberra',
    population: '25.7 milioni',
    area: '7,692,024 km²',
    currency: 'Dollaro Australiano (AUD)',
    language: 'Inglese',
    continent: 'Oceania'
  },
  'Russia': {
    name: 'Russia',
    capital: 'Mosca',
    population: '144.1 milioni',
    area: '17,098,242 km²',
    currency: 'Rublo (RUB)',
    language: 'Russo',
    continent: 'Europa/Asia'
  },
  'South Africa': {
    name: 'Sudafrica',
    capital: 'Pretoria',
    population: '60.0 milioni',
    area: '1,221,037 km²',
    currency: 'Rand (ZAR)',
    language: 'Inglese, Afrikaans, Zulu',
    continent: 'Africa'
  },
  'Egypt': {
    name: 'Egitto',
    capital: 'Il Cairo',
    population: '104.3 milioni',
    area: '1,002,450 km²',
    currency: 'Sterlina Egiziana (EGP)',
    language: 'Arabo',
    continent: 'Africa'
  },
  'Mexico': {
    name: 'Messico',
    capital: 'Città del Messico',
    population: '130.3 milioni',
    area: '1,964,375 km²',
    currency: 'Peso (MXN)',
    language: 'Spagnolo',
    continent: 'Nord America'
  },
  'South Korea': {
    name: 'Corea del Sud',
    capital: 'Seoul',
    population: '51.7 milioni',
    area: '100,210 km²',
    currency: 'Won (KRW)',
    language: 'Coreano',
    continent: 'Asia'
  },
  'Netherlands': {
    name: 'Paesi Bassi',
    capital: 'Amsterdam',
    population: '17.5 milioni',
    area: '41,543 km²',
    currency: 'Euro (EUR)',
    language: 'Olandese',
    continent: 'Europa'
  },
  'Switzerland': {
    name: 'Svizzera',
    capital: 'Berna',
    population: '8.7 milioni',
    area: '41,285 km²',
    currency: 'Franco Svizzero (CHF)',
    language: 'Tedesco, Francese, Italiano',
    continent: 'Europa'
  },
  'Portugal': {
    name: 'Portogallo',
    capital: 'Lisbona',
    population: '10.3 milioni',
    area: '92,212 km²',
    currency: 'Euro (EUR)',
    language: 'Portoghese',
    continent: 'Europa'
  },
  'Greece': {
    name: 'Grecia',
    capital: 'Atene',
    population: '10.4 milioni',
    area: '131,957 km²',
    currency: 'Euro (EUR)',
    language: 'Greco',
    continent: 'Europa'
  },
  'Poland': {
    name: 'Polonia',
    capital: 'Varsavia',
    population: '37.8 milioni',
    area: '312,696 km²',
    currency: 'Zloty (PLN)',
    language: 'Polacco',
    continent: 'Europa'
  },
  'Sweden': {
    name: 'Svezia',
    capital: 'Stoccolma',
    population: '10.4 milioni',
    area: '450,295 km²',
    currency: 'Corona Svedese (SEK)',
    language: 'Svedese',
    continent: 'Europa'
  },
  'Norway': {
    name: 'Norvegia',
    capital: 'Oslo',
    population: '5.4 milioni',
    area: '385,207 km²',
    currency: 'Corona Norvegese (NOK)',
    language: 'Norvegese',
    continent: 'Europa'
  }
}
