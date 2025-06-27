import CorporateInquiryForm from "@/components/CorporateInquiryForm";
const CorporateContentBox = () => <div className="space-y-10 bg-white/90 backdrop-blur-sm p-6 md:p-8 lg:p-12 mx-3 md:mx-auto md:max-w-4xl shadow-xl">
    <div className="text-left">
      <h2>Workshops & Events för er organisation</h2>
      <h3 className="text-theatre-secondary">Utveckla kreativitet, samarbete och kommunikation genom improvisationsteater.</h3>
      <div className="space-y-6">
        <p>
          Improvisationsteater är ett kraftfullt verktyg för teambuilding, kreativ problemlösning och 
          kommunikationsutveckling. Våra skräddarsydda workshops hjälper era medarbetare att utveckla 
          förmågor som är värdefulla både på arbetsplatsen och i vardagslivet.
        </p>
        <p>
          Vi arbetar med organisationer av alla storlekar – från startups till stora företag, 
          myndigheter och ideella organisationer. Varje workshop anpassas efter era specifika mål och behov.
        </p>
      </div>
    </div>

    <div className="text-left">
      <h2>Vad vi erbjuder</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-theatre-secondary">Teambuilding-workshops</h3>
          <p>
            Stärk sammanhållningen och förtroendet i teamet genom övningar som fokuserar på samarbete, 
            lyssnarförmåga och att bygga vidare på varandras idéer.
          </p>
        </div>
        <div>
          <h3 className="text-theatre-secondary">Kommunikationsträning</h3>
          <p>
            Utveckla färdigheter inom presentation, aktiv lyssning och att hantera oväntade situationer 
            med trygghet och kreativitet.
          </p>
        </div>
        <div>
          <h3 className="text-theatre-secondary">Kreativitet & Innovation</h3>
          <p>
            Lär er tekniker för att tänka utanför boxen, säga "ja, och..." till nya idéer och 
            skapa en kultur där innovation kan blomstra.
          </p>
        </div>
        <div>
          <h3 className="text-theatre-secondary">Ledarskapsträning</h3>
          <p>
            Utveckla förmågan att ta initiativ, stötta teammedlemmar och hantera osäkerhet 
            med självförtroende och anpassningsförmåga.
          </p>
        </div>
      </div>
    </div>

    <div className="text-left">
      <h2 className="py-0 my-[24px]">Så här går det till</h2>
      <div className="space-y-4">
        {["Första samtalet", "Skräddarsytt förslag", "Genomförande", "Uppföljning"].map((step, i) => <div key={i} className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              {i + 1}
            </div>
            <div>
              <h3 className="text-theatre-secondary">{step}</h3>
              <p>
                {["Vi träffas (digitalt eller fysiskt) för att förstå era mål, utmaningar och vilken typ av workshop som skulle passa bäst.", "Vi utformar en workshop som är anpassad efter er grupp, era mål och tillgänglig tid.", "Vi kommer till er (eller annan plats) och genomför workshopen.", "Vi följer upp för att höra hur ni upplevde workshopen och diskuterar eventuella fortsättningsaktiviteter."][i]}
              </p>
            </div>
          </div>)}
      </div>
    </div>

    <div className="text-left">
      <h2>Gör en förfrågan</h2>
      <p className="mb-6">
        Berätta om er organisation och vad ni är ute efter, så hör vi av oss för att diskutera möjligheterna.
      </p>
      <CorporateInquiryForm />
    </div>
  </div>;
export default CorporateContentBox;