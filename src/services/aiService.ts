import { AIMessage } from '../types';

export const sendAIChatMessage = async (messages: any[], conversationId?: string) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, conversationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao processar mensagem da IA');
  }

  return response.json();
};

export const generateAIDescription = async (propertyData: any) => {
  const response = await fetch('/api/ai/describe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar descrição');
  }

  const data = await response.json();
  return typeof data.description === 'string' ? JSON.parse(data.description) : data.description;
};

export const getAISummary = async (messages: any[]) => {
  const response = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar resumo');
  }

  const data = await response.json();
  return data.summary;
};
