<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useTimerStore } from './stores/timer'
import TimerWidget from './components/TimerWidget.vue'
import { translations } from './utils/i18n'

const props = defineProps({
  rounded: { type: String, default: '2rem' },
  compact: { type: [Boolean, String], default: false },
  apiUrl: { type: String },
  lang: { type: String, default: 'pt-BR' },
  email: { type: String },
  apiKey: { type: String }
})

const authStore = useAuthStore()
const timerStore = useTimerStore()
const isInitializing = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

const isCompactMode = computed(() => props.compact === true || props.compact === 'true')

const currentLang = computed(() => (props.lang === 'en' ? 'en' : 'pt-BR'))
const t = computed(() => translations[currentLang.value])

onMounted(async () => {
  const legacyConfig = (window as any).AP101_CONFIG || {}
  const targetEmail = props.email || legacyConfig?.user?.email
  const targetApiKey = props.apiKey || legacyConfig.apiKey
  const targetName = legacyConfig?.user?.name

  ;(window as any).__TIME_TRACKER_CONFIG__ = {
    apiUrl: props.apiUrl || legacyConfig.apiUrl,
    lang: currentLang.value
  }

  timerStore.lang = currentLang.value as 'pt-BR' | 'en'

  if (targetEmail && targetApiKey) {
    const success = await authStore.loginViaWidget(targetEmail, targetApiKey, targetName)

    if (success) {
      await timerStore.fetchTodayHistory()
      await timerStore.fetchWeeklySummary()
    } else {
      hasError.value = true
      errorMessage.value = t.value.authError
    }
  } else {
    hasError.value = true
    errorMessage.value = t.value.configError
  }

  isInitializing.value = false
})
</script>

<template>
  <div class="w-full flex flex-col items-center justify-start bg-transparent font-sans">

    <div v-if="!isInitializing && authStore.isAuthenticated && !hasError" key="widget" class="w-full">
      <TimerWidget :rounded="props.rounded" :compact="isCompactMode" />
    </div>

    <div v-else-if="isInitializing" key="loading" class="flex flex-col items-center justify-center p-6 text-indigo-600 dark:text-indigo-400 animate-pulse">
      <span class="text-xs font-bold uppercase tracking-widest">{{ t.loading }}</span>
    </div>

    <div v-else-if="hasError" key="error" class="flex flex-col items-center justify-center p-4 text-center">
      <div class="text-red-500 font-bold text-xs mb-1">AP101 Tracker</div>
      <div class="text-gray-400 text-[10px]">{{ errorMessage }}</div>
    </div>

  </div>
</template>