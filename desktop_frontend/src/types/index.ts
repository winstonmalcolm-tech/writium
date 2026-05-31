export type Theme = 'light' | 'dark'
export type PageSize = 'a4' | 'letter' | 'legal' | 'a3'
export type CitationStyle =
  | 'apa7' | 'apa6'
  | 'mla9' | 'mla8'
  | 'chicago-nb' | 'chicago-ad'
  | 'harvard' | 'ieee'

export interface AppDocument {
  id: string
  title: string
  content: unknown
  updatedAt: Date
  wordCount: number
}

export interface Reference {
  id: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
  abstract?: string
  type: 'journal' | 'book' | 'conference' | 'web'
  url?: string
  volume?: string
  issue?: string
  pages?: string
  publisher?: string
}

export interface Citation {
  id: string
  referenceId: string
  documentId: string
  position: number
  style: CitationStyle
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface PlagiarismMatch {
  sourceUrl:   string
  sourceTitle: string
  similarity:  number
  matchedText: string
  isCited?:    boolean // true when the source is already in the user's reference library
}

export interface DocumentVersion {
  id: string
  documentId: string
  content: unknown
  wordCount: number
  createdAt: Date
}

export type RightPanelTab = 'ai' | 'references' | 'plagiarism'
