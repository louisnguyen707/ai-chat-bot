<script setup lang="ts">
const chatStore = useChatStore()
const boxRef = ref<HTMLElement | null>(null)

const messages = computed(() => chatStore.activeMessages)
const loading = computed(() => chatStore.loading)

onUpdated(async () => {
  await nextTick()
  boxRef.value?.scrollTo({
    top: boxRef.value.scrollHeight,
    behavior: 'smooth'
  })
})
</script>

<template>
  <div
    ref="boxRef"
    class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6"
  >
    <ChatMessage
      v-for="(msg, i) in messages"
      :key="i"
      :message="msg"
    />

    <div
      v-if="loading"
      class="w-full"
    >
      <div class="mx-auto flex max-w-4xl items-start gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
          AI
        </div>
        <div class="max-w-[75%] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          <span class="typing-indicator" aria-label="AI dang tra loi">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 1em;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #6b7280;
  animation: blink 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}
</style>
