<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {useTimerStore} from '../stores/timer'
import {BarChart3, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pencil, X} from 'lucide-vue-next'
import EditRecordModal from './EditRecordModal.vue'

const timerStore = useTimerStore()
const isTimelineExpanded = ref(true)
const editingRecord = ref<any>(null)

const viewMode = ref<'WEEK' | 'MONTHS' | 'YEARS'>('WEEK')
const selectedYear = ref(new Date().getFullYear())

const formatDecimalToHours = (decimalHours: number) => {
  if (!decimalHours) return '00:00'
  const isNegative = decimalHours < 0
  const absVal = Math.abs(decimalHours)
  const h = Math.floor(absVal)
  const m = Math.round((absVal - h) * 60)
  const sign = isNegative ? '-' : '+'
  return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const progressWidth = computed(() => {
  return (value: number) => {
    if (value <= 0) return '0%'
    const calculatedWidth = (value / 8) * 100
    return `${Math.max(calculatedWidth, 5)}%`
  }
})

function getRecordLabel(type: string) {
  const map: Record<string, string> = timerStore.t.history
  return map[type] || type
}

async function openMonthsView() {
  selectedYear.value = timerStore.historyReferenceDate.getFullYear()
  viewMode.value = 'MONTHS'
  await timerStore.fetchYearlySummary(selectedYear.value)
}

async function openYearsView() {
  viewMode.value = 'YEARS'
  await timerStore.fetchAvailableYears()
}

async function selectYear(year: number) {
  selectedYear.value = year
  viewMode.value = 'MONTHS'
  await timerStore.fetchYearlySummary(year)
}

async function selectMonth(month: number) {
  timerStore.historyReferenceDate = new Date(selectedYear.value, month - 1, 1)
  viewMode.value = 'WEEK'
  await timerStore.fetchWeeklySummary()
}

watch(() => timerStore.historyReferenceDate, (newDate) => {
  timerStore.fetchMonthlyBalance(newDate.getFullYear(), newDate.getMonth() + 1)
})

onMounted(() => {
  timerStore.fetchMonthlyBalance(timerStore.historyReferenceDate.getFullYear(), timerStore.historyReferenceDate.getMonth() + 1)
})
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">

    <EditRecordModal v-if="editingRecord" :record="editingRecord" @close="editingRecord = null" />

    <div class="bg-white dark:bg-gray-900 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800 rounded-3xl">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <h2 class="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
          <Calendar :size="16" class="text-[var(--tt-primary,#4f46e5)]" />
          {{ timerStore.t.dashboard.title }}
        </h2>
        <button @click="timerStore.showDetails = false" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-[var(--tt-primary,#4f46e5)]">
          <X :size="18" />
        </button>
      </div>

      <div class="p-5 overflow-y-auto custom-scrollbar flex-1">

        <template v-if="viewMode === 'WEEK'">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-[var(--tt-primary-50,#e0e7ff)] dark:bg-[var(--tt-primary-900,#312e81)]/20 p-3 rounded-2xl border border-[var(--tt-primary-100,#c7d2fe)] dark:border-[var(--tt-primary-900,#312e81)]/50">
              <span class="text-[9px] font-bold uppercase tracking-wider text-[var(--tt-primary,#4f46e5)] dark:text-[var(--tt-primary-light,#818cf8)]">{{ timerStore.t.dashboard.workToday }}</span>
              <div class="text-2xl font-mono font-bold text-[var(--tt-primary-hover,#4338ca)] dark:text-[var(--tt-primary-light,#818cf8)] mt-0.5">{{ timerStore.formattedTime }}</div>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
              <span class="text-[9px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">{{ timerStore.t.dashboard.pauseTotal }}</span>
              <div class="text-2xl font-mono font-bold text-yellow-700 dark:text-yellow-500 mt-0.5">{{ timerStore.formattedTotalPause }}</div>
            </div>
          </div>

          <div v-if="timerStore.monthlyBalance" class="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Saldo do Mês</span>
              <span class="text-xs text-gray-400 mt-0.5">{{ formatDecimalToHours(Math.abs(timerStore.monthlyBalance.workedHours)).substring(1) }}h / {{ formatDecimalToHours(timerStore.monthlyBalance.expectedHours).substring(1) }}h esperadas</span>
            </div>
            <div class="text-xl font-mono font-bold" :class="timerStore.monthlyBalance.balance >= 0 ? 'text-green-500' : 'text-red-500'">
              {{ formatDecimalToHours(timerStore.monthlyBalance.balance) }}
            </div>
          </div>

          <div class="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 select-none">
            <button @click="timerStore.changeWeek('prev')" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all text-gray-500 hover:text-[var(--tt-primary,#4f46e5)] cursor-pointer">
              <ChevronLeft :size="16" />
            </button>
            <div class="flex flex-col items-center cursor-pointer hover:text-[var(--tt-primary,#4f46e5)] transition-colors py-1 px-4 rounded-lg hover:bg-white dark:hover:bg-gray-700" @click="openMonthsView">
              <span class="font-bold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ timerStore.currentHistoryLabel.month }}</span>
              <span class="text-[10px] text-gray-500 font-mono">{{ timerStore.currentHistoryLabel.weekRange }}</span>
            </div>
            <button @click="timerStore.changeWeek('next')" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all text-gray-500 hover:text-[var(--tt-primary,#4f46e5)] cursor-pointer">
              <ChevronRight :size="16" />
            </button>
          </div>

          <div class="mb-6 space-y-2 bg-white dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
            <template v-if="timerStore.visibleWeeklyChart.length > 0">
              <button v-for="data in timerStore.visibleWeeklyChart" :key="data.day" @click="timerStore.selectDay(data.date)" class="flex items-center gap-3 w-full text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-1 py-0.5 transition-colors">
                <span class="w-8 text-[10px] font-bold text-gray-400 uppercase">{{ data.day }}</span>
                <span class="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <span class="block h-full bg-[var(--tt-primary,#4f46e5)] rounded-full transition-all duration-500" :style="{ width: progressWidth(data.hours) }"></span>
                </span>
                <span class="w-12 text-[10px] font-mono text-right text-gray-600 dark:text-gray-400">{{ formatDecimalToHours(Math.abs(data.hours)).substring(1) }}</span>
              </button>
            </template>
            <div v-else class="text-center text-xs text-gray-400 py-2">{{ timerStore.t.dashboard.emptyWeek }}</div>
          </div>

          <button @click="isTimelineExpanded = !isTimelineExpanded" class="flex items-center justify-between w-full mb-2 group cursor-pointer">
            <span class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 :size="16" class="group-hover:text-[var(--tt-primary,#4f46e5)] dark:group-hover:text-[var(--tt-primary-light,#818cf8)] transition-colors" />
              {{ timerStore.timelineLabel }}
            </span>
            <span class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 group-hover:text-[var(--tt-primary,#4f46e5)]">
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
                  <button @click="editingRecord = record" class="text-gray-400 hover:text-[var(--tt-primary,#4f46e5)] opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer p-0.5">
                    <Pencil :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="viewMode === 'MONTHS'">
          <div class="flex items-center justify-center mb-6 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 select-none">
            <button @click="openYearsView" class="font-bold text-sm text-gray-700 dark:text-gray-200 hover:text-[var(--tt-primary,#4f46e5)] transition-colors py-1 px-4 cursor-pointer">
              {{ selectedYear }}
            </button>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <button v-for="m in timerStore.yearlyData" :key="m.month" @click="selectMonth(m.month)" class="bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[var(--tt-primary,#4f46e5)] hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center group">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[var(--tt-primary,#4f46e5)] mb-1 uppercase tracking-wide">{{ m.monthName }}</span>
              <span class="text-[10px] text-gray-400 font-mono">{{ formatDecimalToHours(Math.abs(m.workedHours)).substring(1) }}h</span>
            </button>
          </div>
        </template>

        <template v-if="viewMode === 'YEARS'">
          <div class="text-center mb-6">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Selecione o Ano</span>
          </div>
          <div class="flex flex-col gap-2">
            <button v-for="y in timerStore.availableYears" :key="y" @click="selectYear(y)" class="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer font-mono text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
              {{ y }}
            </button>
          </div>
        </template>

      </div>

      <div class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 text-center shrink-0">
        <button @click="timerStore.showDetails = false" class="text-xs font-bold text-[var(--tt-primary,#4f46e5)] hover:text-[var(--tt-primary-hover,#4338ca)] dark:text-[var(--tt-primary-light,#818cf8)] hover:underline cursor-pointer">
          {{ timerStore.t.actions.closePanel }}
        </button>
      </div>
    </div>
  </div>
</template>