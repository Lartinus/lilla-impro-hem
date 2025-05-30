// Helper functions for transforming Strapi data
export const getStrapiImageUrl = (image: any, baseUrl = 'http://localhost:1337') => {
  if (!image) return null;
  
  if (image.data?.attributes?.url) {
    const url = image.data.attributes.url;
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  }
  
  return null;
};

export const formatStrapiShow = (strapiShow: any) => {
  if (!strapiShow?.attributes) return null;
  
  const attrs = strapiShow.attributes;
  
  // Handle location relation
  const location = attrs.location?.data?.attributes;
  const locationName = location?.name || '';
  const mapLink = location?.google_maps_link || location?.map_link || '';
  
  return {
    id: strapiShow.id,
    title: attrs.titel || attrs.title, // Support both Swedish and English field names
    date: attrs.datum || attrs.date,
    time: attrs.time, // Keep separate time field if needed
    location: locationName,
    slug: attrs.slug,
    description: attrs.beskrivning || attrs.description,
    practicalInfo: attrs.praktisk_info ? 
      attrs.praktisk_info.split('\n').filter((item: string) => item.trim()) : 
      attrs.practical_info || [],
    mapLink: mapLink,
    image: getStrapiImageUrl(attrs.bild || attrs.image),
    performers: attrs.performers?.data?.map((performer: any) => ({
      id: performer.id,
      name: performer.attributes.name,
      bio: performer.attributes.bio,
      image: getStrapiImageUrl(performer.attributes.image),
    })) || [],
    ticketPrice: attrs.ticket_price || 175,
    discountPrice: attrs.discount_price || 145,
    availableTickets: attrs.available_tickets || 100,
  };
};

export const formatStrapiCourse = (strapiCourse: any) => {
  if (!strapiCourse?.attributes) return null;
  
  const attrs = strapiCourse.attributes;
  
  // Handle kursledare (instructor) relation
  const instructor = attrs.kursledare?.data?.attributes;
  
  return {
    id: strapiCourse.id,
    title: attrs.title,
    subtitle: attrs.undertitel,
    description: attrs.description,
    practicalInfo: attrs.praktisk_info ? 
      attrs.praktisk_info.split('\n').filter((item: string) => item.trim()) : 
      [],
    instructor: instructor ? {
      id: attrs.kursledare.data.id,
      name: instructor.name,
      bio: instructor.bio,
      image: getStrapiImageUrl(instructor.image),
    } : null,
    price: attrs.price,
    duration: attrs.duration,
    level: attrs.level,
    maxParticipants: attrs.max_participants,
    availableSpots: attrs.available_spots,
    startDate: attrs.start_date,
    endDate: attrs.end_date,
    schedule: attrs.schedule,
    image: getStrapiImageUrl(attrs.image),
  };
};
