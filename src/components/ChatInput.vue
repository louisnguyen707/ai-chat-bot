<script setup lang="ts">
defineProps<{ loading: boolean }>()
const emit = defineEmits<{ send: [string]; stop: [] }>()

const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const textareaHeight = ref('auto')

const submit = () => {
  if (!text.value.trim()) return
  emit('send', text.value)
  text.value = ''
}

const stop = () => {
  emit('stop')
}

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    submit()
  }
}

const adjustTextareaHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
  textareaHeight.value = el.style.height
}

watch(text, async () => {
  await nextTick()
  adjustTextareaHeight()
})

onMounted(() => {
  adjustTextareaHeight()
})
</script>

<template>
  <div class="border-t border-gray-200 bg-[#f7f7f8] px-4 py-4 sm:px-6">
    <div class="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <textarea
        ref="textareaRef"
        v-model="text"
        rows="1"
        @keydown="handleKeydown"
        @input="adjustTextareaHeight"
        :style="{ height: textareaHeight }"
        class="scrollbar-custom max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-6 outline-none"
        placeholder="Nhập câu hỏi..."
      />
      <button
        v-if="loading"
        @click="stop"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:bg-gray-100"
        aria-label="Stop"
        type="button"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
        </svg>
      </button>
      <button
        v-if="!loading"
        @click="submit"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
        aria-label="Send"
        type="button"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
          <path
            d="M12 4l6 8h-4v8h-4v-8H6l6-8z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
