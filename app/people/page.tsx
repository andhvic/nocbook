'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { PeopleCard } from '@/components/people/PeopleCard'
import { PeopleFilter } from '@/components/people/PeopleFilter'
import { Button } from '@/components/ui/Button'
import { Plus, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import type { Person } from '@/types'

export default function PeoplePage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [people, setPeople] = useState<Person[]>([])
    const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedTag, setSelectedTag] = useState('')

    const supabase = createClient()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchPeople()
        }
    }, [user])

    useEffect(() => {
        filterPeople()
    }, [people, searchTerm, selectedRole, selectedTag])

    const fetchPeople = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('people')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterPeople = () => {
        let filtered = [...people]

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(person =>
                person.name.toLowerCase().includes(term) ||
                person.profession?.toLowerCase().includes(term) ||
                person.skills?.some(skill => skill.toLowerCase().includes(term)) ||
                person.tags?.some(tag => tag.toLowerCase().includes(term))
            )
        }

        // Role filter
        if (selectedRole) {
            filtered = filtered.filter(person => person.role === selectedRole)
        }

        // Tag filter
        if (selectedTag) {
            filtered = filtered.filter(person => person.tags?.includes(selectedTag))
        }

        setFilteredPeople(filtered)
    }

    // Get unique roles and tags
    const roles = Array.from(new Set(people.map(p => p.role).filter(Boolean))) as string[]
    const tags = Array.from(new Set(people.flatMap(p => p.tags || [])))

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading people...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
                        People Database
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary">
                        Manage your network and connections
                    </p>
                </div>
                <Link href="/people/new">
                    <Button variant="primary" className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Person
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4">
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mb-1">Total People</p>
                    <p className="text-3xl font-bold text-text dark:text-text-dark">{people.length}</p>
                </div>
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4">
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mb-1">Roles</p>
                    <p className="text-3xl font-bold text-text dark:text-text-dark">{roles.length}</p>
                </div>
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4">
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mb-1">Tags</p>
                    <p className="text-3xl font-bold text-text dark:text-text-dark">{tags.length}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Filter Sidebar */}
                <div className="lg:col-span-1">
                    <PeopleFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedRole={selectedRole}
                        setSelectedRole={setSelectedRole}
                        selectedTag={selectedTag}
                        setSelectedTag={setSelectedTag}
                        roles={roles}
                        tags={tags}
                    />
                </div>

                {/* People Grid */}
                <div className="lg:col-span-3">
                    {filteredPeople.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-6">
                            {filteredPeople.map(person => (
                                <PeopleCard key={person.id} person={person} />
                            ))}
                        </div>
                    ) : people.length === 0 ? (
                        <div className="text-center py-16 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <UsersIcon className="w-16 h-16 text-text-secondary dark:text-text-darkSecondary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                                No people yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                                Start building your network by adding your first person
                            </p>
                            <Link href="/people/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add Your First Person
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <UsersIcon className="w-16 h-16 text-text-secondary dark:text-text-darkSecondary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                                No results found
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary">
                                Try adjusting your filters or search term
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}