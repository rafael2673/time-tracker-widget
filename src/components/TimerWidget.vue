<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { useAuthStore } from '../stores/auth'
import TimerSlim from './TimerSlim.vue'
import TimerCard from './TimerCard.vue'
import DashboardModal from './DashboardModal.vue'
import SetPasswordModal from './SetPasswordModal.vue'

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

const timerStore = useTimerStore()
const authStore = useAuthStore()
</script>

<template>
  <div
      class="w-full bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 shadow-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden box-border flex items-center"
      :class="[compact ? 'px-3 py-1.5 min-h-[40px]' : 'px-4 py-3']"
      :style="{ borderRadius: props.rounded }"
  >
    <TimerSlim v-if="compact" />
    <TimerCard v-else />
  </div>

  <DashboardModal v-if="timerStore.showDetails" />
  <SetPasswordModal v-if="authStore.showPasswordModal" />
</template>