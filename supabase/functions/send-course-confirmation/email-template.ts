import { createUnifiedEmailTemplate } from "../_shared/unified-email-template.ts";

export function createSimpleEmailTemplate(subject: string, content: string): string {
  // Use the new unified template with course-specific header
  const courseContent = `H1: Tack för din bokning

Din bokning är bekräftad

${content}`;

  return createUnifiedEmailTemplate(subject, courseContent);
}