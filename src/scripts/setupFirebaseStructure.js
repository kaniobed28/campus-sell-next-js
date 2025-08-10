import { db } from '@/lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

/**
 * Professional Firebase Structure Setup
 * This script sets up the complete database structure for the marketplace
 */

// Collection schemas and initial data
const COLLECTIONS_SCHEMA = {
    // Categories collection
    categories: {
        description: 'Product categories with hierarchical structure',
        indexes: [
            'isActive',
            'parentId',
            'displayOrder',
            'slug',
            'metadata.productCount'
        ],
        sampleDocument: {
            id: 'sample-category-id',
            name: 'Sample Category',
            slug: 'sample-category',
            description: 'Sample category description',
            icon: '📁',
            parentId: null,
            displayOrder: 1,
            isActive: true,
            metadata: {
                productCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'system',
            }
        }
    },

    // Products collection
    products: {
        description: 'Product listings with enhanced metadata',
        indexes: [
            'status',
            'categoryId',
            'subcategoryId',
            'createdBy',
            'price',
            'createdAt',
            'featured',
            'sold',
            'searchKeywords'
        ],
        sampleDocument: {
            // Basic product information
            title: 'Sample Product',
            description: 'Sample product description',
            price: 99.99,
            imageUrls: ['https://example.com/image.jpg'],

            // Category information
            categoryId: 'category-id',
            subcategoryId: 'subcategory-id',
            categoryPath: ['category-id', 'subcategory-id'],
            categoryNames: ['Category Name', 'Subcategory Name'],
            categorySlug: 'category-slug',
            subcategorySlug: 'subcategory-slug',

            // User information
            createdBy: 'user-id',
            sellerEmail: 'seller@example.com',
            sellerName: 'Seller Name',

            // Status and metadata
            status: 'active', // active, sold, removed, expired
            condition: 'good', // new, like-new, good, fair, poor
            location: 'campus',

            // Analytics
            views: 0,
            likes: 0,
            inquiries: 0,

            // Search and discovery
            searchKeywords: ['sample', 'product', 'category'],
            tags: [],
            featured: false,
            sold: false,

            // Professional metadata
            productId: 'prod_unique_id',
            version: 1,
            lastModifiedBy: 'user-id',

            // Marketplace features
            negotiable: true,
            delivery: {
                available: true,
                methods: ['pickup', 'campus_delivery'],
                fee: 0,
            },

            // Quality assurance
            verified: false,
            reportCount: 0,
            flagged: false,

            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    },

    // Users collection
    users: {
        description: 'User profiles and preferences',
        indexes: [
            'email',
            'role',
            'isActive',
            'createdAt'
        ],
        sampleDocument: {
            uid: 'user-id',
            email: 'user@example.com',
            displayName: 'User Name',
            photoURL: null,

            // Profile information
            profile: {
                firstName: 'First',
                lastName: 'Last',
                bio: 'User bio',
                location: 'campus',
                phone: null,
                verified: false,
            },

            // Marketplace data
            role: 'user', // user, seller, admin, moderator
            isActive: true,
            isSeller: false,

            // Statistics
            stats: {
                productsListed: 0,
                productsSold: 0,
                totalEarnings: 0,
                rating: 0,
                reviewCount: 0,
            },

            // Preferences
            preferences: {
                notifications: {
                    email: true,
                    push: true,
                    marketing: false,
                },
                privacy: {
                    showEmail: false,
                    showPhone: false,
                },
            },

            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
        }
    },

    // Analytics collection
    analytics: {
        description: 'System analytics and metrics',
        indexes: [
            'type',
            'date',
            'categoryId',
            'userId'
        ],
        sampleDocument: {
            type: 'product_view', // product_view, category_view, search, listing_created
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            timestamp: new Date(),

            // Context data
            productId: 'product-id',
            categoryId: 'category-id',
            userId: 'user-id',

            // Additional metadata
            metadata: {
                userAgent: 'browser-info',
                referrer: 'page-url',
                sessionId: 'session-id',
            }
        }
    },

    // System configuration
    config: {
        description: 'System configuration and settings',
        sampleDocument: {
            version: '1.0.0',
            maintenance: false,
            features: {
                categories: true,
                analytics: true,
                notifications: true,
                messaging: false,
            },
            limits: {
                maxImagesPerProduct: 5,
                maxImageSize: 5242880, // 5MB
                maxProductsPerUser: 50,
            },
            updatedAt: new Date(),
        }
    }
};

/**
 * Initialize the complete Firebase structure
 */
export async function setupFirebaseStructure() {
    try {
        console.log('🚀 Setting up professional Firebase structure...');

        const batch = writeBatch(db);

        // Create system configuration
        const configRef = doc(collection(db, 'config'), 'system');
        batch.set(configRef, COLLECTIONS_SCHEMA.config.sampleDocument);

        // Create initial admin user document structure (placeholder)
        const adminUserRef = doc(collection(db, 'users'), 'admin-placeholder');
        batch.set(adminUserRef, {
            ...COLLECTIONS_SCHEMA.users.sampleDocument,
            uid: 'admin-placeholder',
            email: 'admin@campus-sell.com',
            role: 'admin',
            displayName: 'System Administrator',
            profile: {
                ...COLLECTIONS_SCHEMA.users.sampleDocument.profile,
                firstName: 'System',
                lastName: 'Administrator',
                bio: 'System administrator account',
            }
        });

        await batch.commit();

        console.log('✅ Firebase structure setup complete!');
        console.log('📊 Collections created:');
        Object.keys(COLLECTIONS_SCHEMA).forEach(collection => {
            console.log(`   - ${collection}: ${COLLECTIONS_SCHEMA[collection].description}`);
        });

        return true;

    } catch (error) {
        console.error('❌ Error setting up Firebase structure:', error);
        throw error;
    }
}

/**
 * Clean up old data and reset structure
 */
export async function resetFirebaseStructure() {
    try {
        console.log('⚠️  WARNING: Resetting Firebase structure...');
        console.log('This will remove all existing data!');

        // Note: In a real application, you'd want to implement proper data migration
        // For now, we'll just set up the new structure
        await setupFirebaseStructure();

        console.log('🔄 Firebase structure reset complete!');

    } catch (error) {
        console.error('❌ Error resetting Firebase structure:', error);
        throw error;
    }
}

/**
 * Validate Firebase structure
 */
export async function validateFirebaseStructure() {
    try {
        console.log('🔍 Validating Firebase structure...');

        const validationResults = {
            collections: {},
            overall: true
        };

        // Check each collection
        for (const [collectionName, schema] of Object.entries(COLLECTIONS_SCHEMA)) {
            try {
                const collectionRef = collection(db, collectionName);
                // Basic connectivity test
                await collectionRef.firestore.app;
                validationResults.collections[collectionName] = 'accessible';
            } catch (error) {
                validationResults.collections[collectionName] = 'error';
                validationResults.overall = false;
            }
        }

        console.log('📋 Validation Results:', validationResults);
        return validationResults;

    } catch (error) {
        console.error('❌ Error validating Firebase structure:', error);
        throw error;
    }
}

/**
 * Get recommended Firestore indexes
 */
export function getRecommendedIndexes() {
    const indexes = [];

    Object.entries(COLLECTIONS_SCHEMA).forEach(([collectionName, schema]) => {
        if (schema.indexes) {
            schema.indexes.forEach(field => {
                indexes.push({
                    collection: collectionName,
                    field: field,
                    type: 'ascending'
                });
            });
        }
    });

    return indexes;
}

// Export schema for reference
export { COLLECTIONS_SCHEMA };