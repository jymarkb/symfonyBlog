export type PrivateProfile = {
    id: number;
    email: string;
    handle: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at?: string | null;
    comments_count: number;
    posts_read_count: number;
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

