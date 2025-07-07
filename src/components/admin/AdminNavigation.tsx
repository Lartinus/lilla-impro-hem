import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Mail, 
  Users, 
  Image, 
  ChevronDown,
  Heart,
  UserCheck,
  Ticket,
  UserCircle,
  CreditCard,
  MapPin,
  Send,
  UserPlus,
  Contact,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      icon: BookOpen,
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
      icon: Calendar,
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
      id: 'email',
      title: 'Email',
      icon: Mail,
      type: 'group' as const,
      expanded: expandedSections.email,
      children: [
        { id: 'send', title: 'Skicka meddelande', icon: Send },
        { id: 'groups', title: 'Mottagargrupper', icon: UserPlus },
        { id: 'contacts', title: 'Alla kontakter', icon: Contact },
        { id: 'import', title: 'Importera', icon: FileText },
        { id: 'templates', title: 'Email-mallar', icon: Mail },
      ]
    },
    {
      id: 'images',
      title: 'Bilder',
      icon: Image,
      type: 'single' as const
    },
    {
      id: 'users',
      title: 'Användare',
      icon: Users,
      type: 'single' as const
    }
  ];

  const handleToggleGroup = (groupId: 'courses' | 'shows' | 'email') => {
    setExpandedSections(prev => {
      const newState = { courses: false, shows: false, email: false };
      if (!prev[groupId]) {
        newState[groupId] = true;
        const targetGroup = menuItems.find(item => item.id === groupId);
        if (targetGroup && targetGroup.children && targetGroup.children.length > 0) {
          setActiveSection(targetGroup.children[0].id);
        }
      } else {
        setActiveSection('');
      }
      return newState;
    });
  };

  const handleSelectSingle = (sectionId: string) => {
    setExpandedSections({ courses: false, shows: false, email: false });
    setActiveSection(sectionId);
  };

  const isGroupActive = (item: any) => {
    if (item.type === 'single') {
      return activeSection === item.id;
    }
    return item.children?.some((child: any) => child.id === activeSection);
  };

  return (
    <div className="bg-gradient-to-r from-background to-muted/30 border-b border-border/40 shadow-sm overflow-x-auto">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Navigation */}
        <div className="flex items-center justify-start sm:justify-center space-x-1 py-3 min-w-max sm:min-w-0">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={isGroupActive(item) ? "default" : "ghost"}
              onClick={() => {
                if (item.type === 'single') {
                  handleSelectSingle(item.id);
                } else {
                  handleToggleGroup(item.id as 'courses' | 'shows' | 'email');
                }
              }}
              className={`
                relative px-3 sm:px-6 py-3 h-auto flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium 
                transition-all duration-200 rounded-lg group hover:scale-105 whitespace-nowrap
                ${isGroupActive(item) ? 
                  'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 
                  'hover:bg-muted/60'
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.title}</span>
              <span className="sm:hidden">{item.title.charAt(0)}</span>
              {item.type === 'group' && (
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    item.expanded ? 'rotate-180' : ''
                  }`} 
                />
              )}
              {item.children && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 h-5 px-1.5 text-xs bg-background/20 text-inherit border-0 hidden sm:inline-flex"
                >
                  {item.children.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Submenu */}
        {menuItems.map((item) => 
          item.type === 'group' && item.expanded && (
            <div 
              key={`${item.id}-submenu`} 
              className="pb-4 animate-accordion-down"
            >
              <div className="bg-muted/20 rounded-lg p-3 sm:p-4 border border-border/30">
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                  {item.children?.map((child) => (
                    <Button
                      key={child.id}
                      variant={activeSection === child.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSection(child.id)}
                      className={`
                        flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium 
                        transition-all duration-200 hover:scale-105 whitespace-nowrap
                        ${activeSection === child.id ? 
                          'bg-primary text-primary-foreground shadow-md' : 
                          'bg-background/50 hover:bg-background border-border/60'
                        }
                      `}
                    >
                      <child.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{child.title}</span>
                      <span className="sm:hidden text-xs">{child.title.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};