import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.11.122:3003'

export const sendMessageToAI = async (messages: any[], signal?: AbortSignal) => {
  const { data } = await axios.post(
    `${apiBaseUrl}/api/chat`,
    {
      messages
    },
    {
      signal
    }
  )
  return data
}
