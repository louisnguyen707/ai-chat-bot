<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const { message, animate } = defineProps<{
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    animated?: boolean
  }
  animate?: boolean
}>()

const emit = defineEmits<{
  (event: 'typed'): void
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

const renderCodeBlock = (code: string, lang?: string) => {
  const highlighted = highlightCode(code, lang)
  return [
    '<div class="md-code-block relative">',
    '<button class="md-copy-btn inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800" type="button" title="Copy" aria-label="Copy">',
    '<span class="md-copy-icon" aria-hidden="true">',
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="9" y="9" width="13" height="13" rx="2"></rect>',
    '<path d="M5 15V5a2 2 0 0 1 2-2h10"></path>',
    '</svg>',
    '</span>',
    '<span class="md-copy-check" aria-hidden="true">',
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M20 6 9 17l-5-5"></path>',
    '</svg>',
    '</span>',
    '<span class="md-copy-text">Copy code</span>',
    '<span class="md-copied-text">Copied</span>',
    '</button>',
    `<pre class="hljs"><code>${highlighted}</code></pre>`,
    '</div>'
  ].join('')
}

md.renderer.rules.fence = (tokens: { [x: string]: any }, idx: string|number) => {
  const token = tokens[idx]
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
  const lang = info ? info.split(/\s+/g)[0] : undefined
  return renderCodeBlock(token.content, lang)
}

md.renderer.rules.code_block = (tokens: { [x: string]: any }, idx: string|number) => {
  const token = tokens[idx]
  return renderCodeBlock(token.content)
}

const displayedContent = ref(message.content)
const isTyping = ref(false)
let typingTimer: number | undefined

const startTyping = (content: string, shouldAnimate: boolean) => {
  if (message.role !== 'assistant' || !shouldAnimate) {
    displayedContent.value = content
    isTyping.value = false
    return
  }

  if (typingTimer) {
    window.clearInterval(typingTimer)
  }

  displayedContent.value = ''
  isTyping.value = true
  let index = 0
  const total = content.length
  const chunk = Math.max(1, Math.round(total / 120))

  typingTimer = window.setInterval(() => {
    index = Math.min(total, index + chunk)
    displayedContent.value = content.slice(0, index)
    if (index >= total) {
      window.clearInterval(typingTimer)
      typingTimer = undefined
      isTyping.value = false
      emit('typed')
    }
  }, 32)
}

watch(
  [() => message.content, () => animate],
  ([value, shouldAnimate]: any) => startTyping(value, Boolean(shouldAnimate)),
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typingTimer) {
    window.clearInterval(typingTimer)
  }
})

const rendered = computed(() => md.render(displayedContent.value))

const isMessageCopied = ref(false)
let messageCopyTimer: number | undefined

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

  const block = button.closest<HTMLElement>('.md-code-block')
  const pre = block?.querySelector('pre')
  if (!pre) {
    return
  }

  const text = pre.textContent ?? ''
  await copyText(text)
  const typedButton = button as HTMLButtonElement & { _copyTimer?: number }
  typedButton.classList.add('is-copied')
  if (typedButton._copyTimer) {
    window.clearTimeout(typedButton._copyTimer)
  }
  typedButton._copyTimer = window.setTimeout(() => {
    typedButton.classList.remove('is-copied')
  }, 1000)
}

const onCopyMessage = async () => {
  await copyText(message.content)
  isMessageCopied.value = true
  if (messageCopyTimer) {
    window.clearTimeout(messageCopyTimer)
  }
  messageCopyTimer = window.setTimeout(() => {
    isMessageCopied.value = false
  }, 1000)
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
            class="relative w-full rounded-2xl px-4 py-3 text-sm leading-6"
            :class="message.role === 'user'
              ? 'shadow-sm border border-gray-200 bg-[#f7f7f8] text-gray-900'
              : 'text-gray-900'"
          >
            <div class="chat-markdown" v-html="rendered" @click="onMarkdownClick" />
            <span
              v-if="message.role === 'assistant' && isTyping"
              class="typing-cursor"
              aria-hidden="true"
            ></span>
          </div>
          <button
            v-if="message.role === 'assistant'"
            class="mt-2 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-2 py-1 text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800"
            type="button"
            @click="onCopyMessage"
            title="Copy"
            aria-label="Copy"
          >
            <svg
              v-if="!isMessageCopied"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            <svg
              v-else
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing-cursor {
  display: inline-block;
  width: 0.5rem;
  height: 1rem;
  margin-left: 2px;
  background: currentColor;
  border-radius: 999px;
  animation: typing-blink 1s steps(2, start) infinite;
  vertical-align: text-bottom;
}

@keyframes typing-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
