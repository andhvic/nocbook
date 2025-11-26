'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Person } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [people, setPeople] = useState<Person[]>([])
    const [loading, setLoading] = useState(true)
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
            setLoading(true)
            const { data, error } = await supabase
                .from('people')
                .select('*')
                . order('name', { ascending: true })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading... </p>
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
                    href="/projects"
                    className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                        Create New Project
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                        Start tracking your next amazing project
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                <ProjectForm people={people} />
            </div>
        </div>
    )
}