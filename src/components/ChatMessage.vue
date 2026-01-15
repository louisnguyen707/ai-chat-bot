<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const { message } = defineProps<{
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  }
})

const rendered = computed(() => md.render(message.content))
</script>

<template>
  <div class="w-full">
    <div
      class="mx-auto flex max-w-4xl gap-3"
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <div
        class="flex items-start gap-3"
        :class="message.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold"
          :class="message.role === 'user'
            ? 'bg-gray-900 text-white'
            : 'bg-emerald-600 text-white'"
        >
          {{ message.role === 'user' ? 'You' : 'AI' }}
        </div>
        <div
          class="max-w-[75%] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm"
          :class="message.role === 'user'
            ? 'border-gray-200 bg-[#f7f7f8] text-gray-900'
            : 'border-gray-200 bg-white text-gray-900'"
        >
          <div class="chat-markdown" v-html="rendered" />
        </div>
      </div>
    </div>
  </div>
</template>
