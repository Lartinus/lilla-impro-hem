import React from 'react';
import { 
  BarChart3, 
  Users, 
  Ticket, 
  Mail,
  ChevronDown,
  ChevronRight,
  BookOpen,
  UserCheck,
  Heart,
  Calendar,
  MapPin,
  CreditCard,
  UserCircle,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  expandedSections: {
    courses: boolean;
    shows: boolean;
  };
  setExpandedSections: React.Dispatch<React.SetStateAction<{
    courses: boolean;
    shows: boolean;
  }>>;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeSection,
  setActiveSection,
  expandedSections,
  setExpandedSections
}) => {

  const menuItems = [
    {
      id: 'courses',
      title: 'Kurser',
      icon: Users,
      type: 'group' as const,
      expanded: expandedSections.courses,
      children: [
        { id: 'courses', title: 'Kurshantering', icon: BookOpen },
        { id: 'interest', title: 'Intresse', icon: Heart },
        { id: 'performers', title: 'Kursledare', icon: UserCheck },
      ]
    },
    {
      id: 'shows',
      title: 'Föreställningar',
      icon: Ticket,
      type: 'group' as const,
      expanded: expandedSections.shows,
      children: [
        { id: 'shows', title: 'Föreställningar', icon: Calendar },
        { id: 'actors', title: 'Skådespelare', icon: UserCircle },
        { id: 'discount-codes', title: 'Rabattkoder', icon: CreditCard },
        { id: 'venues', title: 'Platser', icon: MapPin },
        { id: 'tickets', title: 'Biljetter', icon: Ticket },
      ]
    },
    {
      id: 'images',
      title: 'Bilder',
      icon: ImageIcon,
      type: 'single' as const
    },
    {
      id: 'email',
      title: 'Email',
      icon: Mail,
      type: 'single' as const
    }
  ];

  const handleToggleGroup = (groupId: 'courses' | 'shows') => {
    setExpandedSections(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {menuItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-0">
            {item.type === 'single' ? (
              <Button
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => setActiveSection(item.id)}
                className="w-full h-16 flex flex-col gap-2 rounded-none justify-center"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </Button>
            ) : (
              <Collapsible
                open={item.expanded}
                onOpenChange={() => handleToggleGroup(item.id as 'courses' | 'shows')}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-16 flex items-center justify-between p-4 rounded-none"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {item.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="border-t">
                  <div className="grid grid-cols-1 gap-0">
                    {item.children?.map((child) => (
                      <Button
                        key={child.id}
                        variant={activeSection === child.id ? "secondary" : "ghost"}
                        onClick={() => setActiveSection(child.id)}
                        className="h-12 flex items-center gap-3 justify-start px-4 rounded-none border-b last:border-b-0"
                      >
                        <child.icon className="w-4 h-4" />
                        <span className="text-sm">{child.title}</span>
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};