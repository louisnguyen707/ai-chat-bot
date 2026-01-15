import { defineStore } from 'pinia'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  updatedAt: number
}

const STORAGE_KEY = 'ai-chatbot-conversations'
const LEGACY_MESSAGES_KEY = 'ai-chatbot-messages'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    activeId: '' as string,
    loading: false,
    error: '' as string
  }),

  getters: {
    activeConversation(state) {
      return state.conversations.find((chat) => chat.id === state.activeId)
    },
    activeMessages(): Message[] {
      return this.activeConversation?.messages ?? []
    }
  },

  actions: {
    addMessage(message: Message) {
      if (!this.activeId) {
        this.createConversation()
      }
      const conversation = this.conversations.find((chat) => chat.id === this.activeId)
      if (!conversation) return
      conversation.messages.push(message)
      if (message.role === 'user' && conversation.title === 'New chat') {
        conversation.title = message.content.trim().slice(0, 48) || 'New chat'
      }
      conversation.updatedAt = Date.now()
      this.sortConversations()
      this.persistConversations()
    },

    createConversation() {
      const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const conversation: Conversation = {
        id,
        title: 'New chat',
        messages: [],
        updatedAt: Date.now()
      }
      this.conversations.unshift(conversation)
      this.activeId = id
      this.persistConversations()
    },

    selectConversation(id: string) {
      this.activeId = id
    },

    loadConversations() {
      if (!process.client) return
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const legacy = localStorage.getItem(LEGACY_MESSAGES_KEY)
        if (legacy) {
          this.migrateLegacyMessages(legacy)
        }
        if (!this.conversations.length) {
          this.createConversation()
        }
        return
      }
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return
        this.conversations = parsed
          .filter((chat) => chat && typeof chat.id === 'string')
          .map((chat) => ({
            id: chat.id,
            title: typeof chat.title === 'string' ? chat.title : 'New chat',
            messages: Array.isArray(chat.messages)
              ? chat.messages.filter(
                  (msg) =>
                    msg &&
                    (msg.role === 'user' || msg.role === 'assistant') &&
                    typeof msg.content === 'string'
                )
              : [],
            updatedAt: typeof chat.updatedAt === 'number' ? chat.updatedAt : Date.now()
          }))
        this.sortConversations()
        if (!this.conversations.find((chat) => chat.id === this.activeId)) {
          this.activeId = this.conversations[0]?.id ?? ''
        }
      } catch {
        // Ignore corrupted local data.
      }
    },

    persistConversations() {
      if (!process.client) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.conversations))
    },

    migrateLegacyMessages(raw: string) {
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return
        const messages = parsed.filter(
          (msg) =>
            msg &&
            (msg.role === 'user' || msg.role === 'assistant') &&
            typeof msg.content === 'string'
        )
        if (!messages.length) return
        const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        this.conversations = [
          {
            id,
            title: 'Imported chat',
            messages,
            updatedAt: Date.now()
          }
        ]
        this.activeId = id
        this.persistConversations()
      } catch {
        // Ignore corrupted legacy data.
      }
    },

    sortConversations() {
      this.conversations.sort((a, b) => b.updatedAt - a.updatedAt)
    },

    setLoading(value: boolean) {
      this.loading = value
    },

    setError(value: string) {
      this.error = value
    }
  }
})
