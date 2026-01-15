import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = process.env.GEMINI_PORT || 3002
const modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('Missing GEMINI_API_KEY in environment')
}

const genAI = new GoogleGenerativeAI(apiKey || '')

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.post('/api/chat', async (req, res) => {
  try {
    const messages = req.body?.messages
    if (!Array.isArray(messages) || messages.length == 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' })
    }

    const last = messages[messages.length - 1]
    if (!last || last.role !== 'user') {
      return res.status(400).json({ error: 'last message must be a user message' })
    }

    const systemParts = []
    const history = []

    for (const msg of messages.slice(0, -1)) {
      if (!msg || typeof msg.content !== 'string') continue
      if (msg.role === 'system') {
        systemParts.push(msg.content)
        continue
      }

      const role = msg.role === 'assistant' ? 'model' : 'user'
      history.push({ role, parts: [{ text: msg.content }] })
    }

    const systemInstruction = systemParts.length ? systemParts.join('\n') : undefined
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(last.content || '')
    const response = await result.response

    res.json({ reply: response.text() || '' })
  } catch (error) {
    const message = error?.message || 'Unknown error'
    res.status(500).json({ error: message })
  }
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Gemini API server listening on http://0.0.0.0:${port}`)
})
