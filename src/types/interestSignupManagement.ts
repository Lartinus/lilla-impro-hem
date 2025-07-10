export interface InterestSignup {
  id: string;
  title: string;
  subtitle?: string | null;
  information?: string | null;
  is_visible: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface InterestSignupWithSubmissions extends InterestSignup {
  submissionCount: number;
}

export interface InterestSubmission {
  id: string;
  interest_signup_id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  created_at: string;
}

export interface NewInterestSignupForm {
  title: string;
  subtitle: string;
  information: string;
  is_visible: boolean;
}