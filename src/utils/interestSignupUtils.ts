import type { NewInterestSignupForm } from '@/types/interestSignupManagement';

export const getDefaultInterestSignupForm = (): NewInterestSignupForm => ({
  title: '',
  subtitle: '',
  information: '',
  is_visible: true
});