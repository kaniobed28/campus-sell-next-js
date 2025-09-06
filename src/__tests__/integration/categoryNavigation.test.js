import { generateCategorySlug } from '@/utils/categoryUtils';

// Integration test for category navigation
describe('Category Navigation Integration', () => {
  it('generates correct URLs for category navigation', () => {
    // Test data simulating a product with various category names
    const testProducts = [
      { category: 'Books & Education', expectedSlug: 'books-education' },
      { category: 'Electronics', expectedSlug: 'electronics' },
      { category: 'Home & Garden', expectedSlug: 'home-garden' },
      { category: 'Sports #1 Equipment!', expectedSlug: 'sports-1-equipment' },
      { category: '  Toys & Games  ', expectedSlug: 'toys-games' },
    ];

    testProducts.forEach(({ category, expectedSlug }) => {
      // Simulate the breadcrumb URL generation
      const categorySlug = generateCategorySlug(category);
      const breadcrumbUrl = `/categories/${categorySlug}`;
      const expectedUrl = `/categories/${expectedSlug}`;
      
      expect(breadcrumbUrl).toBe(expectedUrl);
    });
  });

  it('handles edge cases in category navigation', () => {
    // Test with null/undefined category
    const nullCategorySlug = generateCategorySlug(null);
    expect(`/categories/${nullCategorySlug}`).toBe('/categories/');
    
    const undefinedCategorySlug = generateCategorySlug(undefined);
    expect(`/categories/${undefinedCategorySlug}`).toBe('/categories/');
    
    const emptyCategorySlug = generateCategorySlug('');
    expect(`/categories/${emptyCategorySlug}`).toBe('/categories/');
  });
});