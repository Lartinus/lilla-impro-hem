
import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative overflow-hidden">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Diagonal geometric shape like in reference */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-full h-32 bg-theatre-secondary/20 transform -skew-y-2 -translate-y-16"
          style={{ top: '35%', left: '-10%', width: '120%' }}
        ></div>
        <div 
          className="absolute w-full h-24 bg-theatre-light/5 transform -skew-y-1 translate-y-8"
          style={{ top: '37%', left: '-10%', width: '120%' }}
        ></div>
      </div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-left space-y-16">
          {/* Main heading with bold typography like IMPROV in reference */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-theatre-light tracking-tight">
              IMPROV
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-light leading-tight text-theatre-light/90 tracking-wide">
              Comedy för alla
            </h2>
          </div>

          {/* Updated description */}
          <div className="max-w-3xl space-y-6">
            <p className="text-xl md:text-2xl leading-relaxed text-theatre-light/80 font-light">
              Lilla Improteatern är en plats för dig som vill{' '}
              <span className="font-medium text-theatre-light">lära dig</span>,{' '}
              <span className="font-medium text-theatre-light">utöva</span> och{' '}
              <span className="font-medium text-theatre-light">uppleva</span>{' '}
              Improv Comedy.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-theatre-light/80 font-light">
              Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. 
              På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, 
              och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
            </p>
          </div>

          {/* Services section */}
          <div className="space-y-12">
            <ServiceBoxes />
          </div>

          {/* Updated mission statement */}
          <div className="max-w-4xl space-y-8 pt-16">
            <p className="text-xl md:text-2xl leading-relaxed text-theatre-light/80 font-light">
              Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
              improvisatörerna bättre och publiken gladare – och på att skapa ett community 
              där du som elev, improvisatör och publik blir en del av något större.
            </p>
            <p className="text-2xl md:text-3xl font-medium text-theatre-light">
              Välkommen till ett nytt hem för Improv Comedy i Stockholm.
            </p>
          </div>

          {/* Video section */}
          <div className="max-w-4xl space-y-12 pt-20">
            <h3 className="text-3xl md:text-4xl font-medium text-theatre-light">
              Tre videor
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((video) => (
                <div key={video} className="group">
                  <div className="bg-theatre-light/10 backdrop-blur-sm border border-theatre-light/20 rounded-2xl p-6 hover:bg-theatre-light/15 transition-all duration-500 hover:border-theatre-light/30 hover:transform hover:scale-105 aspect-video flex items-center justify-center">
                    <div className="text-centre space-y-4">
                      <div className="w-16 h-16 bg-theatre-light/20 rounded-full flex items-center justify-center mx-auto">
                        <div className="w-0 h-0 border-l-[12px] border-l-theatre-light border-y-[8px] border-y-transparent ml-1"></div>
                      </div>
                      <p className="text-theatre-light/80 text-sm font-light">
                        Video {video}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8">
              <h4 className="text-2xl md:text-3xl font-light text-theatre-light mb-4">
                Vad är improv comedy egentligen?
              </h4>
              <p className="text-lg text-theatre-light/80 font-light max-w-2xl mx-auto">
                Upptäck konstformen som bygger på spontanitet, kreativitet och samarbete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
