import { useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceBoxes from '@/components/ServiceBoxes'
import ContentOverlay from '@/components/ContentOverlay'
import OptimizedImage from '@/components/OptimizedImage'
import { ArrowDown } from 'lucide-react'

export default function Index() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="relative min-h-screen">
      <Header />

      {/* Hero image with text overlay */}
      <div className="relative">
        {/* Hero image */}
        <div className="relative w-full h-[50vh] overflow-hidden">
          <img
            src="/uploads/images/Rosenqvist-6315.jpg"
            alt="Lilla Improteatern hero image"
            className="w-full h-full object-cover"
            loading="eager"
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Text overlay - positioned in lower area */}
          <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 px-4 w-full max-w-[90vw] sm:max-w-[500px]">
            <h3 className="font-rajdhani text-[16px] sm:text-[18px] md:text-[20px] text-center mb-6" style={{ color: 'rgb(var(--white))' }}>
              Vi är en plats för dig som vill lära dig,<br />
              utöva och uppleva Improv&nbsp;Comedy.
            </h3>

            {/* Arrow visible on both mobile and desktop */}
            <div className="flex justify-center">
              <ArrowDown
                size={24}
                strokeWidth={2}
                className="animate-bounce"
                style={{ color: 'rgb(var(--white))' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* White section with ServiceBoxes */}
      <div className="bg-white py-16 md:py-20 rounded-t-lg md:rounded-t-none">
        <div className="container mx-auto px-4 max-w-6xl">
          <ServiceBoxes />
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
