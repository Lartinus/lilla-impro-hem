import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookingFormFields, HouseTeamsFormFields, formSchema, houseTeamsSchema } from '@/components/forms/BookingFormFields';
import { BookingInformation } from '@/components/forms/BookingInformation';
import { useCourseBooking } from '@/hooks/useCourseBooking';
import { useIsMobile } from '@/hooks/use-mobile';
import CoursePurchaseFlow from './CoursePurchaseFlow';
import { WaitlistForm } from './WaitlistForm';

interface CourseBookingFormProps {
  courseTitle: string;
  tableName?: string;
  isAvailable: boolean;
  showButton: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'blue';
  maxParticipants?: number | null;
  courseInstance?: {
    id: string;
    course_title: string;
    table_name: string;
    price: number;
    discount_price: number;
    max_participants: number | null;
  };
  isPaidCourse?: boolean;
  isSoldOut?: boolean;
}

const CourseBookingForm = ({ 
  courseTitle, 
  tableName,
  isAvailable, 
  showButton, 
  buttonText = 'Anmäl dig',
  buttonVariant = 'default',
  maxParticipants,
  courseInstance,
  isPaidCourse = false,
  isSoldOut = false
}: CourseBookingFormProps) => {
  const [open, setOpen] = useState(false);
  const { handleSubmit: submitBooking, isSubmitting } = useCourseBooking(tableName || courseTitle);
  const isMobile = useIsMobile();
  const formContainerRef = useRef<HTMLDivElement>(null);

  console.log('CourseBookingForm - isMobile:', isMobile, 'window.innerWidth:', typeof window !== 'undefined' ? window.innerWidth : 'undefined');

  const isHouseTeamsOrContinuation = courseTitle.includes("House teams") || courseTitle.includes("fortsättning");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
    },
  });

  const houseTeamsForm = useForm<z.infer<typeof houseTeamsSchema>>({
    resolver: zodResolver(houseTeamsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema> | z.infer<typeof houseTeamsSchema>) => {
    const result = await submitBooking(values);
    if (result.success) {
      (isHouseTeamsOrContinuation ? houseTeamsForm : form).reset();
      setOpen(false);
    }
  };

  // Auto-scroll function for mobile
  const handleFieldFocus = useCallback((event: React.FocusEvent) => {
    if (!isMobile || !formContainerRef.current) return;
    
    // Small delay to ensure keyboard is shown
    setTimeout(() => {
      const target = event.target as HTMLElement;
      const container = formContainerRef.current!;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      
      // Check if field is not fully visible
      if (targetRect.bottom > containerRect.bottom - 100) {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  }, [isMobile]);

  if (!showButton) return null;

  // Mobile-optimized form content
  const mobileFormContent = () => {
    // Show waitlist form for sold out courses
    if (isSoldOut && courseInstance) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <WaitlistForm 
              courseInstanceId={courseInstance.id} 
              courseTitle={courseTitle} 
              onClose={() => setOpen(false)} 
              isMobile={true}
            />
          </div>
        </div>
      );
    }

    // Show payment flow for paid courses
    if (isPaidCourse && courseInstance) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <CoursePurchaseFlow courseInstance={courseInstance} onClose={() => setOpen(false)} />
          </div>
        </div>
      );
    }

    // Regular free course form
    return (
      <div ref={formContainerRef} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isHouseTeamsOrContinuation ? (
            <Form {...houseTeamsForm}>
              <form id="house-teams-form" onSubmit={houseTeamsForm.handleSubmit(handleFormSubmit)} className="space-y-4 pb-40 md:pb-32">
                <div onFocus={handleFieldFocus}>
                  <HouseTeamsFormFields form={houseTeamsForm} />
                </div>
              </form>
            </Form>
          ) : (
            <Form {...form}>
              <form id="booking-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pb-40 md:pb-32">
                <div onFocus={handleFieldFocus}>
                  <BookingFormFields form={form} />
                  <BookingInformation maxParticipants={maxParticipants} />
                </div>
              </form>
            </Form>
          )}
        </div>
        
        {/* Fixed button area at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe">
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="flex-1 rounded-none"
            >
              Avbryt
            </Button>
            <Button 
              type="submit"
              form={isHouseTeamsOrContinuation ? "house-teams-form" : "booking-form"}
              disabled={isSubmitting} 
              variant={isHouseTeamsOrContinuation ? "blue" : "default"} 
              className="flex-1 rounded-none"
            >
              {isSubmitting ? 'Skickar...' : (isHouseTeamsOrContinuation ? 'Skicka intresseanmälan' : 'Boka din plats')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Desktop form content with ScrollArea
  const desktopFormContent = () => {
    // Show waitlist form for sold out courses
    if (isSoldOut && courseInstance) {
      return (
        <ScrollArea className="max-h-[60vh] lg:max-h-[65vh] px-1">
          <div className="pr-3">
            <WaitlistForm 
              courseInstanceId={courseInstance.id} 
              courseTitle={courseTitle} 
              onClose={() => setOpen(false)} 
              isMobile={false}
            />
          </div>
        </ScrollArea>
      );
    }

    // Show payment flow for paid courses
    if (isPaidCourse && courseInstance) {
      return <CoursePurchaseFlow courseInstance={courseInstance} onClose={() => setOpen(false)} />;
    }

    // Regular free course form
    return (
      <ScrollArea className="max-h-[60vh] lg:max-h-[65vh] px-1">
        {isHouseTeamsOrContinuation ? (
          <Form {...houseTeamsForm}>
            <form onSubmit={houseTeamsForm.handleSubmit(handleFormSubmit)} className="space-y-4 pr-3">
              <HouseTeamsFormFields form={houseTeamsForm} />

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-none">
                  Avbryt
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="blue" className="flex-1 rounded-none">
                  {isSubmitting ? 'Skickar...' : 'Skicka intresseanmälan'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pr-3">
              <BookingFormFields form={form} />
              
              <BookingInformation maxParticipants={maxParticipants} />

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-none">
                  Avbryt
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-none">
                  {isSubmitting ? 'Skickar...' : 'Boka din plats'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </ScrollArea>
    );
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant={buttonVariant} className="w-full rounded-none">
            <span>{isSoldOut ? buttonText : (isHouseTeamsOrContinuation ? buttonText : 'Boka din plats')}</span>
            <span className="text-2xl font-bold">→</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[100vh] w-full p-0 flex flex-col overflow-hidden">
          <SheetHeader className="p-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <SheetTitle className="text-left font-normal">
              {isSoldOut ? `Väntelista - ${courseTitle}` :
               isPaidCourse ? `Köp kursplats - ${courseTitle}` : 
               isHouseTeamsOrContinuation ? "Anmäl intresse - House Teams & fortsättning" : 
               `Anmäl dig till ${courseTitle}`}
            </SheetTitle>
          </SheetHeader>
          {mobileFormContent()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="w-full rounded-none">
          <span>{isSoldOut ? buttonText : (isHouseTeamsOrContinuation ? buttonText : 'Boka din plats')}</span>
          <span className="text-2xl font-bold">→</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px] max-h-[90vh] rounded-none overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="rounded-none font-normal">
            {isSoldOut ? `Väntelista - ${courseTitle}` :
             isPaidCourse ? `Köp kursplats - ${courseTitle}` : 
             isHouseTeamsOrContinuation ? "Anmäl intresse - House Teams & fortsättning" : 
             `Anmäl dig till ${courseTitle}`}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {desktopFormContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseBookingForm;
