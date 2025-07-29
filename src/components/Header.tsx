// src/pages/Index.tsx
import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';
import { useState } from 'react';

const Index = () => {
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);

  return (
    <div className="min-h-[180vh] bg-background-gray relative">
      {/* HEADER – ignore for denna del */}
      <Header />

      {/* 1. Statisk “hero”-bild */}
      <div
        className="absolute inset-x-0 top-[85px] h-[530px]
                   bg-[url('/uploads/images/parallax/ParallaxImage1.jpg')]
                   bg-cover bg-center
                   rounded-b-[10px]"
      />

      {/* 2. Den lilla tagline‐boxen */}
      <div
        className="absolute inset-x-0 top-[85px] 
                   h-[50px] flex justify-center items-center"
      >
        <h3 className="font-rajdhani text-[16px] text-text-black text-center w-[355px]">
          Vi är en plats för dig som vill lära dig,<br/>
          utöva och uppleva Improv Comedy.
        </h3>
      </div>

      {/* 3. Allt innehåll börjar 485px under headerns botten */}
      <main className="relative pt-[485px] px-4 md:px-0">
        <div className="mx-auto md:flex md:items-start md:justify-center md:space-x-8">
          {/* Info-kortet */}
          <div className="bg-card-background rounded-[10px] p-6 md:p-12 lg:p-16 max-w-3xl w-full space-y-6">
            <h1 className="font-tanker text-[32px] lg:text-[40px] leading-tight">
              Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
            </h1>
            <hr className="border-t border-text-gray" />
            <p className="font-satoshi text-[16px] leading-relaxed">
              Improv Comedy är underhållningen som skapas i stunden och som aldrig sker igen. Hos oss kan du lära dig hantverket med några av Sveriges bästa pedagoger, uppleva proffsiga föreställningar eller boka workshops anpassade för både privatpersoner och företag. Oavsett om du är nybörjare eller erfaren improvisatör är du välkommen till Lilla improteatern.
            </p>
          </div>
        </div>

        {/* 4. Service-boxarna */}
        <div className="mt-12 md:mt-16">
          <ServiceBoxes />
        </div>
      </main>

      {/* Newsletter-modal */}
      <NewsletterSignupModal
        open={newsletterModalOpen}
        onOpenChange={setNewsletterModalOpen}
      />
    </div>
  );
};

export default Index;
