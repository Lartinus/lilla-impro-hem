
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Shows = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shows = [
    {
      id: 1,
      title: "Lilla improteaterns ensemble",
      date: "27 oktober 19.00",
      location: "Metropole",
      slug: "ensemble-27-oktober"
    },
    {
      id: 2,
      title: "Improviserad komedi",
      date: "15 november 20.00", 
      location: "Teater Galeasen",
      slug: "improkomedi-15-november"
    },
    {
      id: 3,
      title: "Julspecial - Improkomedi",
      date: "8 december 18.30",
      location: "Södra Teatern",
      slug: "julspecial-8-december"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Föreställningar
          </h1>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="grid gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          {shows.map((show) => (
            <Link key={show.id} to={`/shows/${show.slug}`} className="block">
              <div className="border-4 border-white bg-white rounded-none p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-blue-500 font-bold text-lg mb-1">
                      <span className="block md:hidden">{show.title}</span>
                      <span className="hidden md:block">{show.title} {show.date}</span>
                    </h2>
                    <div className="block md:hidden text-blue-500 font-bold text-lg mb-2">
                      {show.date}
                    </div>
                    <p className="text-gray-600">{show.location}</p>
                  </div>
                  <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
                    <span className="text-sm">Läs mer →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shows;
