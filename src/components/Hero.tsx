
import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative overflow-hidden">
      {/* Geometric shapes inspired by your reference image */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-theatre-light/10 rotate-45 transform"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-theatre-tertiary/30 rotate-12 transform"></div>
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

          {/* Description */}
          <div className="max-w-3xl">
            <p className="text-xl md:text-2xl leading-relaxed text-theatre-light/80 font-light">
              Lilla Improteatern är en plats för dig som vill{' '}
              <span className="font-medium text-theatre-light">lära dig</span>,{' '}
              <span className="font-medium text-theatre-light">utöva</span> och{' '}
              <span className="font-medium text-theatre-light">uppleva</span>{' '}
              Improv Comedy.
            </p>
          </div>

          {/* Services section */}
          <div className="space-y-12">
            <p className="text-xl text-theatre-light font-light">Här hittar du:</p>
            <ServiceBoxes />
          </div>

          {/* Mission statement */}
          <div className="max-w-4xl space-y-8 pt-16">
            <p className="text-xl md:text-2xl leading-relaxed text-theatre-light/80 font-light">
              Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
              improvisatörerna bättre och publiken gladare.
            </p>
            <p className="text-2xl md:text-3xl font-medium text-theatre-light">
              Välkommen till ett nytt hem för Improv Comedy i Stockholm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
