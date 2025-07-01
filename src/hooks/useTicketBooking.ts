
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TicketBooking {
  bookingId: string;
  expiresAt: string;
  sessionId: string;
}

export const useTicketBooking = () => {
  const [booking, setBooking] = useState<TicketBooking | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Generate a unique session ID for this browser session
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('ticket-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ticket-session-id', sessionId);
    }
    return sessionId;
  };

  const createBooking = async (
    showSlug: string, 
    regularTickets: number, 
    discountTickets: number
  ) => {
    try {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase.rpc('create_ticket_booking', {
        show_slug_param: showSlug,
        regular_tickets_param: regularTickets,
        discount_tickets_param: discountTickets,
        session_id_param: sessionId
      });

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const bookingData = data[0];
        const newBooking: TicketBooking = {
          bookingId: bookingData.booking_id,
          expiresAt: bookingData.expires_at,
          sessionId: sessionId
        };
        
        setBooking(newBooking);
        sessionStorage.setItem('current-booking', JSON.stringify(newBooking));
        
        return newBooking;
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  };

  const clearBooking = () => {
    setBooking(null);
    setTimeLeft(0);
    sessionStorage.removeItem('current-booking');
  };

  // Calculate time left in seconds
  useEffect(() => {
    if (!booking?.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expires = new Date(booking.expiresAt).getTime();
      const difference = expires - now;
      
      if (difference > 0) {
        setTimeLeft(Math.ceil(difference / 1000));
      } else {
        setTimeLeft(0);
        clearBooking();
      }
    };

    // Update immediately
    updateTimeLeft();
    
    // Update every second
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [booking?.expiresAt]);

  // Check for existing booking on mount
  useEffect(() => {
    const savedBooking = sessionStorage.getItem('current-booking');
    if (savedBooking) {
      try {
        const parsed = JSON.parse(savedBooking);
        const now = new Date().getTime();
        const expires = new Date(parsed.expiresAt).getTime();
        
        if (expires > now) {
          setBooking(parsed);
        } else {
          sessionStorage.removeItem('current-booking');
        }
      } catch (error) {
        console.error('Error parsing saved booking:', error);
        sessionStorage.removeItem('current-booking');
      }
    }
  }, []);

  return {
    booking,
    timeLeft,
    createBooking,
    clearBooking,
    hasActiveBooking: !!booking && timeLeft > 0
  };
};
