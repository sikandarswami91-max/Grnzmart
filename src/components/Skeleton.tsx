import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm animate-pulse">
      <div className="bg-slate-200 dark:bg-slate-700 rounded-xl aspect-square w-full mb-4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-3 animate-pulse">
      <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl md:col-span-2"></div>
        <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
      </div>
    </div>
  );
};
