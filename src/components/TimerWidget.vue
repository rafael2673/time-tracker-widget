<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTimerStore } from '~/stores/timer'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'
import { Play, LogOut, Moon, Sun, Clock, Square, Coffee, Calendar, X, BarChart3, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Pause } from 'lucide-vue-next'

const props = defineProps({
  rounded: {
    type: String,
    default: '2rem'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const timerStore = useTimerStore()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const showDetails = ref(false)
const isTimelineExpanded = ref(true)
const teleportReady = ref(!!document.getElementById('time-tracker-teleport'))

onMounted(() => {
  if (!document.getElementById('time-tracker-teleport')) {
    const container = document.createElement('div')
    container.id = 'time-tracker-teleport'
    document.body.appendChild(container)
  }
  teleportReady.value = true

  if (authStore.isAuthenticated) {
    timerStore.fetchTodayHistory()
    timerStore.fetchWeeklySummary()
  }
})

function handleLogout() {
  timerStore.stop()
  authStore.logout()
}

function getRecordLabel(type: string) {
  const map: Record<string, string> = timerStore.t.history
  return map[type] || type
}

const progressWidth = computed(() => {
  return (value: number) => `${Math.min(value * 10, 100)}%`
})

const mainDisplay = computed(() => {
  if (timerStore.status === 'PAUSED') {
    return {
      label: 'Tempo de Pausa',
      time: timerStore.formattedTotalPause,
      colorClass: 'text-yellow-500 dark:text-yellow-400',
      icon: Coffee
    }
  }
  return {
    label: 'Tempo de Trabalho',
    time: timerStore.formattedTime,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    icon: Clock
  }
})

const secondaryDisplay = computed(() => {
  if (timerStore.status === 'PAUSED') {
    return {
      label: 'Trabalho',
      time: timerStore.formattedTime,
      icon: Clock
    }
  }
  return {
    label: 'Pausa',
    time: timerStore.formattedTotalPause,
    icon: Coffee
  }
})
</script>

<template>
  <div
      class="w-full bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 shadow-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden"
      :class="[compact ? 'px-3 py-1.5' : 'px-4 py-3']"
      :style="{ borderRadius: props.rounded }"
  >

    <div class="flex items-center justify-between gap-3">

      <div class="flex flex-col justify-center min-w-0 flex-1">

        <div class="flex items-center gap-2 mb-0.5">
          <button @click="toggleTheme" class="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400" :class="compact ? 'p-0.5' : 'p-1'">
            <Sun v-if="isDark" :size="10" />
            <Moon v-else :size="10" />
          </button>

          <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
            <component :is="mainDisplay.icon" :size="10" />
            {{ mainDisplay.label }}
          </span>
        </div>

        <div class="relative overflow-hidden" :class="compact ? 'h-7' : 'h-9'">
          <Transition name="slide-up" mode="out-in">
            <div
                :key="timerStore.status"
                class="font-mono font-bold tracking-tighter tabular-nums leading-none"
                :class="[mainDisplay.colorClass, compact ? 'text-2xl' : 'text-3xl']"
            >
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

      <div class="flex items-center gap-2" v-if="timerStore.status !== 'FINISHED'">

        <button
            @click="timerStore.registerPoint"
            class="group relative flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            :class="compact ? 'w-9 h-9 rounded-lg' : 'w-12 h-12 rounded-2xl'"
        >
          <Play v-if="timerStore.status === 'IDLE' || timerStore.status === 'PAUSED'" :size="compact ? 16 : 20" fill="currentColor" class="ml-0.5" />
          <Pause v-else-if="timerStore.status === 'WORKING'" :size="compact ? 16 : 20" fill="currentColor" />
        </button>

        <button
            v-if="timerStore.status === 'WORKING' || timerStore.status === 'PAUSED'"
            @click="timerStore.registerExit"
            class="group relative flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-all cursor-pointer"
            :class="compact ? 'w-9 h-9 rounded-lg' : 'w-12 h-12 rounded-2xl'"
        >
          <Square :size="compact ? 14 : 18" fill="currentColor" />
        </button>
      </div>

      <div v-else class="text-green-500 font-bold text-[10px] uppercase tracking-wide text-right pr-2">
        Jornada<br>Encerrada
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-gray-50 dark:border-gray-800/50" :class="compact ? 'mt-1 pt-0.5' : 'mt-2 pt-1.5'">
      <button @click="handleLogout" class="hover:text-red-500 text-[10px] text-gray-300 hover:bg-red-50 rounded transition-colors flex items-center gap-1 cursor-pointer" :class="compact ? 'p-0.5' : 'p-1'">
        <LogOut :size="10" /> Sair
      </button>

      <button @click="showDetails = true"
              class="flex items-center gap-1 text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-800" :class="compact ? 'py-0.5 px-1.5' : 'py-1 px-2 rounded-full'">
        <span>{{ timerStore.t.actions.openPanel }}</span>
        <ChevronRight :size="12" />
      </button>
    </div>

    <Teleport to="#time-tracker-teleport" :disabled="!teleportReady">
      <div v-if="showDetails" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
        <div class="bg-white dark:bg-gray-900 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800" :style="{ borderRadius: props.rounded }">

          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <h2 class="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
              <Calendar :size="16" class="text-indigo-500" />
              {{ timerStore.t.dashboard.title }}
            </h2>
            <button @click="showDetails = false" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer text-gray-500">
              <X :size="18" />
            </button>
          </div>

          <div class="p-5 overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <span class="text-[9px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-300">{{ timerStore.t.dashboard.workToday }}</span>
                <div class="text-2xl font-mono font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">{{ timerStore.formattedTime }}</div>
              </div>
              <div class="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                <span class="text-[9px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">{{ timerStore.t.dashboard.pauseTotal }}</span>
                <div class="text-2xl font-mono font-bold text-yellow-700 dark:text-yellow-500 mt-0.5">{{ timerStore.formattedTotalPause }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 select-none">
              <button @click="timerStore.changeWeek('prev')" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all text-gray-500 hover:text-indigo-600 cursor-pointer">
                <ChevronLeft :size="16" />
              </button>
              <div class="flex flex-col items-center">
                <span class="font-bold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ timerStore.currentHistoryLabel.month }}</span>
                <span class="text-[10px] text-gray-500 font-mono">{{ timerStore.currentHistoryLabel.weekRange }}</span>
              </div>
              <button @click="timerStore.changeWeek('next')" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all text-gray-500 hover:text-indigo-600 cursor-pointer">
                <ChevronRight :size="16" />
              </button>
            </div>

            <div class="mb-6 space-y-2 bg-white dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
              <template v-if="timerStore.visibleWeeklyChart.length > 0">
                <div v-for="data in timerStore.visibleWeeklyChart" :key="data.day" class="flex items-center gap-3">
                  <span class="w-8 text-[10px] font-bold text-gray-400 uppercase">{{ data.day }}</span>
                  <div class="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full transition-all duration-500" :style="{ width: progressWidth(data.hours) }"></div>
                  </div>
                  <span class="w-12 text-[10px] font-mono text-right text-gray-600 dark:text-gray-400">{{ Math.floor(data.hours).toString().padStart(2, '0') }}:00</span>
                </div>
              </template>
              <div v-else class="text-center text-xs text-gray-400 py-2">Sem registros nesta semana.</div>
            </div>

            <button @click="isTimelineExpanded = !isTimelineExpanded" class="flex items-center justify-between w-full mb-2 group cursor-pointer">
              <span class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 :size="16" />
                {{ timerStore.t.dashboard.timeline }}
              </span>
              <span class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 group-hover:text-indigo-500">
                <ChevronUp v-if="isTimelineExpanded" :size="16" />
                <ChevronDown v-else :size="16" />
              </span>
            </button>

            <div v-show="isTimelineExpanded" class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2 space-y-4 pb-2 transition-all duration-300 ease-in-out">
              <div v-if="timerStore.todayRecords.length === 0" class="text-xs text-gray-400 italic py-2">
                {{ timerStore.t.dashboard.emptyTimeline }}
              </div>
              <div v-for="(record, index) in timerStore.todayRecords" :key="index" class="relative group">
                <div class="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 transition-all group-hover:scale-110 shadow-sm"
                     :class="{
                       'bg-green-500': record.type === 'ENTRY',
                       'bg-yellow-500': record.type.includes('PAUSE'),
                       'bg-red-500': record.type === 'EXIT'
                     }"></div>
                <div class="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ getRecordLabel(record.type) }}</span>
                  <span class="text-xs font-mono font-bold text-gray-500">{{ record.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 text-center">
            <button @click="showDetails = false" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline cursor-pointer">
              {{ timerStore.t.actions.closePanel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>