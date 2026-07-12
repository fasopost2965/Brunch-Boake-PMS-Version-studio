import React from 'react';

interface SkeletonScreenProps {
  tab: string;
}

export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ tab }) => {
  if (tab === 'dashboard') {
    return (
      <div className="flex flex-col gap-6 animate-pulse w-full">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-3 w-80 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-10 w-44 bg-gray-200 rounded-lg"></div>
        </div>

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div className="flex flex-col gap-2 w-2/3">
                <div className="h-2.5 w-24 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-2 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="w-11 h-11 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Dynamic rows skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-52 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-50 border border-gray-100 rounded-lg w-full flex items-center px-4 justify-between">
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex flex-col gap-1.5 w-2/3">
                      <div className="h-3 w-28 bg-gray-200 rounded"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col gap-4">
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-50 rounded-lg border border-gray-100 p-3"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'reservations' || tab === 'billing' || tab === 'housekeeping' || tab === 'arrivals') {
    return (
      <div className="flex flex-col gap-6 animate-pulse w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-40 bg-gray-200 rounded-lg"></div>
            <div className="h-3 w-64 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Filters/Search box */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-full md:w-32"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-full md:w-32"></div>
        </div>

        {/* Main List Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-6">
            <div className="h-3.5 w-full bg-gray-200 rounded"></div>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-1/2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Settings / Profile Form Skeleton
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-52 bg-gray-200 rounded-lg"></div>
        <div className="h-3 w-72 bg-gray-200 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Skeleton */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-md w-full"></div>
          ))}
        </div>

        {/* Fields Container */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-6">
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-2 w-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-50 border border-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-full md:w-44 self-end"></div>
        </div>
      </div>
    </div>
  );
};
