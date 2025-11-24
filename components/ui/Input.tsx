import React from 'react'
import type { InputProps } from '@/types'

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2 text-text dark:text-text-dark">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark 
          bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
          focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
          placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary
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