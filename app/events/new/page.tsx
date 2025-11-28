'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { EventForm } from '@/components/events/EventForm'
import { Person } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function NewEventPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [people, setPeople] = useState<Person[]>([])
    const [loadingPeople, setLoadingPeople] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchPeople()
        }
    }, [user])

    const fetchPeople = async () => {
        try {
            setLoadingPeople(true)
            const { data, error } = await supabase
                .from('people')
                . select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        } finally {
            setLoadingPeople(false)
        }
    }

    if (authLoading || loadingPeople) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/events"
                    className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                        Add New Event
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                        Document your learning journey and networking activities
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                <EventForm people={people} />
            </div>

            {/* Tips Card */}
            <div className="bg-blue-500/5 border-2 border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                    💡 Tips for Logging Events
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Add people you met</strong> - Build your network graph and remember connections</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Write key insights</strong> - Capture important learnings while they're fresh</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Save materials</strong> - Link to slides, videos, or notes for future reference</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Add certificate URL</strong> - Showcase your achievements and credentials</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Use tags</strong> - Organize events by topics for easy searching later</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Mark featured</strong> - Highlight important events for your portfolio</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}