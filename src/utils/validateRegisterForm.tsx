export type RoleType = 'field_owner' | 'regular_user' | '';

export interface FormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    role: RoleType;
}

export interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
}

export function validateRegisterForm(form: FormState): FormErrors {
    const errors: FormErrors = {};

    if (!form.name || form.name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Invalid email address';
    }

    if (!form.password || form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
    }

    if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
    }

    if (!form.role) {
        errors.role = 'Account type is required';
    }

    return errors;
}