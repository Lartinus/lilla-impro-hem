
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useEffect } from 'react';
import { useCourses, useCourseMainInfo } from '@/hooks/useStrapi';
import { formatStrapiCourse, formatCourseMainInfo } from '@/utils/strapiHelpers';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses();
  const { data: mainInfoData, isLoading: mainInfoLoading, error: mainInfoError } = useCourseMainInfo();

  console.log('Courses page - Raw courses data:', coursesData);
  console.log('Courses page - Raw main info data:', mainInfoData);
  console.log('Courses loading states:', { coursesLoading, mainInfoLoading });
  console.log('Courses errors:', { coursesError, mainInfoError });

  const courses = coursesData?.data ? coursesData.data.map(formatStrapiCourse).filter(Boolean) : [];
  const mainInfo = formatCourseMainInfo(mainInfoData);

  console.log('Formatted courses:', courses);
  console.log('Formatted main info:', mainInfo);

  const practicalInfo = [
    "8 tillfällen á 2,5h",
    "Startdatum: 28 oktober", 
    "12 deltagare",
    "2 800 kr (ordinarie)",
    "2 200 kr (pensionär, student eller omtag)"
  ];

  if (coursesLoading || mainInfoLoading) {
    console.log('Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Laddar kurser...</div>
      </div>
    );
  }

  if (coursesError || mainInfoError) {
    console.error('Error loading data:', { coursesError, mainInfoError });
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Ett fel uppstod vid laddning av kurser</div>
      </div>
    );
  }

  console.log('About to render courses. Number of courses:', courses.length);

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

      {/* Debug section - remove after fixing */}
      <div className="bg-red-500 text-white p-4 mx-4 mb-4">
        <h3>Debug info:</h3>
        <p>Courses length: {courses.length}</p>
        <p>Has main info: {mainInfo ? 'Yes' : 'No'}</p>
        <p>Loading states: courses={coursesLoading.toString()}, mainInfo={mainInfoLoading.toString()}</p>
      </div>

      {/* Courses Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseCard 
                key={course.id || index} 
                course={course}
                practicalInfo={practicalInfo}
              />
            ))
          ) : (
            <div className="col-span-2 text-center text-white text-xl">
              Inga kurser hittades
            </div>
          )}
        </div>
        
        {/* Combined Information Box */}
        <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
          <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
            <div className="text-left space-y-6">
              {mainInfo?.info && (
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-4 max-w-2xl text-left">
                    Ett hem för dig som vill lära dig Improv Comedy – med målet att själv stå på scen.
                  </h3>
                  
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <div 
                      className="text-base space-y-4"
                      style={{ lineHeight: '1.3' }}
                      dangerouslySetInnerHTML={{ __html: mainInfo.info }}
                    />
                  </div>
                </div>
              )}

              {mainInfo?.redbox && (
                <div className="bg-red-700 p-6 rounded-none relative">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Lär dig spela det som redan är kul
                  </h2>
                  <div 
                    className="text-base leading-relaxed text-white font-light"
                    style={{ lineHeight: '1.3' }}
                    dangerouslySetInnerHTML={{ __html: mainInfo.redbox }}
                  />
                </div>
              )}

              {mainInfo?.infoAfterRedbox && (
                <div>
                  <div 
                    className="space-y-6 text-gray-700 leading-relaxed text-base"
                    style={{ lineHeight: '1.3' }}
                    dangerouslySetInnerHTML={{ __html: mainInfo.infoAfterRedbox }}
                  />
                </div>
              )}

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
