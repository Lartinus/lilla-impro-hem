
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformersSection from '@/components/PerformersSection';
import { useEffect } from 'react';
import { useAboutPageContent } from '@/hooks/useStrapi';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: aboutData, isLoading, error } = useAboutPageContent();

  console.log('About page - RAW aboutData:', JSON.stringify(aboutData, null, 2));
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
  console.log('About page - extracted content:', JSON.stringify(content, null, 2));
  
  // Handle performers - check multiple possible data structures
  let performers = [];
  
  // Log the raw performers data first
  console.log('About page - RAW performers data:', JSON.stringify(content?.performers, null, 2));
  
  if (content?.performers?.data) {
    // New Strapi format with data wrapper
    console.log('About page - Using performers.data format');
    performers = content.performers.data.map((performer: any, index: number) => {
      console.log(`About page - Processing performer ${index}:`, JSON.stringify(performer, null, 2));
      
      const attributes = performer.attributes || performer;
      console.log(`About page - Performer ${index} attributes:`, JSON.stringify(attributes, null, 2));
      
      // Log all possible image field locations
      console.log(`About page - Performer ${index} image field:`, JSON.stringify(attributes.image, null, 2));
      console.log(`About page - Performer ${index} bild field:`, JSON.stringify(attributes.bild, null, 2));
      
      // Try to get image URL - check image first since that's what Strapi shows
      const imageField = attributes.image || attributes.bild;
      console.log(`About page - Selected image field for performer ${index}:`, JSON.stringify(imageField, null, 2));
      
      const imageUrl = getStrapiImageUrl(imageField);
      console.log(`About page - Final image URL for performer ${index}:`, imageUrl);
      
      return {
        id: performer.id,
        name: attributes.name,
        bio: attributes.bio,
        image: imageUrl,
      };
    });
  } else if (content?.performers && Array.isArray(content.performers)) {
    // Direct performers array
    console.log('About page - Using direct performers array format');
    performers = content.performers.map((performer: any, index: number) => {
      console.log(`About page - Processing direct performer ${index}:`, JSON.stringify(performer, null, 2));
      
      // Log all possible image field locations
      console.log(`About page - Direct performer ${index} image field:`, JSON.stringify(performer.image, null, 2));
      console.log(`About page - Direct performer ${index} bild field:`, JSON.stringify(performer.bild, null, 2));
      
      const imageField = performer.image || performer.bild;
      console.log(`About page - Selected image field for direct performer ${index}:`, JSON.stringify(imageField, null, 2));
      
      const imageUrl = getStrapiImageUrl(imageField);
      console.log(`About page - Final image URL for direct performer ${index}:`, imageUrl);
      
      return {
        id: performer.id || performer.documentId,
        name: performer.name,
        bio: performer.bio,
        image: imageUrl,
      };
    });
  }

  console.log('About page - FINAL processed performers:', JSON.stringify(performers, null, 2));

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
