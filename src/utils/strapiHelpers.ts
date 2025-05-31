
// Helper functions for transforming Strapi data
export const getStrapiImageUrl = (image: any, baseUrl = 'https://reliable-chicken-da8c8aa37e.strapiapp.com') => {
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
  console.log('Formatting course:', strapiCourse);
  
  // Handle teacher relation - the teacher object is directly in attributes, not nested in data
  const teacher = attrs.teacher;
  console.log('Teacher data:', teacher);
  
  return {
    id: strapiCourse.id,
    title: attrs.titel || attrs.title,
    subtitle: attrs.undertitel || attrs.subtitle,
    description: attrs.description,
    practicalInfo: attrs.praktisk_info ? 
      attrs.praktisk_info.split('\n').filter((item: string) => item.trim()) : 
      [],
    teacher: teacher ? {
      id: teacher.id,
      name: teacher.name,
      bio: teacher.bio,
      image: getStrapiImageUrl(teacher.image),
    } : null,
    available: true,
    showButton: true
  };
};

export const formatCourseMainInfo = (strapiData: any) => {
  if (!strapiData?.data?.attributes) return null;
  
  const attrs = strapiData.data.attributes;
  
  return {
    info: attrs.info || '',
    redbox: attrs.redbox || '',
    infoAfterRedbox: attrs.info_efter_redbox || attrs.info_after_redbox || ''
  };
};
