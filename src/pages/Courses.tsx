
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Star, Calendar, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Courses = () => {
  const courses = [
    {
      title: "Nivå 1 – Scenarbete Improv Comedy",
      description: "För rutinerade improvisatörer och nybörjare",
      content: "Här lägger vi grunden. Fokus ligger på scenarbete; notera, basera, konstatera och att bygga scener tillsammans. Du får lära dig hur man spelar \"Game of the Scene\" och hur ni som grupp spelar samma scen. Kursen är öppen för alla nivåer – oavsett om du är en rutinerad improvisatör eller precis har börjat – Det viktiga är att du vill utvecklas som scenimprovisatör. I slutet av kursen får du skriftlig personlig feedback.",
      details: "8 tillfällen à 2,5h | 12 deltagare | 2800 kr (ord.) / 2200 kr (rabatt vid omtag)",
      icon: <GraduationCap className="h-8 w-8 text-theatre-burgundy" />
    },
    {
      title: "Nivå 2 – Långform & improviserad komik",
      description: "För dig som gått Nivå 1 hos oss",
      content: "Fördjupning med särskilt fokus på longform comedy. Vi tränar på mönsterigenkänning, spelbarhet, återkopplingar, tag-outs, group games och scener som bygger humor över tid. Vi arbetar med att förstå vad publiken tycker är kul och hur ni tillsammans kan skapa underhållande scener. I slutet av kursen får du skriftlig personlig feedback.",
      details: "8 tillfällen à 2,5h | 12 deltagare | 2800 kr (ord.) / 2200 kr (rabatt vid omtag)",
      icon: <Star className="h-8 w-8 text-theatre-burgundy" />
    },
    {
      title: "House Teams & fortsättning",
      description: "Auditions hålls regelbundet",
      content: "Efter Nivå 2 kan du söka till ett av våra House Teams – ensembler som spelar tillsammans under en längre tid. Här fortsätter du utvecklas i grupp med stöd av coach och får spela regelbundet inför publik. Målet är att växa både som grupp och individ – och lära sig skapa hela föreställningar tillsammans. Antagning sker efter nivå, gruppkemi och vilja att utvecklas.",
      details: "",
      icon: <Users className="h-8 w-8 text-theatre-burgundy" />
    },
    {
      title: "Helgworkshops & specialkurser",
      description: "Med oss och inbjudna gästpedagoger",
      content: "Utöver våra nivåbaserade kurser erbjuder vi workshops med oss och inbjudna gästpedagoger. Här kan du fördjupa dig i format, tekniker och tematiska områden – från karaktärsarbete och space work till musikal, sketch eller storytelling.",
      details: "",
      icon: <Calendar className="h-8 w-8 text-theatre-burgundy" />
    }
  ];

  const benefits = [
    "Få konkreta verktyg för att skapa humoristiska scener",
    "Utveckla ditt scenspråk, lyssnande och komiska timing",
    "Bli modigare, säkrare och mer initiativtagande",
    "Och få scentid. Massor."
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
    <div className="min-h-screen font-gopher">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-theatre-cream to-theatre-warm-gray py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-theatre-charcoal mb-6">Kurser</h1>
            <p className="text-xl text-theatre-charcoal/80 leading-relaxed">
              Från grundläggande scenträning till långformsformat och ensemblearbete
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {courses.map((course, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    {course.icon}
                    <CardTitle className="text-xl text-theatre-charcoal group-hover:text-theatre-burgundy transition-colors">
                      {course.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-theatre-burgundy font-medium">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-theatre-charcoal/80 leading-relaxed">
                    {course.content}
                  </p>
                  {course.details && (
                    <div className="bg-theatre-warm-gray p-4 rounded-lg">
                      <p className="font-semibold text-theatre-charcoal">{course.details}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Philosophy */}
      <section className="py-20 bg-theatre-warm-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <h2 className="text-3xl font-bold text-theatre-charcoal mb-6">Vår vision</h2>
              <h3 className="text-xl font-semibold text-theatre-burgundy mb-4">
                Ett hem för dig som vill lära dig Improv Comedy – med målet att själv stå på scen.
              </h3>
              <p className="text-theatre-charcoal/80 leading-relaxed mb-6">
                Lilla Improteatern är platsen för dig som vill bli skickligare på att skapa roliga scener tillsammans med andra. 
                Här lär du dig inte bara hur man improviserar – du förstår varför det funkar, vad som gör en scen rolig och hur du skapar det tillsammans med andra.
              </p>
              <p className="text-theatre-charcoal/80 leading-relaxed">
                Vi ser på improv comedy som ett hantverk. Genom ett tydligt pedagogiskt upplägg – förankrat i många års erfarenhet som både improvisatörer och pedagoger – erbjuder vi ett kurssystem som sträcker sig från grundläggande scenträning till långformsformat och ensemblearbete. Hos oss lär du dig att spela komiska scener med glädje, tydliga verktyg och ett fokus på samspelet.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <h2 className="text-3xl font-bold text-theatre-charcoal mb-6">Vår filosofi</h2>
              <p className="text-theatre-charcoal/80 leading-relaxed mb-6">
                Vi älskar att skratta. Men ännu mer älskar vi att förstå varför något är roligt – och hur man gör det tillsammans. 
                Därför bygger vår undervisning på att steg för steg utveckla dina färdigheter som improvisatör. Inte genom att tvinga fram skämt, utan genom att spela scener som känns levande, enkla och roliga i stunden.
              </p>
              <p className="text-theatre-charcoal/80 leading-relaxed">
                Vi tränar dig i att upptäcka det roliga och följa det – i en trygg, tydlig och lekfull struktur där du får växa som improvisatör.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Method & Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            <div>
              <h2 className="text-3xl font-bold text-theatre-charcoal mb-8 text-center">Kursledare</h2>
              <p className="text-xl text-theatre-charcoal/80 leading-relaxed text-center">
                Kurserna leds av Hjalmar Hardestam och Ellen – två passionerade pedagoger med hjärtat i Improv Comedy och många års erfarenhet från scen och klassrum. Båda har utbildat sig internationellt och brinner för att göra lärandet konkret, roligt och utvecklande.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-theatre-charcoal mb-8 text-center">Vår metod</h2>
              <div className="bg-theatre-warm-gray rounded-2xl p-8 md:p-12">
                <p className="text-theatre-charcoal/80 leading-relaxed mb-6">
                  Vi bygger vårt kursprogram på traditioner från iO, The Free Association, The Annoyance m.fl. – med en stark förankring i scen- och ensemblearbete. Hos oss finns också influenser från fysisk teater, närvaro, deals och dynamics.
                </p>
                <div className="bg-theatre-burgundy text-white rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">"Lär dig spela det som redan är kul"</h3>
                  <p className="leading-relaxed">
                    Istället för att kämpa för att hitta på något kul, lär vi dig hur man upptäcker det som redan är roligt – i dina impulser, i samspelet och i scenens logik. Vi tränar dig att hitta "Game of the Scene", att följa det roliga och att få det att växa.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-theatre-charcoal mb-8 text-center">Du kommer att:</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <ArrowRight className="h-5 w-5 text-theatre-burgundy mt-1 flex-shrink-0" />
                    <p className="text-theatre-charcoal/80">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Come */}
      <section className="py-20 bg-theatre-warm-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theatre-charcoal mb-8">Vem kan komma till Lilla Improteatern?</h2>
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <p className="text-xl text-theatre-charcoal/80 leading-relaxed mb-8">
                Du är varmt välkommen oavsett om du:
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-left space-y-3">
                  <p className="text-theatre-charcoal/80">• Aldrig har testat Improv Comedy förut</p>
                  <p className="text-theatre-charcoal/80">• Vill utvecklas som komisk scenperson</p>
                </div>
                <div className="text-left space-y-3">
                  <p className="text-theatre-charcoal/80">• Är rutinerad och vill vässa ditt hantverk</p>
                  <p className="text-theatre-charcoal/80">• Söker en trygg, tydlig och inspirerande plats att växa på</p>
                </div>
              </div>
              <p className="text-lg text-theatre-charcoal font-semibold">
                Det viktigaste är inte hur rolig du är när du börjar – utan hur nyfiken du är på att lära dig. Vi värdesätter inkludering, generositet och att alla ska få plats att växa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-theatre-charcoal mb-12 text-center">Vanliga frågor</h2>
            <div className="space-y-6">
              {faq.map((item, index) => (
                <div key={index} className="bg-theatre-warm-gray rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-theatre-charcoal mb-3">{item.question}</h3>
                  <p className="text-theatre-charcoal/80 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
