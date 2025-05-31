
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { useAboutPageContent } from '@/hooks/useStrapi';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: aboutData, isLoading, error } = useAboutPageContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Laddar...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading about page content:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Ett fel uppstod vid laddning av sidan</div>
      </div>
    );
  }

  const content = aboutData?.data?.attributes || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            {content.title || 'Om Lilla Improteatern'}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            
            {/* Main content with proper markdown conversion */}
            {content.content && (
              <div 
                className="space-y-6 text-gray-700 leading-relaxed text-base"
                style={{ lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.content) }}
              />
            )}

            {/* Who can join section - NOW WITH MARKDOWN CONVERSION */}
            {content.who_can_join && (
              <div className="mt-8">
                <div 
                  className="space-y-6 text-gray-700 leading-relaxed text-base"
                  style={{ lineHeight: '1.3' }}
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.who_can_join) }}
                />
              </div>
            )}

            {/* Vision section - NOW WITH MARKDOWN CONVERSION */}
            {content.vision && (
              <div className="mt-8">
                <div 
                  className="space-y-6 text-gray-700 leading-relaxed text-base"
                  style={{ lineHeight: '1.3' }}
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.vision) }}
                />
              </div>
            )}

            {/* FAQ section - NOW WITH MARKDOWN CONVERSION */}
            {content.faq && (
              <div className="mt-8">
                <div 
                  className="space-y-6 text-gray-700 leading-relaxed text-base"
                  style={{ lineHeight: '1.3' }}
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.faq) }}
                />
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
