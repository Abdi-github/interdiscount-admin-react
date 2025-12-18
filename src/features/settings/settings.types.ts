export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_language: 'de' | 'en' | 'fr' | 'it';
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
