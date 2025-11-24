import React from 'react';
import { ClockIcon, SparklesIcon } from './icons';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 bg-gray-700 rounded w-48 sm:w-64 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-24"></div>
          </div>
          <div className="text-right w-2/5 sm:w-1/3">
            <div className="h-10 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 ml-auto"></div>
          </div>
        </div>
      </section>

      {/* Recommendation */}
      <section className="border border-gray-700 rounded-xl p-6 text-center bg-gray-800/50">
        <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-12 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-2.5 bg-gray-700 rounded-full w-full"></div>
      </section>

      {/* Today's Snapshot Skeleton */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        </div>
      </section>

      {/* Realtime Trades Skeleton */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
            <div className="h-5 bg-gray-700 rounded"></div>
            <div className="h-5 bg-gray-700 rounded"></div>
            <div className="h-5 bg-gray-700 rounded"></div>
            <div className="h-5 bg-gray-700 rounded"></div>
        </div>
      </section>

      {/* Price Timeline */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6 text-gray-600" />
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-6 h-6 text-gray-600" />
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded"></div>
          </div>
        </div>
      </section>

      {/* Analysis Summary */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="h-7 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </section>
    </div>
  );
};

export default SkeletonLoader;
