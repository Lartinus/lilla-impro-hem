
// src/components/CourseInfoSection.tsx
import React from 'react'
import {
  convertMarkdownToHtml,
  convertMarkdownToHtmlForRedBox,
} from '@/utils/markdownHelpers'

interface CourseInfoSectionProps {
  mainInfo?:
    | {
        info?: string
        redbox?: string
        infoAfterRedbox?: string
      }
    | null
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  // Hårdkodad kursinfo
  const hardcodedMainInfo = {
    info: `## För dig som vill lära dig Improv Comedy - med målet att själv stå på scen.

Lilla Improteatern är platsen för dig som vill bli skickligare på att skapa roliga scener tillsammans med andra. Här lär du dig inte bara hur man improviserar - du förstår varför det funkar, vad som gör en scen rolig och hur du skapar det tillsammans med andra.

Vi ser på improv comedy som ett hantverk. Genom ett tydligt pedagogiskt upplägg - förankrat i många års erfarenhet som både improvisatörer och pedagoger – erbjuder vi ett kurssystem som sträcker sig från grundläggande scenträning till långformsformat och ensemblearbete. Hos oss lär du dig att spela komiska scener med glädje, tydliga verktyg och ett fokus på samspelet.

Vi älskar att skratta. Men ännu mer älskar vi att förstå varför något är roligt - och hur man gör det tillsammans. Därför bygger vår undervisning på att steg för steg utveckla dina färdigheter som improvisatör. Inte genom att tvinga fram skämt, utan genom att spela scener som känns levande, enkla och roliga i stunden.

Vi tränar dig i att upptäcka det roliga och följa det i en trygg, tydlig och lekfull struktur där du får växa som improvisatör.`,

    redbox: `### Lär dig spela det som redan är kul

Istället för att kämpa för att hitta på något kul, lär vi dig hur man upptäcker det som redan är roligt – i dina impulser, i samspelet och i scenens logik. Vi tränar dig att hitta "Game of the scene", att följa det roliga och att få det att växa.`,

    infoAfterRedbox: `## Vem kan komma till Lilla Improteatern?
##### Du är varmt välkommen oavsett om du:

- Aldrig har testat Improv Comedy förut
- Vill utvecklas som komisk scenperson
- Är rutinerad och vill vässa ditt hantverk
- Söker en trygg, tydlig och inspirerande plats att växa på

Det viktigaste är inte hur rolig du är när du börjar – utan hur nyfiken du är på att lära dig. Vi hjälper dig med att:

- Få konkreta verktyg för att skapa humoristiska scener
- Utveckla ditt scenspråk, lyssnande och komiska timing
- Bli modigare, säkrare och mer initiativtagande
- Och få scentid. Massor.

## Vanliga frågor
##### Kan jag börja utan tidigare erfarenhet?
Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener.

##### Får jag feedback?
Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling.

##### Varför har ni krav på att klara av nivå 1 innan man går nivå 2?
Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med rabatterat pris.

##### Behöver jag vara rolig?
Nej. Humor kommer ur samspelet, vi lär dig teknikerna.

##### Kommer jag stå på scen?
Ja. Alla kurser avslutas med ett valfritt uppspel inför publik.

##### Hur stora är grupperna?
Max 12 deltagare, så att alla får mycket scen- och lärartid.

##### Kan jag gå flera gånger?
Ja. Många går om nivåkurser med nya verktyg och scener varje gång.

##### Kan jag ta igen missade tillfällen?
Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna.`
  };

  // Använd hårdkodad info istället för prop
  const {
    info = '',
    redbox = '',
    infoAfterRedbox = '',
  } = hardcodedMainInfo

  const htmlInfo = convertMarkdownToHtml(info)
  const htmlRed = convertMarkdownToHtmlForRedBox(redbox)
  const htmlAfter = convertMarkdownToHtml(infoAfterRedbox)

  return (
    <section className="flex justify-center px-4 md:px-0 mt-12">
      <div className="bg-white max-w-3xl w-full p-8 shadow-lg rounded-none space-y-12">
        {/* Första textblocket */}
        {htmlInfo && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlInfo }}
          />
        )}

        {/* Röd callout med vit text */}
        {htmlRed && (
          <div
            className="bg-[#772424] p-6 rounded-none text-white [&>*]:text-white [&>p]:text-white [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white"
            dangerouslySetInnerHTML={{ __html: htmlRed }}
          />
        )}

        {/* Avslutande textblock - dela upp i två delar */}
        {htmlAfter && (
          <div className="space-y-8">
            {/* Första delen - fram till "Vanliga frågor" */}
            <div className="prose">
              <h2>Vem kan komma till Lilla Improteatern?</h2>
              <h5>Du är varmt välkommen oavsett om du:</h5>
              <ul>
                <li>Aldrig har testat Improv Comedy förut</li>
                <li>Vill utvecklas som komisk scenperson</li>
                <li>Är rutinerad och vill vässa ditt hantverk</li>
                <li>Söker en trygg, tydlig och inspirerande plats att växa på</li>
              </ul>
              <p>Det viktigaste är inte hur rolig du är när du börjar – utan hur nyfiken du är på att lära dig. Vi hjälper dig med att:</p>
              <ul>
                <li>Få konkreta verktyg för att skapa humoristiska scener</li>
                <li>Utveckla ditt scenspråk, lyssnande och komiska timing</li>
                <li>Bli modigare, säkrare och mer initiativtagande</li>
                <li>Och få scentid. Massor.</li>
              </ul>
            </div>

            {/* Vanliga frågor med röd ram */}
            <div>
              <h2 className="mb-4">Vanliga frågor</h2>
              <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4 space-y-3">
                <div>
                  <h5 className="mb-1">Kan jag börja utan tidigare erfarenhet?</h5>
                  <p className="mb-0">Absolut! Det viktiga är att du vill lära dig Improv Comedy och vill stå på scen och improvisera komiska scener.</p>
                </div>

                <div>
                  <h5 className="mb-1">Får jag feedback?</h5>
                  <p className="mb-0">Ja. Alla våra kurser innehåller personlig återkoppling och individuell utveckling.</p>
                </div>

                <div>
                  <h5 className="mb-1">Varför har ni krav på att klara av nivå 1 innan man går nivå 2?</h5>
                  <p className="mb-0">Vi vill att både du och gruppen ska ha grunden för att kunna jobba vidare med längre shower. Du får gå om nivå 1 med rabatterat pris.</p>
                </div>

                <div>
                  <h5 className="mb-1">Behöver jag vara rolig?</h5>
                  <p className="mb-0">Nej. Humor kommer ur samspelet, vi lär dig teknikerna.</p>
                </div>

                <div>
                  <h5 className="mb-1">Kommer jag stå på scen?</h5>
                  <p className="mb-0">Ja. Alla kurser avslutas med ett valfritt uppspel inför publik.</p>
                </div>

                <div>
                  <h5 className="mb-1">Hur stora är grupperna?</h5>
                  <p className="mb-0">Max 12 deltagare, så att alla får mycket scen- och lärartid.</p>
                </div>

                <div>
                  <h5 className="mb-1">Kan jag gå flera gånger?</h5>
                  <p className="mb-0">Ja. Många går om nivåkurser med nya verktyg och scener varje gång.</p>
                </div>

                <div>
                  <h5 className="mb-1">Kan jag ta igen missade tillfällen?</h5>
                  <p className="mb-0">Vi försöker alltid hjälpa dig att ta igen missade tillfällen om det finns plats i andra grupper. Hör av dig så ser vi vad som går att ordna.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CourseInfoSection
