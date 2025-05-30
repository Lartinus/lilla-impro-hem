
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useEffect } from 'react';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const courseLeaders = [
    {
      id: 1,
      name: "Hjalmar Hardestam",
      image: "/lovable-uploads/192352b9-7e67-447a-aa36-9b17372a4155.png",
      bio: "Hjalmar har undervisat på flera improvisationsscener runtom i Sverige. Han är baserad i Stockholm men har tidigare undervisat på Improverket och Gbgimpro i Göteborg och på Dramaverket i Karlstad. Han driver även Göteborg Improv Comedy Club samt podcasten Impropodden. Hjalmar har spelat på flera europeiska festivaler – bland annat i Amsterdam, Edinburgh och Nottingham – och är utbildad vid Improv Olympic och The Annoyance i Chicago samt The Free Association i London."
    },
    {
      id: 2,
      name: "Ellen Bobeck",
      image: "/lovable-uploads/df0cb53d-072e-4970-b9fa-e175209d1cf7.png",
      bio: "Ellen har arbetat med improvisationsteater sedan 2018, både som skådespelare och pedagog. Hon undervisar på flera olika skolor och teatrar i Stockholm, och har stått på scen på festivaler i bland annat Berlin, Oslo, Dublin och Edinburgh. Förutom Spinoff spelar hon även med trion Britta, och är konstnärlig ledare för musikalensemblen Floden STHLM – där hon kombinerar musikalisk känsla med improviserat berättande."
    }
  ];

  const courses = [
    {
      title: "Nivå 1 – Scenarbete Improv Comedy",
      subtitle: "För rutinerade improvisatörer och nybörjare",
      description: "Här lägger vi grunden. Fokus ligger på scenarbete; notera, basera, konstatera och att bygga scener tillsammans. Du får lära dig hur man spelar \"Game of the Scene\" och hur ni som grupp spelar samma scen. Kursen är öppen för alla nivåer – oavsett om du är en rutinerad improvisatör eller precis har börjat – Det viktiga är att du vill utvecklas som scenimprovisatör. I slutet av kursen får du skriftlig personlig feedback.",
      courseLeader: courseLeaders[0],
      available: true,
      showButton: true
    },
    {
      title: "Nivå 2 – Långform & improviserad komik",
      subtitle: "För dig som gått Nivå 1 hos oss",
      description: "Fördjupning med särskilt fokus på longform comedy. Vi tränar på mönsterigenkänning, spelbarhet, återkopplingar, tag-outs, group games och scener som bygger humor över tid. Vi arbetar med att förstå vad publiken tycker är kul och hur ni tillsammans kan skapa underhållande scener. I slutet av kursen får du skriftlig personlig feedback.",
      courseLeader: courseLeaders[1],
      available: true,
      showButton: true
    },
    {
      title: "House Teams & fortsättning",
      subtitle: "Auditions hålls regelbundet",
      description: "Efter Nivå 2 kan du söka till ett av våra House Teams – ensembler som spelar tillsammans under en längre tid. Här fortsätter du utvecklas i grupp med stöd av coach och får spela regelbundet inför publik. Målet är att växa både som grupp och individ – och lära sig skapa hela föreställningar tillsammans. Antagning sker efter nivå, gruppkemi och vilja att utvecklas.",
      courseLeader: null,
      available: false,
      showButton: true,
      buttonText: "Anmäl ditt intresse"
    },
    {
      title: "Helgworkshops & specialkurser",
      subtitle: "Med oss och inbjudna gästpedagoger",
      description: "Utöver våra nivåbaserade kurser erbjuder vi workshops med oss och inbjudna gästpedagoger. Här kan du fördjupa dig i format, tekniker och tematiska områden – från karaktärsarbete och space work till musikal, sketch eller storytelling.",
      courseLeader: null,
      available: false,
      showButton: false
    }
  ];

  const practicalInfo = [
    "8 tillfällen á 2,5h",
    "Startdatum: 28 oktober", 
    "12 deltagare",
    "2 800 kr (ordinarie)",
    "2 200 kr (pensionär, student eller omtag)"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Kurser
          </h1>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
          {courses.map((course, index) => (
            <CourseCard 
              key={index} 
              course={course}
              practicalInfo={practicalInfo}
            />
          ))}
        </div>
        
        {/* Combined Information Box */}
        <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
          <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
            <div className="text-left space-y-6">
              <div>
                <h3 className="text-theatre-secondary font-medium mb-4 max-w-2xl text-left">
                  Ett hem för dig som vill lära dig Improv Comedy – med målet att själv stå på scen.
                </h3>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-base" style={{ lineHeight: '1.3' }}>
                    Lilla Improteatern är platsen för dig som vill bli skickligare på att skapa roliga scener tillsammans med andra. Här lär du dig inte bara hur man improviserar – du förstår varför det funkar, vad som gör en scen rolig och hur du skapar det tillsammans med andra.
                  </p>
                  
                  <p className="text-base" style={{ lineHeight: '1.3' }}>
                    Vi ser på improv comedy som ett hantverk. Genom ett tydligt pedagogiskt upplägg – förankrat i många års erfarenhet som både improvisatörer och pedagoger – erbjuder vi ett kurssystem som sträcker sig från grundläggande scenträning till långformsformat och ensemblearbete. Hos oss lär du dig att spela komiska scener med glädje, tydliga verktyg och ett fokus på samspelet.
                  </p>
                  
                  <p className="text-base" style={{ lineHeight: '1.3' }}>
                    Vi älskar att skratta. Men ännu mer älskar vi att förstå varför något är roligt – och hur man gör det tillsammans. Därför bygger vår undervisning på att steg för steg utveckla dina färdigheter som improvisatör. Inte genom att tvinga fram skämt, utan genom att spela scener som känns levande, enkla och roliga i stunden.
                  </p>
                  
                  <p className="text-base" style={{ lineHeight: '1.3' }}>
                    Vi tränar dig i att upptäcka det roliga och följa det – i en trygg, tydlig och lekfull struktur där du får växa som improvisatör. Du kommer att:
                  </p>
                </div>
              </div>

              <div className="bg-red-700 p-6 -mx-6 md:-mx-6 lg:-mx-12">
                <h2 className="text-xl font-bold text-white mb-4">
                  Lär dig spela det som redan är kul
                </h2>
                <p className="text-base leading-relaxed text-white font-light" style={{ lineHeight: '1.3' }}>
                  Istället för att kämpa för att hitta på något kul, lär vi dig hur man upptäcker det som redan är roligt – i dina impulser, i samspelet och i scenens logik. Vi tränar dig att hitta "Game of the Scene", att följa det roliga och att få det att växa.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Vem kan komma till Lilla Improteatern?
                </h2>
                <h3 className="text-theatre-secondary font-medium mb-4 max-w-2xl text-left">
                  Du är varmt välkommen oavsett om du:
                </h3>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Aldrig har testat Improv Comedy förut</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Vill utvecklas som komisk scenperson</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Är rutinerad och vill vässa ditt hantverk</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Söker en trygg, tydlig och inspirerande plats att växa på</p>
                    </div>
                  </div>
                  
                  <p className="text-base" style={{ lineHeight: '1.3' }}>
                    Det viktigaste är inte hur rolig du är när du börjar – utan hur nyfiken du är på att lära dig. Vi värdesätter inkludering, generositet och att alla ska få plats att växa på.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Få konkreta verktyg för att skapa humoristiska scener</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Utveckla ditt scenspråk, lyssnande och komiska timing</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Bli modigare, säkrare och mer initiativtagande</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 text-lg flex-shrink-0 mt-0">→</div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Och få scentid. Massor.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Vanliga frågor</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Kan jag börja utan tidigare erfarenhet?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Får jag feedback?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Varför har ni krav på att klara av nivå 1 innan man går nivå 2?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med 40 % rabatterat pris.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Behöver jag vara rolig?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Nej. Humor kommer ur samspelet – vi lär dig teknikerna.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Kommer jag stå på scen?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Ja. Alla kurser avslutas med ett valfritt uppspel inför publik.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Hur stora är grupperna?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Max 12 deltagare – så att alla får mycket scen- och lärartid.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Kan jag gå flera gånger?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Ja. Många går om nivåkurser med nya verktyg och scener varje gång.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-theatre-secondary font-medium mb-1">Kan jag ta igen missade tillfällen?</h3>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                      Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
