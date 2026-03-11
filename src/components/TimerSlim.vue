<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '../stores/timer'
import { useTheme } from '../composables/useTheme'
import { Play, Moon, Sun, Square, BarChart3, Pause, Loader2 } from 'lucide-vue-next'

const timerStore = useTimerStore()
const { isDark, toggleTheme } = useTheme()

const mainDisplayColor = computed(() => {
  return timerStore.status === 'PAUSED' ? 'text-yellow-500 dark:text-yellow-400' : 'text-[var(--tt-primary,#4f46e5)] dark:text-[var(--tt-primary-light,#818cf8)]'
})
</script>

<template>
  <div class="flex items-center justify-between w-full h-full gap-2">
    <div class="flex items-center gap-2">
      <button @click="toggleTheme" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-0.5">
        <Sun v-if="isDark" :size="14" />
        <Moon v-else :size="14" />
      </button>

      <div class="font-mono font-bold text-lg tabular-nums leading-none tracking-tighter" :class="mainDisplayColor">
        {{ timerStore.status === 'PAUSED' ? timerStore.formattedTotalPause : timerStore.formattedTime }}
      </div>

      <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-px rounded-full border"
            :class="{
               'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700': timerStore.status === 'IDLE' || timerStore.status === 'FINISHED',
               'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-800': timerStore.status === 'WORKING',
               'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800': timerStore.status === 'PAUSED'
             }">
        {{ timerStore.statusLabel }}
      </span>
    </div>

    <div class="flex items-center gap-1.5">
      <button @click="timerStore.registerPoint" :disabled="timerStore.isProcessing"
              class="flex items-center justify-center bg-[var(--tt-primary,#4f46e5)] text-white rounded-md w-7 h-7 hover:bg-[var(--tt-primary-hover,#4338ca)] disabled:opacity-70 transition-colors cursor-pointer">
        <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="14" />
        <template v-else>
          <Play v-if="['IDLE', 'PAUSED', 'FINISHED'].includes(timerStore.status)" :size="14" fill="currentColor" class="ml-0.5" />
          <Pause v-else-if="timerStore.status === 'WORKING'" :size="14" fill="currentColor" />
        </template>
      </button>

      <button v-if="timerStore.status === 'WORKING' || timerStore.status === 'PAUSED'"
              @click="timerStore.registerExit" :disabled="timerStore.isProcessing"
              class="flex items-center justify-center border border-red-500 text-red-500 bg-transparent rounded-md w-7 h-7 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors cursor-pointer">
        <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="12" />
        <Square v-else :size="12" fill="currentColor" />
      </button>

      <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>

      <button @click="timerStore.showDetails = true" class="text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] transition-colors p-1 cursor-pointer" title="Abrir Painel">
        <BarChart3 :size="16" />
      </button>
    </div>
  </div>
</template>