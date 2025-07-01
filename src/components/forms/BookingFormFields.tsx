
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(6, 'Telefonnummer måste vara minst 6 tecken'),
  address: z.string().min(1, 'Adress är obligatorisk'),
  postalCode: z.string().min(1, 'Postnummer är obligatoriskt'),
  city: z.string().min(1, 'Stad är obligatorisk'),
});

const houseTeamsSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(6, 'Telefonnummer måste vara minst 6 tecken'),
  message: z.string().optional(),
});

interface BookingFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isHouseTeamsOrContinuation?: boolean;
}

interface HouseTeamsFormFieldsProps {
  form: UseFormReturn<z.infer<typeof houseTeamsSchema>>;
}

export const BookingFormFields = ({ form }: BookingFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Namn *</FormLabel>
            <FormControl>
              <Input placeholder="Ditt fullständiga namn" className="rounded-none" {...field} />
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
              <Input placeholder="070-123 45 67" className="rounded-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adress *</FormLabel>
            <FormControl>
              <Input placeholder="Gatuadress" className="rounded-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postnummer *</FormLabel>
              <FormControl>
                <Input placeholder="12345" className="rounded-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stad *</FormLabel>
              <FormControl>
                <Input placeholder="Stockholm" className="rounded-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export const HouseTeamsFormFields = ({ form }: HouseTeamsFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Namn *</FormLabel>
            <FormControl>
              <Input placeholder="För- och efternamn" className="rounded-none" {...field} />
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
              <Input placeholder="070-123 45 67" className="rounded-none" {...field} />
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
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Om dig som improvisatör</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Här kan du skriva en kort text om dig som improvisatör och hur du vill utvecklas"
                className="min-h-[100px] rounded-none"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export { formSchema, houseTeamsSchema };
