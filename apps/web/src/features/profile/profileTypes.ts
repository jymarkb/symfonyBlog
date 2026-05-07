export type NotificationPreference = 'immediate' | 'digest' | 'none';

export type UpdateNotificationsPayload = {
  notify_comment_replies?: NotificationPreference;
  notify_new_posts?: NotificationPreference;
};

export type PrivateProfile = {
    id: number;
    email: string;
    handle: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    created_at?: string | null;
    comments_count: number;
    posts_read_count: number;
    notify_comment_replies: NotificationPreference;
    notify_new_posts: NotificationPreference;
};

export type PrivateProfileResponse = {
    data: PrivateProfile;
};

export type ProfileFormFields = {
    display_name: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
};

export type ProfileFormErrors = Partial<Record<keyof ProfileFormFields, string>> & {
    server?: string;
};

export type ProfileFormSubmitInput = {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
};

export type ProfileFormProps = {
    errors: ProfileFormErrors;
    fields: ProfileFormFields;
    isSubmitting: boolean;
    onChange: (field: keyof ProfileFormFields, value: string) => void;
    onSubmit: () => void | Promise<void>;
    profile: PrivateProfile;
    successMessage: string | null;
};

export type ChangePasswordFields = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type ChangePasswordErrors = Partial<ChangePasswordFields & { server: string }>;

export type ProfileSidebarProps = {
    profile: PrivateProfile | null;
};

export type ProfileComment = {
  id: number;
  body: string;
  post_title: string;
  post_slug: string;
  created_at: string;
};

export type ProfileCommentsResponse = {
  data: ProfileComment[];
};

export type ProfileReadingHistoryItem = {
  post_id: number;
  post_title: string;
  post_slug: string;
  read_progress: number;
  last_viewed_at: string;
};

export type ProfileReadingHistoryResponse = {
  data: ProfileReadingHistoryItem[];
};

export type DeleteAccountResponse = {
  message: string;
};