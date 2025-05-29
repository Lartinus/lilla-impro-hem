import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseBookingForm from '@/components/CourseBookingForm';
import CourseLeaderModal from '@/components/CourseLeaderModal';
import { useState } from 'react';

const Courses = () => {
  const [selectedLeader, setSelectedLeader] = useState<typeof courseLeaders[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courseLeaders = [
    {
      id: 1,
      name: "Ellen Bobeck",
      image: "/lovable-uploads/df0cb53d-072e-4970-b9fa-e175209d1cf7.png",
      bio: "Ellen har arbetat med improvisationsteater sedan 2018, både som skådespelare och pedagog. Hon undervisar på flera olika skolor och teatrar i Stockholm, och har stått på scen på festivaler i bland annat Berlin, Oslo, Dublin och Edinburgh. Förutom Spinoff spelar hon även med trion Britta, och är konstnärlig ledare för musikalensemblen Floden STHLM – där hon kombinerar musikalisk känsla med improviserat berättande."
    },
    {
      id: 2,
      name: "Hjalmar Hardestam",
      image: "/lovable-uploads/192352b9-7e67-447a-aa36-9b17372a4155.png",
      bio: "Hjalmar har undervisat på flera improvisationsscener runtom i Sverige. Han är baserad i Stockholm men har tidigare undervisat på Improverket och Gbgimpro i Göteborg och på Dramaverket i Karlstad. Han driver även Göteborg Improv Comedy Club samt podcasten Impropodden. Hjalmar har spelat på flera europeiska festivaler – bland annat i Amsterdam, Edinburgh och Nottingham – och är utbildad vid Improv Olympic och The Annoyance i Chicago samt The Free Association i London."
    }
  ];

  const handleLeaderClick = (leader: typeof courseLeaders[0]) => {
    setSelectedLeader(leader);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLeader(null);
  };

  const courses = [
    {
      title: "Nivå 1 – Scenarbete Improv Comedy",
      subtitle: "För rutinerade improvisatörer och nybörjare",
      description: "Här lägger vi grunden. Fokus ligger på scenarbete; notera, basera, konstatera och att bygga scener tillsammans. Du får lära dig hur man spelar \"Game of the Scene\" och hur ni som grupp spelar samma scen. Kursen är öppen för alla nivåer – oavsett om du är en rutinerad improvisatör eller precis har börjat – Det viktiga är att du vill utvecklas som scenimprovisatör. I slutet av kursen får du skriftlig personlig feedback.",
      courseLeaders: [courseLeaders[0], courseLeaders[1]],
      available: true,
      showButton: true
    },
    {
      title: "Nivå 2 – Långform & improviserad komik",
      subtitle: "För dig som gått Nivå 1 hos oss",
      description: "Fördjupning med särskilt fokus på longform comedy. Vi tränar på mönsterigenkänning, spelbarhet, återkopplingar, tag-outs, group games och scener som bygger humor över tid. Vi arbetar med att förstå vad publiken tycker är kul och hur ni tillsammans kan skapa underhållande scener. I slutet av kursen får du skriftlig personlig feedback.",
      courseLeaders: [courseLeaders[0]],
      available: true,
      showButton: true
    },
    {
      title: "House Teams & fortsättning",
      subtitle: "Auditions hålls regelbundet",
      description: "Efter Nivå 2 kan du söka till ett av våra House Teams – ensembler som spelar tillsammans under en längre tid. Här fortsätter du utvecklas i grupp med stöd av coach och får spela regelbundet inför publik. Målet är att växa både som grupp och individ – och lära sig skapa hela föreställningar tillsammans. Antagning sker efter nivå, gruppkemi och vilja att utvecklas.",
      courseLeaders: [],
      available: false,
      showButton: true
    },
    {
      title: "Helgworkshops & specialkurser",
      subtitle: "Med oss och inbjudna gästpedagoger",
      description: "Utöver våra nivåbaserade kurser erbjuder vi workshops med oss och inbjudna gästpedagoger. Här kan du fördjupa dig i format, tekniker och tematiska områden – från karaktärsarbete och space work till musikal, sketch eller storytelling.",
      courseLeaders: [],
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

  const benefits = [
    "Få konkreta verktyg för att skapa humoristiska scener",
    "Utveckla ditt scenspråk, lyssnande och komiska timing",
    "Bli modigare, säkrare och mer initiativtagande",
    "Och få scentid. Massor."
  ];

  const whoCanCome = [
    "Aldrig har testat Improv Comedy förut",
    "Vill utvecklas som komisk scenperson",
    "Är rutinerad och vill vässa ditt hantverk",
    "Söker en trygg, tydlig och inspirerande plats att växa på"
  ];

  const faq = [
    {
      question: "Kan jag börja utan tidigare erfarenhet?",
      answer: "Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener."
    },
    {
      question: "Får jag feedback?",
      answer: "Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling."
    },
    {
      question: "Varför har ni krav på att klara av nivå 1 innan man går nivå 2?",
      answer: "Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med 40 % rabatterat pris."
    },
    {
      question: "Behöver jag vara rolig?",
      answer: "Nej. Humor kommer ur samspelet – vi lär dig teknikerna."
    },
    {
      question: "Kommer jag stå på scen?",
      answer: "Ja. Alla kurser avslutas med ett valfritt uppspel inför publik."
    },
    {
      question: "Hur stora är grupperna?",
      answer: "Max 12 deltagare – så att alla får mycket scen- och lärartid."
    },
    {
      question: "Kan jag gå flera gånger?",
      answer: "Ja. Många går om nivåkurser med nya verktyg och scener varje gång."
    },
    {
      question: "Kan jag ta igen missade tillfällen?",
      answer: "Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="py-12 px-6 mt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-8">
            Kurser
          </h1>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-2 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 mb-4">
            {courses.map((course, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-theatre-primary mb-2">
                      {course.title}
                    </h2>
                    <h3 className="text-theatre-secondary font-medium mb-4">
                      {course.subtitle}
                    </h3>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {course.description}
                  </p>
                  
                  {course.courseLeaders.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-gray-800 font-bold mb-1">Kursledare</h4>
                      <div className="flex flex-wrap gap-3">
                        {course.courseLeaders.map((leader) => (
                          <div 
                            key={leader.id} 
                            className="flex items-center space-x-2 bg-theatre-light/10 rounded p-2 cursor-pointer hover:bg-theatre-light/20 transition-colors"
                            onClick={() => handleLeaderClick(leader)}
                          >
                            <img 
                              src={leader.image} 
                              alt={leader.name}
                              className="w-8 h-8 rounded-full object-cover object-center"
                            />
                            <span className="text-gray-700 font-medium">{leader.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  {course.available && (
                    <div className="mb-6">
                      <h4 className="text-gray-800 font-bold mb-1">Praktisk information</h4>
                      <div className="space-y-2">
                        {practicalInfo.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <p className="text-gray-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <CourseBookingForm 
                    courseTitle={course.title}
                    isAvailable={course.available}
                    showButton={course.showButton}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Combined Content Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-12 border-4 border-white p-16 bg-white rounded-none">
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Vår vision</h2>
              <h3 className="text-theatre-secondary font-medium mb-4">
                Ett hem för dig som vill lära dig Improv Comedy – med målet att själv stå på scen.
              </h3>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Lilla Improteatern är platsen för dig som vill bli skickligare på att skapa roliga scener tillsammans med andra. 
                  Här lär du dig inte bara hur man improviserar – du förstår varför det funkar, vad som gör en scen rolig och hur du skapar det tillsammans med andra.
                </p>
                <p>
                  Vi ser på improv comedy som ett hantverk. Genom ett tydligt pedagogiskt upplägg – förankrat i många års erfarenhet som både improvisatörer och pedagoger – erbjuder vi ett kurssystem som sträcker sig från grundläggande scenträning till långformsformat och ensemblearbete. Hos oss lär du dig att spela komiska scener med glädje, tydliga verktyg och ett fokus på samspelet.
                </p>
                <p>
                  Vi älskar att skratta. Men ännu mer älskar vi att förstå varför något är roligt – och hur man gör det tillsammans. 
                  Därför bygger vår undervisning på att steg för steg utveckla dina färdigheter som improvisatör. Inte genom att tvinga fram skämt, utan genom att spela scener som känns levande, enkla och roliga i stunden.
                </p>
                <p>
                  Vi tränar dig i att upptäcka det roliga och följa det – i en trygg, tydlig och lekfull struktur där du får växa som improvisatör. Du kommer att:
                </p>
                <div className="bg-theatre-primary text-white p-6 border-4 border-white rounded-none">
                  <h3 className="text-white font-bold mb-4">Lär dig spela det som redan är kul</h3>
                  <p className="leading-relaxed">
                    Istället för att kämpa för att hitta på något kul, lär vi dig hur man upptäcker det som redan är roligt – i dina impulser, i samspelet och i scenens logik. Vi tränar dig att hitta "Game of the Scene", att följa det roliga och att få det att växa.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Vem kan komma till Lilla Improteatern?</h2>
              <h3 className="text-theatre-secondary font-medium leading-relaxed mb-4">
                Du är varmt välkommen oavsett om du:
              </h3>
              <div className="space-y-3 mb-6">
                {whoCanCome.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Det viktigaste är inte hur rolig du är när du börjar – utan hur nyfiken du är på att lära dig. Vi värdesätter inkludering, generositet och att alla ska få plats att växa på.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Vanliga frågor</h2>
              <div className="space-y-0">
                {faq.map((item, index) => (
                  <div key={index} className="bg-theatre-light/10 border-4 border-white px-0 py-2 rounded-none">
                    <h3 className="text-theatre-secondary font-medium mb-3">
                      {item.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseLeaderModal 
        leader={selectedLeader}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <Footer />
    </div>
  );
};

export default Courses;
