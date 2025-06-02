
// Helper functions for transforming Strapi data
export const getStrapiImageUrl = (image: any, baseUrl = 'https://reliable-chicken-da8c8aa37e.strapiapp.com') => {
  console.log('getStrapiImageUrl - Input image:', JSON.stringify(image, null, 2));
  console.log('getStrapiImageUrl - Image type:', typeof image);
  
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
  
  // Handle Strapi v5 format with data wrapper first
  if (image?.data) {
    // Single image with data wrapper
    if (image.data.url) {
      const url = image.data.url;
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      console.log('getStrapiImageUrl - Using data.url:', fullUrl);
      return fullUrl;
    }
    
    // Array of images with data wrapper
    if (Array.isArray(image.data) && image.data.length > 0 && image.data[0].url) {
      const url = image.data[0].url;
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      console.log('getStrapiImageUrl - Using data[0].url:', fullUrl);
      return fullUrl;
    }
  }
  
  // Handle direct image object (legacy format)
  if (image?.url) {
    const url = image.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using direct url:', fullUrl);
    return fullUrl;
  }
  
  // Handle legacy attributes format
  if (image?.attributes?.url) {
    const url = image.attributes.url;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log('getStrapiImageUrl - Using attributes.url:', fullUrl);
    return fullUrl;
  }
  
  // Handle array of images (take first one)
  if (Array.isArray(image) && image.length > 0) {
    console.log('getStrapiImageUrl - Processing array, taking first image');
    return getStrapiImageUrl(image[0], baseUrl);
  }
  
  console.log('getStrapiImageUrl - No valid image URL found, returning null');
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
  
  const formatted = {
    id: strapiShow.id,
    title: showData.titel || showData.title,
    date: showData.datum || showData.date,
    time: showData.time,
    location: locationName,
    slug: showData.slug,
    image: getStrapiImageUrl(showData.bild || showData.image),
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
  
  // Handle performers with extensive logging and error handling
  let performers = [];
  console.log('formatStrapiShow - Raw performers data:', JSON.stringify(showData.performers, null, 2));
  
  if (showData.performers && Array.isArray(showData.performers)) {
    console.log('formatStrapiShow - Processing performers array:', showData.performers.length, 'performers');
    
    performers = showData.performers.map((performer: any, index: number) => {
      console.log(`formatStrapiShow - Processing performer ${index}:`, JSON.stringify(performer, null, 2));
      
      // Handle both direct performer objects and data-wrapped performers
      const performerData = performer.attributes || performer;
      console.log(`formatStrapiShow - Performer ${index} data after extraction:`, JSON.stringify(performerData, null, 2));
      
      // Log ALL available fields for this performer to see what Strapi is actually returning
      console.log(`formatStrapiShow - Performer ${index} ALL AVAILABLE FIELDS:`, Object.keys(performerData));
      
      // Try to find image data in the original performer object (not just performerData)
      let performerImage = null;
      const allImageFields = ['bild', 'image', 'media', 'foto', 'picture', 'avatar', 'profileImage', 'profile_image'];
      
      // First check in the extracted performerData
      for (const fieldName of allImageFields) {
        if (performerData[fieldName]) {
          console.log(`formatStrapiShow - Performer ${index}: Found field '${fieldName}' in performerData:`, JSON.stringify(performerData[fieldName], null, 2));
          performerImage = getStrapiImageUrl(performerData[fieldName]);
          if (performerImage) {
            console.log(`formatStrapiShow - Performer ${index}: Successfully got image URL from performerData.${fieldName}:`, performerImage);
            break;
          }
        }
      }
      
      // If no image found in performerData, check in the original performer object
      if (!performerImage) {
        console.log(`formatStrapiShow - Performer ${index}: No image in performerData, checking original performer object`);
        for (const fieldName of allImageFields) {
          if (performer[fieldName]) {
            console.log(`formatStrapiShow - Performer ${index}: Found field '${fieldName}' in original performer:`, JSON.stringify(performer[fieldName], null, 2));
            performerImage = getStrapiImageUrl(performer[fieldName]);
            if (performerImage) {
              console.log(`formatStrapiShow - Performer ${index}: Successfully got image URL from performer.${fieldName}:`, performerImage);
              break;
            }
          }
        }
      }
      
      if (!performerImage) {
        console.log(`formatStrapiShow - Performer ${index}: No image found anywhere. Original performer object:`, JSON.stringify(performer, null, 2));
        console.log(`formatStrapiShow - Performer ${index}: PerformerData object:`, JSON.stringify(performerData, null, 2));
      }
      
      const formattedPerformer = {
        id: performer.id || performerData.id || index,
        name: performerData.name || `Performer ${index + 1}`,
        bio: performerData.bio || '',
        image: performerImage, // This will be null if no image is found
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
    image: getStrapiImageUrl(showData.bild || showData.image),
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
  
  // Handle teacher relation with proper image handling
  let teacher = null;
  if (attrs.teacher) {
    console.log('Teacher data found:', JSON.stringify(attrs.teacher, null, 2));
    
    // New Strapi v4/v5 format with data wrapper
    if (attrs.teacher.data?.attributes) {
      const teacherAttrs = attrs.teacher.data.attributes;
      console.log('Teacher attributes:', JSON.stringify(teacherAttrs, null, 2));
      console.log('Teacher bild data:', JSON.stringify(teacherAttrs.bild, null, 2));
      console.log('Teacher image data:', JSON.stringify(teacherAttrs.image, null, 2));
      
      // Check all possible image field locations
      const imageField = teacherAttrs.bild || teacherAttrs.image;
      console.log('Selected image field:', JSON.stringify(imageField, null, 2));
      
      teacher = {
        id: attrs.teacher.data.id,
        name: teacherAttrs.name,
        bio: teacherAttrs.bio,
        image: getStrapiImageUrl(imageField),
      };
      console.log('Created teacher object (v4/v5 format):', teacher);
    }
    // Direct teacher data (older format or simplified)
    else if (attrs.teacher.name) {
      console.log('Teacher bild field exists?', 'bild' in attrs.teacher);
      console.log('Teacher bild value:', attrs.teacher.bild);
      console.log('Teacher image field exists?', 'image' in attrs.teacher);
      console.log('Teacher image value:', attrs.teacher.image);
      
      const imageField = attrs.teacher.bild || attrs.teacher.image;
      console.log('Selected direct image field:', JSON.stringify(imageField, null, 2));
      
      teacher = {
        id: attrs.teacher.id,
        name: attrs.teacher.name,
        bio: attrs.teacher.bio,
        image: getStrapiImageUrl(imageField),
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
