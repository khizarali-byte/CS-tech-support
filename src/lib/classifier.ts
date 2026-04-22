import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const client = new Anthropic()

export async function classifySession(sessionId: string, rootCause?: string | null, resolution?: string | null): Promise<void> {
  if (!rootCause?.trim() && !resolution?.trim()) return

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 128,
      system: 'You classify tech support session notes into short 2-5 word patterns. Always respond with valid JSON only, no extra text.',
      messages: [
        {
          role: 'user',
          content: `Summarise these session notes into 2-5 word patterns.
Root cause: ${rootCause || 'N/A'}
Resolution: ${resolution || 'N/A'}

Respond with exactly this JSON shape:
{"issuePattern": "<2-5 words>", "resolutionPattern": "<2-5 words>"}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const parsed = JSON.parse(raw) as { issuePattern?: string; resolutionPattern?: string }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        issuePattern:      parsed.issuePattern?.slice(0, 80)      ?? null,
        resolutionPattern: parsed.resolutionPattern?.slice(0, 80) ?? null,
      },
    })
  } catch {
    // Classification is best-effort — never surface errors to callers
  }
}
