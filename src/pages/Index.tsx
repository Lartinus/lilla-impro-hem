// src/pages/Index.tsx
import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';
import { useState } from 'react';

const Index = () => {
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);

  return (
    <div className="min-h-[180vh] bg-background-gray relative">
      {/* Header */}
      <Header />

      {/* Parallax-bild (85px under header, 530px hög) */}
      <div
        className="absolute inset-x-0 top-[85px] h-[530px]
                   bg-[url('/uploads/images/parallax/ParallaxImage1.jpg')]
                   bg-cover bg-center
                   rounded-b-[10px]"
      />

      {/* Main content – börjar 485px ner och är relativ för att positionera tagline */}
      <section className="relative pt-[485px] px-0.5 md:px-0">
        {/* Den lilla tagline-boxen */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2
                     w-[355px] h-[50px]
                     bg-background-gray
                     flex items-center justify-center"
        >
          <h3 className="font-rajdhani text-[16px] leading-none text-text-black text-center">
            Vi är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
          </h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-center md:min-h-screen my-[30px] py-[20px]">
          <div className="p-4 md:p-12 lg:p-16 bg-card-background mx-3 md:mx-0 md:max-w-5xl relative z-10 rounded-[10px] space-y-4">
            {/* Intro-text */}
            <div className="mx-1 md:mx-0 lg:max-w-3xl">
              <h1 className="mt-[10px] mb-[25px] md:mb-[30px]">
                Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv&nbsp;Comedy.
              </h1>
              <div className="border-t border-text-gray pt-[25px] md:pt-[10px] w-full lg:w-[90%] lg:mx-auto">
                <p className="text-base md:text-lg md:my-8">
                  Improv Comedy är underhållningen som skapas i stunden och som aldrig sker igen. Hos oss kan du lära dig hantverket med några av Sveriges bästa pedagoger, uppleva proffsiga föreställningar eller boka workshops anpassade för både privatpersoner och företag. Oavsett om du är nybörjare eller erfaren improvisatör är du välkommen till Lilla improteatern.
                </p>
              </div>
            </div>

            {/* Service-båtar */}
            <div className="space-y-4">
              <ServiceBoxes />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter modal */}
      <NewsletterSignupModal
        open={newsletterModalOpen}
        onOpenChange={setNewsletterModalOpen}
      />
    </div>
  );
};

export default Index;
