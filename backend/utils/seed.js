// Seeds MongoDB Atlas with demo categories, brands, an admin user, products and active deals.
// Run with: npm run seed  (make sure MONGODB_URI is set in .env first)
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from './logger.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Deal from '../models/Deal.js';

const categories = ['Grocery', 'Fashion', 'Electronics', 'Home & Kitchen', 'Beauty', 'Sports', 'Books', 'Baby & Kids'];
const brands = ['Tata', 'Amul', 'boAt', 'Samsung', 'Nike', 'Philips'];

const run = async () => {
  await connectDB();
  logger.info('Seeding database...');

  await Promise.all([Category.deleteMany({}), Brand.deleteMany({}), Product.deleteMany({}), Deal.deleteMany({})]);

  const categoryDocs = await Category.insertMany(categories.map((name) => ({ name })));
  const brandDocs = await Brand.insertMany(brands.map((name) => ({ name })));

  let admin = await User.findOne({ email: 'admin@dukaan.com' });
  if (!admin) {
    admin = await User.create({ name: 'Dukaan Admin', email: 'admin@dukaan.com', password: 'Admin@123', role: 'admin' });
  }

  const productsInserted = await Product.insertMany([
    {
      name: 'Organic Avocados (Pack of 4)', description: 'Creamy, ripe avocados sourced directly from organic farms.',
      price: 249, mrp: 349, stock: 42, category: categoryDocs[0]._id, brand: brandDocs[0]._id,
      images: [{ url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578', alt: 'Avocados' }],
      tags: ['trending', 'flashSale'],
    },
    {
      name: 'boAt Rockerz 450 Headphones', description: 'Wireless on-ear headphones with 15h battery life.',
      price: 1299, mrp: 2999, stock: 120, category: categoryDocs[2]._id, brand: brandDocs[2]._id,
      images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb', alt: 'Headphones' }],
      tags: ['bestSeller', 'flashSale', 'deal'],
    },
    {
      name: 'Nike Revolution 6 Sneakers', description: 'Lightweight running shoes with breathable mesh upper.',
      price: 2499, mrp: 3995, stock: 55, category: categoryDocs[1]._id, brand: brandDocs[4]._id,
      images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', alt: 'Sneakers' }],
      tags: ['bestSeller', 'recommended'],
    },
  ]);

  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Deal.create({
    title: 'Independence Day Mega Sale',
    description: 'Flat 50% OFF on selected premium electronics & audio gear!',
    banner: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    products: [productsInserted[1]._id, productsInserted[0]._id],
    discountPercentage: 50,
    startDate: now,
    endDate: nextWeek,
    isActive: true,
    displayOrder: 1,
  });

  logger.info(`Seeded ${categoryDocs.length} categories, ${brandDocs.length} brands, 3 products, 1 deal.`);
  logger.info('Admin login: admin@dukaan.example / Admin@123');

  await disconnectDB();
  process.exit(0);
};

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});
