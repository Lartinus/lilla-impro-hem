import { useEffect } from 'react';
import Header from '@/components/Header';

export default function Integritet() {
  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO: title, meta description, canonical
    document.title = 'Integritet, GDPR och cookies | Lilla Improteatern';
    const desc = 'Integritetspolicy, GDPR och cookies för Lilla Improteatern Stockholm AB. Läs om hur vi behandlar personuppgifter och dina rättigheter.';

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
    canonical.setAttribute('href', window.location.origin + '/integritet');

    // Structured data
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Integritetspolicy – Lilla Improteatern',
      url: window.location.origin + '/integritet',
      description: desc,
    };
    const scriptId = 'ld-json-integritet';
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
      <Header />
      <div className="h-[240px] relative overflow-hidden">
        {/* Hero placeholder */}
        <div className="w-full h-full bg-card-component" />
      </div>

      <main className="bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[900px] -mt-12">
          <article className="bg-[#F3F3F3] rounded-t-lg overflow-hidden">
            <div className="p-6 md:p-8 space-y-6">
              <header>
                <h1>Integritets-, GDPR- och cookiespolicy</h1>
                <p className="text-sm text-text-gray">Lilla Improteatern Stockholm AB • Senast uppdaterad: 2025-08-12</p>
              </header>

              <section className="space-y-3">
                <h2>Omfattning</h2>
                <p>
                  Denna policy beskriver hur Lilla Improteatern Stockholm AB ("vi", "oss") behandlar personuppgifter
                  och hur vi hanterar cookies/spårning på vår webbplats.
                </p>
              </section>

              <section className="space-y-2">
                <h2>Personuppgiftsansvarig och kontakt</h2>
                <p>Personuppgiftsansvarig: Lilla Improteatern Stockholm AB</p>
                <p>
                  Kontakt för alla integritetsfrågor: <a className="underline" href="mailto:kontakt@improteatern.se">kontakt@improteatern.se</a>
                </p>
              </section>

              <section className="space-y-2">
                <h2>Vilka uppgifter vi behandlar</h2>
                <p>
                  Vi behandlar i första hand uppgifter som du själv lämnar till oss, såsom namn, e-postadress,
                  telefonnummer och meddelanden i samband med kontakt, bokning eller avtal.
                </p>
              </section>

              <section className="space-y-2">
                <h2>Ändamål och rättslig grund</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Svara på förfrågningar och ge support – berättigat intresse.</li>
                  <li>Hantera bokningar/avtal och leverera tjänster – avtal.</li>
                  <li>Fullgöra rättsliga skyldigheter (t.ex. bokföring) – rättslig förpliktelse.</li>
                </ul>
                <p>Sådant som kräver samtycke behandlas endast om du uttryckligen samtycker.</p>
                <p>Vi samlar inte in mer än nödvändigt, säljer inte personuppgifter och delar inte för marknadsföringssyften.</p>
              </section>

              <section className="space-y-2">
                <h2>Lagringstid</h2>
                <p>
                  Vi sparar uppgifter endast så länge de behövs för ovanstående ändamål eller så länge lag kräver.
                  Därefter raderas eller anonymiseras de. Du kan när som helst begära att vi raderar dina uppgifter,
                  med förbehåll för lagkrav.
                </p>
              </section>

              <section className="space-y-2">
                <h2>Säkerhet</h2>
                <p>
                  Vi skyddar uppgifter med lämpliga tekniska och organisatoriska åtgärder, inklusive åtkomstkontroller
                  och kryptering där det är relevant.
                </p>
              </section>

              <section className="space-y-2">
                <h2>Delning till tredje part</h2>
                <p>
                  Vi delar bara uppgifter med leverantörer som behövs för att leverera våra tjänster (t.ex. IT-drift)
                  och då enligt personuppgiftsbiträdesavtal. Ingen försäljning eller delning för marknadsföring.
                </p>
              </section>

              <section className="space-y-2">
                <h2>Cookies och spårning</h2>
                <p>Vi sätter inga egna cookies och använder ingen spårning via t.ex. tredjeparts-pixlar eller analytics-skript.</p>
                <p>
                  Inbäddat innehåll från tredje part (t.ex. videospelare) kan sätta egna cookies enligt respektive leverantörs villkor.
                  Vi försöker undvika detta eller använda ”no-cookie”-lösningar där det är möjligt.
                </p>
              </section>

              <section className="space-y-2">
                <h2>Dina rättigheter (GDPR)</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tillgång till dina uppgifter och kopior av dem.</li>
                  <li>Rättelse av felaktiga uppgifter.</li>
                  <li>Radering (”rätten att bli bortglömd”).</li>
                  <li>Begränsning av behandling och invändning mot viss behandling.</li>
                  <li>Dataportabilitet för uppgifter du lämnat till oss.</li>
                </ul>
                <p>
                  Du kan även lämna klagomål till Integritetsskyddsmyndigheten (IMY).
                </p>
                <p>
                  Utöva dina rättigheter genom att mejla <a className="underline" href="mailto:kontakt@improteatern.se">kontakt@improteatern.se</a>.
                  Vi svarar utan onödigt dröjsmål (senast inom 30 dagar).
                </p>
              </section>

              <section className="space-y-2">
                <h2>Ändringar i policyn</h2>
                <p>
                  Vi kan uppdatera denna policy vid behov. Den senaste versionen publiceras på vår webbplats och
                  gäller från publiceringsdatumet.
                </p>
              </section>

              <aside className="pt-4 border-t border-gray-200">
                <p>
                  —<br />
                  Kontakt: <a className="underline" href="mailto:kontakt@improteatern.se">kontakt@improteatern.se</a><br />
                  Lilla Improteatern Stockholm AB
                </p>
              </aside>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
