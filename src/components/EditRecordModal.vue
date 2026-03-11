<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTimerStore } from '../stores/timer'
import { Clock } from 'lucide-vue-next'

const props = defineProps<{
  record: any
}>()

const emit = defineEmits(['close'])

const timerStore = useTimerStore()

const editTime = ref('')
const editJustification = ref('')
const editError = ref('')
const isSubmittingEdit = ref(false)

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    editTime.value = newRecord.time
    editJustification.value = ''
    editError.value = ''
  }
}, { immediate: true })

function close() {
  emit('close')
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
    await timerStore.editRecord(props.record.id, editTime.value, editJustification.value)
    close()
  } catch (e: any) {
    editError.value = e?.response?._data?.error || timerStore.t.edit.errorServer
  } finally {
    isSubmittingEdit.value = false
  }
}
</script>

<template>
  <div class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
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
        <button @click="close" :disabled="isSubmittingEdit" class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50">{{ timerStore.t.edit.cancel }}</button>
        <button @click="submitEdit" :disabled="isSubmittingEdit" class="flex-1 px-4 py-2 bg-[var(--tt-primary,#4f46e5)] hover:bg-[var(--tt-primary-hover,#4338ca)] text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-[var(--tt-primary,#4f46e5)]/20 cursor-pointer disabled:opacity-50">{{ timerStore.t.edit.save }}</button>
      </div>
    </div>
  </div>
</template>