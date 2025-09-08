// utils/__tests__/timestampUtils.test.js
import { convertTimestamp } from '../timestampUtils';

describe('convertTimestamp', () => {
  it('should handle null/undefined values', () => {
    expect(convertTimestamp(null)).toBeNull();
    expect(convertTimestamp(undefined)).toBeNull();
  });

  it('should handle Date objects', () => {
    const date = new Date('2022-01-01');
    expect(convertTimestamp(date)).toBe(date);
  });

  it('should handle Firestore Timestamp objects', () => {
    const timestamp = {
      seconds: 1640995200,
      nanoseconds: 0,
      toDate: () => new Date('2022-01-01')
    };
    expect(convertTimestamp(timestamp)).toEqual(new Date('2022-01-01'));
  });

  it('should handle timestamp objects with seconds', () => {
    const timestamp = { seconds: 1640995200, nanoseconds: 0 };
    expect(convertTimestamp(timestamp)).toEqual(new Date('2022-01-01'));
  });

  it('should handle string dates', () => {
    expect(convertTimestamp('2022-01-01')).toEqual(new Date('2022-01-01'));
    expect(convertTimestamp('2022-01-01T10:00:00Z')).toEqual(new Date('2022-01-01T10:00:00Z'));
  });

  it('should handle numeric timestamps', () => {
    const timestamp = 1640995200000; // milliseconds
    expect(convertTimestamp(timestamp)).toEqual(new Date('2021-12-31T16:00:00.000Z'));
  });

  it('should handle timestamp objects with _seconds/_nanoseconds', () => {
    const timestamp = { _seconds: 1640995200, _nanoseconds: 0 };
    expect(convertTimestamp(timestamp)).toEqual(new Date('2022-01-01'));
  });

  it('should handle invalid inputs', () => {
    expect(convertTimestamp('invalid')).toBeNull();
    expect(convertTimestamp({})).toBeNull();
    expect(convertTimestamp([])).toBeNull();
  });

  it('should handle edge cases', () => {
    // Empty object
    expect(convertTimestamp({})).toBeNull();
    
    // Object with seconds but no nanoseconds
    expect(convertTimestamp({ seconds: 1640995200 })).toEqual(new Date('2022-01-01'));
    
    // Object with invalid seconds
    expect(convertTimestamp({ seconds: 'invalid' })).toBeNull();
  });
});