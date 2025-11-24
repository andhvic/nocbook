import Link from 'next/link'
import { User, Briefcase, Tag } from 'lucide-react'
import type { Person } from '@/types'
import { ContactButton } from './ContactButton'

interface PeopleCardProps {
    person: Person
}

export function PeopleCard({ person }: PeopleCardProps) {
    const initials = person.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Get available contacts
    const availableContacts = person.contacts
        ? Object.entries(person.contacts).filter(([_, value]) => value && value.trim() !== '')
        : []

    return (
        <div className="group bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
    rounded-xl p-6 hover:border-primary dark:hover:border-primary-dark
    hover:shadow-lg transition-all duration-200">

    {/* Avatar & Name - Clickable to detail */}
    <Link href={`/people/${person.id}`} className="block mb-4">
    <div className="flex items-start gap-4">
    <div className="w-14 h-14 rounded-full bg-primary/20 dark:bg-primary-dark/20
    flex items-center justify-center flex-shrink-0">
    <span className="text-xl font-bold text-primary dark:text-primary-dark">
        {initials}
        </span>
        </div>
        <div className="flex-1 min-w-0">
    <h3 className="text-lg font-bold text-text dark:text-text-dark group-hover:text-primary
    dark:group-hover:text-primary-dark transition-colors truncate">
    {person.name}
    </h3>
    {person.profession && (
        <div className="flex items-center gap-1 text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
        <Briefcase className="w-4 h-4" />
        <span className="truncate">{person.profession}</span>
            </div>
    )}
    </div>
    </div>
    </Link>

    {/* Role */}
    {person.role && (
        <div className="mb-3">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
        bg-accent/20 dark:bg-accent-dark/20 text-accent dark:text-accent-dark">
    <User className="w-3 h-3" />
        {person.role}
        </span>
        </div>
    )}

    {/* Skills */}
    {person.skills && person.skills.length > 0 && (
        <div className="mb-3">
        <div className="flex flex-wrap gap-2">
            {person.skills.slice(0, 3).map((skill, idx) => (
                    <span
                        key={idx}
                className="px-2 py-1 text-xs rounded-md bg-primary/10 dark:bg-primary-dark/10
                text-primary dark:text-primary-dark"
            >
            {skill}
            </span>
    ))}
        {person.skills.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800
            text-text-secondary dark:text-text-darkSecondary">
        +{person.skills.length - 3} more
        </span>
        )}
        </div>
        </div>
    )}

    {/* Tags */}
    {person.tags && person.tags.length > 0 && (
        <div className="mb-3">
        <div className="flex items-center gap-1 text-text-secondary dark:text-text-darkSecondary text-sm">
        <Tag className="w-4 h-4" />
        <span className="truncate">{person.tags.join(', ')}</span>
            </div>
            </div>
    )}

    {/* Contacts - CLICKABLE! */}
    {availableContacts.length > 0 && (
        <div className="pt-3 border-t border-border dark:border-border-dark">
        <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-2 font-medium">
            Quick Contact:
        </p>
        <div className="flex flex-wrap gap-2">
        {availableContacts.map(([type, value]) => (
                <ContactButton
                    key={type}
            type={type as any}
            value={value as string}
            size="sm"
                />
    ))}
        </div>
        </div>
    )}

    {availableContacts.length === 0 && (
        <div className="pt-3 border-t border-border dark:border-border-dark">
        <p className="text-xs text-text-secondary dark:text-text-darkSecondary text-center">
            No contacts available
    </p>
    </div>
    )}
    </div>
)
}