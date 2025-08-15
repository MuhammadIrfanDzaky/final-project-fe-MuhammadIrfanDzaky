interface TogglePasswordIconProps {
    isVisible: boolean;
}

export default function TogglePasswordIcon({ isVisible }: TogglePasswordIconProps) {
    return isVisible ? (
        // Eye Off SVG
        <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            >
            <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.53 2.84-4.66 5.06-6.06M1 1l22 22" />
            <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.96 0 1.84-.38 2.47-1" />
        </svg>
    ) : (
        // Eye Open SVG
        <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            >
            <circle cx="12" cy="12" r="3" />
            <path d="M2 12C3.73 7.11 7.99 4 12 4s8.27 3.11 10 8c-1.73 4.89-5.99 8-10 8s-8.27-3.11-10-8z" />
        </svg>
    );
}