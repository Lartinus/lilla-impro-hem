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
  Image,
  Archive,
  FileText,
  Settings
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminSidebarProps {
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

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  setActiveSection,
  expandedSections,
  setExpandedSections
}) => {
  const { open, setOpen } = useSidebar();

  const menuItems = [
    {
      id: 'overview',
      title: 'Översikt',
      icon: BarChart3,
      type: 'single' as const
    },
    {
      id: 'courses',
      title: 'Kurser',
      icon: BookOpen,
      type: 'group' as const,
      expanded: expandedSections.courses,
      children: [
        { id: 'courses', title: 'Aktiva kurser', icon: BookOpen },
        { id: 'courses-completed', title: 'Genomförda kurser', icon: Archive },
        { id: 'course-templates', title: 'Kursmallar', icon: FileText },
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
        { id: 'shows', title: 'Aktiva föreställningar', icon: Calendar },
        { id: 'shows-completed', title: 'Genomförda föreställningar', icon: Archive },
        { id: 'show-templates', title: 'Föreställningsmallar', icon: FileText },
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
        { id: 'email-send', title: 'Skicka email', icon: Mail },
        { id: 'email-templates', title: 'Email-mallar', icon: FileText },
        { id: 'email-groups', title: 'Email-grupper', icon: Users },
        { id: 'email-contacts', title: 'Kontakter', icon: UserCircle },
        { id: 'email-automatic', title: 'Automatiska mejl', icon: Settings },
        { id: 'email-sent', title: 'Skickade email', icon: Archive },
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
    setExpandedSections(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <Sidebar className="bg-gray-900 border-r border-gray-800">
      <SidebarContent className="bg-gray-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 font-satoshi font-semibold px-6 py-4 text-sm">
            Administratörspanel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3" style={{ listStyleType: 'none' }}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id} style={{ listStyleType: 'none' }}>
                  {item.type === 'single' ? (
                    <SidebarMenuButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveSection(item.id);
                        // Close sidebar on mobile after selection
                        if (window.innerWidth < 768) {
                          const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
                          if (sidebarTrigger) sidebarTrigger.click();
                        }
                      }}
                      isActive={activeSection === item.id}
                      className={`w-full font-satoshi text-sm ${
                        activeSection === item.id
                          ? 'bg-primary-red text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {open && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  ) : (
                    <Collapsible
                      open={item.expanded}
                      onOpenChange={() => handleToggleGroup(item.id as 'courses' | 'shows' | 'email')}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full font-satoshi text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                          <item.icon className="w-4 h-4" />
                          {open && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              {item.expanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {open && (
                        <CollapsibleContent className="space-y-1">
                          {item.children?.map((child) => (
                            <SidebarMenuItem key={child.id} className="ml-4" style={{ listStyleType: 'none' }}>
                              <SidebarMenuButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveSection(child.id);
                                  // Close sidebar on mobile after selection
                                  if (window.innerWidth < 768) {
                                    const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
                                    if (sidebarTrigger) sidebarTrigger.click();
                                  }
                                }}
                                isActive={activeSection === child.id}
                                size="sm"
                                className={`w-full font-satoshi text-xs ${
                                  activeSection === child.id
                                    ? 'bg-primary-red text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                <child.icon className="w-4 h-4" />
                                <span>{child.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};