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
  UserCircle
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
  };
  setExpandedSections: React.Dispatch<React.SetStateAction<{
    courses: boolean;
    shows: boolean;
  }>>;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  setActiveSection,
  expandedSections,
  setExpandedSections
}) => {
  const { open } = useSidebar();

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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administratörspanel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  {item.type === 'single' ? (
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id)}
                      isActive={activeSection === item.id}
                      className="w-full"
                    >
                      <item.icon className="w-4 h-4" />
                      {open && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  ) : (
                    <Collapsible
                      open={item.expanded}
                      onOpenChange={() => handleToggleGroup(item.id as 'courses' | 'shows')}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full">
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
                            <SidebarMenuItem key={child.id} className="ml-4">
                              <SidebarMenuButton
                                onClick={() => setActiveSection(child.id)}
                                isActive={activeSection === child.id}
                                size="sm"
                                className="w-full"
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