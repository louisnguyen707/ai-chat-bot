<script setup lang="ts">
const chatStore = useChatStore()

const conversations = computed(() => chatStore.conversations)
const activeId = computed(() => chatStore.activeId)

const selectConversation = (id: string) => {
  chatStore.selectConversation(id)
}

const startNewChat = () => {
  chatStore.createConversation()
}
</script>

<template>
  <aside class="hidden w-64 flex-none border-r border-gray-200 bg-white sm:flex sm:flex-col">
    <div class="px-4 py-4">
      <button
        class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
        @click="startNewChat"
      >
        + New chat
      </button>
    </div>
    <div class="flex-1 overflow-y-auto px-2 pb-4">
      <button
        v-for="chat in conversations"
        :key="chat.id"
        class="mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition"
        :class="chat.id === activeId ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-100 text-gray-700'"
        @click="selectConversation(chat.id)"
      >
        <span class="h-2 w-2 rounded-full bg-emerald-500" v-if="chat.id === activeId" />
        <span class="truncate">{{ chat.title }}</span>
      </button>
    </div>
  </aside>
</template>
