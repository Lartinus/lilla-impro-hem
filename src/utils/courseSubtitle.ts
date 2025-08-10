// Utility to build default course subtitles in Swedish
// Example: "Söndagar 18:00, startdatum 12 oktober"

export function buildDefaultSubtitle(
  startDate?: string | Date | null,
  startTime?: string | null
): string {
  if (!startDate) return '';

  const date = typeof startDate === 'string' ? new Date(startDate) : startDate;
  if (!date || isNaN(date.getTime())) return '';

  const pluralWeekdays = [
    'Söndagar',
    'Måndagar',
    'Tisdagar',
    'Onsdagar',
    'Torsdagar',
    'Fredagar',
    'Lördagar',
  ];

  const weekday = pluralWeekdays[date.getDay()];
  const time = startTime ? String(startTime).slice(0, 5) : '';
  const dateStr = date
    .toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
    .toLowerCase();

  if (weekday && time) {
    return `${weekday} ${time}, startdatum ${dateStr}`;
  }
  return `Startdatum ${dateStr}`;
}
