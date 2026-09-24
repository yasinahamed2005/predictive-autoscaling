import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid3x3, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/products', label: 'Categories', icon: Grid3x3 },
  { to: '/wishlist', label: 'Wishlist', icon: Heart, badgeKey: 'wishlist' },
  { to: '/cart', label: 'Cart', icon: ShoppingCart, badgeKey: 'cart' },
  { to: '/profile', label: 'Account', icon: User },
];

const MobileBottomNav = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const badges = { cart: cartCount, wishlist: wishlistCount };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-ink/95 backdrop-blur border-t border-ink/10 dark:border-paper/10 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? 'text-brand-500' : 'text-ink/50 dark:text-paper/50'
              }`
            }
          >
            <div className="relative">
              <Icon size={20} />
              {badgeKey && badges[badgeKey] > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {badges[badgeKey]}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
