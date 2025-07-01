// strapiHelpers.ts

export type Size = 'small' | 'medium' | 'large';
export interface ImageOpts {
  baseUrl?: string;
  size?: Size;
}

/**
 * Returns a fully qualified and optionally size-optimized Strapi image URL.
 */
export const getStrapiImageUrl = (
  image: any,
  opts: ImageOpts = {}
): string | null => {
  const { baseUrl = 'https://reliable-chicken-da8c8aa37e.strapiapp.com', size } = opts;
  if (!image) return null;

  // Extract URL from various Strapi response shapes
  let url: string | undefined;
  if (typeof image === 'string') {
    url = image;
  } else {
    const data = Array.isArray(image.data)
      ? image.data[0]
      : image.data ?? image;
    url = data?.attributes?.url ?? data?.url;
  }
  if (!url) return null;

  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Optimize by injecting size prefix for Strapi media
  if (size && fullUrl.includes('.media.strapiapp.com')) {
    const parts = fullUrl.split('/');
    const filename = parts.pop();
    const prefix = parts.join('/');
    return `${prefix}/${size}_${filename}`;
  }

  return fullUrl;
};

// Convenience wrappers for common sizes
export const getStrapiImageSmall  = (img: any) => getStrapiImageUrl(img, { size: 'small' });
export const getStrapiImageMedium = (img: any) => getStrapiImageUrl(img, { size: 'medium' });
export const getStrapiImageLarge  = (img: any) => getStrapiImageUrl(img, { size: 'large' });

import { convertMarkdownToHtml } from './markdownHelpers';

/**
 * Format show for listing pages (basic info)
 */
export const formatStrapiShowSimple = (show: any) => {
  if (!show) return null;
  const attrs = show.attributes ?? show;
  if (!attrs) return null;

  // Extract location name
  const loc = attrs.location;
  const locationName =
    loc?.name ?? loc?.data?.attributes?.name ?? '';

  return {
    id: show.id,
    title: attrs.titel ?? attrs.title,
    date: attrs.datum ?? attrs.date,
    time: attrs.time,
    location: locationName,
    slug: attrs.slug,
    image: getStrapiImageMedium(attrs.bild),
  };
};

/**
 * Format detailed show with performers and practical info
 */
export const formatStrapiShow = (show: any) => {
  if (!show) return null;
  const attrs = show.attributes ?? show;
  if (!attrs) return null;

  // Location and map link
  const loc = attrs.location;
  const locationName =
    loc?.name ?? loc?.data?.attributes?.name ?? '';
  const mapLink =
    loc?.google_maps_link ?? loc?.map_link
    ?? loc?.data?.attributes?.google_maps_link
    ?? loc?.data?.attributes?.map_link
    ?? '';

  // Performers
  const performers = Array.isArray(attrs.performers)
    ? attrs.performers.map((p: any, i: number) => {
        const data = p.attributes ?? p;
        return {
          id: p.id ?? data.id ?? i,
          name: data.name,
          bio: data.bio ?? '',
          image: getStrapiImageSmall(data.bild),
        };
      })
    : [];

  // Practical info: split lines, strip markdown
  const practicalInfo = (attrs.praktisk_info ?? '')
    .split('\n')
    .map(line => line.replace(/^[-#]\s*/, '').trim())
    .filter(Boolean);

  // Improved available tickets handling with better logging
  const availableTickets = attrs.available_tickets ?? 50;
  console.log(`📊 Show "${attrs.titel}": available_tickets from Strapi = ${attrs.available_tickets}, using = ${availableTickets}`);

  return {
    id: show.id,
    title: attrs.titel ?? attrs.title,
    date: attrs.datum ?? attrs.date,
    time: attrs.time,
    location: locationName,
    slug: attrs.slug,
    description: attrs.beskrivning ?? attrs.description,
    descriptionHtml: convertMarkdownToHtml(attrs.beskrivning ?? attrs.description),
    practicalInfo,
    mapLink,
    image: getStrapiImageLarge(attrs.bild),
    performers,
    ticketPrice: attrs.ticket_price ?? 150,
    discountPrice: attrs.discount_price ?? 120,
    availableTickets,
  };
};

/**
 * Format course for listing
 */
export const formatStrapiCourse = (course: any) => {
  if (!course) return null;
  const attrs = course.attributes ?? course;
  if (!attrs) return null;

  // Teacher
  let teacher = null;
  if (attrs.teacher) {
    const t = attrs.teacher.data?.attributes ?? attrs.teacher;
    teacher = {
      id: attrs.teacher.data?.id ?? attrs.teacher.id,
      name: t.name,
      bio: t.bio ?? '',
      image: getStrapiImageSmall(t.bild ?? t.poster ?? t.avatar ?? t.image),
    };
  }

  // Practical info
  const practicalInfo = (attrs.praktisk_info ?? '')
    .split('\n')
    .map(l => l.replace(/^[-#]\s*/, '').trim())
    .filter(Boolean);

  // Priority sorting helper
  const getPriorityValue = (p: string) =>
    ['high','mid','low'].indexOf(p.toLowerCase()) + 1 || 4;
  const priorityValue = getPriorityValue(attrs.prioritet ?? attrs.priority);
  const isLevel1 = (attrs.titel ?? attrs.title ?? '')
    .toLowerCase().includes('nivå 1');

  return {
    id: course.id,
    title: attrs.titel ?? attrs.title,
    subtitle: attrs.undertitel ?? attrs.subtitle,
    description: attrs.description,
    practicalInfo,
    teacher,
    available: true,
    showButton: true,
    priority: attrs.prioritet ?? attrs.priority ?? 'low',
    priorityValue,
    isLevel1,
    maxParticipants: attrs.platser ?? attrs.max_participants ?? null,
  };
};

/**
 * Extract main course info
 */
export const formatCourseMainInfo = (data: any) => {
  const attrs = data?.data?.attributes ?? data?.data;
  if (!attrs) return null;
  return {
    info: attrs.info ?? '',
    redbox: attrs.redbox ?? '',
    infoAfterRedbox: attrs.info_efter_redbox ?? attrs.info_after_redbox ?? '',
  };
};

/**
 * Sort courses by priority and level
 */
export const sortCourses = (courses: any[]) =>
  courses.sort((a, b) => {
    if (a.priorityValue !== b.priorityValue)
      return a.priorityValue - b.priorityValue;
    if (a.isLevel1 !== b.isLevel1)
      return a.isLevel1 ? -1 : 1;
    return 0;
  });

/**
 * Sort shows by date (upcoming shows first)
 */
export const sortShows = (shows: any[]) => {
  return shows.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    return dateA.getTime() - dateB.getTime();
  });
};
