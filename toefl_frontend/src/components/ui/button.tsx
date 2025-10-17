// toefl_frontend/src/components/ui/button.tsx

import React from 'react';

// 定义 Button 的属性类型
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' 
  size?: 'sm' | 'lg' | 'default'
}

// 占位 Button 组件
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', size = 'default', ...props }) => {

  const baseStyle = "rounded-lg font-semibold transition duration-150 ease-in-out";
  
  // 样式映射
  const variantStyles = {
    default: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md', // 使用 App.tsx 中的颜色
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-base',
    default: 'h-10 px-4 text-sm',
  }

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};