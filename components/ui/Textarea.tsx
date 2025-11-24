import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2 text-text dark:text-text-dark">
                    {label}
                    </label>
            )}
    <textarea
        className={`w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark 
          bg-background dark:bg-background-dark text-text dark:text-text-dark
          focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
          placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary
          resize-none
          ${error ? 'border-red-500 dark:border-red-400' : ''}
          ${className}`}
    {...props}
    />
    {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
    )}
    </div>
)
}