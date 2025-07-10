import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EmailTemplate } from '../components/admin/email/types';

interface TemplateForm {
  name: string;
  subject: string;
  content: string;
  background_image: string;
  description: string;
}

export function useEmailTemplateManagement() {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateForm>({
    name: '',
    subject: '',
    content: '',
    background_image: '',
    description: ''
  });

  const queryClient = useQueryClient();

  const resetForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      content: '',
      background_image: '',
      description: ''
    });
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Namn, ämne och innehåll är obligatoriska.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: templateForm.name,
            subject: templateForm.subject,
            content: templateForm.content,
            background_image: templateForm.background_image,
            description: templateForm.description
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Mall uppdaterad!",
          description: "Email-mallen har uppdaterats.",
        });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: templateForm.name,
            subject: templateForm.subject,
            content: templateForm.content,
            background_image: templateForm.background_image,
            description: templateForm.description
          });

        if (error) throw error;

        toast({
          title: "Mall skapad!",
          description: "Email-mallen har skapats.",
        });
      }
      
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error: any) {
      console.error('Template save error:', error);
      toast({
        title: "Fel vid sparning",
        description: error.message || "Det gick inte att spara mallen.",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        background_image: template.background_image || '',
        description: template.description || ''
      });
    } else {
      setEditingTemplate(null);
      resetForm();
    }
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna mall?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Mall borttagen",
        description: "Email-mallen har tagits bort.",
      });

      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error: any) {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Det gick inte att ta bort mallen.",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
    resetForm();
  };

  return {
    isTemplateDialogOpen,
    editingTemplate,
    templateForm,
    setTemplateForm,
    handleSaveTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    closeDialog
  };
}