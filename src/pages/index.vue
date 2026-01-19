<script setup lang="ts">
import { sendMessageToAI } from '~/apis/chatApi'

const chatStore = useChatStore()
const messages = computed(() => chatStore.activeMessages)
onMounted(() => {
  chatStore.loadConversations()
})

const abortController = ref<AbortController | null>(null)

const sendMessage = async (text: string) => {
  if (chatStore.loading) return
  chatStore.setError('')
  chatStore.addMessage({ role: 'user', content: text })
  chatStore.setLoading(true)
  abortController.value = new AbortController()

  try {
    const payloadMessages = chatStore.activeMessages.map(({ role, content }) => ({ role, content }))
    const res = await sendMessageToAI(payloadMessages, abortController.value.signal)
    chatStore.addMessage({
      role: 'assistant',
      content: res.reply
    })
  } catch (err: any) {
    if (err?.name === 'CanceledError' || err?.message === 'canceled') {
      return
    }
    const message =
      err?.response?.data?.error?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Unknown error'
    chatStore.setError(message)
  } finally {
    setTimeout(() => {
      chatStore.setLoading(false)
    }, 1000)
    abortController.value = null
  }
}

const stopSending = () => {
  abortController.value?.abort()
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f8] text-gray-900">
    <div class="flex h-screen">
      <ChatSidebar />
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
              AI
            </div>
            <div class="text-base font-semibold">AI Chatbot</div>
          </div>
          <div class="text-xs text-gray-500">FakeChat.io</div>
        </header>



        <div class="flex min-h-0 flex-1 flex-col" :class="{ 'justify-center' : messages.length === 0}">
          <template v-if="messages.length === 0">
            <div class="text-center text-[32px] font-bold">
              What can I help with?
            </div>
          </template>
          <template v-else>
           <ChatBox />
          </template>

          
          <div v-if="chatStore.error" class="px-4 pb-3 sm:px-6">
            <div
              class="mx-auto flex max-w-4xl items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 text-red-500">!</div>
                <div class="leading-6">
                  <div class="font-semibold">Có lỗi khi gọi API</div>
                  <div class="break-words">{{ chatStore.error }}</div>
                </div>
              </div>
              <button class="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                @click="chatStore.setError('')">
                Dismiss
              </button>
            </div>
          </div>
          <ChatInput :loading="chatStore.loading" @send="sendMessage" @stop="stopSending" />
        </div>
      </div>
    </div>
  </div>
</template>
