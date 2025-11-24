'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { TagInput } from '@/components/ui/TagInput'
import { ArrowLeft, Save, User, Briefcase, Tag, MessageSquare, Globe } from 'lucide-react'
import Link from 'next/link'
import type { PersonFormData } from '@/types'

export default function NewPersonPage() {
    const { user } = useAuth()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState<PersonFormData>({
        name: '',
        profession: '',
        skills: [],
        role: '',
        tags: [],
        contacts: {
            instagram: '',
            whatsapp: '',
            linkedin: '',
            github: '',
            discord: '',
            email: '',
            phone: '',
            twitter: '',
            telegram: '',
            website: ''
        },
        notes: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            contacts: { ...prev.contacts, [name]: value }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            setError('You must be logged in')
            return
        }

        if (!formData.name.trim()) {
            setError('Name is required')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Filter out empty contacts
            const cleanedContacts = Object.entries(formData.contacts).reduce((acc, [key, value]) => {
                if (value && value.trim() !== '') {
                    acc[key] = value.trim()
                }
                return acc
            }, {} as Record<string, string>)

            const { data, error: insertError } = await supabase
                .from('people')
                .insert([
                    {
                        user_id: user.id,
                        name: formData.name.trim(),
                        profession: formData.profession.trim() || null,
                        skills: formData.skills.length > 0 ? formData.skills : null,
                        role: formData.role.trim() || null,
                        tags: formData.tags.length > 0 ? formData.tags : null,
                        contacts: Object.keys(cleanedContacts).length > 0 ? cleanedContacts : null,
                        notes: formData.notes.trim() || null
                    }
                ])
                .select()

            if (insertError) throw insertError

            router.push('/people')
            router.refresh()
        } catch (err: any) {
            console.error('Error adding person:', err)
            setError(err.message || 'Failed to add person')
        } finally {
            setLoading(false)
        }
    }

    const roleOptions = [
        'Friend',
        'Colleague',
        'Client',
        'Mentor',
        'Student',
        'Freelancer',
        'Business Partner',
        'Family',
        'Teacher',
        'Other'
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/people">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-text-dark">Add New Person</h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary">
                        Add someone to your network
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-primary dark:text-primary-dark" />
                        <h2 className="text-xl font-semibold text-text dark:text-text-dark">
                            Basic Information
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                        />

                        <Input
                            label="Profession"
                            name="profession"
                            value={formData.profession}
                            onChange={handleInputChange}
                            placeholder="Software Engineer"
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text dark:text-text-dark">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                            >
                                <option value="">Select a role...</option>
                                {roleOptions.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Skills & Tags */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag className="w-5 h-5 text-primary dark:text-primary-dark" />
                        <h2 className="text-xl font-semibold text-text dark:text-text-dark">
                            Skills & Tags
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <TagInput
                            label="Skills"
                            tags={formData.skills}
                            setTags={(skills) => setFormData(prev => ({ ...prev, skills }))}
                            placeholder="e.g., Python, IoT, Web Development"
                        />

                        <TagInput
                            label="Tags"
                            tags={formData.tags}
                            setTags={(tags) => setFormData(prev => ({ ...prev, tags }))}
                            placeholder="e.g., Tech, Content Creator, Mentor"
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="w-5 h-5 text-primary dark:text-primary-dark" />
                        <h2 className="text-xl font-semibold text-text dark:text-text-dark">
                            Contact Information
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Instagram"
                            name="instagram"
                            value={formData.contacts.instagram}
                            onChange={handleContactChange}
                            placeholder="@username or username"
                        />

                        <Input
                            label="WhatsApp"
                            name="whatsapp"
                            value={formData.contacts.whatsapp}
                            onChange={handleContactChange}
                            placeholder="081234567890"
                        />

                        <Input
                            label="LinkedIn"
                            name="linkedin"
                            value={formData.contacts.linkedin}
                            onChange={handleContactChange}
                            placeholder="username or full URL"
                        />

                        <Input
                            label="GitHub"
                            name="github"
                            value={formData.contacts.github}
                            onChange={handleContactChange}
                            placeholder="@username or username"
                        />

                        <Input
                            label="Discord"
                            name="discord"
                            value={formData.contacts.discord}
                            onChange={handleContactChange}
                            placeholder="username#1234"
                        />

                        <Input
                            label="Twitter"
                            name="twitter"
                            value={formData.contacts.twitter}
                            onChange={handleContactChange}
                            placeholder="@username or username"
                        />

                        <Input
                            label="Telegram"
                            name="telegram"
                            value={formData.contacts.telegram}
                            onChange={handleContactChange}
                            placeholder="@username or username"
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.contacts.email}
                            onChange={handleContactChange}
                            placeholder="email@example.com"
                        />

                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.contacts.phone}
                            onChange={handleContactChange}
                            placeholder="081234567890"
                        />

                        <Input
                            label="Website"
                            name="website"
                            value={formData.contacts.website}
                            onChange={handleContactChange}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare className="w-5 h-5 text-primary dark:text-primary-dark" />
                        <h2 className="text-xl font-semibold text-text dark:text-text-dark">
                            Additional Notes
                        </h2>
                    </div>

                    <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional information, how you met, projects together, etc..."
                        rows={6}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 dark:border-red-400
            text-red-500 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end sticky bottom-4 bg-background dark:bg-background-dark
          p-4 rounded-xl border-2 border-border dark:border-border-dark shadow-lg">
                    <Link href="/people">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" loading={loading} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Person
                    </Button>
                </div>
            </form>
        </div>
    )
}