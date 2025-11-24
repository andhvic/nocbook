'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Users, FolderKanban, Award, Calendar, CheckSquare, FileText, BookOpen, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    const stats = [
        {
            icon: Users,
            label: 'People',
            value: '0',
            change: '+0',
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
            href: '/people'
        },
        {
            icon: FolderKanban,
            label: 'Projects',
            value: '0',
            change: '+0',
            color: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-green-500/10 dark:bg-green-400/10',
            href: '/projects'
        },
        {
            icon: Award,
            label: 'Skills',
            value: '0',
            change: '+0',
            color: 'text-purple-500 dark:text-purple-400',
            bgColor: 'bg-purple-500/10 dark:bg-purple-400/10',
            href: '/skills'
        },
        {
            icon: Calendar,
            label: 'Events',
            value: '0',
            change: '+0',
            color: 'text-orange-500 dark:text-orange-400',
            bgColor: 'bg-orange-500/10 dark:bg-orange-400/10',
            href: '/events'
        },
    ]

    const quickActions = [
        {
            title: 'Add Person',
            description: 'Add someone to your network',
            icon: Users,
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
            href: '/people/new'
        },
        {
            title: 'New Project',
            description: 'Start tracking a new project',
            icon: FolderKanban,
            color: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-green-500/10 dark:bg-green-400/10',
            href: '/projects/new'
        },
        {
            title: 'Log Event',
            description: 'Record a workshop or seminar',
            icon: Calendar,
            color: 'text-orange-500 dark:text-orange-400',
            bgColor: 'bg-orange-500/10 dark:bg-orange-400/10',
            href: '/events/new'
        },
        {
            title: 'Daily Log',
            description: 'Write today\'s entry',
            icon: BookOpen,
            color: 'text-purple-500 dark:text-purple-400',
            bgColor: 'bg-purple-500/10 dark:bg-purple-400/10',
            href: '/logs'
        }
    ]

    const recentActivities = [
        {
            title: 'Welcome to NocBook!',
            description: 'Start by adding your first person or project',
            time: 'Just now',
            icon: TrendingUp,
            color: 'text-primary dark:text-primary-dark'
        }
    ]

    // Get first name from email
    const displayName = user.email?.split('@')[0] || 'User'

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 dark:from-primary-dark/10 dark:via-accent-dark/10 dark:to-primary-dark/10 rounded-xl p-8 border-2 border-border dark:border-border-dark">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-text dark:text-text-dark mb-2">
                            Welcome back, <span className="text-primary dark:text-primary-dark">{displayName}!</span>
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-lg">
                            Here's what's happening with your NocBook today
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-20 h-20 rounded-full bg-primary/20 dark:bg-primary-dark/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary dark:text-primary-dark">
                {displayName.charAt(0).toUpperCase()}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div>
                <h2 className="text-xl font-bold text-text dark:text-text-dark mb-4">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className="group bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
                  rounded-xl p-6 hover:border-primary dark:hover:border-primary-dark
                  hover:shadow-lg transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <div className="text-right">
                    <span className="text-3xl font-bold text-text dark:text-text-dark block">
                      {stat.value}
                    </span>
                                        <span className="text-xs text-text-secondary dark:text-text-darkSecondary">
                      {stat.change} this week
                    </span>
                                    </div>
                                </div>
                                <p className="text-text-secondary dark:text-text-darkSecondary font-medium group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                                    {stat.label}
                                </p>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-text dark:text-text-dark mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Link
                                key={action.title}
                                href={action.href}
                                className="group p-6 border-2 border-border dark:border-border-dark rounded-xl
                  bg-cardBg dark:bg-cardBg-dark
                  hover:border-primary dark:hover:border-primary-dark
                  hover:shadow-lg transition-all duration-200 text-left"
                            >
                                <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-6 h-6 ${action.color}`} />
                                </div>
                                <p className="font-semibold text-text dark:text-text-dark mb-1 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                                    {action.title}
                                </p>
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {action.description}
                                </p>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-xl font-bold text-text dark:text-text-dark mb-4">Recent Activity</h2>
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                    {recentActivities.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => {
                                const Icon = activity.icon
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg bg-primary/10 dark:bg-primary-dark/10`}>
                                            <Icon className={`w-5 h-5 ${activity.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-text dark:text-text-dark">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <span className="text-xs text-text-secondary dark:text-text-darkSecondary whitespace-nowrap">
                      {activity.time}
                    </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-text-secondary dark:text-text-darkSecondary">
                                No recent activity yet. Start by creating something!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-primary to-accent dark:from-primary-dark dark:to-accent-dark rounded-xl p-8 text-white">
                <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
                    <p className="mb-6 text-white/90">
                        Build your network, track your projects, and monitor your growth all in one place.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/people/new">
                            <button className="px-6 py-3 bg-white text-primary dark:text-primary-dark font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                                <Plus className="w-5 h-5 inline mr-2" />
                                Add Your First Person
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}