/** BanRep SUAMECA series IDs (verified ADR-0010, ADR-0011) */
export const BANREP_SERIES: Record<'USD' | 'EUR' | 'GBP' | 'CNY' | 'JPY', number> = {
  USD: 1,
  EUR: 30,
  GBP: 31,
  CNY: 28, // COP/CNY (ADR-0011)
  JPY: 33, // COP/JPY (ADR-0011)
} as const

/** Banxico FIX series ID */
export const BANXICO_SERIES = 'SF43718' as const

/** SUAMECA REST endpoint */
export const SUAMECA_BASE_URL =
  'https://suameca.banrep.gov.co/estadisticas-economicas-back/rest/estadisticaEconomicaRestService/consultaInformacionSerie' as const

/** Banxico SIE endpoint (case-sensitive path) */
export const BANXICO_BASE_URL =
  'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno' as const

export const RATES_STORAGE_KEY = 'app-exchange-rates' as const
export const STALENESS_BOUND_MS = 86400000 // 24h
export const FETCH_TIMEOUT_MS = 8000 as const
