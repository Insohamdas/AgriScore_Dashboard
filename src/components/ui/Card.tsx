import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div
    {...props}
    className={`bg-white rounded-[24px] p-6 shadow-sm border border-slate-100/60 hover:shadow-md transition-all duration-300 ease-in-out ${className}`}
  >
    {children}
  </div>
);

export default Card;
