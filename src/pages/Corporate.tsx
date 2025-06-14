
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import { useEffect, useState, useRef } from 'react';
import { Loader } from 'lucide-react';

const PARALLAX_HEIGHT_MOBILE = 400;
const PARALLAX_HEIGHT_MD = 620;
const PARALLAX_HEIGHT_LG = 750;

const PARALLAX_IMAGE_FACTOR = 0.4; // långsammare, men följer med
const PARALLAX_BOX_FACTOR = 1.0;

const getParallaxHeights = () => {
  if (window.innerWidth >= 1024) return PARALLAX_HEIGHT_LG;
  if (window.innerWidth >= 768) return PARALLAX_HEIGHT_MD;
  return PARALLAX_HEIGHT_MOBILE;
};

const Corporate = () => {
  const [scrollY, setScrollY] = useState(0);
  const [parallaxHeight, setParallaxHeight] = useState(PARALLAX_HEIGHT_MOBILE);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // UPD: Håll koll på window height för att räkna max scroll
  const [windowHeight, setWindowHeight] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 0);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Update parallax height on resize
    const handleResize = () => {
      setParallaxHeight(getParallaxHeights());
      setWindowHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Listen for scroll and update scrollY
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mät höjden på contentlådan + hero
  useEffect(() => {
    const updateSectionHeight = () => {
      if (sectionRef.current) {
        setContentHeight(sectionRef.current.offsetHeight);
      }
    };
    updateSectionHeight();
    window.addEventListener("resize", updateSectionHeight);
    return () => window.removeEventListener("resize", updateSectionHeight);
  }, []);

  // 1. PARALLAX OFFSETS
  // Vi låter bild åka uppåt men långsammare. När vi har scrollat x% av rutan (t.ex. 0.6), så slutar vi animera bakgrunden.
  const maxImageOffset = parallaxHeight * 0.6; // efter ca 60% av hero är bilden borta
  const maxBoxOffset = (contentHeight ?? 0) - parallaxHeight + 40; // box bör aldrig lämna sidan

  // Dynamisk clamping
  const imageOffset = Math.min(scrollY * PARALLAX_IMAGE_FACTOR, maxImageOffset);
  const boxOffset = Math.min(scrollY * PARALLAX_BOX_FACTOR, maxBoxOffset);

  // Content boxen ska aldrig gå under toppen av bilden
  const minMarginTop = parallaxHeight - 70;
  const marginTop = Math.max(minMarginTop - boxOffset, 40);

  // 2. Beräkna total höjd för hela sidan - mer exakt för att minimera extra utrymme
  useEffect(() => {
    if (contentHeight) {
      // Beräkna exakt höjd baserat på innehållets faktiska position
      const contentBoxTop = parallaxHeight - 70; // boxens startposition
      const actualContentEnd = contentBoxTop + contentHeight - boxOffset; // ingen extra padding
      const totalRequiredHeight = Math.max(actualContentEnd + 50, windowHeight); // minimal padding
      
      setContainerHeight(totalRequiredHeight);
    }
  }, [contentHeight, parallaxHeight, boxOffset, windowHeight]);

  return (
    <div 
      className="bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative"
      style={{ 
        height: containerHeight ? `${containerHeight}px` : 'auto',
        minHeight: '100vh',
        overflow: 'auto'
      }}
    >
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      {/* Parallax Hero Section */}
      <div
        className="absolute top-0 left-0 w-full z-0 select-none pointer-events-none"
        style={{
          height: parallaxHeight,
          transform: `translateY(-${imageOffset}px)`,
          transition: "height 0.3s",
          overflow: 'hidden',
          // För mobil: "tona ut" bilden i botten om imageOffset >= maxImageOffset
          maskImage: imageOffset >= maxImageOffset ? 'linear-gradient(to bottom, black 75%, transparent 100%)' : undefined
        }}
        aria-hidden="true"
      >
        <img
          src="/lovable-uploads/9e2e2703-327c-416d-8e04-082ee11225ea.png"
          alt=""
          className="w-full h-full object-cover object-center pointer-events-none"
          style={{
            height: '100%',
            width: '100%',
            display: 'block',
            margin: 0,
            padding: 0,
            filter: 'brightness(0.99)', // lite mörk overlay men ljusare än innan
            willChange: 'transform',
            userSelect: 'none',
            transition: 'filter 0.2s'
          }}
          draggable={false}
        />
        {/* Transparent overlay över, mindre mörk */}
        <div className="absolute inset-0 pointer-events-none" style={{background: "rgba(0,0,0,0.10)" }} />
      </div>

      {/* Content */}
      <section
        ref={sectionRef}
        className="relative z-10 transition-transform"
        style={{
          marginTop: marginTop,
          willChange: "transform",
          paddingBottom: '2rem' // Minimal padding för att undvika att innehållet klistrar mot botten
        }}
      >
        <div
          className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto py-[23px] -mt-14 md:-mt-20 lg:-mt-24 shadow-xl"
          style={{
            boxShadow: '0 10px 36px 4px rgba(50, 38, 22, 0.16)',
            transition: 'box-shadow 0.4s, transform 0.3s cubic-bezier(.22,1.04,.79,1)',
            backdropFilter: 'blur(0.5px)',
            background: 'rgba(255,255,255,0.97)',
            transform: `translateY(-${boxOffset}px)`,
            willChange: "transform",
          }}
        >
          {/* Contentboxen överlappar bilden snyggt */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Workshops & Events för er organisation</h2>
            <h3 className="text-theatre-secondary mb-4 font-medium text-base">
              Utveckla kreativitet, samarbete och kommunikation genom improvisationsteater.
            </h3>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-base" style={{ lineHeight: '1.3' }}>
                Improvisationsteater är ett kraftfullt verktyg för teambuilding, kreativ problemlösning och 
                kommunikationsutveckling. Våra skräddarsydda workshops hjälper era medarbetare att utveckla 
                förmågor som är värdefulla både på arbetsplatsen och i vardagslivet.
              </p>
              <p className="text-base" style={{ lineHeight: '1.3' }}>
                Vi arbetar med organisationer av alla storlekar – från startups till stora företag, 
                myndigheter och ideella organisationer. Varje workshop anpassas efter era specifika mål och behov.
              </p>
            </div>
          </div>

          {/* What we offer */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vad vi erbjuder</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Teambuilding-workshops</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{
                lineHeight: '1.3'
              }}>
                  Stärk sammanhållningen och förtroendet i teamet genom övningar som fokuserar på samarbete, 
                  lyssnarförmåga och att bygga vidare på varandras idéer.
                </p>
              </div>
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Kommunikationsträning</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{
                lineHeight: '1.3'
              }}>
                  Utveckla färdigheter inom presentation, aktiv lyssning och att hantera oväntade situationer 
                  med trygghet och kreativitet.
                </p>
              </div>
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Kreativitet & Innovation</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{
                lineHeight: '1.3'
              }}>
                  Lär er tekniker för att tänka utanför boxen, säga "ja, och..." till nya idéer och 
                  skapa en kultur där innovation kan blomstra.
                </p>
              </div>
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Ledarskapsträning</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{
                lineHeight: '1.3'
              }}>
                  Utveckla förmågan att ta initiativ, stötta teammedlemmar och hantera osäkerhet 
                  med självförtroende och anpassningsförmåga.
                </p>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Så här går det till</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Första samtalet</h3>
                  <p className="text-gray-700 text-base" style={{
                  lineHeight: '1.3'
                }}>
                    Vi träffas (digitalt eller fysiskt) för att förstå era mål, utmaningar och 
                    vilken typ av workshop som skulle passa bäst.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Skräddarsytt förslag</h3>
                  <p className="text-gray-700 text-base" style={{
                  lineHeight: '1.3'
                }}>Vi utformar en workshop som är anpassad efter er grupp, era mål och tillgänglig tid.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Genomförande</h3>
                  <p className="text-gray-700 text-base" style={{
                  lineHeight: '1.3'
                }}>Vi kommer till er (eller annan plats) och genomför workshopen.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Uppföljning</h3>
                  <p className="text-gray-700 text-base" style={{
                  lineHeight: '1.3'
                }}>
                    Vi följer upp för att höra hur ni upplevde workshopen och diskuterar 
                    eventuella fortsättningsaktiviteter.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4 my-0">Gör en förfrågan</h2>
            <p style={{ lineHeight: '1.3' }} className="text-gray-700 mb-6 text-base py-0 my-[17px]">
              Berätta om er organisation och vad ni är ute efter, så hör vi av oss för att diskutera möjligheterna.
            </p>
            <CorporateInquiryForm />
          </div>
        </div>
      </section>

      {/* Responsive höjder + fallback för section's marginTop på större skärmar */}
      <style>
        {`
          @media (min-width: 768px) {
            .absolute.top-0.left-0.w-full.z-0 {
              height: ${PARALLAX_HEIGHT_MD}px !important;
            }
          }
          @media (min-width: 1024px) {
            .absolute.top-0.left-0.w-full.z-0 {
              height: ${PARALLAX_HEIGHT_LG}px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Corporate;
