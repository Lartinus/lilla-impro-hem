import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformersSection from '@/components/PerformersSection';
import { useEffect } from 'react';
import { useAboutPageContent } from '@/hooks/useStrapi';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';
import { Loader } from 'lucide-react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: aboutData, isLoading, error } = useAboutPageContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-white" />
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

  // Handle both data.data and direct data formats from Strapi
  const content = aboutData?.data?.attributes || aboutData?.data || aboutData;
  
  // Hantera performers-data utan logs
  let performers = [];
  if (content?.performers?.data) {
    // Ny Strapi-format med data wrapper
    performers = content.performers.data.map((performer: any) => {
      const attributes = performer.attributes || performer;
      const imageField = attributes.image || attributes.bild;
      const imageUrl = getStrapiImageUrl(imageField);
      return {
        id: performer.id,
        name: attributes.name,
        bio: attributes.bio,
        image: imageUrl,
      };
    });
  } else if (content?.performers && Array.isArray(content.performers)) {
    // Direkt performers-array
    performers = content.performers.map((performer: any) => {
      const imageField = performer.image || performer.bild;
      const imageUrl = getStrapiImageUrl(imageField);
      return {
        id: performer.id || performer.documentId,
        name: performer.name,
        bio: performer.bio,
        image: imageUrl,
      };
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      {/* Main Content */}
      <section className="py-8 px-0.5 md:px-4 mt-20 flex-1">
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Main info content with markdown conversion */}
          {content?.info && (
            <div 
              className="space-y-6 text-gray-700 leading-relaxed text-base"
              style={{ lineHeight: '1.3' }}
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.info) }}
            />
          )}

          {/* Performers section */}
          {performers && performers.length > 0 && (
            <PerformersSection performers={performers} />
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
