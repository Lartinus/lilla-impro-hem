export const getBookingErrorMessage = (error: any): string => {
  if (!error?.message) {
    return "Något gick fel vid anmälan. Kontrollera dina uppgifter och försök igen.";
  }

  const message = error.message;

  if (message.includes('Ogiltig e-postadress')) {
    return "Ogiltig e-postadress. Kontrollera att du har angett rätt format.";
  }
  
  if (message.includes('Ogiltigt telefonnummer')) {
    return "Ogiltigt telefonnummer. Ange ett nummer mellan 6-20 tecken.";
  }
  
  if (message.includes('Namn får inte vara tomt')) {
    return "Namn är obligatoriskt och får inte vara tomt.";
  }
  
  if (message.includes('Namn är för långt')) {
    return "Namnet är för långt. Maximalt 100 tecken tillåtet.";
  }
  
  if (message.includes('duplicate key') || message.includes('unique constraint')) {
    return "Du har redan anmält dig till denna kurs med den e-postadressen.";
  }
  
  if (message.includes('permission denied')) {
    return "Åtkomst nekad. Kontakta support om problemet kvarstår.";
  }

  return "Något gick fel vid anmälan. Kontrollera dina uppgifter och försök igen.";
};

export interface BookingResult {
  success: boolean;
  error?: string | any;
}