import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'
import { translations } from '../utils/i18n'
import { $api } from '../utils/api'

export type WorkStatus = 'IDLE' | 'WORKING' | 'PAUSED' | 'FINISHED'

interface TimeRecord {
    id?: string
    type: string
    time: string
    timestamp: any
    label?: string
}

interface DailySummary {
    day: string
    hours: number
    date: string
}

interface MonthlyBalance {
    workedHours: number
    expectedHours: number
    balance: number
}

interface MonthSummary {
    month: number
    monthName: string
    workedHours: number
}

export const useTimerStore = defineStore('timer', () => {
    const status = ref<WorkStatus>('IDLE')
    const lang = ref<'pt-BR' | 'en'>('pt-BR')
    const t = computed(() => translations[lang.value])

    const startTime = ref<number | null>(null)
    const elapsedTime = ref(0)

    const currentPauseStart = ref<number | null>(null)
    const currentPauseElapsed = ref(0)
    const accumulatedPauseTime = ref(0)

    const todayRecords = ref<TimeRecord[]>([])
    const weeklyData = ref<DailySummary[]>([])
    const availableYears = ref<number[]>([])
    const yearlyData = ref<MonthSummary[]>([])
    const monthlyBalance = ref<MonthlyBalance | null>(null)

    const intervalId = ref<any>(null)
    const isProcessing = ref(false)
    const showDetails = ref(false)
    const authStore = useAuthStore()

    const historyReferenceDate = ref(new Date())

    const pad = (n: number) => String(n).padStart(2, '0')

    const todayDateStr = (() => {
        const now = new Date()
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    })()

    const selectedDate = ref<string>(todayDateStr)

    function parseServerDate(val: any): Date {
        if (Array.isArray(val)) {
            return new Date(val[0], val[1] - 1, val[2], val[3], val[4], val[5] || 0)
        }
        if (typeof val === 'string') {
            const p = val.split(/\D+/)
            if (p.length >= 5) {
                return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), Number(p[3]), Number(p[4]), Number(p[5] || 0))
            }
        }
        return new Date(val)
    }

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
        const s = (totalSeconds % 60).toString().padStart(2, '0')
        return `${h}:${m}:${s}`
    }

    const formatClock = (timestamp: any) => {
        return parseServerDate(timestamp).toLocaleTimeString(lang.value, { hour: '2-digit', minute: '2-digit' })
    }

    const formattedTime = computed(() => formatDuration(elapsedTime.value))

    const formattedTotalPause = computed(() => {
        const pending = status.value === 'PAUSED' ? currentPauseElapsed.value : 0
        return formatDuration(accumulatedPauseTime.value + pending)
    })

    const statusLabel = computed(() => {
        switch (status.value) {
            case 'IDLE': return t.value.status.idle
            case 'WORKING': return t.value.status.working
            case 'PAUSED': return t.value.status.paused
            case 'FINISHED': return t.value.status.finished
            default: return ''
        }
    })

    const currentHistoryLabel = computed(() => {
        const start = new Date(historyReferenceDate.value)
        const day = start.getDay()
        const diff = start.getDate() - day
        start.setDate(diff)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        const monthName = start.toLocaleDateString(lang.value, { month: 'long', year: 'numeric' })
        const startStr = start.toLocaleDateString(lang.value, { day: 'numeric', month: 'short' }).replace('.', '')
        const endStr = end.toLocaleDateString(lang.value, { day: 'numeric', month: 'short' }).replace('.', '')

        return {
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            weekRange: `${startStr} - ${endStr}`
        }
    })

    const visibleWeeklyChart = computed(() => {
        return weeklyData.value.filter(d => d.hours > 0)
    })

    const sortedRecords = computed(() => {
        return [...todayRecords.value].sort((a, b) =>
            parseServerDate(a.timestamp).getTime() - parseServerDate(b.timestamp).getTime()
        )
    })

    const timelineLabel = computed(() => {
        const parts = selectedDate.value.split('-')
        const year = Number(parts[0] ?? 0)
        const month = Number(parts[1] ?? 1)
        const day = Number(parts[2] ?? 1)
        const date = new Date(year, month - 1, day)
        const formatted = date.toLocaleDateString(lang.value, { day: '2-digit', month: '2-digit' })
        return `${t.value.dashboard.timeline.replace(/\s*\(.*\)/, '')} (${formatted})`
    })

    async function changeWeek(direction: 'next' | 'prev') {
        const newDate = new Date(historyReferenceDate.value)
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        historyReferenceDate.value = newDate
        await fetchWeeklySummary()
    }

    function startTicker() {
        if (intervalId.value) clearInterval(intervalId.value)
        intervalId.value = setInterval(() => {
            const now = Date.now()
            if (status.value === 'WORKING' && startTime.value) {
                elapsedTime.value = now - startTime.value
            } else if (status.value === 'PAUSED' && currentPauseStart.value) {
                currentPauseElapsed.value = now - currentPauseStart.value
            }
        }, 1000)
    }

    function rebuildStateFromRecords() {
        if (!todayRecords.value || todayRecords.value.length === 0) {
            status.value = 'IDLE'
            elapsedTime.value = 0
            accumulatedPauseTime.value = 0
            return
        }

        let workTime = 0
        let pauseTime = 0
        let lastEntryTime: number | null = null
        let lastPauseTime: number | null = null
        let currentStatus: WorkStatus = 'IDLE'

        const sortedRecords = [...todayRecords.value].sort((a, b) =>
            parseServerDate(a.timestamp).getTime() - parseServerDate(b.timestamp).getTime()
        )

        for (const record of sortedRecords) {
            const time = parseServerDate(record.timestamp).getTime()

            if (record.type === 'ENTRY') {
                lastEntryTime = time
                currentStatus = 'WORKING'
            } else if (record.type === 'PAUSE_START') {
                if (lastEntryTime) workTime += (time - lastEntryTime)
                lastPauseTime = time
                currentStatus = 'PAUSED'
            } else if (record.type === 'PAUSE_END') {
                if (lastPauseTime) pauseTime += (time - lastPauseTime)
                lastEntryTime = time
                currentStatus = 'WORKING'
            } else if (record.type === 'EXIT') {
                if (lastEntryTime && currentStatus === 'WORKING') {
                    workTime += (time - lastEntryTime)
                }
                currentStatus = 'FINISHED'
            }
        }

        status.value = currentStatus
        accumulatedPauseTime.value = pauseTime

        if (currentStatus === 'WORKING' && lastEntryTime) {
            startTime.value = lastEntryTime - workTime
            startTicker()
        } else if (currentStatus === 'PAUSED') {
            elapsedTime.value = workTime
            currentPauseStart.value = lastPauseTime || Date.now()
            startTicker()
        } else if (currentStatus === 'FINISHED') {
            elapsedTime.value = workTime
            if (intervalId.value) clearInterval(intervalId.value)
        }
    }

    async function getGeolocation(): Promise<{ lat: number, lon: number }> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ lat: 0, lon: 0 })
                return
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => resolve({ lat: 0, lon: 0 }),
                { timeout: 5000, enableHighAccuracy: true }
            )
        })
    }

    async function fetchTodayHistory() {
        if (!authStore.token) return
        try {
            const data: any = await $api('/api/v1/records', {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            })
            todayRecords.value = data.map((r: any) => ({
                ...r,
                type: r.recordType,
                timestamp: r.registeredAt,
                time: formatClock(r.registeredAt),
                label: t.value.history[r.recordType as keyof typeof t.value.history] || r.recordType
            }))
            rebuildStateFromRecords()
        } catch (error) {
        }
    }

    async function fetchWeeklySummary() {
        if (!authStore.token) return
        const y = historyReferenceDate.value.getFullYear()
        const m = pad(historyReferenceDate.value.getMonth() + 1)
        const d = pad(historyReferenceDate.value.getDate())
        const dateStr = `${y}-${m}-${d}`

        try {
            weeklyData.value = await $api(`/api/v1/summary/weekly?date=${dateStr}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            })
        } catch (error) {
        }
    }

    async function fetchAvailableYears() {
        if (!authStore.token) return
        try {
            availableYears.value = await $api('/api/v1/summary/years', {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            })
        } catch (error) {
        }
    }

    async function fetchYearlySummary(year: number) {
        if (!authStore.token) return
        try {
            yearlyData.value = await $api(`/api/v1/summary/yearly?year=${year}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            })
        } catch (error) {
        }
    }

    async function fetchMonthlyBalance(year: number, month: number) {
        if (!authStore.token) return
        try {
            monthlyBalance.value = await $api(`/api/v1/summary/monthly-balance?year=${year}&month=${month}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            })
        } catch (error) {
        }
    }

    async function sendRecord(type: string) {
        if (!authStore.token) return

        const now = new Date()
        const localDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

        const { lat, lon } = await getGeolocation()
        try {
            await $api('/api/v1/records', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authStore.token}` },
                body: {
                    recordType: type,
                    source: 'MANUAL',
                    registeredAt: localDateTime,
                    latitude: lat,
                    longitude: lon
                }
            })
            await fetchTodayHistory()
        } catch (error) {
        }
    }

    async function editRecord(id: string, timeStr: string, justification: string) {
        if (!authStore.token) return

        const record = todayRecords.value.find(r => r.id === id)
        if (!record) return

        const originalDate = parseServerDate(record.timestamp)
        const [hours = 0, minutes = 0] = timeStr.split(':').map(Number)
        originalDate.setHours(hours, minutes, 0, 0)

        const localDateTime = `${originalDate.getFullYear()}-${pad(originalDate.getMonth() + 1)}-${pad(originalDate.getDate())}T${pad(originalDate.getHours())}:${pad(originalDate.getMinutes())}:${pad(originalDate.getSeconds())}`

        try {
            await $api(`/api/v1/records/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authStore.token}` },
                body: {
                    registeredAt: localDateTime,
                    justification: justification
                }
            })
            await fetchTodayHistory()
            await fetchWeeklySummary()
            if (monthlyBalance.value) {
                await fetchMonthlyBalance(originalDate.getFullYear(), originalDate.getMonth() + 1)
            }
        } catch (error) {
            throw error
        }
    }

    async function registerPoint() {
        if (isProcessing.value) return
        isProcessing.value = true
        try {
            if (status.value === 'IDLE' || status.value === 'FINISHED') {
                await sendRecord('ENTRY')
            } else if (status.value === 'WORKING') {
                await sendRecord('PAUSE_START')
            } else if (status.value === 'PAUSED') {
                await sendRecord('PAUSE_END')
            }
        } finally {
            isProcessing.value = false
        }
    }

    async function selectDay(dateStr: string) {
        if (!authStore.token) return
        selectedDate.value = dateStr
        try {
            const data: any = await $api(`/api/v1/records?date=${dateStr}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            })
            todayRecords.value = data.map((r: any) => ({
                ...r,
                type: r.recordType,
                timestamp: r.registeredAt,
                time: formatClock(r.registeredAt),
                label: t.value.history[r.recordType as keyof typeof t.value.history] || r.recordType
            }))
        } catch {
            todayRecords.value = []
        }
    }

    async function registerExit() {
        if (status.value !== 'WORKING' && status.value !== 'PAUSED') return
        if (isProcessing.value) return
        isProcessing.value = true
        try {
            await sendRecord('EXIT')
        } finally {
            isProcessing.value = false
        }
    }

    return {
        status,
        lang,
        t,
        formattedTime,
        formattedTotalPause,
        statusLabel,
        todayRecords,
        sortedRecords,
        currentHistoryLabel,
        visibleWeeklyChart,
        timelineLabel,
        isProcessing,
        showDetails,
        historyReferenceDate,
        availableYears,
        yearlyData,
        monthlyBalance,
        changeWeek,
        selectDay,
        registerPoint,
        registerExit,
        fetchTodayHistory,
        fetchWeeklySummary,
        fetchAvailableYears,
        fetchYearlySummary,
        fetchMonthlyBalance,
        editRecord
    }
})