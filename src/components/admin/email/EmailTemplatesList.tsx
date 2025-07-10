import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { EmailTemplate } from './types';

interface EmailTemplatesListProps {
  emailTemplates: EmailTemplate[];
  templatesLoading: boolean;
  onEdit: (template?: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => void;
  onCreateNew: () => void;
}

export function EmailTemplatesList({ 
  emailTemplates, 
  templatesLoading, 
  onEdit, 
  onPreview, 
  onDelete, 
  onCreateNew 
}: EmailTemplatesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Email-mallar</h3>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ny mall
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tillgängliga mallar</CardTitle>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="text-center py-4">Laddar mallar...</div>
          ) : emailTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Inga mallar hittades. Skapa din första mall!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Ämne</TableHead>
                  <TableHead>Skapad</TableHead>
                  <TableHead className="w-[120px]">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString('sv-SE')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onPreview(template)}
                          title="Förhandsgranska"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEdit(template)}
                          title="Redigera"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDelete(template.id)}
                          title="Ta bort"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}