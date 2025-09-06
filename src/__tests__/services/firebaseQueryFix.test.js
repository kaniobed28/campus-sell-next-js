// __tests__/services/firebaseQueryFix.test.js
import { cleanQueryArray, isValidQueryValue } from '@/utils/firebaseUtils';

describe('Firebase Query Utilities', () => {
  describe('cleanQueryArray', () => {
    it('should remove undefined and null values from array', () => {
      const input = ['active', undefined, null, 'blocked'];
      const result = cleanQueryArray(input);
      expect(result).toEqual(['active', 'blocked']);
    });

    it('should return empty array if all values are undefined or null', () => {
      const input = [undefined, null];
      const result = cleanQueryArray(input);
      expect(result).toEqual([]);
    });

    it('should return the same array if no undefined or null values', () => {
      const input = ['active', 'blocked', 'removed'];
      const result = cleanQueryArray(input);
      expect(result).toEqual(['active', 'blocked', 'removed']);
    });
  });

  describe('isValidQueryValue', () => {
    it('should return true for valid values', () => {
      expect(isValidQueryValue('active')).toBe(true);
      expect(isValidQueryValue(123)).toBe(true);
      expect(isValidQueryValue(true)).toBe(true);
      expect(isValidQueryValue({})).toBe(true);
      expect(isValidQueryValue([])).toBe(true);
    });

    it('should return false for undefined and null values', () => {
      expect(isValidQueryValue(undefined)).toBe(false);
      expect(isValidQueryValue(null)).toBe(false);
    });
  });
});