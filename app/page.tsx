import Link from 'next/link'
import { Calculator } from '@/components/icons/calculator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Emergency Banner */}
      <div className="bg-red-700 text-white py-3 px-4 shadow-lg">
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
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Plumbing Revenue Calculator</h1>
          <p className="text-xl text-gray-300 mb-8">
            Analyze and optimize your plumbing business with our advanced calculator
          </p>
          <Link 
            href="/calculator"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
          >
            <Calculator className="w-6 h-6 mr-2" />
            Launch Calculator
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Revenue Analysis</h3>
            <p className="text-gray-300">
              Get instant insights into potential revenue and profitability metrics for your plumbing business
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Cost Optimization</h3>
            <p className="text-gray-300">
              Calculate optimal pricing and estimate operational costs for maximum profitability
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Service Comparison</h3>
            <p className="text-gray-300">
              Compare different plumbing services and their potential returns
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-800 p-8 rounded-lg mb-16">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">1. Input Parameters</h3>
              <p className="text-gray-300">
                Enter your business parameters, including hourly rates, material costs, and operational factors
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">2. Calculate Profitability</h3>
              <p className="text-gray-300">
                Our calculator processes your inputs and provides detailed profitability analysis for your plumbing business
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 