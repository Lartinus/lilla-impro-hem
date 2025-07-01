
import { useEffect, useState } from 'react';

interface TicketCountdownProps {
  timeLeft: number;
  onExpired?: () => void;
}

const TicketCountdown = ({ timeLeft, onExpired }: TicketCountdownProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && onExpired) {
      onExpired();
    }
  }, [timeLeft, onExpired]);

  if (!mounted) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft <= 120; // Last 2 minutes

  return (
    <div className={`p-3 rounded-none border-2 text-left w-full max-w-xs ${
      isUrgent ? 'border-red-600 bg-red-50' : 'border-blue-600 bg-blue-50'
    }`}>
      <div className="flex flex-col">
        <span className={`font-semibold ${isUrgent ? 'text-red-800' : 'text-blue-800'}`}>
          Dina biljetter är reserverade
        </span>
        <span className={`text-sm ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
          Tid kvar: {minutes}:{seconds.toString().padStart(2, '0')} minuter
        </span>
      </div>
    </div>
  );
};

export default TicketCountdown;
