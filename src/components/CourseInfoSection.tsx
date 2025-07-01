
// src/components/CourseInfoSection.tsx
import React from 'react';

interface Faq {
  question: string;
  answer: string;
}

export default function CourseInfoSection() {
  // Vanliga frågor definierade som en array
  const faqs: Faq[] = [
    {
      question: 'Kan jag börja utan tidigare erfarenhet?',
      answer:
        'Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener.',
    },
    {
      question: 'Får jag feedback?',
      answer: 'Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling.',
    },
    {
      question:
        'Varför har ni krav på att klara av nivå 1 innan man går nivå 2?',
      answer:
        'Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med rabatterat pris.',
    },
    {
      question: 'Behöver jag vara rolig?',
      answer: 'Nej. Humor kommer ur samspelet, vi lär dig teknikerna.',
    },
    {
      question: 'Kommer jag stå på scen?',
      answer:
        'Ja. Alla kurser avslutas med ett valfritt uppspel inför publik.',
    },
    {
      question: 'Hur stora är grupperna?',
      answer:
        'Max 12 deltagare, så att alla får mycket scen- och lärartid.',
    },
    {
      question: 'Kan jag gå flera gånger?',
      answer:
        'Ja. Många går om nivåkurser med nya verktyg och scener varje gång.',
    },
    {
      question: 'Kan jag ta igen missade tillfällen?',
      answer:
        'Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna.',
    },
  ];

  return (
    <section className="flex justify-center px-0 md:px-4 mt-12">
      <div className="bg-white w-full max-w-5xl mx-[12px] md:mx-0 p-8 shadow-lg rounded-none space-y-12">
        {/* För dig som vill lära dig Improv Comedy */}
        <div>
          <h2>För dig som vill lära dig Improv Comedy - med målet att själv stå på scen.</h2>
          <div className="prose">
            <p>
              Lilla Improteatern är platsen för dig som vill bli skickligare på att skapa roliga scener tillsammans med andra. Här lär du dig inte bara hur man improviserar – du förstår varför det funkar, vad som gör en scen rolig och hur du skapar det tillsammans med andra.
            </p>
            <p>
              Vi ser på improv comedy som ett hantverk. Genom ett tydligt pedagogiskt upplägg – förankrat i många års erfarenhet som både improvisatörer och pedagoger – erbjuder vi ett kurssystem som sträcker sig från grundläggande scenträning till långformsformat och ensemblearbete. Hos oss lär du dig att spela komiska scener med glädje, tydliga verktyg och ett fokus på samspelet.
            </p>
            <p>
              Vi älskar att skratta. Men ännu mer älskar vi att förstå varför något är roligt – och hur man gör det tillsammans. Därför bygger vår undervisning på att steg för steg utveckla dina färdigheter som improvisatör. Inte genom att tvinga fram skämt, utan genom att spela scener som känns levande, enkla och roliga i stunden.
            </p>
            <p>
              Vi tränar dig i att upptäcka det roliga och följa det i en trygg, tydlig och lekfull struktur där du får växa som improvisatör.
            </p>
          </div>
        </div>

        {/* Röd callout med red-primary */}
        <div className="bg-red-700 p-6 rounded-none text-white [&>*]:text-white [&>p]:text-white [&>h2]:text-white [&>h3]:text-white">
          <h3>Lär dig spela det som redan är kul</h3>
          <p>
            Istället för att kämpa för att hitta på något kul, lär vi dig hur man upptäcker det som redan är roligt – i dina impulser, i samspelet och i scenens logik. Vi tränar dig att hitta "Game of the scene", att följa det roliga och att få det att växa.
          </p>
        </div>

        {/* Avslutande text */}
        <div>
          <h2>Vem kan komma till Lilla Improteatern?</h2>
          <div className="prose space-y-4">
            <h5>Du är varmt välkommen oavsett om du:</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aldrig har testat Improv Comedy förut</li>
              <li>Vill utvecklas som komisk scenperson</li>
              <li>Är rutinerad och vill vässa ditt hantverk</li>
              <li>Söker en trygg, tydlig och inspirerande plats att växa på</li>
            </ul>
            <p>
              Det viktigaste är inte hur rolig du är när du börjar – utan hur nyfiken du är på att lära dig. Vi hjälper dig med att:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Få konkreta verktyg för att skapa humoristiska scener</li>
              <li>Utveckla ditt scenspråk, lyssnande och komiska timing</li>
              <li>Bli modigare, säkrare och mer initiativtagande</li>
              <li>Och få scentid. Massor.</li>
            </ul>
          </div>
        </div>

        {/* Vanliga frågor */}
        <div>
          <h2 className="mb-4">Vanliga frågor</h2>
          <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4 space-y-4">
            {faqs.map(({ question, answer }) => (
              <div key={question}>
                <h6 className="-mb-1">{question}</h6>
                <p className="mb-0">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
