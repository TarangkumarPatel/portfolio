"use client";
import React from 'react';

const Button = ({ children, variant = 'primary', onClick, type = 'button', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-300 rounded-none border";
  const variants = {
    primary: "bg-white text-black border-white hover:bg-neutral-200 hover:border-neutral-200",
    secondary: "bg-transparent text-white border-white/30 hover:border-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white"
  };
  
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;