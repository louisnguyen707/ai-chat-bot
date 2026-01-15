import { defineStore } from 'pinia'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'ai-chatbot-messages'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as Message[],
    loading: false,
    error: '' as string
  }),

  actions: {
    addMessage(message: Message) {
      this.messages.push(message)
      this.persistMessages()
    },

    loadMessages() {
      if (!process.client) return
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          this.messages = parsed.filter(
            (msg) =>
              msg &&
              (msg.role === 'user' || msg.role === 'assistant') &&
              typeof msg.content === 'string'
          )
        }
      } catch {
        // Ignore corrupted local data.
      }
    },

    persistMessages() {
      if (!process.client) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages))
    },

    setLoading(value: boolean) {
      this.loading = value
    },

    setError(value: string) {
      this.error = value
    }
  }
})
