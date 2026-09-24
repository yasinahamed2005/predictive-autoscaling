import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

const columns = [
  { heading: 'About', links: [['About Us', '/about'], ['Careers', '#'], ['Press', '#'], ['Contact Us', '/contact']] },
  { heading: 'Help', links: [['Help Center', '/help'], ['Track Order', '/orders'], ['Returns', '#'], ['Shipping Info', '#']] },
  { heading: 'Policy', links: [['Privacy Policy', '#'], ['Terms of Use', '#'], ['Security', '#'], ['Sitemap', '#']] },
  { heading: 'Sell With Us', links: [['Become a Seller', '#'], ['Seller Login', '#'], ['Advertise', '#']] },
];

const trustBadges = [
  { icon: Truck, label: 'Free & fast delivery' },
  { icon: RotateCcw, label: '7-day easy returns' },
  { icon: ShieldCheck, label: 'Secure payments' },
  { icon: CreditCard, label: 'Cash on delivery' },
];

const Footer = () => (
  <footer className="mt-16 bg-ink text-paper/80">
    <div className="container-page grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-b border-paper/10">
      {trustBadges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon size={22} className="text-marigold-500 shrink-0" />
          <span className="text-sm">{label}</span>
        </div>
      ))}
    </div>

    <div className="container-page grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-display font-extrabold">D</span>
          <span className="text-lg font-display font-extrabold text-paper">Dukaan</span>
        </div>
        <p className="text-sm text-paper/50 mb-4">India's friendliest online store — groceries, fashion, electronics and more, delivered fast.</p>
        <div className="flex gap-3">
          {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center hover:bg-brand-500 transition-colors" aria-label="Social link">
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>
      {columns.map((col) => (
        <div key={col.heading}>
          <h4 className="font-semibold text-paper mb-3 text-sm">{col.heading}</h4>
          <ul className="space-y-2">
            {col.links.map(([label, href]) => (
              <li key={label}>
                <Link to={href} className="text-sm text-paper/50 hover:text-marigold-500">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="container-page py-4 border-t border-paper/10 text-xs text-paper/40 text-center">
      &copy; {new Date().getFullYear()} Dukaan. Built with React, Vite &amp; Tailwind CSS.
    </div>
  </footer>
);

export default Footer;
