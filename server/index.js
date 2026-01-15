import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 3001

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.warn('Missing OPENAI_API_KEY in environment')
}

const openai = new OpenAI({ apiKey })

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.post('/api/chat', async (req, res) => {
  try {
    const messages = req.body?.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: messages ||[
        { role: "system", content: "Bạn là trợ lý AI" },
        { role: "user", content: "Xin chào" }
      ]
    })

    const reply = completion.choices?.[0]?.message?.content || ''

    res.json({ reply })
  } catch (error) {
    const message = error?.message || 'Unknown error'
    res.status(500).json({ error: message })
  }
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
