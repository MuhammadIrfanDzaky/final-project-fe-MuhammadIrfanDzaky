import React from 'react';

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Avatar({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full${className ? ' ' + className : ''}`}
        {...props}
      />
    );
  }
);
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  function AvatarImage({ className, src, ...props }, ref) {
    if (!src) return null;
    return (
      <img
        ref={ref}
        src={src}
        className={`aspect-square h-full w-full${className ? ' ' + className : ''}`}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';