import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const MODEL  = 'gemini-2.5-flash'

export type AiCommand = 'suggest' | 'rephrase' | 'humanize' | 'expand' | 'summarize' | 'grammar' | 'formal' | 'clarity' | 'cite'

// Per-command temperature — creative/humanize tasks need higher variance;
// correction tasks (grammar, clarity) need precision.
const TEMPERATURES: Record<AiCommand, number> = {
  suggest:   0.80,
  rephrase:  0.70,
  humanize:  0.90,  // high variance gives more natural unpredictability
  expand:    0.75,
  summarize: 0.50,
  grammar:   0.25,  // low — corrections should be deterministic
  formal:    0.55,
  clarity:   0.40,
  cite:      0.60,
}

const PROMPTS: Record<AiCommand, string> = {
  suggest:
    "You are an academic writing assistant. Continue the text below naturally, matching the author's style and register. Write 2-4 sentences. Return only the continuation — no preamble.",

  rephrase:
    'You are an academic writing assistant. Rephrase the text below to improve clarity and flow while preserving meaning. Return only the rephrased text.',

  humanize: `\
You are an expert editor who rewrites AI-generated academic text so it reads as though a knowledgeable human wrote it. \
Apply every rule below without exception.

RULES:
1. SENTENCE LENGTH VARIATION — alternate aggressively between short sentences (5-12 words) and long, complex ones (25-45 words). \
   No three consecutive sentences may be the same approximate length.
2. BANNED WORDS — never use any of the following: \
   delve, elucidate, paramount, leverage, underscore, pivotal, embark, foster, facilitate, utilise, \
   multifaceted, nuanced, robust, comprehensive, meticulous, commendable, noteworthy, realm, \
   it is worth noting, it is important to note, it is essential to, furthermore (use "also" or restructure), \
   thus (use "so" or reorder), hence, aforementioned, in conclusion (as a sentence opener).
3. VARIED SENTENCE OPENINGS — never start two consecutive sentences with the same word. \
   Mix subject-first, prepositional, adverbial, and subordinate-clause openers.
4. ACTIVE VOICE — rewrite passive constructions as active wherever it sounds natural.
5. HUMAN TEXTURE — add one or two of: a parenthetical aside (like this one), an em-dash interruption — \
   the kind a writer uses mid-thought — or a brief rhetorical question. Use sparingly.
6. CONTRACTIONS — use them in explanatory or argumentative passages where they don't undermine formality: \
   "it's", "doesn't", "they're", "isn't", "can't".
7. PRESERVE — keep all citations, technical terminology, field-specific vocabulary, and numerical data exactly as written.

Return ONLY the rewritten text. No commentary, no preamble, no explanation.`,

  expand:
    'You are an academic writing assistant. Expand the text below with supporting detail or elaboration. Return only the expanded text.',

  summarize:
    'You are an academic writing assistant. Summarise the text below concisely, preserving key points. Return only the summary.',

  grammar:
    'You are an academic writing assistant. Fix grammar, punctuation and style issues in the text below. Return only the corrected text.',

  formal:
    'You are an academic writing assistant. Rewrite the text below in a more formal, academic register. Return only the rewritten text.',

  clarity:
    'You are an academic writing assistant. Rewrite the text below for maximum clarity and precision. Return only the rewritten text.',

  cite:
    'You are an academic writing assistant. Write 1–3 sentences that incorporate the reference described below into academic prose. Place the exact token [CITE] at the very end of the last sentence, immediately before the full stop. Use only information from the provided content — do not fabricate details. Return only the sentences, nothing else.',
}

export async function runAiCommand(
  command: AiCommand,
  text: string,
  context?: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: TEMPERATURES[command],
    },
  })

  const contextNote = context
    ? `\n\nSurrounding document context (reference only — do not reproduce):\n${context.slice(0, 500)}`
    : ''
  const prompt = `${PROMPTS[command]}${contextNote}\n\nText:\n${text}`
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

export async function chatWithAi(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : ('user' as const),
    parts: [{ text: m.content }],
  }))

  const last = messages.at(-1)
  if (!last) throw new Error('No messages provided')

  const model = genAI.getGenerativeModel({ model: MODEL })
  const session = model.startChat({ history })
  const result = await session.sendMessage(last.content)
  return result.response.text().trim()
}
