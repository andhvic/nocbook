export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export type Theme = 'light' | 'dark';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

// People Fiture
export interface Person {
    id: string
    user_id: string
    name: string
    profession?: string
    skills?: string[]
    role?: string
    tags?: string[]
    contacts?: {
        instagram?: string
        whatsapp?: string
        linkedin?: string
        github?: string
        discord?: string
        email?: string
        phone?: string
        twitter?: string
        telegram?: string
        website?: string
    }
    notes?: string
    created_at: string
    updated_at: string
}

export interface PersonFormData {
    name: string
    profession: string
    skills: string[]
    role: string
    tags: string[]
    contacts: {
        instagram: string
        whatsapp: string
        linkedin: string
        github: string
        discord: string
        email: string
        phone: string
        twitter: string
        telegram: string
        website: string
    }
    notes: string
}