import React, { useState } from 'react';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import { Helmet } from '../components/Helmet';

const faqs = [
  { q: 'How do I track my order?', a: "Go to My Orders from your account menu to see live status for every order you've placed." },
  { q: 'What is your return policy?', a: 'Most items can be returned within 7 days of delivery for a full refund, as long as they’re unused and in original packaging.' },
  { q: 'Which payment methods are accepted?', a: 'We accept UPI, major debit/credit cards, net banking, and cash on delivery on eligible orders.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 2–5 business days depending on your pincode. Express options are available at checkout.' },
  { q: 'How do I cancel an order?', a: 'You can cancel any order that’s still "Processing" from the My Orders page.' },
];

const Help = () => {
  const [open, setOpen] = useState(0);

  return (
    <>
      <Helmet title="Help Center — Dukaan" />
      <div className="container-page py-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <LifeBuoy className="text-brand-500" size={28} />
          <h1 className="text-2xl font-display font-bold text-ink dark:text-paper">Help Center</h1>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="card-surface overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="w-full flex justify-between items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="font-medium text-sm text-ink dark:text-paper">{f.q}</span>
                <ChevronDown size={18} className={`shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm text-ink/60 dark:text-paper/60">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Help;
