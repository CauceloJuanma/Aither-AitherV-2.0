import React, { HTMLAttributes, PropsWithChildren } from 'react';

export function Card({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div {...props} className={["bg-white shadow rounded-lg p-4", props.className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardHeader({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div {...props} className={["mb-2", props.className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 {...props} className={["text-lg font-semibold", className].filter(Boolean).join(' ')}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p {...props} className={["text-sm text-gray-500", className].filter(Boolean).join(' ')}>
      {children}
    </p>
  );
}

export function CardContent({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div {...props} className={["mt-2", props.className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export default Card;