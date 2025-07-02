
import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';
import MultiLayerParallaxBackground from '@/components/MultiLayerParallaxBackground';
import { useOptimizedPrefetch } from '@/hooks/useOptimizedPrefetch';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  // Use optimized prefetch for better performance
  useOptimizedPrefetch();
  const isMobile = useIsMobile();

  // Enkelt sätt att stänga av parallax-bakgrunden
  const enableParallaxBackground = true;

  // Responsive container heights
  const containerHeight = isMobile ? "h-[120vh]" : "h-[200vh]";
  const sectionHeight = isMobile ? "h-[120vh]" : "h-[200vh]";

  return (
    <div className={`${containerHeight} bg-gradient-to-br from-theatre-secondary to-theatre-tertiary relative`}>
      {/* Parallax bakgrund - responsiv */}
      <MultiLayerParallaxBackground enabled={enableParallaxBackground} />
      
      <Header />

      <section className={`${sectionHeight} flex flex-col justify-center px-0.5 relative overflow-hidden py-0 md:px-0`}>
        <div className={`flex items-center justify-center min-h-screen ${isMobile ? 'mt-32' : 'my-[30px]'} py-[20px]`}>
          <div className="mt-12 md:mt-20 p-4 md:p-12 lg:p-16 text-left md:text-center space-y-4 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto relative z-10">
            
            <div className="mx-3 md:mx-0 md:max-w-6xl lg:max-w-7xl pb-1">
              <h1 className="mt-[10px] mb-[25px] md:mb-[30px]">
                Lilla improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv&nbsp;Comedy.
              </h1>
              <div className="border-t border-gray-400 pt-[25px] md:pt-[10px] w-full lg:w-[90%] lg:mx-auto">
                <p className="text-base md:text-lg md:my-8">
                  Improv Comedy är underhållningen som skapas i stunden och som aldrig sker igen. Hos oss kan du lära dig hantverket med några av Sveriges bästa pedagoger, uppleva proffsiga föreställningar eller boka workshops anpassade för både privatpersoner och företag. Oavsett om du är nybörjare eller erfaren improvisatör är du välkommen till Lilla improteatern.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ServiceBoxes />
            </div>

            <div className="block md:hidden mt-6">
              <a href="/om-oss">
                <img
                  src="/uploads/LIT_BoW_large.png"
                  alt="Lilla Improteatern logotyp"
                  className="h-[120px] cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Logotyp längst ner på sidan - responsiv positionering */}
        <div className={`absolute ${isMobile ? 'bottom-[4rem]' : 'bottom-[18rem]'} left-1/2 transform -translate-x-1/2 z-5 text-center`}>
          <img
            src="/uploads/images/parallax/ParallaxImage1.jpg"
            alt="Lilla Improteatern logotyp"
            className="h-40 md:h-48 lg:h-56 mx-auto mb-4"
          />
          <p className="text-white text-sm">Följ oss på @lillaimproteatern</p>
        </div>
      </section>
    </div>
  );
};

export default Index;
