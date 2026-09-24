import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Helmet } from '../components/Helmet';

const NotFound = () => (
  <>
    <Helmet title="Page not found — Dukaan" />
    <div className="container-page py-24 flex flex-col items-center text-center">
      <CompassIcon size={48} className="text-brand-500 mb-4" />
      <h1 className="text-3xl font-display font-bold text-ink dark:text-paper mb-2">Page not found</h1>
      <p className="text-ink/60 dark:text-paper/60 mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-full">Back to home</Link>
    </div>
  </>
);

export default NotFound;
