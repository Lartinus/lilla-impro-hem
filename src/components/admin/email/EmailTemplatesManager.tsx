import { useState } from 'react';
import { EmailTemplate } from './types';
import { useEmailTemplateManagement } from '@/hooks/useEmailTemplateManagement';
import { EmailTemplatesList } from './EmailTemplatesList';
import { EmailTemplateForm } from './EmailTemplateForm';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { EmailTemplatePreviewDialog } from './EmailTemplatePreviewDialog';

interface EmailTemplatesManagerProps {
  emailTemplates: EmailTemplate[];
  templatesLoading: boolean;
}

export function EmailTemplatesManager({ emailTemplates, templatesLoading }: EmailTemplatesManagerProps) {
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const {
    isTemplateDialogOpen,
    editingTemplate,
    templateForm,
    setTemplateForm,
    handleSaveTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    closeDialog
  } = useEmailTemplateManagement();

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  if (isTemplateDialogOpen) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmailTemplateForm
          editingTemplate={editingTemplate}
          templateForm={templateForm}
          onFormChange={setTemplateForm}
          onSave={handleSaveTemplate}
          onClose={closeDialog}
        />
        <EmailTemplatePreview templateForm={templateForm} />
      </div>
    );
  }

  return (
    <>
      <EmailTemplatesList
        emailTemplates={emailTemplates}
        templatesLoading={templatesLoading}
        onEdit={handleEditTemplate}
        onPreview={handlePreviewTemplate}
        onDelete={handleDeleteTemplate}
        onCreateNew={() => handleEditTemplate()}
      />

      <EmailTemplatePreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        template={previewTemplate}
      />
    </>
  );
}