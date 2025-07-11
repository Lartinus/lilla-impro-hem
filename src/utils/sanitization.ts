import DOMPurify from 'dompurify';

// Sanitize HTML content for email templates
export const sanitizeEmailContent = (html: string): string => {
  
  // Configure allowed tags and attributes for email content
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'a', 'img',
      'div', 'span',
      'table', 'tr', 'td', 'th', 'tbody', 'thead',
      'blockquote'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title',
      'style', 'class',
      'target', 'rel',
      'width', 'height'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target'],
    FORBID_CONTENTS: ['script', 'style'],
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    KEEP_CONTENT: true
  });
};

// Sanitize markdown content before conversion
export const sanitizeMarkdownContent = (markdown: string): string => {
  // Remove potentially dangerous markdown patterns
  return markdown
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '') // Remove iframes
    .replace(/<object[\s\S]*?<\/object>/gi, '') // Remove objects
    .replace(/<embed[\s\S]*?>/gi, ''); // Remove embeds
};

// Validate email addresses
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
};

// Validate and sanitize user input for forms
export const sanitizeFormInput = (input: string, maxLength: number = 1000): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};