<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'
import { User, Lock, Eye, EyeOff, Moon, Sun, Loader2 } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()
const { isDark, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response: any = await $fetch('/api/v1/auth/authenticate', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    if (response && response.token) {
      authStore.setToken(response.token)
    }
  } catch (error: any) {
    errorMessage.value = 'Email ou senha incorretos.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="relative w-full max-w-sm transition-all duration-300">

    <button
        @click="toggleTheme"
        class="absolute -top-12 right-0 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:scale-110 transition-transform cursor-pointer"
        title="Alternar Tema"
    >
      <Sun v-if="isDark" :size="20" />
      <Moon v-else :size="20" />
    </button>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">

      <div class="px-8 pt-8 pb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
          Bem-vindo de volta
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          TimeTracker - Intersistemas
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="px-8 pb-8 space-y-5">

        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
            Email Corporativo
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <User :size="18" />
            </div>
            <input
                v-model="email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="voce@intersistemas.com.br"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
            Senha
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Lock :size="18" />
            </div>
            <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="••••••••"
            />
            <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors"
            >
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg animate-pulse">
          <span class="font-bold">!</span> {{ errorMessage }}
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
        >
          <Loader2 v-if="isLoading" :size="20" class="animate-spin" />
          <span v-else>Acessar Sistema</span>
        </button>
      </form>

      <div class="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </div>
  </div>
</template>