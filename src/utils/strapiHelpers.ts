// Helper functions for transforming Strapi data
export const getStrapiImageUrl = (image: any, baseUrl = 'https://reliable-chicken-da8c8aa37e.strapiapp.com', preferredSize?: 'small' | 'medium' | 'large') => {
  console.log('getStrapiImageUrl - Input image:', JSON.stringify(image, null, 2));
  console.log('getStrapiImageUrl - Image type:', typeof image);
  
  if (!image) {
    console.log('getStrapiImageUrl - No image provided (null/undefined)');
    return null;
  }
  
  // Helper function to get optimized URL
  const getOptimizedUrl = (url: string) => {
    if (!preferredSize) return url;
    
    // If it's a Strapi media URL, try to get the optimized version
    if (url.includes('reliable-chicken-da8c8aa37e.media.strapiapp.com')) {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const baseUrlParts = parts.slice(0, -1).join('/');
      
      // Return the preferred size version if available
      return `${baseUrlParts}/${preferredSize}_${filename}`;
    }
    
    return url;
  };
  
  // Handle if image is just a string URL
  if (typeof image === 'string') {
    const fullUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
    console.log('getStrapiImageUrl - Using string url:', fullUrl);
    return getOptimizedUrl(fullUrl);
  }
  
  // Handle direct image object with url field (current Strapi format)
  if (image?.url) {
    const url = image.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using direct url:', fullUrl);
    return getOptimizedUrl(fullUrl);
  }
  
  // Handle Strapi v5 format with data wrapper
  if (image?.data) {
    // Single image with data wrapper
    if (image.data?.url) {
      const url = image.data.url;
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      console.log('getStrapiImageUrl - Using data.url:', fullUrl);
      return getOptimizedUrl(fullUrl);
    }
    
    // Handle nested data with attributes
    if (image.data?.attributes?.url) {
      const url = image.data.attributes.url;
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      console.log('getStrapiImageUrl - Using data.attributes.url:', fullUrl);
      return getOptimizedUrl(fullUrl);
    }
    
    // Array of images with data wrapper
    if (Array.isArray(image.data) && image.data.length > 0) {
      const firstImage = image.data[0];
      if (firstImage?.url) {
        const url = firstImage.url;
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
        console.log('getStrapiImageUrl - Using data[0].url:', fullUrl);
        return getOptimizedUrl(fullUrl);
      }
      if (firstImage?.attributes?.url) {
        const url = firstImage.attributes.url;
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
        console.log('getStrapiImageUrl - Using data[0].attributes.url:', fullUrl);
        return getOptimizedUrl(fullUrl);
      }
    }
  }
  
  // Handle legacy attributes format
  if (image?.attributes?.url) {
    const url = image.attributes.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using attributes.url:', fullUrl);
    return getOptimizedUrl(fullUrl);
  }
  
  // Handle array of images (take first one)
  if (Array.isArray(image) && image.length > 0) {
    console.log('getStrapiImageUrl - Processing array, taking first image');
    return getStrapiImageUrl(image[0], baseUrl, preferredSize);
  }
  
  console.log('getStrapiImageUrl - No valid image URL found, returning null');
  console.log('getStrapiImageUrl - Available keys in image object:', Object.keys(image || {}));
  return null;
};

import { convertMarkdownToHtml } from './markdownHelpers';

// Simple format for show listing page - only basic info
export const formatStrapiShowSimple = (strapiShow: any) => {
  console.log('formatStrapiShowSimple - Input show:', JSON.stringify(strapiShow, null, 2));
  
  if (!strapiShow) {
    console.log('formatStrapiShowSimple - No show data provided');
    return null;
  }
  
  const showData = strapiShow.attributes || strapiShow;
  
  if (!showData) {
    console.log('formatStrapiShowSimple - No show attributes found');
    return null;
  }
  
  // Handle location
  let locationName = '';
  if (showData.location) {
    if (showData.location.name) {
      locationName = showData.location.name;
    } else if (showData.location.data?.attributes) {
      locationName = showData.location.data.attributes.name || '';
    }
  }
  
  // Use optimized image with medium size for show cards
  const showImage = getStrapiImageUrl(showData.bild, undefined, 'medium');
  console.log('formatStrapiShowSimple - Processed image URL:', showImage);
  
  const formatted = {
    id: strapiShow.id,
    title: showData.titel || showData.title,
    date: showData.datum || showData.date,
    time: showData.time,
    location: locationName,
    slug: showData.slug,
    image: showImage,
  };
  
  console.log('formatStrapiShowSimple - Final formatted show:', formatted);
  return formatted;
};

// Full format for show details page - all info
export const formatStrapiShow = (strapiShow: any) => {
  console.log('formatStrapiShow - Input show:', JSON.stringify(strapiShow, null, 2));
  
  if (!strapiShow) {
    console.log('formatStrapiShow - No show data provided');
    return null;
  }
  
  // Handle both new Strapi format (direct data) and old format (attributes nested)
  const showData = strapiShow.attributes || strapiShow;
  
  if (!showData) {
    console.log('formatStrapiShow - No show attributes found');
    return null;
  }
  
  console.log('formatStrapiShow - Using show data:', JSON.stringify(showData, null, 2));
  
  // Handle location
  let locationName = '';
  let mapLink = '';
  
  if (showData.location) {
    if (showData.location.name) {
      locationName = showData.location.name;
      mapLink = showData.location.google_maps_link || showData.location.map_link || '';
    } else if (showData.location.data?.attributes) {
      locationName = showData.location.data.attributes.name || '';
      mapLink = showData.location.data.attributes.google_maps_link || showData.location.data.attributes.map_link || '';
    }
  }
  
  console.log('formatStrapiShow - Location:', locationName, 'Map link:', mapLink);
  
  // Handle performers - now with optimized image processing
  let performers = [];
  console.log('formatStrapiShow - Raw performers data:', JSON.stringify(showData.performers, null, 2));
  
  if (showData.performers && Array.isArray(showData.performers)) {
    console.log('formatStrapiShow - Processing performers array:', showData.performers.length, 'performers');
    
    performers = showData.performers.map((performer: any, index: number) => {
      console.log(`formatStrapiShow - Processing performer ${index}:`, JSON.stringify(performer, null, 2));
      
      // Extract performer data (handle both new and old formats)
      const performerData = performer.attributes || performer;
      console.log(`formatStrapiShow - Performer ${index} data after extraction:`, JSON.stringify(performerData, null, 2));
      console.log(`formatStrapiShow - Performer ${index} bild field:`, JSON.stringify(performerData.bild, null, 2));
      
      // Process performer image using our helper function with small size optimization
      const performerImage = getStrapiImageUrl(performerData.bild, undefined, 'small');
      console.log(`formatStrapiShow - Performer ${index} processed image:`, performerImage);
      
      const formattedPerformer = {
        id: performer.id || performerData.id || index,
        name: performerData.name || `Performer ${index + 1}`,
        bio: performerData.bio || '',
        image: performerImage,
      };
      
      console.log(`formatStrapiShow - Performer ${index} final result:`, formattedPerformer);
      return formattedPerformer;
    });
  } else {
    console.log('formatStrapiShow - No performers array found or performers is not an array');
  }
  
  console.log('formatStrapiShow - Final performers array:', performers);
  
  // Parse practical info
  let practicalInfo = [];
  if (showData.praktisk_info) {
    practicalInfo = showData.praktisk_info
      .split('\n')
      .filter((item: string) => item.trim() && !item.startsWith('#'))
      .map((item: string) => item.replace(/^-\s*/, '').trim())
      .filter((item: string) => item);
  }
  
  // Use large size for detailed show view
  const formatted = {
    id: strapiShow.id,
    title: showData.titel || showData.title,
    date: showData.datum || showData.date,
    time: showData.time,
    location: locationName,
    slug: showData.slug,
    description: showData.beskrivning || showData.description,
    practicalInfo: practicalInfo,
    mapLink: mapLink,
    image: getStrapiImageUrl(showData.bild, undefined, 'large'),
    performers: performers,
    ticketPrice: showData.ticket_price || 150,
    discountPrice: showData.discount_price || 120,
    availableTickets: showData.available_tickets || 50,
  };
  
  console.log('formatStrapiShow - Final formatted show:', formatted);
  return formatted;
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
  
  // Handle teacher relation with optimized image handling
  let teacher = null;
  if (attrs.teacher) {
    console.log('Teacher data found:', JSON.stringify(attrs.teacher, null, 2));
    
    // New Strapi v4/v5 format with data wrapper
    if (attrs.teacher.data?.attributes) {
      const teacherAttrs = attrs.teacher.data.attributes;
      console.log('Teacher attributes:', JSON.stringify(teacherAttrs, null, 2));
      
      // Check bild field first, then poster, then avatar, then fallback to other fields
      const imageField = teacherAttrs.bild || teacherAttrs.poster || teacherAttrs.avatar || teacherAttrs.image;
      console.log('Selected image field:', JSON.stringify(imageField, null, 2));
      
      teacher = {
        id: attrs.teacher.data.id,
        name: teacherAttrs.name,
        bio: teacherAttrs.bio,
        image: getStrapiImageUrl(imageField, undefined, 'small'), // Use small for teacher images
      };
      console.log('Created teacher object (v4/v5 format):', teacher);
    }
    // Direct teacher data (older format or simplified)
    else if (attrs.teacher.name) {
      const imageField = attrs.teacher.bild || attrs.teacher.poster || attrs.teacher.avatar || attrs.teacher.image;
      console.log('Selected direct image field:', JSON.stringify(imageField, null, 2));
      
      teacher = {
        id: attrs.teacher.id,
        name: attrs.teacher.name,
        bio: attrs.teacher.bio,
        image: getStrapiImageUrl(imageField, undefined, 'small'), // Use small for teacher images
      };
      console.log('Created teacher object (direct format):', teacher);
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
    isLevel1: (attrs.titel || attrs.title || '').toLowerCase().includes('nivå 1'),
    maxParticipants: attrs.platser || attrs.max_participants || null // Add max participants field
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
