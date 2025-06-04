


import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <>
      <section className="min-h-screen flex flex-col justify-center py-12 px-2 md:px-4 relative overflow-hidden">
        <div className="relative z-10">
          {/* Hero heading outside the box */}
          {/* Combined content box */}
          <div className="text-left space-y-4 p-6 md:p-16 lg:p-20 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto animate-fade-in">
            {/* Description */}
            <div className="max-w-4xl space-y-2 pb-1">
              <p className="text-lg text-gray-700 font-light" style={{ lineHeight: '1.2' }}>
                Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. 
                På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, 
                och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
              </p>
            </div>

            {/* Services section */}
            <div className="space-y-4">
              <ServiceBoxes />
            </div>

            {/* Mission statement */}
            <div className="max-w-4xl space-y-3 pt-4">
              <p className="text-lg text-gray-700 font-light" style={{ lineHeight: '1.2' }}>
                Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
                improvisatörerna bättre och publiken gladare – och på att skapa ett community 
                där du som elev, improvisatör och publik blir en del av något större.
              </p>
              <p className="text-lg text-gray-700 font-light" style={{ lineHeight: '1.2' }}>
                Välkommen till ett nytt hem för Improv Comedy i Stockholm.
              </p>
            </div>

            {/* Video section headings - responsive alignment */}
            <div className="max-w-4xl space-y-3 pt-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-800 tracking-normal mb-4 text-left md:text-center">
                Vad är improv comedy egentligen?
              </h1>
              <h3 className="text-theatre-secondary font-medium mb-4 text-left md:text-center">
                Upptäck konstformen som bygger på spontanitet, kreativitet och samarbete.
              </h3>
            </div>

            {/* Video section content */}
            <div className="mt-8">
              <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white">
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((video) => (
                    <div key={video} className="group">
                      <div className="bg-red-700 backdrop-blur-sm border border-theatre-primary/20 rounded-2xl p-6 hover:bg-red-800 transition-all duration-500 hover:border-theatre-primary/30 hover:transform hover:scale-105 aspect-video flex items-center justify-center">
                        <div className="text-centre space-y-4">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                          </div>
                          <p className="text-white text-sm font-light">
                            Video {video}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;


