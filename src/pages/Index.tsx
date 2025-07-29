import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceBoxes from '@/components/ServiceBoxes'
import ContentOverlay from '@/components/ContentOverlay'
import { ArrowDown } from 'lucide-react'

export default function Index() {
  return (
    <div className="relative min-h-screen">
      <Header />

      {/* Hero image with text overlay */}
      <div className="relative">
        {/* Hero image */}
        <div
          className="
            w-full
            h-[50vh]
            bg-[url('/uploads/images/parallax/ParallaxImage1.jpg')]
            bg-cover bg-center
          "
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Text overlay - positioned in lower area */}
          <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 px-4">
            <h3 className="font-rajdhani text-[16px] sm:text-[18px] md:text-[20px] text-white text-center max-w-[400px] leading-relaxed sm:leading-tight mb-6">
              Vi är en plats för dig som vill lära dig,<br />
              utöva och uppleva Improv&nbsp;Comedy.
            </h3>

            {/* Arrow visible on both mobile and desktop */}
            <div className="flex justify-center">
              <ArrowDown
                size={24}
                strokeWidth={2}
                className="text-white animate-bounce"
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
