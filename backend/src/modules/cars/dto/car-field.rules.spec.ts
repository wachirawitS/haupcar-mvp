import {
  normalizeNotes,
  normalizeRegistrationNumber,
  REGISTRATION_NUMBER_PATTERN,
} from './car-field.rules';

describe('car field rules', () => {
  it.each([
    ['1กข 1234', '1กข 1234'],
    ['1กข1234', '1กข 1234'],
    ['1กข-1234', '1กข 1234'],
    ['  1กข   1234 ', '1กข 1234'],
    ['กข 99', 'กข 99'],
    ['ก 1', 'ก 1'],
    ['12กขค 1', '12กขค 1'],
  ])('normalises plate %p to %p, which passes the pattern', (raw, expected) => {
    const normalised = normalizeRegistrationNumber(raw);
    expect(normalised).toBe(expected);
    expect(REGISTRATION_NUMBER_PATTERN.test(normalised as string)).toBe(true);
  });

  it.each([
    ['latin letters', 'AB 1234'],
    ['too many digits', '1กข 12345'],
    ['no digits', 'กข'],
    ['no letters', '1234'],
    ['too many letters', 'กขคง 1'],
  ])('rejects %s (%p)', (_label, raw) => {
    const normalised = normalizeRegistrationNumber(raw);
    expect(REGISTRATION_NUMBER_PATTERN.test(normalised as string)).toBe(false);
  });

  it('turns empty notes into null and trims the rest', () => {
    expect(normalizeNotes('   ')).toBeNull();
    expect(normalizeNotes('  ok  ')).toBe('ok');
    expect(normalizeNotes(null)).toBeNull();
  });
});
