
// Helper functions for transforming Strapi data
export const getStrapiImageUrl = (image: any, baseUrl = 'https://reliable-chicken-da8c8aa37e.strapiapp.com') => {
  console.log('getStrapiImageUrl - Input image:', JSON.stringify(image, null, 2));
  console.log('getStrapiImageUrl - Image type:', typeof image);
  console.log('getStrapiImageUrl - Is null?', image === null);
  console.log('getStrapiImageUrl - Is undefined?', image === undefined);
  
  if (!image) {
    console.log('getStrapiImageUrl - No image provided (null/undefined)');
    return null;
  }
  
  // Handle if image is just a string URL
  if (typeof image === 'string') {
    const fullUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
    console.log('getStrapiImageUrl - Using string url:', fullUrl);
    return fullUrl;
  }
  
  // Handle different image formats from Strapi
  if (image?.data?.attributes?.url) {
    const url = image.data.attributes.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using data.attributes.url:', fullUrl);
    return fullUrl;
  }
  
  // Handle direct image object
  if (image?.url) {
    const url = image.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using direct url:', fullUrl);
    return fullUrl;
  }
  
  // Handle nested data structure
  if (image?.attributes?.url) {
    const url = image.attributes.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using attributes.url:', fullUrl);
    return fullUrl;
  }
  
  console.log('getStrapiImageUrl - No valid image URL found, returning null');
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
  
  // Handle teacher relation - improved debugging for missing image
  let teacher = null;
  if (attrs.teacher) {
    console.log('Teacher data found:', JSON.stringify(attrs.teacher, null, 2));
    console.log('Teacher image field exists?', 'image' in attrs.teacher);
    console.log('Teacher image value:', attrs.teacher.image);
    
    // Direct teacher data (new format)
    if (attrs.teacher.name) {
      teacher = {
        id: attrs.teacher.id,
        name: attrs.teacher.name,
        bio: attrs.teacher.bio,
        image: attrs.teacher.image ? getStrapiImageUrl(attrs.teacher.image) : null,
      };
      console.log('Created teacher object (direct):', teacher);
    }
    // Teacher with data property (old format)
    else if (attrs.teacher.data?.attributes) {
      const teacherAttrs = attrs.teacher.data.attributes;
      console.log('Teacher attributes:', JSON.stringify(teacherAttrs, null, 2));
      console.log('Teacher attributes image field exists?', 'image' in teacherAttrs);
      teacher = {
        id: attrs.teacher.data.id,
        name: teacherAttrs.name,
        bio: teacherAttrs.bio,
        image: teacherAttrs.image ? getStrapiImageUrl(teacherAttrs.image) : null,
      };
      console.log('Created teacher object (nested):', teacher);
    }
  } else {
    console.log('No teacher data found in course');
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
  
  // Convert priority to numeric value for sorting
  const getPriorityValue = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 1;
      case 'mid': return 2;
      case 'low': return 3;
      default: return 4; // Unknown priorities go last
    }
  };
  
  const formatted = {
    id: strapiCourse.id,
    title: attrs.titel || attrs.title,
    subtitle: attrs.undertitel || attrs.subtitle,
    description: attrs.description,
    practicalInfo: practicalInfo,
    teacher: teacher,
    available: true,
    showButton: true,
    priority: attrs.prioritet || attrs.priority || 'low',
    priorityValue: getPriorityValue(attrs.prioritet || attrs.priority),
    isLevel1: (attrs.titel || attrs.title || '').toLowerCase().includes('nivå 1')
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
    info: attrs.info || '',
    redbox: attrs.redbox || '',
    infoAfterRedbox: attrs.info_efter_redbox || attrs.info_after_redbox || ''
  };
  
  console.log('Formatted main info result:', formatted);
  return formatted;
};

// Helper function to sort courses by priority and level
export const sortCourses = (courses: any[]) => {
  return courses.sort((a, b) => {
    // First sort by priority value (1=high, 2=mid, 3=low)
    if (a.priorityValue !== b.priorityValue) {
      return a.priorityValue - b.priorityValue;
    }
    
    // If same priority, put "nivå 1" courses first
    if (a.isLevel1 && !b.isLevel1) return -1;
    if (!a.isLevel1 && b.isLevel1) return 1;
    
    // If both are level 1 or both are not, keep original order
    return 0;
  });
};
