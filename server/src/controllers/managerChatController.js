import {askManagerAssistant} from '../services/managerChatService.js'

export const ask = async (request, response) => {
  const answer = await askManagerAssistant(request.body.question)
  response.json(answer)
}