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
  breaks: true
})

const highlightCode = (code: string, lang?: string) => {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang }).value
  }
  return md.utils.escapeHtml(code)
}

const escapeAttr = (value: string) => md.utils.escapeHtml(value)

const renderCodeBlock = (code: string, lang?: string) => {
  const encoded = escapeAttr(encodeURIComponent(code))
  const highlighted = highlightCode(code, lang)
  return [
    '<div class="md-code-block">',
    `<button class="md-copy-btn" data-copy="${encoded}">Copy</button>`,
    `<pre class="hljs"><code>${highlighted}</code></pre>`,
    '</div>'
  ].join('')
}

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
  const lang = info ? info.split(/\s+/g)[0] : undefined
  return renderCodeBlock(token.content, lang)
}

md.renderer.rules.code_block = (tokens, idx) => {
  const token = tokens[idx]
  return renderCodeBlock(token.content)
}

const rendered = computed(() => md.render(message.content))

const copyText = async (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

const onMarkdownClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) {
    return
  }

  const button = target.closest<HTMLButtonElement>('button.md-copy-btn')
  if (!button) {
    return
  }

  const encoded = button.dataset.copy
  if (!encoded) {
    return
  }

  const text = decodeURIComponent(encoded)
  await copyText(text)
  const original = button.textContent
  button.textContent = 'Copied'
  window.setTimeout(() => {
    button.textContent = original || 'Copy'
  }, 1600)
}

const onCopyMessage = async () => {
  await copyText(message.content)
}
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
          class="flex max-w-[75%] flex-col"
          :class="message.role === 'user' ? 'items-end' : 'items-start'"
        >
          <div
            class="w-full rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm"
            :class="message.role === 'user'
              ? 'border-gray-200 bg-[#f7f7f8] text-gray-900'
              : 'border-gray-200 bg-white text-gray-900'"
          >
            <div class="chat-markdown" v-html="rendered" @click="onMarkdownClick" />
          </div>
          <button
            v-if="message.role === 'assistant'"
            class="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800"
            type="button"
            @click="onCopyMessage"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
