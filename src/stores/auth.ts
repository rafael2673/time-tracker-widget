import { defineStore } from 'pinia'
import { ref } from 'vue'
import { $api } from '../utils/api'

interface User {
    email: string
    name: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('tt_widget_token'))
    const user = ref<User | null>(null)
    const isAuthenticated = ref(!!token.value)

    function setToken(newToken: string) {
        token.value = newToken
        isAuthenticated.value = !!newToken
        localStorage.setItem('tt_widget_token', newToken)
    }

    function setUser(newUser: User) {
        user.value = newUser
    }

    async function loginViaWidget(emailParam?: string, apiKeyParam?: string, nameParam?: string): Promise<boolean> {
        const config = (window as any).AP101_CONFIG

        const email = emailParam || config?.user?.email
        const apiKey = apiKeyParam || config?.apiKey
        const name = nameParam || config?.user?.name || 'User'

        if (!email || !apiKey) {
            return false
        }

        try {
            const response: any = await $api('/api/v1/auth/widget-login', {
                method: 'POST',
                body: {
                    apiKey: apiKey,
                    email: email,
                    name: name
                }
            })

            if (response && response.token) {
                setToken(response.token)
                setUser({ email, name })
                return true
            }
        } catch (error) {
            throw error
        }

        return false
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
        setToken,
        loginViaWidget,
        logout
    }
})