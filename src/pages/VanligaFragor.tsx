import { useEffect } from 'react';

export default function VanligaFragor() {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO: title, meta description, canonical
    document.title = 'Vanliga frågor – Improvkurser | Lilla Improteatern';
    const desc = 'Vanliga frågor om nivåer, återbetalning, frånvaro, scenframträdanden m.m. på Lilla Improteatern.';

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/vanliga-fragor');

    // Structured data: FAQPage
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Kan jag börja utan tidigare erfarenhet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener.'
          }
        },
        {
          '@type': 'Question',
          name: 'Varför har ni krav på att klara av nivå 1 innan man går nivå 2?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med rabatterat pris.'
          }
        },
        {
          '@type': 'Question',
          name: 'Får jag feedback?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling.'
          }
        },
        {
          '@type': 'Question',
          name: 'Behöver jag vara rolig?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nej. Humor kommer ur samspelet – vi lär dig teknikerna.'
          }
        },
        {
          '@type': 'Question',
          name: 'Kommer jag stå på scen?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ja. Alla kurser avslutas med ett uppspel inför publik.'
          }
        },
        {
          '@type': 'Question',
          name: 'Hur stora är grupperna?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Max 12 deltagare – så att alla får mycket scen- och lärartid.'
          }
        },
        {
          '@type': 'Question',
          name: 'Kan jag gå flera gånger?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ja. Många går om nivåkurser med nya verktyg och scener varje gång.'
          }
        },
        {
          '@type': 'Question',
          name: 'Kan jag ta igen missade tillfällen?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna.'
          }
        },
        {
          '@type': 'Question',
          name: 'Kan jag byta kurs om dagen inte passar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Om det finns platser i en annan grupp hjälper vi dig att byta. Ju tidigare du frågar desto större chans att du kan byta.'
          }
        },
        {
          '@type': 'Question',
          name: 'Jag behöver avboka kursen. Kan jag få pengarna tillbaka?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Avbokning är kostnadsfri fram till 30 dagar före kursstart. Därefter återbetalas du bara 50 % av kursavgiften. Vid avbokning senare än 14 dagar före kursstart ger vi ingen återbetalning. Vid utebliven närvaro sker ingen återbetalning.'
          }
        }
      ]
    } as const;
    const scriptId = 'ld-json-faq';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(ld);
  }, []);

  return (
    <>
      {/* Hero placeholder (samma struktur som Integritet) */}
      <div className="h-[240px] relative overflow-hidden">
        <div className="w-full h-full bg-card-component" />
      </div>

      <main className="bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[900px] -mt-12">
          <article className="bg-[#F3F3F3] rounded-t-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <header>
                <h1>Vanliga frågor</h1>
              </header>
              
              <section>
                <p className="mb-1 font-semibold">Kan jag börja utan tidigare erfarenhet?</p>
                <p className="mb-3">Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener.</p>
                <p className="font-semibold">Varför har ni krav på att klara av nivå 1 innan man går nivå 2?</p>
                <p>Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med rabatterat pris.</p>
                <p className="font-semibold">Får jag feedback?</p>
                <p>Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling.</p>
                <p className="font-semibold">Behöver jag vara rolig?</p>
                <p>Nej. Humor kommer ur samspelet – vi lär dig teknikerna.</p>
                <p className="font-semibold">Kommer jag stå på scen?</p>
                <p>Ja. Alla kurser avslutas med ett uppspel inför publik.</p>
                <p className="font-semibold">Hur stora är grupperna?</p>
                <p>Max 12 deltagare – så att alla får mycket scen- och lärartid.</p>
                <p className="font-semibold">Kan jag gå flera gånger?</p>
                <p>Ja. Många går om nivåkurser med nya verktyg och scener varje gång.</p>
                <p className="font-semibold">Kan jag ta igen missade tillfällen?</p>
                <p>Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna.</p>
                <p className="font-semibold">Kan jag byta kurs om dagen inte passar?</p>
                <p>Om det finns platser i en annan grupp hjälper vi dig att byta. Ju tidigare du frågar desto större chans att du kan byta.</p>
                <p className="font-semibold">Jag behöver avboka kursen. Kan jag få pengarna tillbaka?</p>
                <p>Avbokning är kostnadsfri fram till 30 dagar före kursstart. Därefter återbetalas du bara 50 % av kursavgiften. Vid avbokning senare än 14 dagar före kursstart ger vi ingen återbetalning. Vid utebliven närvaro sker ingen återbetalning.</p>
              </section>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
