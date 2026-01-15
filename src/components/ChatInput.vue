<script setup lang="ts">
defineProps<{ loading: boolean }>()
const emit = defineEmits<{ send: [string] }>()

const text = ref('')

const submit = () => {
  if (!text.value.trim()) return
  emit('send', text.value)
  text.value = ''
}
</script>

<template>
  <div class="border-t border-gray-200 bg-[#f7f7f8] px-4 py-4 sm:px-6">
    <div class="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <input
        v-model="text"
        @keyup.enter="submit"
        class="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
        placeholder="Nhập câu hỏi..."
      />
      <button
        @click="submit"
        :disabled="loading"
        class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  </div>
</template>
