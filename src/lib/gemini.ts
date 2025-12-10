const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = process.env.GEMINI_API_URL

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export async function generateWithGemini(
  prompt: string,
  model = 'gemini-2.5-flash'
) {
  try {
    // Validate environment variables
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    if (!GEMINI_API_URL) {
      throw new Error('GEMINI_API_URL is not configured')
    }

    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response:', errorText)
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data: GeminiResponse = await response.json()

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API')
    }

    let generatedText = data.candidates[0]?.content?.parts[0]?.text || ''

    // Clean up the response
    generatedText = generatedText
      .trim()
      .replace(/^['"""']|['"""']$/g, '') // Remove quotes
      .replace(/\n+/g, ' ') // Replace multiple newlines with space
      .trim()

    if (!generatedText) {
      throw new Error('Empty response from Gemini API')
    }

    return generatedText
  } catch (error) {
    console.error('Gemini API Error:', error)
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`)
    }
    throw error
  }
}
