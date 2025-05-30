
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
  
  return {
    id: strapiCourse.id,
    title: attrs.title,
    description: attrs.description,
    longDescription: attrs.long_description,
    price: attrs.price,
    duration: attrs.duration,
    level: attrs.level,
    maxParticipants: attrs.max_participants,
    availableSpots: attrs.available_spots,
    startDate: attrs.start_date,
    endDate: attrs.end_date,
    schedule: attrs.schedule,
    image: getStrapiImageUrl(attrs.image),
    instructor: attrs.instructor?.data ? {
      id: attrs.instructor.data.id,
      name: attrs.instructor.data.attributes.name,
      bio: attrs.instructor.data.attributes.bio,
      image: getStrapiImageUrl(attrs.instructor.data.attributes.image),
    } : null,
  };
};
