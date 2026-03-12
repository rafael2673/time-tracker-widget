<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '../stores/timer'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { Play, Moon, Sun, Clock, Square, Coffee, ChevronRight, Pause, Loader2, KeyRound } from 'lucide-vue-next'

const timerStore = useTimerStore()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const mainDisplay = computed(() => {
  if (timerStore.status === 'PAUSED') {
    return {
      label: timerStore.t.status.paused,
      time: timerStore.formattedTotalPause,
      colorClass: 'text-yellow-500 dark:text-yellow-400',
      icon: Coffee
    }
  }
  return {
    label: timerStore.t.status.working,
    time: timerStore.formattedTime,
    colorClass: 'text-[var(--tt-primary,#4f46e5)] dark:text-[var(--tt-primary-light,#818cf8)]',
    icon: Clock
  }
})

const secondaryDisplay = computed(() => {
  if (timerStore.status === 'PAUSED') {
    return {
      label: timerStore.t.status.working,
      time: timerStore.formattedTime,
      icon: Clock
    }
  }
  return {
    label: timerStore.t.status.paused,
    time: timerStore.formattedTotalPause,
    icon: Coffee
  }
})
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between gap-3">
      <div class="flex flex-col justify-center min-w-0 flex-1">
        <div class="flex items-center gap-1.5 mb-1">
          <component :is="mainDisplay.icon" :size="14" class="text-gray-400 dark:text-gray-500 shrink-0" />
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
            {{ mainDisplay.label }}
          </span>
          <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-px rounded-full border shrink-0"
                :class="{
                  'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700': timerStore.status === 'IDLE' || timerStore.status === 'FINISHED',
                  'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-800': timerStore.status === 'WORKING',
                  'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800': timerStore.status === 'PAUSED'
                }">
            {{ timerStore.statusLabel }}
          </span>
        </div>

        <div class="font-mono font-bold text-3xl tabular-nums leading-none tracking-tighter" :class="mainDisplay.colorClass">
          {{ mainDisplay.time }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="timerStore.registerPoint" :disabled="timerStore.isProcessing"
                class="flex items-center justify-center bg-[var(--tt-primary,#4f46e5)] text-white rounded-xl w-14 h-14 hover:bg-[var(--tt-primary-hover,#4338ca)] shadow-md shadow-[var(--tt-primary,#4f46e5)]/20 disabled:opacity-70 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0">
          <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="24" />
          <template v-else>
            <Play v-if="['IDLE', 'PAUSED', 'FINISHED'].includes(timerStore.status)" :size="24" fill="currentColor" class="ml-1" />
            <Pause v-else-if="timerStore.status === 'WORKING'" :size="24" fill="currentColor" />
          </template>
        </button>

        <button v-if="timerStore.status === 'WORKING' || timerStore.status === 'PAUSED'"
                @click="timerStore.registerExit" :disabled="timerStore.isProcessing"
                class="flex items-center justify-center border-2 border-red-500 text-red-500 bg-transparent rounded-xl w-14 h-14 hover:bg-red-50 hover:dark:bg-red-900/10 disabled:opacity-50 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                :title="timerStore.t.actions.exit">
          <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="20" />
          <Square v-else :size="20" fill="currentColor" />
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
        <component :is="secondaryDisplay.icon" :size="12" />
        <span class="text-xs font-medium">{{ secondaryDisplay.label }}:</span>
        <span class="font-mono text-xs font-bold">{{ secondaryDisplay.time }}</span>
      </div>

      <div class="flex items-center gap-1">
        <button v-if="!authStore.hasWebPassword" @click="authStore.openPasswordModal" class="p-1 rounded-md text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer" :title="timerStore.t.actions.setPassword">
          <KeyRound :size="14" />
        </button>

        <button @click="toggleTheme" class="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <Sun v-if="isDark" :size="14" />
          <Moon v-else :size="14" />
        </button>

        <button @click="timerStore.showDetails = true" class="flex items-center gap-1 pl-2 ml-1 border-l border-gray-200 dark:border-gray-700 text-[var(--tt-primary,#4f46e5)] dark:text-[var(--tt-primary-light,#818cf8)] hover:text-[var(--tt-primary-hover,#4338ca)] font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer" :title="timerStore.t.actions.openPanel">
          Detalhes <ChevronRight :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>