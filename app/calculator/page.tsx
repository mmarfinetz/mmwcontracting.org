'use client';

import dynamic from 'next/dynamic'
import '@/css/win97.css'
import { useState, useEffect } from 'react'

const RevenueCalculator = dynamic(() => import('@/components/RevenueCalculator'), {
  ssr: false,
})

export default function CalculatorPage() {
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    // Set initial time
    updateTime();
    
    // Update time every minute
    const interval = setInterval(updateTime, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);
  
  const updateTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  };

  return (
    <div className="bg-teal-600 min-h-screen">
      {/* Emergency Banner */}
      <div className="bg-red-700 text-white py-3 px-4 shadow-lg mb-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-2 md:mb-0">
            <svg className="w-6 h-6 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold text-lg">EMERGENCY 24/7 PLUMBING SERVICES</span>
          </div>
          <div className="flex items-center">
            <span className="mr-3 text-sm md:text-base">Serving PA - Butler, Beaver, Allegheny Counties</span>
            <a 
              href="tel:8142258389" 
              className="px-4 py-2 bg-white text-red-700 font-bold rounded hover:bg-gray-200 transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Call Now: 814-225-8389
            </a>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <RevenueCalculator />
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-gray-300 border-t border-gray-400 flex items-center px-2 justify-between">
        <button 
          className="flex items-center h-6 px-2 bg-gray-300 border border-gray-400 shadow-inner"
          onClick={() => {
            // Check if we're running in the Python server context (URL contains 'out/calculator')
            if (window.location.pathname.includes('out/calculator')) {
              window.location.href = '../../';
            } else {
              window.location.href = '/';
            }
          }}
        >
          <span className="mr-1">🏠</span>
          <span>Back to Home</span>
        </button>
        <div className="flex items-center">
          <div className="bg-gray-300 border border-gray-400 shadow-inner h-6 px-2 flex items-center">
            <span className="mr-1">🧮</span>
            <span>Revenue Calculator</span>
          </div>
        </div>
        <div className="text-sm">
          {currentTime}
        </div>
      </div>
    </div>
  )
} 