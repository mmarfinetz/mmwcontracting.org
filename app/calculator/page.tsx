import dynamic from 'next/dynamic'

const RevenueCalculator = dynamic(() => import('@/components/RevenueCalculator'), {
  ssr: false,
})

export default function CalculatorPage() {
  return (
    <div className="container mx-auto py-8">
      <RevenueCalculator />
    </div>
  )
} 