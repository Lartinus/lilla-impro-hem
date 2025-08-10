import { CourseTemplate } from '@/types/courseManagement';

// Template data mapping
export const getTemplateData = (courseType: string, courseTemplates: CourseTemplate[]) => {
  // First check if it's a template from the database
  const template = courseTemplates.find(t => t.id === courseType);
  if (template) {
    return {
      title_template: template.title_template,
      subtitle: template.subtitle,
      course_info: template.course_info,
      practical_info: template.practical_info,
      price: template.price,
      discount_price: template.discount_price,
      max_participants: template.max_participants,
      sessions: template.sessions,
      hours_per_session: template.hours_per_session,
      start_time: template.start_time,
    };
  }
  
  // Fallback to legacy mapping for backward compatibility
  const legacyTemplates = {
    'niv1': {
      title_template: 'Nivå 1 – Improv Comedy',
      subtitle: 'Grundkurs i improvisationsteater',
      course_info: 'En introduktionskurs för nybörjare inom improvisationsteater.',
      practical_info: 'Ta med bekväma kläder och vara beredd att ha kul!',
      price: 2800,
      discount_price: 2200,
      max_participants: 12,
      sessions: 8,
      hours_per_session: 2,
      start_time: '18:00',
    },
    'niv2': {
      title_template: 'Nivå 2 – Improv Comedy',
      subtitle: 'Fördjupningskurs i improvisationsteater',
      course_info: 'En fortsättningskurs för dig som redan har grundläggande kunskaper.',
      practical_info: 'Kräver tidigare erfarenhet av improvisationsteater.',
      price: 2800,
      discount_price: 2200,
      max_participants: 10,
      sessions: 8,
      hours_per_session: 2.5,
      start_time: '18:00',
    },
    'houseteam': {
      title_template: 'House Team & fortsättning',
      subtitle: 'Regelbunden träning för erfarna improvisatörer',
      course_info: 'Kontinuerlig träning och utveckling för medlemmar i LIT:s house team.',
      practical_info: 'Endast för inbjudna medlemmar.',
      price: 1500,
      discount_price: 1200,
      max_participants: 8,
      sessions: 12,
      hours_per_session: 2,
      start_time: '18:00',
    },
    'helgworkshop': {
      title_template: 'Helgworkshop',
      subtitle: 'Intensiv workshop under en helg',
      course_info: 'En koncentrerad workshop som sträcker sig över en helg.',
      practical_info: 'Fredag kväll, lördag och söndag.',
      price: 1800,
      discount_price: 1400,
      max_participants: 15,
      sessions: 3,
      hours_per_session: 4,
      start_time: '18:00',
    }
  };
  return legacyTemplates[courseType as keyof typeof legacyTemplates];
};

export const generateCourseTitle = (courseData: any, courseTemplates: CourseTemplate[]) => {
  // Check if it's a template and use its title
  const template = courseTemplates.find(t => t.id === courseData.courseType);
  if (template) {
    return (template.title_template || courseData.customName || 'Untitled Course').trim();
  }
  
  // Legacy handling for non-template courses
  switch (courseData.courseType) {
    case 'custom':
      return courseData.customName;
    case 'niv1':
      return 'Nivå 1 – Improv Comedy';
    case 'niv2':
      return 'Nivå 2 – Improv Comedy';
    case 'helgworkshop':
      return courseData.customName;
    case 'houseteam':
      return 'House Team & fortsättning';
    default:
      return courseData.customName || 'Untitled Course';
  }
};

export const generateTableName = (courseData: any, courseTemplates: CourseTemplate[]) => {
  const template = courseTemplates.find(t => t.id === courseData.courseType);
  if (template) {
    return `course_${template.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }
  
  // Legacy handling for non-template courses
  switch (courseData.courseType) {
    case 'custom':
      return `course_custom_${courseData.customName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    case 'niv1':
      return `course_niv_1_scenarbete_improv_comedy_${Date.now()}`;
    case 'niv2':
      return `course_niv_2_langform_improviserad_komik_${Date.now()}`;
    case 'helgworkshop':
      return `course_helgworkshop_${courseData.customName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    case 'houseteam':
      return `course_house_team_fortsattning_${Date.now()}`;
    default:
      return `course_custom_${Date.now()}`;
  }
};