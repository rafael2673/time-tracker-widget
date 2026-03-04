<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useTimerStore } from './stores/timer'
import TimerWidget from './components/TimerWidget.vue'
import { translations } from './utils/i18n'

const props = defineProps({
  rounded: {
    type: String,
    default: '2rem'
  },
  compact: {
    type: [Boolean, String],
    default: false
  }
})

const authStore = useAuthStore()
const timerStore = useTimerStore()
const isInitializing = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

const t = computed(() => translations['pt'])

const isCompactMode = computed(() => {
  return props.compact === true || props.compact === 'true'
})

onMounted(async () => {
  if (typeof window !== 'undefined' && window.AP101_CONFIG) {
    const success = await authStore.loginViaWidget()

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