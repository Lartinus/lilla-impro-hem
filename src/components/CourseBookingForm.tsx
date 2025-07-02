
import { useState } from 'react';
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

interface CourseBookingFormProps {
  courseTitle: string;
  isAvailable: boolean;
  showButton: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'blue';
  maxParticipants?: number | null;
}

const CourseBookingForm = ({ 
  courseTitle, 
  isAvailable, 
  showButton, 
  buttonText = 'Anmäl dig',
  buttonVariant = 'default',
  maxParticipants 
}: CourseBookingFormProps) => {
  const [open, setOpen] = useState(false);
  const { handleSubmit: submitBooking, isSubmitting } = useCourseBooking(courseTitle);
  const isMobile = useIsMobile();

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

  if (!showButton) return null;

  const formContent = (
    <ScrollArea className="max-h-[70vh] md:max-h-none px-1">
      {isHouseTeamsOrContinuation ? (
        <Form {...houseTeamsForm}>
          <form onSubmit={houseTeamsForm.handleSubmit(handleFormSubmit)} className="space-y-4">
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant={buttonVariant} className="w-full rounded-none">
            {isHouseTeamsOrContinuation ? buttonText : 'Boka din plats'}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-lg">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">
              {isHouseTeamsOrContinuation ? "Anmäl intresse - House Teams & fortsättning" : `Anmäl dig till ${courseTitle}`}
            </SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="w-full rounded-none">
          {isHouseTeamsOrContinuation ? buttonText : 'Boka din plats'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none">
        <DialogHeader>
          <DialogTitle className="rounded-none">
            {isHouseTeamsOrContinuation ? "Anmäl intresse - House Teams & fortsättning" : `Anmäl dig till ${courseTitle}`}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default CourseBookingForm;
