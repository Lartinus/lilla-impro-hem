
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

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
    <div className={`flex items-center space-x-2 p-3 rounded-none border-2 ${
      isUrgent ? 'border-red-600 bg-red-50' : 'border-orange-500 bg-orange-50'
    }`}>
      <Clock size={20} className={isUrgent ? 'text-red-600' : 'text-orange-600'} />
      <div className="flex flex-col">
        <span className={`font-semibold ${isUrgent ? 'text-red-800' : 'text-orange-800'}`}>
          Dina biljetter är reserverade
        </span>
        <span className={`text-sm ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
          Tid kvar: {minutes}:{seconds.toString().padStart(2, '0')} minuter
        </span>
      </div>
    </div>
  );
};

export default TicketCountdown;
