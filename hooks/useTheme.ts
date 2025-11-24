'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Get theme from localStorage or system preference
        const stored = localStorage.getItem('theme') as Theme | null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = stored || (prefersDark ? 'dark' : 'light')

        setTheme(initialTheme)
        applyTheme(initialTheme)
    }, [])

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement

        // Remove both classes first
        root.classList.remove('light', 'dark')

        // Add the new theme class
        root.classList.add(newTheme)
    }

    const toggleTheme = () => {
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const setThemeMode = (newTheme: Theme) => {
        setTheme(newTheme)
        applyTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    }

    return { theme, toggleTheme, setTheme: setThemeMode, mounted }
}