
import Header from '@/components/Header';
import CorporateInquiryForm from "@/components/CorporateInquiryForm";
import { useEffect, useState } from 'react';

const Corporate = () => {
  const [marginTop, setMarginTop] = useState('-150px');

  useEffect(() => {
    window.scrollTo(0, 0);

    const updateMarginTop = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setMarginTop('-200px'); // desktop
      } else if (width >= 768) {
        setMarginTop('-150px'); // tablet
      } else {
        setMarginTop('-120px'); // mobile
      }
    };

    updateMarginTop();
    window.addEventListener('resize', updateMarginTop);
    return () => window.removeEventListener('resize', updateMarginTop);
  }, []);

  return (
    <div
      className="relative overflow-x-hidden bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary"
      style={{
        boxSizing: 'border-box',
        padding: 0,
        margin: 0,
        width: '100vw',
        minHeight: '100dvh',
      }}
    >
      <Header />
      
      {/* Hero Section */}
      <div className="w-full relative overflow-hidden select-none pointer-events-none h-[400px] md:h-[620px] lg:h-[750px]">
        <img
          src="/lovable-uploads/87ee64a5-46e8-4910-9307-369d9a2071bb.png"
          alt=""
          className="w-full h-full object-cover object-center brightness-[0.97] select-none pointer-events-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Content Section */}
      <main
        className="z-10 w-full relative overflow-x-hidden pb-16 md:pb-28"
        style={{
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          paddingBottom: '64px',
          marginTop,
        }}
      >
        <div className="space-y-10 bg-white backdrop-blur-sm p-6 md:p-8 lg:p-12 mx-3 md:mx-auto md:max-w-4xl shadow-xl text-left">
          
          {/* Intro */}
          <div className="space-y-6">
            <h2>Workshops & Events för er organisation</h2>
            <h5>
              Utveckla kreativitet, samarbete och kommunikation genom improvisationsteater.
            </h5>
            <p>
              Improvisationsteater är ett kraftfullt verktyg för teambuilding, kreativ problemlösning och 
              kommunikationsutveckling. Våra skräddarsydda workshops hjälper era medarbetare att utveckla 
              förmågor som är värdefulla både på arbetsplatsen och i vardagslivet.
            </p>
            <p>
              Vi arbetar med organisationer av alla storlekar – från startups till stora företag, 
              myndigheter och ideella organisationer. Varje workshop anpassas efter era specifika mål och behov.
            </p>
          </div>

          <h2>Vad vi erbjuder</h2>
          {/* Vad vi erbjuder */}
          <div className="space-y-4 border-3 border-red-800 p-4">
            {[
              ["Teambuilding-workshops", "Stärk sammanhållningen och förtroendet i teamet genom övningar som fokuserar på samarbete, lyssnarförmåga och att bygga vidare på varandras idéer."],
              ["Kommunikationsträning", "Utveckla färdigheter inom presentation, aktiv lyssning och att hantera oväntade situationer med trygghet och kreativitet."],
              ["Kreativitet & Innovation", "Lär er tekniker för att tänka utanför boxen, säga \"ja, och...\" till nya idéer och skapa en kultur där innovation kan blomstra."],
              ["Ledarskapsträning", "Utveckla förmågan att ta initiativ, stötta teammedlemmar och hantera osäkerhet med självförtroende och anpassningsförmåga."]
            ].map(([title, body], i) => (
              <div key={i}>
                <h5>{title}</h5>
                <p>{body}</p>
              </div>
            ))}
          </div>

          {/* Process */}
          <div className="space-y-4">
            <h2 className="my-6">Så här går det till</h2>

            {["Första samtalet", "Skräddarsytt förslag", "Genomförande", "Uppföljning"].map((step, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-theatre-secondary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-theatre-secondary">{step}</h3>
                  <p>
                    {[
                      "Vi träffas (digitalt eller fysiskt) för att förstå era mål, utmaningar och vilken typ av workshop som skulle passa bäst.",
                      "Vi utformar en workshop som är anpassad efter er grupp, era mål och tillgänglig tid.",
                      "Vi kommer till er (eller annan plats) och genomför workshopen.",
                      "Vi följer upp för att höra hur ni upplevde workshopen och diskuterar eventuella fortsättningsaktiviteter."
                    ][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulär */}
          <div className="space-y-4">
            <p>
              Berätta om er organisation och vad ni är ute efter, så hör vi av oss för att diskutera möjligheterna.
            </p>
            <CorporateInquiryForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Corporate;
