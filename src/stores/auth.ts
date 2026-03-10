import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('tt_widget_token'))
    const isAuthenticated = ref(!!token.value)

    function setToken(newToken: string) {
        token.value = newToken
        isAuthenticated.value = !!newToken
        localStorage.setItem('tt_widget_token', newToken)
    }

    function logout() {
        token.value = null
        isAuthenticated.value = false
        localStorage.removeItem('tt_widget_token')
    }

    return {
        token,
        isAuthenticated,
        setToken,
        logout
    }
})