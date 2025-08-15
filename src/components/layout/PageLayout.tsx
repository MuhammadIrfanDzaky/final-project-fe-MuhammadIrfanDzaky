'use client';

import React from 'react';
import Navigation from './Navigation';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout(props: PageLayoutProps) {
  const { children, title, subtitle } = props;
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 flex flex-col overflow-hidden">
        {(title || subtitle) && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}