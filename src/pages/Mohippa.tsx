
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrivateInquiryForm from '@/components/PrivateInquiryForm';
import CourseInfoSection from '@/components/CourseInfoSection';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePrivateParty } from '@/hooks/useStrapi';
import { formatCourseMainInfo } from '@/utils/strapiHelpers';
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

const Mohippa = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: privatePartyData, isLoading, error } = usePrivateParty();
  const mainInfo = formatCourseMainInfo(privatePartyData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Laddar...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading private party data:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      {/* Main Content - All in one white section */}
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 animate-fade-in flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            
            {/* Render Strapi content if available */}
            {mainInfo ? (
              <div className="space-y-6">
                <div className="text-left space-y-6">
                  {mainInfo.info && (
                    <div
                      className="space-y-6 text-gray-700 leading-relaxed text-base"
                      style={{ lineHeight: '1.8' }}
                      dangerouslySetInnerHTML={{
                        __html: convertMarkdownToHtml(mainInfo.info),
                      }}
                    />
                  )}

                  {mainInfo.redbox && (
                    <div className="bg-red-700 p-6 rounded-none relative">
                      <div
                        className="text-base leading-relaxed font-light"
                        style={{ lineHeight: '1.8' }}
                        dangerouslySetInnerHTML={{
                          __html: convertMarkdownToHtmlForRedBox(mainInfo.redbox),
                        }}
                      />
                    </div>
                  )}

                  {mainInfo.infoAfterRedbox && (
                    <div
                      className="space-y-6 text-gray-700 leading-relaxed text-base"
                      style={{ lineHeight: '1.8' }}
                      dangerouslySetInnerHTML={{
                        __html: convertMarkdownToHtml(mainInfo.infoAfterRedbox),
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Fallback content */
              <div>
                {/* Main heading */}
                <div className="mb-8">
                  <h3 className="text-theatre-secondary font-medium mb-6">
                    Boka en improworkshop eller en skräddarsydd show till din fest, möhippa, svensexa, födelsedag eller annan tillställning.
                  </h3>
                  <p className="text-black text-base leading-relaxed">
                    Improv Comedy är en perfekt aktivitet för att skapa skratt, gemenskap och minnen. Vi tar med oss det vi älskar med improv comedy – värme, överraskning och lekfullhet – och skapar något som passar just er.
                  </p>
                </div>

                {/* What can you book */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-black mb-4">Vad kan ni boka?</h2>
                  <ul className="space-y-3 text-black">
                    <li className="flex items-start">
                      <ArrowRight className="text-red-800 mr-2 mt-1 flex-shrink-0" size={16} />
                      <div>
                        <strong>Improshow</strong> – En specialutformad improföreställning där vi inkluderar detaljer om t.ex. födelsedagsbarnet eller brudparet
                      </div>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="text-red-800 mr-2 mt-1 flex-shrink-0" size={16} />
                      <div>
                        <strong>Workshop</strong> – En lekfull och inkluderande introduktion i Improv Comedy, inga förkunskaper krävs
                      </div>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="text-red-800 mr-2 mt-1 flex-shrink-0" size={16} />
                      <div>
                        <strong>Workshop + Show</strong> – Börja med att en workshop tillsammans, avsluta med att vi uppträder för er
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Location */}
                <div className="mb-8">
                  <p className="text-black text-base leading-relaxed">
                    Vi kommer gärna till er – eller hjälper till att ordna plats i samarbete med lokaler i Stockholm.
                  </p>
                </div>

                {/* Examples */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-black mb-4">Exempel på tillfällen vi passar för:</h2>
                  <ul className="space-y-2 text-black">
                    <li className="flex items-center">
                      <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                      Möhippor & svensexor
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                      Födelsedagsfester
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                      After work
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                      Kompisgäng som vill göra något kul tillsammans
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Contact Form - always at the bottom within same white section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-black mb-4">Hör av dig</h2>
              <PrivateInquiryForm />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Mohippa;
