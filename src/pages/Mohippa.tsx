// src/pages/Mohippa.tsx
import { useEffect } from 'react';
import Header from '@/components/Header';
import PrivateInquiryForm from '@/components/PrivateInquiryForm';
import { ArrowRight } from 'lucide-react';

export default function Mohippa() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col
                 bg-gradient-to-br from-theatre-primary
                 via-theatre-secondary to-theatre-tertiary
                 relative overflow-x-hidden overflow-y-visible"
      style={{ boxSizing: 'border-box', padding: 0, margin: 0 }}
    >
      <Header />

      {/* Hero Section */}
      <div className="w-full relative overflow-hidden select-none pointer-events-none h-[400px] md:h-[620px] lg:h-[750px]">
        <img
          src="/uploads/images/kurser_LIT_2024.jpg"
          alt=""
          className="w-full h-full object-cover object-center brightness-[0.97]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Content Section */}
      <main className="z-10 w-full relative overflow-x-hidden pb-16 md:pb-28">
        <div
          className="space-y-10 bg-white backdrop-blur-sm
                     p-6 md:p-8 lg:p-12
                     mx-3 md:mx-auto md:max-w-4xl
                     shadow-xl text-left"
        >
          {/* Huvudinnehåll */}
          <div className="space-y-4">
            <h2>Impro för möhippa, svensexa eller festen.</h2>
            <p>
              Improv Comedy är en perfekt aktivitet för att skapa skratt,
              gemenskap och minnen. Vi tar med oss det vi älskar med improv
              comedy – värme, överraskning och lekfullhet – och skapar något
              som passar just er.
            </p>

            <h3>Vad kan ni boka?</h3>
            <ul className="space-y-2">
              {[
                [
                  'Improshow',
                  'En specialutformad improföreställning där vi inkluderar detaljer om t.ex. födelsedagsbarnet eller brudparet',
                ],
                [
                  'Workshop',
                  'En lekfull och inkluderande introduktion i Improv Comedy, inga förkunskaper krävs',
                ],
                [
                  'Workshop + Show',
                  'Börja med en workshop tillsammans, avsluta med att vi uppträder för er',
                ],
              ].map(([title, body], i) => (
                <li key={i} className="flex items-start space-x-2">
                  <ArrowRight
                    className="text-red-800 mt-1 flex-shrink-0"
                    size={16}
                  />
                  <div>
                    <strong>{title}</strong> – {body}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Exempel på tillfällen */}
          <div className="space-y-4">
            <h3>Exempel på tillfällen vi passar för</h3>
            <ul className="space-y-2">
              {[
                'Möhippor & svensexor',
                'Födelsedagsfester',
                'After work',
                'Kompisgäng som vill göra något kul tillsammans',
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <ArrowRight className="text-red-800 flex-shrink-0" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontaktformulär */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="mb-4">Hör av dig</h3>
            <PrivateInquiryForm />
          </div>
        </div>
      </main>
    </div>
  );
}
