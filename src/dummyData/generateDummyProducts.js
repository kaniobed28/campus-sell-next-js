const { faker } = require('@faker-js/faker');

function generateDummyProducts(count) {
  const categoryMap = {
    Fashion: ["Men's Wear", "Women's Wear", "Shoes", "Accessories"],
    Electronics: ["Laptops", "Phones", "Tablets", "Accessories"],
    Home: ["Furniture", "Decor", "Kitchen", "Bedding"],
    Trending: ["Tech Gadgets", "Viral Items", "Wearables", "Smart Home"],
    Popular: ["Best Sellers", "New Arrivals", "Customer Favorites", "Top Rated"],
    Books: ["Fiction", "Non-Fiction", "Comics", "Educational"],
    Sports: ["Equipment", "Apparel", "Shoes", "Accessories"],
    Accessories: ["Jewelry", "Watches", "Bags", "Hats"],
  };

  const categoryList = Object.keys(categoryMap); // Extract category names from the map
  const products = [];

  for (let i = 0; i < count; i++) {
    // Randomly select a category
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    // Randomly select a subtype from the category's subtypes
    const subtype = categoryMap[category][Math.floor(Math.random() * categoryMap[category].length)];

    products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      category: category,
      subtype: subtype,
      price: parseFloat(faker.commerce.price()),
      image: faker.image.url(640, 480, 'technics', true),
      likes: faker.number.int({ min: 0, max: 500 }), // Random number of likes
      views: faker.number.int({ min: 0, max: 10000 }), // Random number of views
    });
  }

  return products;
}

module.exports = generateDummyProducts;
