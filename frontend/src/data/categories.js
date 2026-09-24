import { Carrot, Shirt, Smartphone, Home as HomeIcon, Sparkles, Dumbbell, BookOpen, Baby } from 'lucide-react';

export const categories = [
  { id: 'grocery', name: 'Grocery', icon: Carrot, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=60' },
  { id: 'fashion', name: 'Fashion', icon: Shirt, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=60' },
  { id: 'electronics', name: 'Electronics', icon: Smartphone, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=60' },
  { id: 'home', name: 'Home & Kitchen', icon: HomeIcon, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=60' },
  { id: 'beauty', name: 'Beauty', icon: Sparkles, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=60' },
  { id: 'sports', name: 'Sports', icon: Dumbbell, image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=60' },
  { id: 'books', name: 'Books', icon: BookOpen, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=60' },
  { id: 'baby', name: 'Baby & Kids', icon: Baby, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=300&q=60' },
];

export const megaMenu = [
  {
    category: 'Grocery',
    id: 'grocery',
    groups: [
      { heading: 'Fresh', links: ['Fruits & Vegetables', 'Dairy & Eggs', 'Bakery'] },
      { heading: 'Pantry Essentials', links: ['Atta, Rice & Dal', 'Oils & Ghee', 'Spices'] },
      { heading: 'Beverages', links: ['Tea & Coffee', 'Juices', 'Soft Drinks'] },
    ],
  },
  {
    category: 'Fashion',
    id: 'fashion',
    groups: [
      { heading: 'Men', links: ['Shirts', 'T-Shirts', 'Footwear'] },
      { heading: 'Women', links: ['Kurtas & Suits', 'Sarees', 'Western Wear'] },
      { heading: 'Kids', links: ['Boys Clothing', 'Girls Clothing', 'Toys'] },
    ],
  },
  {
    category: 'Electronics',
    id: 'electronics',
    groups: [
      { heading: 'Mobiles', links: ['Smartphones', 'Accessories', 'Wearables'] },
      { heading: 'Computers', links: ['Laptops', 'Monitors', 'Storage'] },
      { heading: 'TV & Audio', links: ['Televisions', 'Headphones', 'Speakers'] },
    ],
  },
  {
    category: 'Home & Kitchen',
    id: 'home',
    groups: [
      { heading: 'Kitchenware', links: ['Cookware', 'Appliances', 'Storage'] },
      { heading: 'Furnishing', links: ['Bedsheets', 'Curtains', 'Cushions'] },
      { heading: 'Decor & Lighting', links: ['Wall Art', 'Lighting', 'Plants'] },
    ],
  },
];
