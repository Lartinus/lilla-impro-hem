

interface BookingInformationProps {
  maxParticipants?: number | null;
}

export const BookingInformation = ({ maxParticipants }: BookingInformationProps) => {
  return (
    <>
      <div className="text-muted-foreground space-y-1">
        <p className="text-xs font-bold">Bokningsinformation</p>
        <div className="text-xs space-y-0.5">
          <p>- Anmälan är bindande</p>
          <p>- Betalning sker via faktura som mejlas till e-postadressen du anger ovan</p>
          <p>- Avbokning är kostnadsfri fram till 30 dagar före kursstart. Därefter debiteras 50 % av kursavgiften. Vid avbokning senare än 14 dagar före kursstart debiteras hela avgiften</p>
          <p>- Vid utebliven närvaro sker ingen återbetalning</p>
          <p>- Bekräftelse på din plats skickas via mejl inom 5 arbetsdagar efter att anmälan har registrerats</p>
          <p>- För frågor eller särskilda önskemål, kontakta oss på kurs@improteatern.se</p>
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

