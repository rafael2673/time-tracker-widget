import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
    const updateDOM = () => {
        if (typeof document === 'undefined') return

        const dark = isDark.value
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')

        document.querySelectorAll('time-tracker').forEach(host => {
            host.classList.toggle('dark', dark)
        })

        document.getElementById('time-tracker-teleport')?.classList.toggle('dark', dark)
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        updateDOM()
    }

    const initTheme = () => {
        if (typeof window === 'undefined') return
        const savedTheme = localStorage.getItem('theme')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDark.value = savedTheme === 'dark' || (!savedTheme && systemDark)
        updateDOM()
    }

    return { isDark, toggleTheme, initTheme }
}