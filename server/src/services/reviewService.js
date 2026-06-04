const positiveWords = ['iyi', 'güven', 'rahat', 'memnun', 'faydalı', 'anlaşılmış', 'profesyonel', 'teşekkür', 'harika'];
const negativeWords = ['kötü', 'zor', 'memnun değil', 'yetersiz', 'geç', 'sorun', 'rahatsız'];

function tidyReview(text) {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bi\b/g, 'ı')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/^./, (char) => char.toLocaleUpperCase('tr-TR'));
}

function localReviewAnalysis(text) {
  const lower = String(text || '').toLocaleLowerCase('tr-TR');
  const positive = positiveWords.filter((word) => lower.includes(word)).length;
  const negative = negativeWords.filter((word) => lower.includes(word)).length;
  const raw = 4 + positive * 0.35 - negative * 0.7;
  const stars = Math.max(1, Math.min(5, Math.round(raw)));

  return {
    provider: 'Local Review AI',
    stars,
    summary:
      stars >= 4
        ? 'Yorum genel olarak olumlu; güven, fayda veya memnuniyet vurgusu taşıyor.'
        : 'Yorumda geliştirilmesi gereken noktalar olabilir; doktor panelinde incelenmeli.'
  };
}

function parseGeminiJson(text) {
  return JSON.parse(String(text || '').replace(/```json|```/g, '').trim());
}

function requestTimeout(ms = 8000) {
  return AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined;
}

export async function analyzeReview(text) {
  const cleanedText = tidyReview(text);

  if (!process.env.GEMINI_API_KEY) {
    return { ...localReviewAnalysis(cleanedText), cleanedText };
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const prompt = [
      'Türkçe bir terapi deneyimi yorumunu analiz et.',
      'Yalnızca JSON döndür: {"stars":1-5,"summary":"kısa özet","cleanedText":"minimal yazım düzeltmeli yorum"}',
      'Yorumu abartma, anlamını değiştirme, sadece bariz yazım ve boşluk hatalarını düzelt.',
      `Yorum: ${cleanedText}`
    ].join('\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: requestTimeout(),
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseGeminiJson(raw);
    const stars = Math.max(1, Math.min(5, Math.round(Number(parsed.stars) || 4)));

    return {
      provider: `Gemini ${model}`,
      stars,
      summary: String(parsed.summary || 'Yorum AI tarafından analiz edildi.'),
      cleanedText: String(parsed.cleanedText || cleanedText)
    };
  } catch (error) {
    console.warn(error.message);
    return { ...localReviewAnalysis(cleanedText), cleanedText };
  }
}
