import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen py-24 px-4 flex items-center justify-center text-center">
      <div className="space-y-6 max-w-md">
        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-slate-400">
          <HelpCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black">404 - Drop Not Found</h1>
          <p className="text-xs text-slate-400">The collection or product you are searching for does not exist or has been archived.</p>
        </div>
        <Link
          to="/shop"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-2xl text-xs"
        >
          Explore Valid Drops
        </Link>
      </div>
    </div>
  );
};
