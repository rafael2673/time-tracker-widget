<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { translations } from '../utils/i18n'
import { KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const t = computed(() => translations['pt-BR'])

const password = ref<string>('')
const showPassword = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')
const successMessage = ref<string>('')

async function handleSave() {
  if (!password.value || password.value.length < 6) {
    errorMessage.value = t.value.password.error
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const success = await authStore.setWebPassword(password.value)

  if (success) {
    successMessage.value = t.value.password.success
    setTimeout(() => {
      authStore.closePasswordModal()
    }, 2000)
  } else {
    errorMessage.value = t.value.password.error
  }

  isLoading.value = false
}

function close() {
  if (!isLoading.value) {
    authStore.closePasswordModal()
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">

      <div class="p-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <KeyRound :size="20" />
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ t.password.title }}</h2>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {{ t.password.subtitle }}
        </p>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
              {{ t.password.newPassword }}
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Lock :size="18" />
              </div>
              <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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

          <div v-if="errorMessage" class="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="p-3 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg font-bold">
            {{ successMessage }}
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
                type="button"
                @click="close"
                :disabled="isLoading"
                class="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {{ t.password.cancel }}
            </button>
            <button
                type="submit"
                :disabled="isLoading || !!successMessage"
                class="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
            >
              <Loader2 v-if="isLoading" :size="18" class="animate-spin" />
              <span v-else>{{ t.password.save }}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>