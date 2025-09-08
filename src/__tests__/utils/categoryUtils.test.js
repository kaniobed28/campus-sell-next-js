import { generateCategorySlug } from '@/utils/categoryUtils';

describe('categoryUtils', () => {
  describe('generateCategorySlug', () => {
    it('generates correct slug for normal category names', () => {
      expect(generateCategorySlug('Books & Education')).toBe('books-education');
      expect(generateCategorySlug('Electronics')).toBe('electronics');
      expect(generateCategorySlug('Home & Garden')).toBe('home-garden');
    });

    it('handles special characters correctly', () => {
      expect(generateCategorySlug('Toys & Games!')).toBe('toys-games');
      expect(generateCategorySlug('Art & Crafts @ Home')).toBe('art-crafts-home');
      expect(generateCategorySlug('Sports #1')).toBe('sports-1');
    });

    it('handles multiple spaces correctly', () => {
      expect(generateCategorySlug('Books  &   Education')).toBe('books-education');
      expect(generateCategorySlug('  Electronics  ')).toBe('electronics');
    });

    it('handles empty or null inputs', () => {
      expect(generateCategorySlug('')).toBe('');
      expect(generateCategorySlug(null)).toBe('');
      expect(generateCategorySlug(undefined)).toBe('');
    });
  });
});