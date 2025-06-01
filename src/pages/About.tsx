
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformersSection from '@/components/PerformersSection';
import { useEffect } from 'react';
import { useAboutPageContent } from '@/hooks/useStrapi';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: aboutData, isLoading, error } = useAboutPageContent();

  console.log('About page - aboutData:', aboutData);
  console.log('About page - isLoading:', isLoading);
  console.log('About page - error:', error);

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

  // Handle both data.data and direct data formats from Strapi
  const content = aboutData?.data?.attributes || aboutData?.data || aboutData;
  
  // Handle performers - check multiple possible data structures
  let performers = [];
  if (content?.performers?.data) {
    // New Strapi format with data wrapper
    performers = content.performers.data.map((performer: any) => {
      console.log('Processing performer from Strapi:', performer);
      
      const attributes = performer.attributes || performer;
      
      // Extract image data - check multiple possible locations
      let imageData = null;
      
      // Check if image is in attributes.image.data.attributes.url format
      if (attributes.image?.data?.attributes?.url) {
        imageData = attributes.image.data.attributes;
      }
      // Check if image is in attributes.bild.data.attributes.url format  
      else if (attributes.bild?.data?.attributes?.url) {
        imageData = attributes.bild.data.attributes;
      }
      // Check direct image object
      else if (attributes.image?.url) {
        imageData = attributes.image;
      }
      else if (attributes.bild?.url) {
        imageData = attributes.bild;
      }
      
      console.log('Extracted image data for performer:', attributes.name, imageData);
      
      return {
        id: performer.id,
        name: attributes.name,
        bio: attributes.bio,
        image: imageData, // Pass the full image data object
      };
    });
  } else if (content?.performers && Array.isArray(content.performers)) {
    // Direct performers array - ensure proper structure
    performers = content.performers.map((performer: any) => {
      console.log('Processing direct performer:', performer);
      
      // Extract image data for direct format too
      let imageData = null;
      
      if (performer.image?.data?.attributes?.url) {
        imageData = performer.image.data.attributes;
      } else if (performer.bild?.data?.attributes?.url) {
        imageData = performer.bild.data.attributes;
      } else if (performer.image?.url) {
        imageData = performer.image;
      } else if (performer.bild?.url) {
        imageData = performer.bild;
      }
      
      console.log('Extracted direct image data for performer:', performer.name, imageData);
      
      return {
        id: performer.id || performer.documentId,
        name: performer.name,
        bio: performer.bio,
        image: imageData,
      };
    });
  }

  console.log('About page - content:', content);
  console.log('About page - processed performers:', performers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Om Lilla Improteatern
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            
            {/* Main info content with markdown conversion */}
            {content?.info && (
              <div 
                className="space-y-6 text-gray-700 leading-relaxed text-base mb-8"
                style={{ lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content.info) }}
              />
            )}

            {/* Performers section */}
            {performers && performers.length > 0 && (
              <PerformersSection performers={performers} />
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
