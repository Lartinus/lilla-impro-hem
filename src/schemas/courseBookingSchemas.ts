import * as z from 'zod';

export const formSchema = z.object({
  name: z.string()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får vara max 100 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string()
    .min(6, 'Telefonnummer måste vara minst 6 tecken')
    .max(20, 'Telefonnummer får vara max 20 tecken')
    .regex(/^[+0-9\s\-()]+$/, 'Telefonnummer får endast innehålla siffror, +, -, (), och mellanslag'),
  address: z.string().min(1, 'Adress är obligatorisk'),
  postalCode: z.string().min(1, 'Postnummer är obligatoriskt'),
  city: z.string().min(1, 'Stad är obligatorisk'),
});

export const houseTeamsSchema = z.object({
  name: z.string()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får vara max 100 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string()
    .min(6, 'Telefonnummer måste vara minst 6 tecken')
    .max(20, 'Telefonnummer får vara max 20 tecken')
    .regex(/^[+0-9\s\-()]+$/, 'Telefonnummer får endast innehålla siffror, +, -, (), och mellanslag'),
  message: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
export type HouseTeamsData = z.infer<typeof houseTeamsSchema>;
export type CourseBookingData = FormData | HouseTeamsData;