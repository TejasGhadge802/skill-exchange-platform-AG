import React from 'react';

const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-content focus:not-sr-only sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;

