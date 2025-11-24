'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface PeopleFilterProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    selectedRole: string
    setSelectedRole: (value: string) => void
    selectedTag: string
    setSelectedTag: (value: string) => void
    roles: string[]
    tags: string[]
}

export function PeopleFilter({
                                 searchTerm,
                                 setSearchTerm,
                                 selectedRole,
                                 setSelectedRole,
                                 selectedTag,
                                 setSelectedTag,
                                 roles,
                                 tags
                             }: PeopleFilterProps) {
    const clearFilters = () => {
        setSearchTerm('')
        setSelectedRole('')
        setSelectedTag('')
    }

    const hasActiveFilters = searchTerm || selectedRole || selectedTag

    return (
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark">
                    Filter & Search
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-text-secondary dark:text-text-darkSecondary hover:text-primary
              dark:hover:text-primary-dark transition-colors flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Clear all
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-darkSecondary" />
                    <input
                        type="text"
                        placeholder="Search by name, skill, or profession..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-background dark:bg-background-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>

                {/* Role Filter */}
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-background dark:bg-background-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Tag Filter */}
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Tag
                    </label>
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-background dark:bg-background-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        <option value="">All Tags</option>
                        {tags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}