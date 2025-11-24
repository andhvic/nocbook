'use client'

import { useState } from 'react'
import {
    Instagram,
    MessageCircle,
    Linkedin,
    Github,
    Mail,
    Phone,
    Twitter,
    Send,
    Globe,
    Copy,
    Check,
    ExternalLink
} from 'lucide-react'

interface ContactButtonProps {
    type: 'instagram' | 'whatsapp' | 'linkedin' | 'github' | 'discord' | 'email' | 'phone' | 'twitter' | 'telegram' | 'website'
    value: string
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
}

export function ContactButton({ type, value, size = 'md', showLabel = false }: ContactButtonProps) {
    const [copied, setCopied] = useState(false)

    const getIcon = () => {
        const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'

        switch (type) {
            case 'instagram': return <Instagram className={iconClass} />
            case 'whatsapp': return <MessageCircle className={iconClass} />
            case 'linkedin': return <Linkedin className={iconClass} />
            case 'github': return <Github className={iconClass} />
            case 'discord': return <Copy className={iconClass} />
            case 'email': return <Mail className={iconClass} />
            case 'phone': return <Phone className={iconClass} />
            case 'twitter': return <Twitter className={iconClass} />
            case 'telegram': return <Send className={iconClass} />
            case 'website': return <Globe className={iconClass} />
            default: return <ExternalLink className={iconClass} />
        }
    }

    const getLabel = () => {
        switch (type) {
            case 'instagram': return 'Instagram'
            case 'whatsapp': return 'WhatsApp'
            case 'linkedin': return 'LinkedIn'
            case 'github': return 'GitHub'
            case 'discord': return 'Discord'
            case 'email': return 'Email'
            case 'phone': return 'Phone'
            case 'twitter': return 'Twitter'
            case 'telegram': return 'Telegram'
            case 'website': return 'Website'
            default: return 'Contact'
        }
    }

    const getColor = () => {
        switch (type) {
            case 'instagram': return 'bg-pink-500/10 text-pink-500 dark:bg-pink-400/10 dark:text-pink-400 hover:bg-pink-500/20'
            case 'whatsapp': return 'bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 hover:bg-green-500/20'
            case 'linkedin': return 'bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 hover:bg-blue-600/20'
            case 'github': return 'bg-gray-600/10 text-gray-700 dark:bg-gray-400/10 dark:text-gray-300 hover:bg-gray-600/20'
            case 'discord': return 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 hover:bg-indigo-500/20'
            case 'email': return 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400 hover:bg-red-500/20'
            case 'phone': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 hover:bg-emerald-500/20'
            case 'twitter': return 'bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400 hover:bg-sky-500/20'
            case 'telegram': return 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 hover:bg-blue-500/20'
            case 'website': return 'bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 hover:bg-purple-500/20'
            default: return 'bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400 hover:bg-gray-500/20'
        }
    }

    const getLink = () => {
        const cleanValue = value.trim()

        switch (type) {
            case 'instagram':
                // Remove @ if exists and create link
                const igUsername = cleanValue.replace('@', '')
                return `https://instagram.com/${igUsername}`

            case 'whatsapp':
                // Format: remove all non-numeric, add country code if needed
                const phoneNumber = cleanValue.replace(/\D/g, '')
                return `https://wa.me/${phoneNumber}`

            case 'linkedin':
                // If full URL, use it. Otherwise create profile link
                if (cleanValue.startsWith('http')) return cleanValue
                const linkedinUsername = cleanValue.replace(/^\//, '')
                return `https://linkedin.com/in/${linkedinUsername}`

            case 'github':
                const githubUsername = cleanValue.replace('@', '')
                return `https://github.com/${githubUsername}`

            case 'twitter':
                const twitterUsername = cleanValue.replace('@', '')
                return `https://twitter.com/${twitterUsername}`

            case 'telegram':
                const telegramUsername = cleanValue.replace('@', '')
                return `https://t.me/${telegramUsername}`

            case 'email':
                return `mailto:${cleanValue}`

            case 'phone':
                return `tel:${cleanValue}`

            case 'website':
                return cleanValue.startsWith('http') ? cleanValue : `https://${cleanValue}`

            case 'discord':
                // Discord can't be opened directly, we'll copy username
                return null

            default:
                return cleanValue
        }
    }

    const handleClick = async (e: React.MouseEvent) => {
        if (type === 'discord') {
            // Copy to clipboard for Discord
            e.preventDefault()
            try {
                await navigator.clipboard.writeText(value)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        } else if (type === 'phone') {
            // For phone, try to open dialer but also allow copying
            e.preventDefault()
            const link = getLink()
            if (link) {
                window.location.href = link
            }
        }
    }

    const link = getLink()
    const sizeClass = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3'

    if (type === 'discord') {
        return (
            <button
                onClick={handleClick}
                className={`${sizeClass} rounded-lg ${getColor()} transition-all hover:scale-105 flex items-center gap-2`}
                title={`Copy ${getLabel()}: ${value}`}
            >
                {copied ? <Check className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} /> : getIcon()}
                {showLabel && (
                    <span className="text-sm font-medium">
            {copied ? 'Copied!' : value}
          </span>
                )}
            </button>
        )
    }

    return (
        <a
            href={link || '#'}
            target={type === 'email' || type === 'phone' ? undefined : '_blank'}
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`${sizeClass} rounded-lg ${getColor()} transition-all hover:scale-105 flex items-center gap-2 group`}
            title={`Open ${getLabel()}: ${value}`}
        >
            {getIcon()}
            {showLabel && (
                <span className="text-sm font-medium truncate max-w-[150px]">
          {value}
        </span>
            )}
        </a>
    )
}