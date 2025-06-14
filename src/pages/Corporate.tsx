import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

const PARALLAX_HEIGHT_MOBILE = 400;
const PARALLAX_HEIGHT_MD = 620;
const PARALLAX_HEIGHT_LG = 750;

const Corporate = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-hidden">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      {/* Parallax Hero Section */}
      <div
        className="fixed top-0 left-0 w-full z-0"
        style={{
          height: `calc(${PARALLAX_HEIGHT_MOBILE}px + 8vw)`, // För lite extra höjd
        }}
      >
        <img
          src="/lovable-uploads/9e2e2703-327c-416d-8e04-082ee11225ea.png"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{
            height: '100%',
            width: '100%',
            display: 'block',
            margin: 0,
            padding: 0,
            filter: 'brightness(0.98)', // Lite mörkare, valfritt
            willChange: 'transform',
          }}
          draggable={false}
        />
        {/* Transparent overlay för tydlig text ovanpå */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      {/* Content */}
      <section
        className="relative z-10"
        style={{
          marginTop: `calc(${PARALLAX_HEIGHT_MOBILE}px + 8vw - 70px)`, // Skjuter ned contentboxen så “parallax” syns
        }}
      >
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto py-[23px] -mt-14 md:-mt-20 lg:-mt-24 shadow-xl"
          style={{
            // Lite fade/skugga nertill för flytande känsla
            boxShadow: '0 10px 36px 4px rgba(50, 38, 22, 0.16)',
            transition: 'box-shadow 0.4s, transform 0.3s cubic-bezier(.22,1.04,.79,1)',
            backdropFilter: 'blur(0.5px)',
            background: 'rgba(255,255,255,0.97)',
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

      {/* MOBILE/RESPONSIVE HEIGHTS */}
      <style>
        {`
          @media (min-width: 768px) {
            .fixed.top-0.left-0.w-full.z-0 {
              height: ${PARALLAX_HEIGHT_MD}px !important;
            }
            section[style] {
              margin-top: calc(${PARALLAX_HEIGHT_MD}px - 64px) !important;
            }
          }
          @media (min-width: 1024px) {
            .fixed.top-0.left-0.w-full.z-0 {
              height: ${PARALLAX_HEIGHT_LG}px !important;
            }
            section[style] {
              margin-top: calc(${PARALLAX_HEIGHT_LG}px - 64px) !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Corporate;
