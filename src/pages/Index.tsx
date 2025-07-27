
import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';
import MultiLayerParallaxBackground from '@/components/MultiLayerParallaxBackground';

import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';
import { useState } from 'react';

const Index = () => {
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);

  // Enkelt sätt att stänga av parallax-bakgrunden
  const enableParallaxBackground = true;

  return (
    <div className="min-h-[180vh] bg-gradient-to-br from-theatre-secondary to-theatre-tertiary relative">
      {/* Parallax bakgrund - lägg till/ta bort enkelt */}
      <MultiLayerParallaxBackground enabled={enableParallaxBackground} />
      
      <Header />

      <section className="min-h-[140vh] flex flex-col px-0.5 relative overflow-hidden py-0 md:px-0">
        <div className="mt-[300px] md:mt-[400px] md:flex md:items-center md:justify-center md:min-h-screen my-[30px] py-[20px]">
          <div className="p-4 md:p-12 lg:p-16 text-left md:text-center space-y-4 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto relative z-10">
            
            <div className="mx-1 md:mx-0 md:max-w-6xl lg:max-w-7xl pb-1">
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
          </div>
        </div>
      </section>

      {/* Logotyp placerad EFTER den vita boxen för att garantera att den hamnar under */}
      <div className="relative z-30 text-center pb-12 md:pb-16">
        <div className="mt-8 md:mt-12 mb-8">
          <img
            src="/uploads/LIT_WoB_large.png"
            alt="Lilla Improteatern logotyp"
            className="h-40 md:h-48 lg:h-56 mx-auto mb-4 drop-shadow-lg"
          />
          <p className="text-white text-sm">
            Följ oss på @lillaimproteatern eller via{' '}
            <button 
              onClick={() => setNewsletterModalOpen(true)}
              className="underline hover:no-underline transition-all duration-200 cursor-pointer"
            >
              nyhetsbrevet
            </button>
          </p>
        </div>
      </div>

      <NewsletterSignupModal 
        open={newsletterModalOpen} 
        onOpenChange={setNewsletterModalOpen} 
      />
    </div>
  );
};

export default Index;
