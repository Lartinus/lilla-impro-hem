import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone } from 'lucide-react';

type EmailType = 'course-confirmation' | 'ticket-confirmation' | 'newsletter' | 'general';
type EmailStyle = 'current' | 'minimal-clean';

const EmailPreview = () => {
  const [emailType, setEmailType] = useState<EmailType>('course-confirmation');
  const [emailStyle, setEmailStyle] = useState<EmailStyle>('current');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Mock data
  const mockData = {
    name: "Anna Andersson",
    email: "anna@example.com",
    courseTitle: "Nivå 1 - Scenarbete & Improv Comedy",
    showTitle: "Davids Testevent",
    showDate: "2025-01-15 19:00",
    showLocation: "Lilla Improteatern, Lund",
    ticketCode: "ABC12345",
    regularTickets: 2,
    discountTickets: 1
  };

  const getCurrentEmailContent = () => {
    const isAvailable = emailType === 'course-confirmation';
    
    if (emailStyle === 'current') {
      return renderCurrentEmailStyle();
    } else {
      return renderMinimalCleanStyle();
    }
  };

  const renderCurrentEmailStyle = () => {
    if (emailType === 'course-confirmation') {
      return (
        <div style={{ 
          fontFamily: 'Arial, sans-serif', 
          lineHeight: 1.6, 
          color: '#333',
          backgroundColor: '#f5f5f5',
          padding: '0',
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '40px auto',
            position: 'relative',
            zIndex: 10,
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                borderBottom: '2px solid #d32f2f', 
                paddingBottom: '20px', 
                marginBottom: '30px',
              }}>
                <h2 style={{
                  color: '#d32f2f', 
                  margin: '0 0 10px 0',
                  fontSize: '24px',
                }}>
                  Bekräftelse av kursbokning - {mockData.courseTitle}
                </h2>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <p style={{ marginBottom: '15px' }}>
                  Tack för din kursbokning, <strong>{mockData.name}</strong>!
                </p>
                <p style={{ marginBottom: '15px' }}>
                  Vi har tagit emot din bokning för kursen <strong>{mockData.courseTitle}</strong>.
                </p>
                <p style={{ marginBottom: '15px' }}>
                  Vi kommer att kontakta dig snart med mer information om kursen, inklusive tid, plats och praktiska detaljer.
                </p>
                <p style={{ marginBottom: '15px' }}>
                  Vi ser fram emot att träffa dig på kursen!
                </p>
              </div>
              
              <div style={{
                borderTop: '1px solid #eee', 
                paddingTop: '20px',
                color: '#666',
                fontSize: '14px',
              }}>
                <p style={{ margin: '0 0 15px 0' }}>
                  Med vänliga hälsningar,<br />
                  <strong>Lilla Improteatern</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (emailType === 'ticket-confirmation') {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('ticket-' + mockData.ticketCode)}`;
      
      return (
        <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
          <div style={{
            maxWidth: '600px',
            margin: '20px auto',
            border: '2px solid #d32f2f',
            borderRadius: '10px',
            overflow: 'hidden',
            background: '#fff'
          }}>
            <div style={{
              background: '#d32f2f',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h1 style={{ margin: 0, fontSize: '24px', color: 'white' }}>{mockData.showTitle}</h1>
              <p style={{ margin: '10px 0 0 0', color: 'white' }}>BILJETT</p>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Datum & Tid:</div>
                  <div>{mockData.showDate}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Plats:</div>
                  <div>{mockData.showLocation}</div>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px dashed #d32f2f'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '200px', display: 'block', margin: '0 auto' }} />
                </div>
                <p><small>Visa denna QR-kod vid entrén</small></p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <div>Innehåll för {emailType} med nuvarande stil...</div>;
  };

  const renderMinimalCleanStyle = () => {
    if (emailType === 'course-confirmation') {
      return (
        <div style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          backgroundColor: '#ffffff',
          margin: 0,
          padding: 0,
          lineHeight: '1.6',
          color: '#2c2c2c'
        }}>
          {/* Hero Section with subtle background */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '300',
                margin: '0 0 16px 0',
                color: '#2c2c2c',
                letterSpacing: '-0.5px'
              }}>
                Välkommen till kursen
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6c757d',
                margin: 0,
                fontWeight: '300'
              }}>
                Din bokning är bekräftad
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px 20px'
          }}>
            {/* Greeting */}
            <div style={{
              marginBottom: '40px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '400',
                margin: '0 0 16px 0',
                color: '#2c2c2c'
              }}>
                Hej {mockData.name}!
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Tack för din kursbokning. Vi ser fram emot att träffa dig!
              </p>
            </div>

            {/* Course Details Card */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '40px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '500',
                margin: '0 0 20px 0',
                color: '#2c2c2c',
                textAlign: 'center'
              }}>
                {mockData.courseTitle}
              </h3>
              
              <div style={{
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  Vi kommer snart att kontakta dig med
                </p>
                <p style={{ margin: '0' }}>
                  tid, plats och praktiska detaljer
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '500',
                margin: '0 0 16px 0',
                color: '#2c2c2c'
              }}>
                Vad händer nu?
              </h3>
              <div style={{
                fontSize: '16px',
                color: '#6c757d',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  Du kommer att få ett mejl med kursdetaljer senast en vecka innan kursstart
                </p>
                <p style={{ margin: '0' }}>
                  Har du frågor? Svara på detta mejl så hör vi av oss
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid #e9ecef',
              paddingTop: '32px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                margin: '0 0 8px 0'
              }}>
                Med vänliga hälsningar
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#2c2c2c',
                margin: 0
              }}>
                Lilla Improteatern
              </p>
            </div>
          </div>

          {/* Unsubscribe */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '24px 20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#6c757d',
              margin: 0
            }}>
              Vill du inte längre få våra mejl?{' '}
              <a href="#" style={{
                color: '#6c757d',
                textDecoration: 'underline'
              }}>
                Avprenumerera här
              </a>
            </p>
          </div>
        </div>
      );
    }

    if (emailType === 'ticket-confirmation') {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('ticket-' + mockData.ticketCode)}`;
      
      return (
        <div style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          backgroundColor: '#ffffff',
          margin: 0,
          padding: 0,
          lineHeight: '1.6',
          color: '#2c2c2c'
        }}>
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
            padding: '60px 20px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '300',
                margin: '0 0 16px 0',
                letterSpacing: '-0.5px'
              }}>
                {mockData.showTitle}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#e9ecef',
                margin: 0,
                fontWeight: '300'
              }}>
                Din biljett är bekräftad
              </p>
            </div>
          </div>

          {/* Ticket Card */}
          <div style={{
            maxWidth: '600px',
            margin: '40px auto',
            padding: '0 20px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #e9ecef',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              {/* Event Details */}
              <div style={{
                padding: '40px',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6c757d',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}>
                      Datum & Tid
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#2c2c2c',
                      fontWeight: '500'
                    }}>
                      {mockData.showDate}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6c757d',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}>
                      Plats
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#2c2c2c',
                      fontWeight: '500'
                    }}>
                      {mockData.showLocation}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6c757d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Köpare
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#2c2c2c',
                    fontWeight: '500'
                  }}>
                    {mockData.name}
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6c757d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px'
                }}>
                  Din biljett
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    style={{ 
                      display: 'block',
                      width: '150px',
                      height: '150px'
                    }} 
                  />
                </div>
                
                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  margin: '16px 0 0 0'
                }}>
                  Visa denna kod vid entrén
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            padding: '0 20px'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0 0 12px 0',
                color: '#2c2c2c'
              }}>
                Viktig information
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#6c757d',
                lineHeight: '1.5'
              }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  Kom i god tid innan föreställningen börjar
                </p>
                <p style={{ margin: 0 }}>
                  Ta med dig denna biljett (utskriven eller på mobilen)
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '32px 20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              margin: '0 0 8px 0'
            }}>
              Med vänliga hälsningar
            </p>
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#2c2c2c',
              margin: 0
            }}>
              Lilla Improteatern
            </p>
          </div>
        </div>
      );
    }

    if (emailType === 'newsletter') {
      return (
        <div style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          backgroundColor: '#ffffff',
          margin: 0,
          padding: 0,
          lineHeight: '1.6',
          color: '#2c2c2c'
        }}>
          {/* Hero with Image */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '60px 20px 40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {/* Logo/Image placeholder */}
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#2c2c2c',
                borderRadius: '60px',
                margin: '0 auto 32px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                LIT
              </div>
              
              <h1 style={{
                fontSize: '36px',
                fontWeight: '300',
                margin: '0 0 16px 0',
                color: '#2c2c2c',
                letterSpacing: '-0.5px'
              }}>
                Månadsnytt
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                margin: 0,
                fontWeight: '300'
              }}>
                Nyheter från Lilla Improteatern
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px 20px'
          }}>
            {/* Article */}
            <article style={{
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '400',
                margin: '0 0 16px 0',
                color: '#2c2c2c'
              }}>
                Nya kurser på våren 2025
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                margin: '0 0 20px 0',
                lineHeight: '1.6'
              }}>
                Vi är glada att kunna presentera vårt vårutbud med spännande kurser för alla nivåer. 
                Från nybörjare till erfarna improvisatörer.
              </p>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  margin: '0 0 12px 0',
                  color: '#2c2c2c'
                }}>
                  Nivå 1 - Scenarbete & Improv Comedy
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  margin: '0 0 16px 0',
                  lineHeight: '1.5'
                }}>
                  Start: 15 mars 2025 • 8 veckor • 2800 kr
                </p>
                <a href="#" style={{
                  display: 'inline-block',
                  backgroundColor: '#2c2c2c',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Läs mer & anmäl
                </a>
              </div>
            </article>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid #e9ecef',
              paddingTop: '32px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                margin: '0 0 8px 0'
              }}>
                Med vänliga hälsningar
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#2c2c2c',
                margin: 0
              }}>
                Lilla Improteatern
              </p>
            </div>
          </div>

          {/* Unsubscribe */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '24px 20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#6c757d',
              margin: 0
            }}>
              Vill du inte längre få våra mejl?{' '}
              <a href="#" style={{
                color: '#6c757d',
                textDecoration: 'underline'
              }}>
                Avprenumerera här
              </a>
            </p>
          </div>
        </div>
      );
    }

    return <div>Minimal Clean stil för {emailType}...</div>;
  };

  const containerWidth = viewMode === 'desktop' ? '100%' : '375px';
  const containerHeight = viewMode === 'desktop' ? '600px' : '667px';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preview</h1>
          <p className="text-gray-600">Förhandsgranska och testa olika email-designer</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Inställningar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email-typ</label>
                  <Select value={emailType} onValueChange={(value: EmailType) => setEmailType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course-confirmation">Kursbekräftelse</SelectItem>
                      <SelectItem value="ticket-confirmation">Biljettbekräftelse</SelectItem>
                      <SelectItem value="newsletter">Nyhetsbrev</SelectItem>
                      <SelectItem value="general">Allmänt meddelande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Design-stil</label>
                  <Select value={emailStyle} onValueChange={(value: EmailStyle) => setEmailStyle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Nuvarande design</SelectItem>
                      <SelectItem value="minimal-clean">Minimal & Ren (Moccamaster-inspirerad)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Förhandsvisning</label>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('desktop')}
                      className="flex-1"
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Desktop
                    </Button>
                    <Button
                      variant={viewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('mobile')}
                      className="flex-1"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobil
                    </Button>
                  </div>
                </div>

                {emailStyle === 'minimal-clean' && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-green-800 mb-2">✨ Moccamaster-inspirerad design</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Minimalistisk layout</li>
                      <li>• Elegant typografi</li>
                      <li>• Sofistikerad färgpalett</li>
                      <li>• Responsiv design</li>
                      <li>• Förbättrad läsbarhet</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Email Preview
                  <div className="text-sm text-gray-500">
                    {viewMode === 'desktop' ? 'Desktop' : 'Mobil'} • {emailStyle === 'current' ? 'Nuvarande' : 'Minimal & Ren'}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div 
                    style={{
                      width: containerWidth,
                      height: containerHeight,
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'auto',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {getCurrentEmailContent()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;