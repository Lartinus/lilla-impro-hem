import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWaitlistBooking } from '@/hooks/useWaitlistBooking';

const waitlistSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  email: z.string().email("Ogiltig e-postadress"),
  phone: z.string().min(6, "Telefonnummer måste vara minst 6 tecken"),
  message: z.string(),
});

interface WaitlistFormProps {
  courseInstanceId: string;
  courseTitle: string;
  onClose: () => void;
  isMobile?: boolean;
}

export const WaitlistForm = ({ courseInstanceId, courseTitle, onClose, isMobile = false }: WaitlistFormProps) => {
  const { submitWaitlistBooking, isSubmitting } = useWaitlistBooking(courseInstanceId);

  const form = useForm<z.infer<typeof waitlistSchema>>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof waitlistSchema>) => {
    const result = await submitWaitlistBooking({
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: values.message
    });
    if (result.success) {
      form.reset();
      onClose();
    }
  };

  if (isMobile) {
    return (
      <Form {...form}>
        <form id="waitlist-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namn *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ditt fullständiga namn" 
                      className="rounded-none" 
                      maxLength={100}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-postadress *</FormLabel>
                  <FormControl>
                    <Input placeholder="din@email.se" type="email" className="rounded-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonnummer *</FormLabel>
                  <FormControl>
                    <Input placeholder="070-123 45 67" type="tel" className="rounded-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meddelande (valfritt)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Eventuellt meddelande..." 
                      className="rounded-none min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Kursen är fullbokad!</strong> Genom att skriva upp dig på väntelistan får du chansen att delta om en plats blir ledig. Vi kontaktar dig i den ordning anmälningarna kom in.
            </p>
          </div>
        </form>

        {/* Fixed button area at bottom for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe">
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 rounded-none"
            >
              Avbryt
            </Button>
            <Button 
              type="submit"
              form="waitlist-form"
              disabled={isSubmitting} 
              variant="blue" 
              className="flex-1 rounded-none"
            >
              {isSubmitting ? 'Skickar...' : 'Skriv upp mig'}
            </Button>
          </div>
        </div>
      </Form>
    );
  }

  // Desktop version
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Namn *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ditt fullständiga namn" 
                    className="rounded-none" 
                    maxLength={100}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-postadress *</FormLabel>
                <FormControl>
                  <Input placeholder="din@email.se" type="email" className="rounded-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefonnummer *</FormLabel>
                <FormControl>
                  <Input placeholder="070-123 45 67" type="tel" className="rounded-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meddelande (valfritt)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Eventuellt meddelande..." 
                    className="rounded-none min-h-[80px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Kursen är fullbokad!</strong> Genom att skriva upp dig på väntelistan får du chansen att delta om en plats blir ledig. Vi kontaktar dig i den ordning anmälningarna kom in.
          </p>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-none">
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting} variant="blue" className="flex-1 rounded-none">
            {isSubmitting ? 'Skickar...' : 'Skriv upp mig på väntelistan'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return formContent;
};