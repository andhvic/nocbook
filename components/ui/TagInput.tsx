'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
    label: string
    tags: string[]
    setTags: (tags: string[]) => void
    placeholder?: string
}

export function TagInput({ label, tags, setTags, placeholder }: TagInputProps) {
    const [input, setInput] = useState('')

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag()
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    const addTag = () => {
        const trimmed = input.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed])
            setInput('')
        }
    }

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index))
    }

    return (
        <div>
            <label className="block text-sm font-medium mb-2 text-text dark:text-text-dark">
                {label}
            </label>
            <div className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
        bg-background dark:bg-background-dark min-h-[42px] flex flex-wrap gap-2 items-center
        focus-within:border-primary dark:focus-within:border-primary-dark transition-colors">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10
              dark:bg-primary-dark/10 text-primary dark:text-primary-dark text-sm"
                    >
            {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-red-500 transition-colors"
                        >
              <X className="w-3 h-3" />
            </button>
          </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent text-text dark:text-text-dark
            focus:outline-none placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                />
            </div>
            <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">
                Press Enter or comma to add, Backspace to remove
            </p>
        </div>
    )
}