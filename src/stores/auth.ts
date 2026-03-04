import { defineStore } from 'pinia'
import { ref } from 'vue'
import { $api } from '../utils/api'

interface User {
    email: string
    name: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)
    const isAuthenticated = ref(false)

    function setToken(newToken: string) {
        token.value = newToken
        isAuthenticated.value = !!newToken
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
            const response: any = await $api('/api/v1/auth/widget-login', {
                method: 'POST',
                body: {
                    apiKey: config.apiKey,
                    email: config.user.email,
                    name: config.user.name
                }
            })

            if (response && response.token) {
                setToken(response.token)
                setUser(config.user)
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
    }

    return {
        token,
        user,
        isAuthenticated,
        setToken,
        setUser,
        loginViaWidget,
        logout
    }
})