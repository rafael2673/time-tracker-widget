<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '../stores/timer'
import { useTheme } from '../composables/useTheme'
import { Play, Moon, Sun, Clock, Square, Coffee, ChevronRight, Pause, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  hideThemeToggle: {
    type: Boolean,
    default: false
  }
})

const timerStore = useTimerStore()
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
        <div class="flex items-center gap-2 mb-0.5">
          <button v-if="!props.hideThemeToggle" @click="toggleTheme" class="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 p-1">
            <Sun v-if="isDark" :size="10" />
            <Moon v-else :size="10" />
          </button>
          <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
            <component :is="mainDisplay.icon" :size="10" />
            {{ mainDisplay.label }}
          </span>
        </div>

        <div class="relative overflow-hidden h-9">
          <Transition name="slide-up" mode="out-in">
            <div :key="timerStore.status" class="font-mono font-bold tracking-tighter tabular-nums leading-none text-3xl" :class="mainDisplay.colorClass">
              {{ mainDisplay.time }}
            </div>
          </Transition>
        </div>

        <div class="flex items-center gap-2 mt-1">
          <span class="text-[9px] font-bold uppercase tracking-wide px-2 py-px rounded-full border transition-colors"
                :class="{
                 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700': timerStore.status === 'IDLE' || timerStore.status === 'FINISHED',
                 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-800': timerStore.status === 'WORKING',
                 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800': timerStore.status === 'PAUSED'
               }">
            {{ timerStore.statusLabel }}
          </span>

          <span v-if="secondaryDisplay.time !== '00:00:00'" class="flex items-center gap-1 text-[10px] text-gray-400 font-mono border-l border-gray-200 dark:border-gray-700 pl-2">
            <component :is="secondaryDisplay.icon" :size="10" />
            {{ secondaryDisplay.label }}: {{ secondaryDisplay.time }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="timerStore.registerPoint" :disabled="timerStore.isProcessing" class="group relative flex items-center justify-center bg-[var(--tt-primary,#4f46e5)] hover:bg-[var(--tt-primary-hover,#4338ca)] text-white shadow-lg shadow-[var(--tt-primary,#4f46e5)]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed w-12 h-12 rounded-2xl">
          <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="20" />
          <template v-else>
            <Play v-if="['IDLE', 'PAUSED', 'FINISHED'].includes(timerStore.status)" :size="20" fill="currentColor" class="ml-0.5" />
            <Pause v-else-if="timerStore.status === 'WORKING'" :size="20" fill="currentColor" />
          </template>
        </button>

        <button v-if="timerStore.status === 'WORKING' || timerStore.status === 'PAUSED'" @click="timerStore.registerExit" :disabled="timerStore.isProcessing" class="group relative flex items-center justify-center border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-500 dark:disabled:hover:text-red-400 dark:disabled:hover:bg-transparent w-12 h-12 rounded-2xl">
          <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="18" />
          <Square v-else :size="18" fill="currentColor" />
        </button>
      </div>
    </div>

    <div class="flex items-center justify-end border-t border-gray-50 dark:border-gray-800/50 mt-2 pt-1.5">
      <button @click="timerStore.showDetails = true" class="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] dark:hover:text-[var(--tt-primary-light,#818cf8)] transition-colors cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-800 py-1 px-2 rounded-full">
        <span>{{ timerStore.t.actions.openPanel }}</span>
        <ChevronRight :size="12" />
      </button>
    </div>
  </div>
</template>