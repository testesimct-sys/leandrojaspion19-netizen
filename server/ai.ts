import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { db } from "./firebase";
import { collection, query, where, getDocs, limit, orderBy, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const searchPropertiesTool: FunctionDeclaration = {
  name: "searchProperties",
  description: "Busca imóveis no banco de dados com base em filtros.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      purpose: { type: Type.STRING, enum: ["SALE", "RENT"], description: "Finalidade (SALE para venda, RENT para aluguel)" },
      propertyType: { type: Type.STRING, description: "Tipo de imóvel (HOUSE, APARTMENT, CONDO, LAND, COMMERCIAL, FARM)" },
      maxPrice: { type: Type.NUMBER, description: "Preço máximo" },
      minPrice: { type: Type.NUMBER, description: "Preço mínimo" },
      city: { type: Type.STRING, description: "Cidade" },
      neighborhood: { type: Type.STRING, description: "Bairro" },
      bedrooms: { type: Type.NUMBER, description: "Mínimo de quartos" },
      suites: { type: Type.NUMBER, description: "Mínimo de suítes" },
      bathrooms: { type: Type.NUMBER, description: "Mínimo de banheiros" },
      parkingSpaces: { type: Type.NUMBER, description: "Mínimo de vagas de garagem" },
      minArea: { type: Type.NUMBER, description: "Metragem mínima" },
      features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de características desejadas (piscina, churrasqueira, etc)" }
    }
  }
};

const createLeadTool: FunctionDeclaration = {
  name: "createLead",
  description: "Cria um lead no CRM quando o usuário demonstra interesse real ou fornece dados de contato.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome completo do lead" },
      email: { type: Type.STRING, description: "E-mail de contato" },
      whatsapp: { type: Type.STRING, description: "WhatsApp de contato" },
      propertyId: { type: Type.STRING, description: "ID do imóvel de interesse (se houver)" },
      message: { type: Type.STRING, description: "Resumo do que o usuário busca" },
      intent: { type: Type.STRING, enum: ["BUY", "RENT", "SELL", "INFO"], description: "Intenção do usuário" }
    },
    required: ["name", "whatsapp", "intent"]
  }
};

export async function handleAIChat(messages: any[], conversationId?: string) {
  const model = ai.models.generateContent({
    model: "gemini-3.8-flash",
    config: {
      systemInstruction: `Você é um assistente imobiliário profissional e elegante da Elite Imóveis.
Sua missão é ajudar visitantes a encontrar o imóvel ideal e qualificar leads para os corretores humanos.

DIRETRIZES FUNDAMENTAIS:
1. NUNCA invente imóveis ou características que não existam no banco de dados.
2. Seja prestativo, educado e profissional.
3. Use os dados reais consultados via ferramentas.
4. Se não encontrar uma informação, diga claramente: "Não encontrei essa informação nos dados disponíveis. Posso encaminhar sua dúvida para um corretor."
5. Colete informações do lead (nome, whatsapp, intenção) de forma natural durante a conversa.
6. Quando o usuário demonstrar interesse real ou fornecer os dados necessários, use a ferramenta 'createLead' para registrar o lead no CRM.
7. Para recomendações, mencione a porcentagem de compatibilidade baseada nos filtros do usuário.

FLUXO DE ATENDIMENTO:
- Entenda o que o usuário busca (Comprar/Alugar, Tipo, Localização, Valor).
- Use a ferramenta 'searchProperties' para encontrar opções reais.
- Apresente as opções com seus códigos e principais características.
- Se o usuário quiser saber mais ou agendar, peça o nome e WhatsApp e use 'createLead'.`,
      tools: [{ functionDeclarations: [searchPropertiesTool, createLeadTool] }],
      toolConfig: { includeServerSideToolInvocations: true }
    },
    contents: messages
  });

  const response = await model;
  
  // Handle function calls
  if (response.functionCalls) {
    const results = [];
    for (const call of response.functionCalls) {
      if (call.name === "searchProperties") {
        const filters = call.args as any;
        const properties = await executePropertySearch(filters);
        results.push({
          name: call.name,
          response: { content: properties },
          id: call.id
        });
      } else if (call.name === "createLead") {
        const leadData = call.args as any;
        const result = await executeCreateLead(leadData, conversationId);
        results.push({
          name: call.name,
          response: { content: result },
          id: call.id
        });
      }
    }

    // Call model again with function results
    const secondResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        ...messages,
        response.candidates[0].content,
        {
          role: "user",
          parts: results.map(r => ({ functionResponse: r }))
        }
      ]
    });
    
    return secondResponse;
  }

  return response;
}

async function executeCreateLead(data: any, conversationId?: string) {
  try {
    let propertyCode = '';
    if (data.propertyId) {
      const propDoc = await getDocs(query(collection(db, 'properties'), where('id', '==', data.propertyId)));
      if (!propDoc.empty) {
        propertyCode = propDoc.docs[0].data().code;
      }
    }

    const leadRef = await addDoc(collection(db, 'leads'), {
      name: data.name,
      email: data.email || '',
      phone: data.whatsapp,
      whatsapp: data.whatsapp,
      message: data.message || `Interessado em ${data.intent === 'BUY' ? 'comprar' : 'alugar'}`,
      source: 'AI_ASSISTANT',
      status: 'NEW',
      propertyId: data.propertyId || null,
      propertyCode: propertyCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update conversation with leadId
    if (conversationId) {
      await updateDoc(doc(db, 'aiConversations', conversationId), {
        leadId: leadRef.id,
        status: 'CONVERTED',
        updatedAt: serverTimestamp()
      });
    }

    return { status: "success", leadId: leadRef.id, message: "Lead criado com sucesso no CRM." };
  } catch (error: any) {
    console.error("Error creating lead via AI:", error);
    return { status: "error", message: error.message };
  }
}

async function executePropertySearch(filters: any) {
  let q = query(collection(db, 'properties'), where('status', '==', 'AVAILABLE'));

  if (filters.purpose) {
    q = query(q, where('purpose', '==', filters.purpose));
  }
  
  if (filters.propertyType) {
    q = query(q, where('propertyType', '==', filters.propertyType));
  }
  
  if (filters.maxPrice) {
    q = query(q, where('price', '<=', filters.maxPrice));
  }
  
  if (filters.minPrice) {
    q = query(q, where('price', '>=', filters.minPrice));
  }
  
  if (filters.city) {
    q = query(q, where('city', '==', filters.city));
  }

  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Post-filtering for values Firestore doesn't handle well in complex queries without indices
  if (filters.bedrooms) {
    results = results.filter((p: any) => p.bedrooms >= filters.bedrooms);
  }
  
  if (filters.bathrooms) {
    results = results.filter((p: any) => p.bathrooms >= filters.bathrooms);
  }

  if (filters.parkingSpaces) {
    results = results.filter((p: any) => p.parkingSpaces >= filters.parkingSpaces);
  }

  if (filters.features && filters.features.length > 0) {
    results = results.filter((p: any) => 
      filters.features.every((f: string) => p.features?.includes(f))
    );
  }

  return results.slice(0, 5); // Return top 5 matches
}

export async function generatePropertyDescription(propertyData: any) {
  const model = ai.models.generateContent({
    model: "gemini-3.8-flash",
    config: {
      systemInstruction: "Você é um redator imobiliário sênior. Crie descrições profissionais, persuasivas e honestas baseadas EXCLUSIVAMENTE nos dados técnicos fornecidos. Não invente características inexistentes.",
    },
    contents: `Gere uma descrição profissional para este imóvel:
${JSON.stringify(propertyData, null, 2)}

Retorne um JSON com os campos: title, shortDescription, longDescription, highlights (array de strings).`
  });

  return (await model).text;
}

export async function summarizeConversation(messages: any[]) {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "Resuma a conversa entre o assistente de IA e o cliente, destacando: Intenção, Orçamento, Localização Preferida, Perfil do Imóvel e Próximos Passos Sugeridos.",
    },
    contents: `Resuma esta conversa para o corretor:
${JSON.stringify(messages, null, 2)}`
  });

  return (await model).text;
}
