import rateLimit from 'express-rate-limit'

export const aiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { error: 'Too many AI requests — please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const referenceRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  message: { error: 'Too many reference requests — please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const plagiarismRateLimit = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: { error: 'Too many plagiarism checks — please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
})
