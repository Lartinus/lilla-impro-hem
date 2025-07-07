import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface AdminNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  expandedSections: {
    courses: boolean;
    shows: boolean;
    email: boolean;
  };
  setExpandedSections: React.Dispatch<React.SetStateAction<{
    courses: boolean;
    shows: boolean;
    email: boolean;
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
      type: 'group' as const,
      expanded: expandedSections.courses,
      children: [
        { id: 'courses', title: 'Kurshantering' },
        { id: 'interest', title: 'Intresse' },
        { id: 'performers', title: 'Kursledare' },
      ]
    },
    {
      id: 'shows',
      title: 'Föreställningar',
      type: 'group' as const,
      expanded: expandedSections.shows,
      children: [
        { id: 'shows', title: 'Föreställningar' },
        { id: 'actors', title: 'Skådespelare' },
        { id: 'discount-codes', title: 'Rabattkoder' },
        { id: 'venues', title: 'Platser' },
        { id: 'tickets', title: 'Biljetter' },
      ]
    },
    {
      id: 'users',
      title: 'Användare',
      type: 'single' as const
    },
    {
      id: 'images',
      title: 'Bilder',
      type: 'single' as const
    },
    {
      id: 'email',
      title: 'Email',
      type: 'group' as const,
      expanded: expandedSections.email,
      children: [
        { id: 'send', title: 'Skicka meddelande' },
        { id: 'groups', title: 'Mottagargrupper' },
        { id: 'contacts', title: 'Alla kontakter' },
        { id: 'import', title: 'Importera' },
        { id: 'templates', title: 'Email-mallar' },
      ]
    }
  ];

  const handleToggleGroup = (groupId: 'courses' | 'shows' | 'email') => {
    setExpandedSections(prev => {
      // Close all groups first, then open the clicked one if it was closed
      const newState = { courses: false, shows: false, email: false };
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
    setExpandedSections({ courses: false, shows: false, email: false });
    setActiveSection(sectionId);
  };

  return (
    <div className="space-y-1">
      {/* Main Navigation Toggle Bar */}
      <Card className="overflow-hidden bg-muted/20">
        <CardContent className="p-2">
          <ToggleGroup 
            type="single" 
            value={
              menuItems.find(item => 
                (item.type === 'single' && activeSection === item.id) ||
                (item.type === 'group' && item.expanded)
              )?.id || ''
            }
            className="w-full justify-start bg-background/50 rounded-lg p-1 gap-1"
          >
            {menuItems.map((item) => (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                onClick={() => {
                  if (item.type === 'single') {
                    handleSelectSingle(item.id);
                  } else {
                    handleToggleGroup(item.id as 'courses' | 'shows' | 'email');
                  }
                }}
                className={`
                  flex-1 h-12 px-4 text-sm font-medium transition-all duration-200 
                  bg-muted/40 hover:bg-muted/60 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
                  border border-border/40 hover:border-border/60 data-[state=on]:border-primary
                  ${item.type === 'group' && item.expanded 
                    ? 'rounded-b-none border-b-0 data-[state=on]:rounded-b-none' 
                    : 'rounded-md'
                  }
                `}
              >
                {item.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
        
        {/* Submenu directly attached */}
        {menuItems.map((item) => 
          item.type === 'group' && item.expanded && (
            <div 
              key={`${item.id}-submenu`} 
              className="border-t bg-muted/30 animate-accordion-down"
            >
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {item.children?.map((child) => (
                    <Button
                      key={child.id}
                      variant={activeSection === child.id ? "default" : "ghost"}
                      onClick={() => setActiveSection(child.id)}
                      className="px-6 py-2 text-sm font-medium transition-all duration-200"
                    >
                      {child.title}
                    </Button>
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