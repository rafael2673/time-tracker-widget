import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
    email: string
    name: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)
    const isAuthenticated = ref<boolean>(false)
    const hasWebPassword = ref<boolean>(localStorage.getItem('tt_web_pwd_set') === 'true')
    const showPasswordModal = ref<boolean>(false)

    function setToken(newToken: string) {
        token.value = newToken
        isAuthenticated.value = !!newToken
        localStorage.setItem('tt_widget_token', newToken)
    }

    function setUser(newUser: User) {
        user.value = newUser
    }

    async function loginViaWidget(): Promise<boolean> {
        const config = window.AP101_CONFIG

        if (!config || !config.apiKey || !config.user) {
            return false
        }

        try {
            const response = await fetch('/api/v1/auth/widget-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: config.apiKey,
                    email: config.user.email,
                    name: config.user.name
                })
            })

            const data = await response.json()

            if (data && data.token) {
                setToken(data.token)
                setUser(config.user)
                hasWebPassword.value = data.hasPassword === true
                localStorage.setItem('tt_web_pwd_set', data.hasPassword ? 'true' : 'false')
                return true
            }
        } catch (error: unknown) {
            return false
        }

        return false
    }

    async function setWebPassword(newPassword: string): Promise<boolean> {
        try {
            const response = await fetch('/api/v1/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`
                },
                body: JSON.stringify({ newPassword })
            })

            if (response.ok) {
                hasWebPassword.value = true
                localStorage.setItem('tt_web_pwd_set', 'true')
                return true
            }
            return false
        } catch (error: unknown) {
            return false
        }
    }

    function openPasswordModal() {
        showPasswordModal.value = true
    }

    function closePasswordModal() {
        showPasswordModal.value = false
    }

    function logout() {
        token.value = null
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('tt_widget_token')
    }

    return {
        token,
        user,
        isAuthenticated,
        hasWebPassword,
        showPasswordModal,
        setToken,
        setUser,
        loginViaWidget,
        setWebPassword,
        openPasswordModal,
        closePasswordModal,
        logout
    }
})