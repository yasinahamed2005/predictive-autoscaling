import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { Helmet } from '../components/Helmet';

// NOTE: this demo submits the form locally (no network call). Wire this up to
// your own email service (EmailJS, a backend endpoint, etc.) for production use.
const Contact = () => {
  const form = useRef();
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      e.target.reset();
      setTimeout(() => setIsSent(false), 5000);
    }, 900);
  };

  return (
    <>
      <Helmet title="Contact Us — Dukaan" />
      <div className="container-page py-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Get in <span className="text-gradient-brand">Touch</span>
          </h1>
          <p className="text-xl text-ink/60 dark:text-paper/60">Have questions? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="card-surface p-6 flex items-start gap-4">
              <div className="bg-brand-500/10 p-3 rounded-full text-brand-500"><MapPin size={22} /></div>
              <div>
                <h3 className="font-display font-bold text-ink dark:text-paper mb-1">Visit Us</h3>
                <p className="text-ink/60 dark:text-paper/60 text-sm">Vaddeswaram<br />Vijayawada, Andhra Pradesh</p>
              </div>
            </div>
            <div className="card-surface p-6 flex items-start gap-4">
              <div className="bg-brand-500/10 p-3 rounded-full text-brand-500"><Phone size={22} /></div>
              <div>
                <h3 className="font-display font-bold text-ink dark:text-paper mb-1">Call Us</h3>
                <p className="text-ink/60 dark:text-paper/60 text-sm">+91 90000 00000<br />Mon–Fri: 9am – 6pm</p>
              </div>
            </div>
            <div className="card-surface p-6 flex items-start gap-4">
              <div className="bg-brand-500/10 p-3 rounded-full text-brand-500"><Mail size={22} /></div>
              <div>
                <h3 className="font-display font-bold text-ink dark:text-paper mb-1">Email Us</h3>
                <p className="text-ink/60 dark:text-paper/60 text-sm">support@dukaan.example</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <form ref={form} onSubmit={handleSubmit} className="space-y-5 card-surface p-8">
              <div>
                <label htmlFor="user_name" className="block text-sm text-ink/60 dark:text-paper/60 mb-1.5">Name</label>
                <input required type="text" id="user_name" name="user_name" placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-ink/[0.03] dark:bg-paper/10 border border-ink/10 dark:border-paper/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-ink dark:text-paper transition-colors" />
              </div>
              <div>
                <label htmlFor="user_email" className="block text-sm text-ink/60 dark:text-paper/60 mb-1.5">Email</label>
                <input required type="email" id="user_email" name="user_email" placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-ink/[0.03] dark:bg-paper/10 border border-ink/10 dark:border-paper/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-ink dark:text-paper transition-colors" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm text-ink/60 dark:text-paper/60 mb-1.5">Message</label>
                <textarea required rows="4" id="message" name="message" placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-lg bg-ink/[0.03] dark:bg-paper/10 border border-ink/10 dark:border-paper/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-ink dark:text-paper transition-colors" />
              </div>
              <button type="submit" disabled={isLoading || isSent}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full transition-colors active:scale-[0.98] disabled:opacity-60 flex justify-center items-center gap-2">
                {isLoading ? (<>Sending <Loader2 size={18} className="animate-spin" /></>) : isSent ? 'Message sent!' : (<>Send message <Send size={16} /></>)}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;
