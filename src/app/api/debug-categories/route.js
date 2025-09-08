import { defaultCategoryStructure } from '@/data/categoryStructure.js';

export async function GET() {
  try {
    console.log('Debug: defaultCategoryStructure:', defaultCategoryStructure);
    
    return Response.json({
      success: true,
      categoryCount: defaultCategoryStructure?.length || 0,
      hasData: !!defaultCategoryStructure,
      isArray: Array.isArray(defaultCategoryStructure),
      firstCategory: defaultCategoryStructure?.[0] || null,
      categories: defaultCategoryStructure || []
    });
  } catch (error) {
    console.error('Debug error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

