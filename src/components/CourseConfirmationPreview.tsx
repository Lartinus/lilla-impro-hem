
import React, { useState } from 'react';

const CourseConfirmationPreview = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Mock data for preview
  const mockData = {
    name: "Anna Andersson",
    courseTitle: "Niv 2 - Långform improviserad komik"
  };

  const subject = isAvailable 
    ? `Bekräftelse av kursbokning - ${mockData.courseTitle}`
    : `Bekräftelse av intresseanmälan - ${mockData.courseTitle}`;

  const emailContent = isAvailable 
    ? `Tack för din kursbokning, ${mockData.name}! Vi har tagit emot din bokning för kursen ${mockData.courseTitle}. Vi kommer att kontakta dig snart med mer information om kursen, inklusive tid, plats och praktiska detaljer. Vi ser fram emot att träffa dig på kursen!`
    : `Tack för din intresseanmälan, ${mockData.name}! Vi har tagit emot din intresseanmälan för ${mockData.courseTitle}. Vi kommer att kontakta dig så snart det finns lediga platser eller när nästa kurs planeras. Tack för ditt intresse!`;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Kursbekräftelse Email Preview</h1>
        
        <div className="mb-6 text-center">
          <button
            onClick={() => setIsAvailable(true)}
            className={`px-4 py-2 mr-2 rounded ${isAvailable ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Tillgänglig kurs
          </button>
          <button
            onClick={() => setIsAvailable(false)}
            className={`px-4 py-2 rounded ${!isAvailable ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
          >
            Intresseanmälan
          </button>
        </div>
        
        <div style={{ 
          fontFamily: 'Arial, sans-serif', 
          lineHeight: 1.6, 
          color: '#333',
          backgroundColor: '#fff',
          maxWidth: '600px',
          margin: '20px auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px'
        }}>
          <div style={{ 
            borderBottom: '2px solid #d32f2f', 
            paddingBottom: '20px', 
            marginBottom: '30px' 
          }}>
            <h2 style={{ 
              color: '#d32f2f', 
              margin: '0 0 10px 0',
              fontSize: '24px'
            }}>
              {subject}
            </h2>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ marginBottom: '15px' }}>
              {isAvailable ? (
                <>Tack för din kursbokning, <strong>{mockData.name}</strong>!</>
              ) : (
                <>Tack för din intresseanmälan, <strong>{mockData.name}</strong>!</>
              )}
            </p>
            
            <p style={{ marginBottom: '15px' }}>
              {isAvailable ? (
                <>Vi har tagit emot din bokning för kursen <strong>{mockData.courseTitle}</strong>.</>
              ) : (
                <>Vi har tagit emot din intresseanmälan för <strong>{mockData.courseTitle}</strong>.</>
              )}
            </p>
            
            <p style={{ marginBottom: '15px' }}>
              {isAvailable ? (
                "Vi kommer att kontakta dig snart med mer information om kursen, inklusive tid, plats och praktiska detaljer."
              ) : (
                "Vi kommer att kontakta dig så snart det finns lediga platser eller när nästa kurs planeras."
              )}
            </p>
            
            <p style={{ marginBottom: '15px' }}>
              {isAvailable ? (
                "Vi ser fram emot att träffa dig på kursen!"
              ) : (
                "Tack för ditt intresse!"
              )}
            </p>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #eee', 
            paddingTop: '20px',
            color: '#666',
            fontSize: '14px'
          }}>
            <p style={{ margin: '0' }}>
              Med vänliga hälsningar,<br />
              <strong>Lilla Improteatern</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseConfirmationPreview;
