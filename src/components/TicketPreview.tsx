
import React from 'react';

const TicketPreview = () => {
  // Mock data for preview
  const mockPurchase = {
    show_title: "Davids Testevent",
    show_date: "2025-01-15 19:00",
    show_location: "Lilla Improteatern, Lund",
    buyer_name: "Anna Andersson",
    regular_tickets: 2,
    discount_tickets: 1,
    ticket_code: "ABC12345",
    qr_data: "ticket-abc12345-show-davids-testevent"
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPurchase.qr_data)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Biljett Email Preview</h1>
        
        <div style={{ 
          fontFamily: 'Arial, sans-serif', 
          lineHeight: 1.6, 
          color: '#333',
          backgroundColor: '#fff',
          maxWidth: '600px',
          margin: '20px auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
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
              <h1 style={{ margin: 0, fontSize: '24px' }}>{mockPurchase.show_title}</h1>
              <p style={{ margin: '10px 0 0 0' }}>BILJETT</p>
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
                  <div>{mockPurchase.show_date}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Plats:</div>
                  <div>{mockPurchase.show_location}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Köpare:</div>
                  <div>{mockPurchase.buyer_name}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Biljetter:</div>
                  <div>{mockPurchase.regular_tickets + mockPurchase.discount_tickets} st</div>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px dashed #d32f2f'
              }}>
                <p><strong>Biljettkod:</strong></p>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#d32f2f',
                  marginBottom: '20px'
                }}>
                  {mockPurchase.ticket_code}
                </div>
                <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '200px' }} />
                <p><small>Visa denna QR-kod vid entrén</small></p>
              </div>
            </div>
          </div>
          
          <div style={{
            maxWidth: '600px',
            margin: '20px auto',
            padding: '20px',
            background: '#f5f5f5'
          }}>
            <h3>Viktig information:</h3>
            <ul>
              <li>Ta med dig denna biljett (utskriven eller på mobilen) till föreställningen</li>
              <li>Kom i god tid innan föreställningen börjar</li>
              <li>Kontakta oss på info@lit.se om du har frågor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreview;
