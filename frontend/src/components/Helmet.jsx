import { useEffect } from 'react';

// Lightweight SEO helper — sets document title & meta description without
// adding a dependency. For a multi-page app at scale, swap for react-helmet-async.
export const Helmet = ({ title, description }) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};
