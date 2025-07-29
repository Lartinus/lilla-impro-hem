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
            h-[60vh] md:h-[70vh]
            bg-[url('/uploads/images/parallax/ParallaxImage1.jpg')]
            bg-cover bg-center
          "
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <h3 className="font-rajdhani text-[18px] md:text-[20px] text-white text-center max-w-[400px] leading-tight">
              Vi är en plats för dig som vill lära dig,<br />
              utöva och uppleva Improv&nbsp;Comedy.
            </h3>

            {/* Arrow only on mobile */}
            <span className="block mt-6 md:hidden">
              <ArrowDown
                size={24}
                strokeWidth={2}
                className="text-white animate-bounce"
              />
            </span>
          </div>
        </div>

        {/* Service boxes - desktop: overlapping image, mobile: in content overlay */}
        <div className="relative">
          {/* Desktop: ServiceBoxes overlapping the image */}
          <div className="hidden md:block absolute -top-20 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
            <div className="bg-card-background p-8 lg:p-12">
              <ServiceBoxes />
            </div>
          </div>

          {/* Mobile: ServiceBoxes in ContentOverlay */}
          <div className="md:hidden">
            <ContentOverlay className="mx-4 -mt-8 p-6 relative z-10">
              <ServiceBoxes />
            </ContentOverlay>
          </div>
        </div>
      </div>

      {/* Spacer for desktop layout */}
      <div className="hidden md:block h-40" />
      
      <Footer />
    </div>
  )
}
