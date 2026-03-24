<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useTimerStore } from './stores/timer'
import TimerWidget from './components/TimerWidget.vue'
import { translations } from './utils/i18n'

const props = defineProps({
  rounded: { type: String, default: '2rem' },
  compact: { type: [Boolean, String], default: false },
  apiUrl: { type: String, required: true },
  lang: { type: String, default: 'pt-BR' },
  token: { type: String },
  hideThemeToggle: { type: [Boolean, String], default: false },
  'hide-theme-toggle': { type: [Boolean, String], default: false },
  hidethemetoggle: { type: [Boolean, String], default: false }
})

const authStore = useAuthStore()
const timerStore = useTimerStore()
const isInitializing = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

const isCompactMode = computed(() => props.compact === true || props.compact === 'true')

const isThemeToggleHidden = computed(() => {
  const v1 = props.hideThemeToggle
  const v2 = props['hide-theme-toggle']
  const v3 = props.hidethemetoggle
  return v1 === true || v1 === 'true' || v2 === true || v2 === 'true' || v3 === true || v3 === 'true'
})

const currentLang = computed(() => (props.lang === 'en' ? 'en' : 'pt-BR'))
const t = computed(() => translations[currentLang.value])

onMounted(async () => {
  ;(window as any).__TIME_TRACKER_CONFIG__ = {
    apiUrl: props.apiUrl,
    lang: currentLang.value
  }

  timerStore.lang = currentLang.value as 'pt-BR' | 'en'

  if (props.token) {
    authStore.setToken(props.token)

    try {
      await timerStore.fetchTodayHistory()
      await timerStore.fetchWeeklySummary()
    } catch (e) {
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
      <TimerWidget :rounded="props.rounded" :compact="isCompactMode" :hide-theme-toggle="isThemeToggleHidden" />
    </div>

    <div v-else-if="isInitializing" key="loading" class="flex flex-col items-center justify-center p-6 text-[var(--tt-primary,#4f46e5)] animate-pulse">
      <span class="text-xs font-bold uppercase tracking-widest">{{ t.loading }}</span>
    </div>

    <div v-else-if="hasError" key="error" class="flex flex-col items-center justify-center p-4 text-center">
      <div class="text-red-500 font-bold text-xs mb-1">Time Tracker</div>
      <div class="text-gray-400 text-[10px]">{{ errorMessage }}</div>
    </div>

  </div>
</template>