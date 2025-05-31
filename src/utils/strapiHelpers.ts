// Helper functions for transforming Strapi data
export const getStrapiImageUrl = (image: any, baseUrl = 'https://reliable-chicken-da8c8aa37e.strapiapp.com') => {
  if (!image) return null;
  
  // Handle different image formats from Strapi
  if (image.data?.attributes?.url) {
    const url = image.data.attributes.url;
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  }
  
  // Handle direct image object
  if (image.url) {
    const url = image.url;
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  }
  
  return null;
};

import { convertMarkdownToHtml } from './markdownHelpers';

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
  console.log('Formatting course - input:', JSON.stringify(strapiCourse, null, 2));
  
  if (!strapiCourse) {
    console.log('No course data provided');
    return null;
  }
  
  // Handle both new Strapi format (direct attributes) and old format (attributes nested)
  const attrs = strapiCourse.attributes || strapiCourse;
  
  if (!attrs) {
    console.log('No attributes found in course data');
    return null;
  }
  
  // Handle teacher relation
  let teacher = null;
  if (attrs.teacher) {
    console.log('Teacher data found:', JSON.stringify(attrs.teacher, null, 2));
    
    // Direct teacher data (new format)
    if (attrs.teacher.name) {
      teacher = {
        id: attrs.teacher.id,
        name: attrs.teacher.name,
        bio: attrs.teacher.bio,
        image: getStrapiImageUrl(attrs.teacher.image),
      };
    }
    // Teacher with data property (old format)
    else if (attrs.teacher.data?.attributes) {
      const teacherAttrs = attrs.teacher.data.attributes;
      teacher = {
        id: attrs.teacher.data.id,
        name: teacherAttrs.name,
        bio: teacherAttrs.bio,
        image: getStrapiImageUrl(teacherAttrs.image),
      };
    }
  }
  
  // Parse practical info from markdown-like text, removing markdown headers
  let practicalInfo = [];
  if (attrs.praktisk_info) {
    console.log('Processing praktisk_info:', attrs.praktisk_info);
    practicalInfo = attrs.praktisk_info
      .split('\n')
      .filter((line: string) => line.trim() && !line.startsWith('#'))
      .map((line: string) => line.replace(/^-\s*/, '').trim())
      .filter((line: string) => line);
  }
  
  const formatted = {
    id: strapiCourse.id,
    title: attrs.titel || attrs.title,
    subtitle: attrs.undertitel || attrs.subtitle,
    description: attrs.description,
    practicalInfo: practicalInfo,
    teacher: teacher,
    available: true,
    showButton: true
  };
  
  console.log('Formatted course result:', formatted);
  return formatted;
};

export const formatCourseMainInfo = (strapiData: any) => {
  console.log('Formatting course main info - input:', JSON.stringify(strapiData, null, 2));
  
  if (!strapiData?.data) {
    console.log('No main info data found');
    return null;
  }
  
  // Handle both old and new Strapi formats
  const attrs = strapiData.data.attributes || strapiData.data;
  
  if (!attrs) {
    console.log('No attributes found in main info data');
    return null;
  }
  
  const formatted = {
    info: convertMarkdownToHtml(attrs.info || ''),
    redbox: convertMarkdownToHtml(attrs.redbox || ''),
    infoAfterRedbox: convertMarkdownToHtml(attrs.info_efter_redbox || attrs.info_after_redbox || '')
  };
  
  console.log('Formatted main info result:', formatted);
  return formatted;
};
