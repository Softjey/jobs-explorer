import { formatDate, formatDuration, formatLocation, formatShifts, formatWage } from './format'

describe('format', () => {
  it('formats a CHF wage with two decimals', () => {
    expect(formatWage({ amount: 27.5, currencyId: 1 })).toBe('CHF 27.50')
  })

  it('falls back to the amount for an unknown currency', () => {
    expect(formatWage({ amount: 10, currencyId: 99 })).toBe('10.00')
  })

  it('formats an epoch date as day month year', () => {
    expect(formatDate(Date.UTC(2026, 9, 12, 12))).toBe('12 Oct 2026')
  })

  it('formats dates in Swiss time, where a late UTC evening is already the next day', () => {
    // Summer (CEST, UTC+2): 23:23 UTC is 01:23 in Zurich, a real case from the API.
    expect(formatDate(Date.UTC(2026, 9, 10, 23, 23))).toBe('11 Oct 2026')
    // Winter (CET, UTC+1): 23:30 UTC is 00:30 in Zurich.
    expect(formatDate(Date.UTC(2026, 0, 14, 23, 30))).toBe('15 Jan 2026')
  })

  it('keeps the same day when it is still before midnight in Zurich', () => {
    expect(formatDate(Date.UTC(2026, 0, 14, 22, 30))).toBe('14 Jan 2026')
    expect(formatDate(Date.UTC(2026, 9, 10, 21, 59))).toBe('10 Oct 2026')
  })

  it('formats location as zip and city', () => {
    const location = {
      addressStreet: '',
      extraAddress: '',
      zip: '8408',
      city: 'Winterthur',
      countryId: 1,
    }
    expect(formatLocation(location)).toBe('8408 Winterthur')
  })

  it('omits an empty zip', () => {
    const location = { addressStreet: '', extraAddress: '', zip: '', city: 'Bern', countryId: 1 }
    expect(formatLocation(location)).toBe('Bern')
  })

  it('formats minutes as hours', () => {
    expect(formatDuration(1980)).toBe('33 h')
  })

  it('formats leftover minutes', () => {
    expect(formatDuration(90)).toBe('1 h 30 min')
    expect(formatDuration(45)).toBe('45 min')
  })

  it('formats a zero wage and a missing city without crashing', () => {
    expect(formatWage({ amount: 0, currencyId: 1 })).toBe('CHF 0.00')
    const location = { addressStreet: '', extraAddress: '', zip: '', city: '', countryId: 1 }
    expect(formatLocation(location)).toBe('')
  })

  it('formats one shift in the singular', () => {
    expect(formatShifts(1)).toBe('1 shift')
  })

  it('formats several shifts in the plural', () => {
    expect(formatShifts(14)).toBe('14 shifts')
    expect(formatShifts(0)).toBe('0 shifts')
  })

  it('formats zero minutes', () => {
    expect(formatDuration(0)).toBe('0 min')
  })
})
