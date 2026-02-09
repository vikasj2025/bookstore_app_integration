import React from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseClasses = [
      'block',
      'w-full',
      'rounded-lg',
      'border',
      'bg-white',
      'px-3',
      'py-2.5',
      'text-sm',
      'transition-colors',
      'duration-200',
      'placeholder:text-secondary-400',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary-500',
      'focus:border-transparent',
      'disabled:bg-secondary-50',
      'disabled:text-secondary-500',
      'disabled:cursor-not-allowed',
    ];

    const stateClasses = error
      ? ['border-error-300', 'focus:ring-error-500']
      : ['border-secondary-300', 'hover:border-secondary-400'];

    const paddingClasses = [];
    if (leftIcon) paddingClasses.push('pl-10');
    if (rightIcon || isPassword) paddingClasses.push('pr-10');

    const inputClasses = clsx(baseClasses, stateClasses, paddingClasses, className);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-secondary-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="h-5 w-5 text-secondary-400">{leftIcon}</div>
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          {(rightIcon || isPassword) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isPassword ? (
                <button
                  type="button"
                  className="h-5 w-5 text-secondary-400 hover:text-secondary-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              ) : (
                <div className="h-5 w-5 text-secondary-400 pointer-events-none">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={clsx(
              'mt-2 text-sm',
              error ? 'text-error-600' : 'text-secondary-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
