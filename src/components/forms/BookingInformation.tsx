

interface BookingInformationProps {
  maxParticipants?: number | null;
}

export const BookingInformation = ({ maxParticipants }: BookingInformationProps) => {
  return (
    <>
      <div className="text-muted-foreground space-y-1">
        <p className="text-sm">Bokningsinformation</p>
        <div className="space-y-1">
          <p className="text-xs">• Anmälan är bindande</p>
          <p className="text-xs">• Betalning sker via faktura som mejlas till e-postadressen du anger ovan</p>
          <p className="text-xs">• Avbokning är kostnadsfri fram till 30 dagar före kursstart. Därefter debiteras 50 % av kursavgiften. Vid avbokning senare än 14 dagar före kursstart debiteras hela avgiften</p>
          <p className="text-xs">• Vid utebliven närvaro sker ingen återbetalning</p>
          <p className="text-xs">• Bekräftelse på din plats skickas via mejl inom 5 arbetsdagar efter att anmälan har registrerats</p>
          <p className="text-xs">• För frågor eller särskilda önskemål, kontakta oss på kurs@improteatern.se</p>
        </div>
      </div>

      {maxParticipants && (
        <div className="text-xs text-muted-foreground">
          Max {maxParticipants} deltagare
        </div>
      )}
    </>
  );
};

