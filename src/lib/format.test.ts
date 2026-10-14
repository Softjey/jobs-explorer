import { formatDate, formatDuration, formatLocation, formatWage } from './format'

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

  it('formats zero minutes', () => {
    expect(formatDuration(0)).toBe('0 min')
  })
})
