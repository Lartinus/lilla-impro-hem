import ServiceBoxes from './ServiceBoxes';
import { useHeroImages } from '@/hooks/useHeroImages';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';
const Hero = () => {
  const {
    data: heroData,
    isLoading
  } = useHeroImages();
  console.log('Hero - Hero data:', heroData);

  // Extract video URLs from hero data
  const getVideoUrl = (fieldName: string) => {
    if (!heroData?.data) return null;
    const videoField = heroData.data[fieldName];
    return getStrapiImageUrl(videoField); // Videos are stored as media files
  };
  const videos = [{
    id: 1,
    url: getVideoUrl('video_1'),
    title: "Video 1"
  }, {
    id: 2,
    url: getVideoUrl('video_2'),
    title: "Video 2"
  }, {
    id: 3,
    url: getVideoUrl('video_3'),
    title: "Video 3"
  }];
  return <section className="min-h-screen flex flex-col justify-center py-12 px-0.5 md:px-4 relative overflow-hidden">
      <div className="relative z-10">
        {/* På mobil: mt-12, på desktop: mt-20 för mer avstånd till header */}
        <div className="mt-12 md:mt-20 p-4 md:p-12 lg:p-16 text-left space-y-4 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto">
          
          {/* Beskrivning */}
          <div className="max-w-4xl space-y-2 pb-1">
            <h1 className="sm:text-2xl md:text-3xl leading-tight text-gray-800 tracking-normal mb-4 text-left lg:text-5xl font-bold text-xl py-px mx-[2px] my-[10px]">
              Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
            </h1>
            <p className="text-base md:text-lg text-gray-700 font-light leading-tight">
              Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. 
              På vår teater får du utvecklas som improvisatör i trygga och inspirerande kursmiljöer, 
              och ta del av roliga, smarta och lekfulla föreställningar.
            </p>
          </div>

          {/* Services‐sektionen - prioriterad laddning */}
          <div className="space-y-4">
            <ServiceBoxes />
          </div>

          {/* Mission statement */}
          <div className="max-w-4xl space-y-3 pt-4">
            <p className="text-base md:text-lg text-gray-700 font-light leading-tight">
              Vi bygger med kvalitet, nyfikenhet och ett stort fokus på att göra 
              improvisatörerna bättre och publiken gladare – och på att skapa ett community 
              där du som elev, improvisatör och publik blir en del av något större.
            </p>
            <p className="text-base md:text-lg text-gray-700 font-light leading-tight">
              Välkommen till ett nytt hem för Improv Comedy i Stockholm.
            </p>
          </div>

          {/* Video‐rubriker - centrerad på desktop, vänster på mobil */}
          <div className="max-w-4xl space-y-3 pt-8 py-0 my-[21px]">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-gray-800 tracking-normal mb-4 text-left md:text-center lg:text-3xl">
              Vad är improv comedy egentligen?
            </h1>
            <h3 className="text-theatre-secondary font-medium mb-4 text-left md:text-center">
              Upptäck konstformen som bygger på spontanitet, kreativitet och samarbete.
            </h3>
          </div>

          {/* Video‐innehåll - laddas efter bilder */}
          <div className="mt-8">
            <div className="space-y-8 p-6 md:p-6 lg:p-12 bg-white py-0">
              <div className="grid md:grid-cols-3 gap-6">
                {videos.map((video, index) => <div key={video.id} className="group">
                    <div className="bg-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 aspect-video">
                      {isLoading ? <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
                          <div className="text-gray-500 text-sm">
                            Laddar video...
                          </div>
                        </div> : video.url ? <video controls className="w-full h-full object-cover" preload="metadata">
                          <source src={video.url} type="video/mp4" />
                          Din webbläsare stöder inte video-taggen.
                        </video> : <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto">
                              <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {video.title}
                            </p>
                          </div>
                        </div>}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>;
};
export default Hero;