'use client';

import React from 'react';

interface FutsalLogoProps {
    className?: string;
    size?: number;
}

function FutsalLogo({ className = '', size = 32 }: FutsalLogoProps) {
    return (
        <div
            className={`bg-primary rounded-lg flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                width={size * 0.6}
                height={size * 0.6}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Main ball circle - white background */}
                <circle
                    cx="12"
                    cy="12"
                    r="11"
                    fill="white"
                    stroke="none"
                />

                {/* Futsal panel lines using negative space (green lines) */}
                {/* Vertical curved line through center */}
                <path
                    d="M12 1 C16 6, 16 18, 12 23"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Left curved panel line */}
                <path
                    d="M3 8 C7 10, 7 14, 3 16"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Right curved panel line */}
                <path
                    d="M21 8 C17 10, 17 14, 21 16"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Top curved panel line */}
                <path
                    d="M8 3 C10 7, 14 7, 16 3"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

export default FutsalLogo;