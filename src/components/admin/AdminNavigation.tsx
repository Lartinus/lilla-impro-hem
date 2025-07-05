import React from 'react';
import { 
  ChevronDown,
  ChevronRight,
  BookOpen,
  UserCheck,
  Heart,
  Calendar,
  MapPin,
  CreditCard,
  UserCircle,
  ImageIcon,
  Users,
  Ticket,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    setExpandedSections(prev => {
      // Close all groups first, then open the clicked one if it was closed
      const newState = { courses: false, shows: false };
      if (!prev[groupId]) {
        newState[groupId] = true;
        // Set active section to first child when opening a group
        const targetGroup = menuItems.find(item => item.id === groupId);
        if (targetGroup && targetGroup.children && targetGroup.children.length > 0) {
          setActiveSection(targetGroup.children[0].id);
        }
      } else {
        // Clear active section when closing a group
        setActiveSection('');
      }
      return newState;
    });
  };

  const handleSelectSingle = (sectionId: string) => {
    // Close all expanded groups when selecting a single section
    setExpandedSections({ courses: false, shows: false });
    setActiveSection(sectionId);
  };

  return (
    <div className="space-y-1">
      {/* Main Navigation Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="text-center">
                <Button
                  variant={
                    (item.type === 'single' && activeSection === item.id) ||
                    (item.type === 'group' && item.expanded) 
                      ? "default" 
                      : "ghost"
                  }
                  onClick={() => {
                    if (item.type === 'single') {
                      handleSelectSingle(item.id);
                    } else {
                      handleToggleGroup(item.id as 'courses' | 'shows');
                    }
                  }}
                  className={`w-full h-16 flex flex-col gap-2 justify-center transition-all duration-200 ${
                    item.type === 'group' && item.expanded 
                      ? 'rounded-b-none border-b-0' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.type === 'group' && (
                      item.expanded ? (
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                      )
                    )}
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        
        {/* Submenu directly attached */}
        {menuItems.map((item) => 
          item.type === 'group' && item.expanded && (
            <div 
              key={`${item.id}-submenu`} 
              className="border-t bg-muted/30 animate-accordion-down"
            >
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {item.children?.map((child) => (
                    <div key={child.id} className="text-center">
                      <Button
                        variant={activeSection === child.id ? "secondary" : "ghost"}
                        onClick={() => setActiveSection(child.id)}
                        className="w-full h-12 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
                      >
                        <child.icon className="w-4 h-4" />
                        <span className="text-sm">{child.title}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </Card>
    </div>
  );
};