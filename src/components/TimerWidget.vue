<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimerStore } from '../stores/timer'
import { useTheme } from '../composables/useTheme'
import { Play, Moon, Sun, Clock, Square, Coffee, Calendar, X, BarChart3, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Pause, Pencil, Loader2 } from 'lucide-vue-next'

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
const { isDark, toggleTheme } = useTheme()

const showDetails = ref(false)
const isTimelineExpanded = ref(true)

const editingRecordId = ref<string | null>(null)
const editTime = ref('')
const editJustification = ref('')
const editError = ref('')
const isSubmittingEdit = ref(false)

function getRecordLabel(type: string) {
  const map: Record<string, string> = timerStore.t.history
  return map[type] || type
}

const formatChartTime = (decimalHours: number) => {
  if (!decimalHours) return '00:00'
  const h = Math.floor(decimalHours)
  const m = Math.round((decimalHours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const progressWidth = computed(() => {
  return (value: number) => {
    if (value <= 0) return '0%'
    const calculatedWidth = (value / 8) * 100
    return `${Math.max(calculatedWidth, 5)}%`
  }
})

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

function openEditModal(record: any) {
  editingRecordId.value = record.id
  editTime.value = record.time
  editJustification.value = ''
  editError.value = ''
}

function closeEditModal() {
  editingRecordId.value = null
}

async function submitEdit() {
  if (!editJustification.value.trim()) {
    editError.value = timerStore.t.edit.errorJustification
    return
  }
  if (!editTime.value) {
    editError.value = timerStore.t.edit.errorTime
    return
  }

  isSubmittingEdit.value = true
  try {
    await timerStore.editRecord(editingRecordId.value!, editTime.value, editJustification.value)
    closeEditModal()
  } catch (e: any) {
    editError.value = e?.response?._data?.error || timerStore.t.edit.errorServer
  } finally {
    isSubmittingEdit.value = false
  }
}
</script>

<template>
  <div
      class="w-full bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 shadow-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden box-border flex items-center"
      :class="[compact ? 'px-3 py-1.5 min-h-[40px]' : 'px-4 py-3']"
      :style="{ borderRadius: props.rounded }"
  >

    <div v-if="compact" class="flex items-center justify-between w-full h-full gap-2">

      <div class="flex items-center gap-2">
        <button @click="toggleTheme" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-0.5">
          <Sun v-if="isDark" :size="14" />
          <Moon v-else :size="14" />
        </button>

        <div class="font-mono font-bold text-lg tabular-nums leading-none tracking-tighter" :class="mainDisplay.colorClass">
          {{ mainDisplay.time }}
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

      <div class="flex items-center gap-1.5" v-if="timerStore.status !== 'FINISHED'">
        <button @click="timerStore.registerPoint" :disabled="timerStore.isProcessing"
                class="flex items-center justify-center bg-[var(--tt-primary,#4f46e5)] text-white rounded-md w-7 h-7 hover:bg-[var(--tt-primary-hover,#4338ca)] disabled:opacity-70 transition-colors cursor-pointer">
          <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="14" />
          <template v-else>
            <Play v-if="timerStore.status === 'IDLE' || timerStore.status === 'PAUSED'" :size="14" fill="currentColor" class="ml-0.5" />
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

        <button @click="showDetails = true" class="text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] transition-colors p-1 cursor-pointer" title="Abrir Painel">
          <BarChart3 :size="16" />
        </button>
      </div>

      <div v-else class="flex items-center gap-2">
        <span class="text-green-500 font-bold text-[9px] uppercase">{{ timerStore.t.status.finished }}</span>
        <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"></div>
        <button @click="showDetails = true" class="text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] transition-colors p-1 cursor-pointer" title="Abrir Painel">
          <BarChart3 :size="16" />
        </button>
      </div>
    </div>

    <div v-else class="w-full">
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col justify-center min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-0.5">
            <button @click="toggleTheme" class="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 p-1">
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

        <div class="flex items-center gap-2" v-if="timerStore.status !== 'FINISHED'">
          <button @click="timerStore.registerPoint" :disabled="timerStore.isProcessing" class="group relative flex items-center justify-center bg-[var(--tt-primary,#4f46e5)] hover:bg-[var(--tt-primary-hover,#4338ca)] text-white shadow-lg shadow-[var(--tt-primary,#4f46e5)]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed w-12 h-12 rounded-2xl">
            <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="20" />
            <template v-else>
              <Play v-if="timerStore.status === 'IDLE' || timerStore.status === 'PAUSED'" :size="20" fill="currentColor" class="ml-0.5" />
              <Pause v-else-if="timerStore.status === 'WORKING'" :size="20" fill="currentColor" />
            </template>
          </button>

          <button v-if="timerStore.status === 'WORKING' || timerStore.status === 'PAUSED'" @click="timerStore.registerExit" :disabled="timerStore.isProcessing" class="group relative flex items-center justify-center border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-500 dark:disabled:hover:text-red-400 dark:disabled:hover:bg-transparent w-12 h-12 rounded-2xl">
            <Loader2 v-if="timerStore.isProcessing" class="animate-spin" :size="18" />
            <Square v-else :size="18" fill="currentColor" />
          </button>
        </div>

        <div v-else class="text-green-500 font-bold text-[10px] uppercase tracking-wide text-right pr-2">
          {{ timerStore.t.status.finished }}
        </div>
      </div>

      <div class="flex items-center justify-end border-t border-gray-50 dark:border-gray-800/50 mt-2 pt-1.5">
        <button @click="showDetails = true" class="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] dark:hover:text-[var(--tt-primary-light,#818cf8)] transition-colors cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-800 py-1 px-2 rounded-full">
          <span>{{ timerStore.t.actions.openPanel }}</span>
          <ChevronRight :size="12" />
        </button>
      </div>
    </div>
  </div>

  <div v-if="showDetails" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
    <div v-if="editingRecordId" class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-xs p-5">
        <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Clock :size="16" class="text-[var(--tt-primary,#4f46e5)]" />
          {{ timerStore.t.edit.title }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{{ timerStore.t.edit.newTime }}</label>
            <input type="time" v-model="editTime" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-[var(--tt-primary,#4f46e5)] outline-none" />
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{{ timerStore.t.edit.justification }}</label>
            <textarea v-model="editJustification" rows="3" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--tt-primary,#4f46e5)] outline-none placeholder-gray-400" :placeholder="timerStore.t.edit.placeholder"></textarea>
            <span v-if="editError" class="text-[10px] font-bold text-red-500 mt-1 block">{{ editError }}</span>
          </div>
        </div>

        <div class="flex gap-2 mt-5">
          <button @click="closeEditModal" :disabled="isSubmittingEdit" class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50">{{ timerStore.t.edit.cancel }}</button>
          <button @click="submitEdit" :disabled="isSubmittingEdit" class="flex-1 px-4 py-2 bg-[var(--tt-primary,#4f46e5)] hover:bg-[var(--tt-primary-hover,#4338ca)] text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-[var(--tt-primary,#4f46e5)]/20 cursor-pointer disabled:opacity-50">{{ timerStore.t.edit.save }}</button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800" :style="{ borderRadius: props.rounded }">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <h2 class="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
          <Calendar :size="16" class="text-[var(--tt-primary,#4f46e5)]" />
          {{ timerStore.t.dashboard.title }}
        </h2>
        <button @click="showDetails = false" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-[var(--tt-primary,#4f46e5)]">
          <X :size="18" />
        </button>
      </div>

      <div class="p-5 overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-[var(--tt-primary-50,#e0e7ff)] dark:bg-[var(--tt-primary-900,#312e81)]/20 p-3 rounded-2xl border border-[var(--tt-primary-100,#c7d2fe)] dark:border-[var(--tt-primary-900,#312e81)]/50">
            <span class="text-[9px] font-bold uppercase tracking-wider text-[var(--tt-primary,#4f46e5)] dark:text-[var(--tt-primary-light,#818cf8)]">{{ timerStore.t.dashboard.workToday }}</span>
            <div class="text-2xl font-mono font-bold text-[var(--tt-primary-hover,#4338ca)] dark:text-[var(--tt-primary-light,#818cf8)] mt-0.5">{{ timerStore.formattedTime }}</div>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
            <span class="text-[9px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">{{ timerStore.t.dashboard.pauseTotal }}</span>
            <div class="text-2xl font-mono font-bold text-yellow-700 dark:text-yellow-500 mt-0.5">{{ timerStore.formattedTotalPause }}</div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 select-none">
          <button @click="timerStore.changeWeek('prev')" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all text-gray-500 hover:text-[var(--tt-primary,#4f46e5)] dark:hover:text-[var(--tt-primary-light,#818cf8)] cursor-pointer">
            <ChevronLeft :size="16" />
          </button>
          <div class="flex flex-col items-center">
            <span class="font-bold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ timerStore.currentHistoryLabel.month }}</span>
            <span class="text-[10px] text-gray-500 font-mono">{{ timerStore.currentHistoryLabel.weekRange }}</span>
          </div>
          <button @click="timerStore.changeWeek('next')" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all text-gray-500 hover:text-[var(--tt-primary,#4f46e5)] dark:hover:text-[var(--tt-primary-light,#818cf8)] cursor-pointer">
            <ChevronRight :size="16" />
          </button>
        </div>

        <div class="mb-6 space-y-2 bg-white dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
          <template v-if="timerStore.visibleWeeklyChart.length > 0">
            <button
                v-for="data in timerStore.visibleWeeklyChart"
                :key="data.day"
                @click="timerStore.selectDay(data.date)"
                class="flex items-center gap-3 w-full text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-1 py-0.5 transition-colors"
            >
              <span class="w-8 text-[10px] font-bold text-gray-400 uppercase">{{ data.day }}</span>
              <span class="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <span class="block h-full bg-[var(--tt-primary,#4f46e5)] rounded-full transition-all duration-500" :style="{ width: progressWidth(data.hours) }"></span>
              </span>
              <span class="w-12 text-[10px] font-mono text-right text-gray-600 dark:text-gray-400">{{ formatChartTime(data.hours) }}</span>
            </button>
          </template>
          <div v-else class="text-center text-xs text-gray-400 py-2">{{ timerStore.t.dashboard.emptyWeek }}</div>
        </div>

        <button @click="isTimelineExpanded = !isTimelineExpanded" class="flex items-center justify-between w-full mb-2 group cursor-pointer">
          <span class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 :size="16" class="group-hover:text-[var(--tt-primary,#4f46e5)] dark:group-hover:text-[var(--tt-primary-light,#818cf8)] transition-colors" />
            {{ timerStore.timelineLabel }}
          </span>
          <span class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 group-hover:text-[var(--tt-primary,#4f46e5)] dark:group-hover:text-[var(--tt-primary-light,#818cf8)]">
            <ChevronUp v-if="isTimelineExpanded" :size="16" />
            <ChevronDown v-else :size="16" />
          </span>
        </button>

        <div v-show="isTimelineExpanded" class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2 space-y-4 pb-2 transition-all duration-300 ease-in-out">
          <div v-if="timerStore.sortedRecords.length === 0" class="text-xs text-gray-400 italic py-2">
            {{ timerStore.t.dashboard.emptyTimeline }}
          </div>
          <div v-for="(record, index) in timerStore.sortedRecords" :key="index" class="relative group/item">
            <div class="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 transition-all group-hover/item:scale-110 shadow-sm"
                 :class="{
                   'bg-green-500': record.type === 'ENTRY',
                   'bg-yellow-500': record.type.includes('PAUSE'),
                   'bg-red-500': record.type === 'EXIT'
                 }"></div>
            <div class="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ getRecordLabel(record.type) }}</span>
              <div class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold text-gray-500">{{ record.time }}</span>
                <button @click="openEditModal(record)" class="text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] dark:hover:text-[var(--tt-primary-light,#818cf8)] opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer p-0.5">
                  <Pencil :size="12" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 text-center">
        <button @click="showDetails = false" class="text-xs font-bold text-[var(--tt-primary,#4f46e5)] hover:text-[var(--tt-primary-hover,#4338ca)] dark:text-[var(--tt-primary-light,#818cf8)] hover:underline cursor-pointer">
          {{ timerStore.t.actions.closePanel }}
        </button>
      </div>
    </div>
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