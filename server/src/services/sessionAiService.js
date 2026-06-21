function localSessionAnalysis(notes) {
  const clean = String(notes || '').replace(/\s+/g, ' ').trim();
  const lower = clean.toLocaleLowerCase('tr-TR');
  const focusAreas = [];

  if (/kayg|anksiyete|stres|panik/.test(lower)) focusAreas.push('Kaygı ve stres yönetimi');
  if (/ilişki|eş|partner|aile|iletişim/.test(lower)) focusAreas.push('İlişki ve iletişim temaları');
  if (/uyku|iştah|yorgun|enerji/.test(lower)) focusAreas.push('Günlük işlevsellik ve beden belirtileri');
  if (/özgüven|değer|suçluluk|utanç/.test(lower)) focusAreas.push('Benlik algısı ve öz şefkat');

  return {
    provider: 'Yerel AI yedek analizi',
    summary: clean
      ? `Seans notlarında öne çıkan ana tema: ${focusAreas[0] || 'duygusal süreçlerin takip edilmesi'}. Notlar bir sonraki görüşmede süreklilik için kullanılabilir.`
      : 'Analiz için yeterli seans notu bulunamadı.',
    riskLevel: /kendime zarar|intihar|ölmek|zarar vermek/.test(lower) ? 'Yakın klinik takip önerilir' : 'Rutin takip',
    focusAreas: focusAreas.length ? focusAreas : ['Duygu düzenleme', 'Terapi hedeflerini netleştirme'],
    nextSessionSuggestions: [
      'Bir sonraki seansta haftalık değişimleri kısa örneklerle değerlendirin.',
      'Danışanın güçlü kaldığı anları ve zorlandığı tetikleyicileri ayırın.',
      'Ev ödevi veya küçük takip hedefi belirleyin.'
    ],
    privacyNote: 'Danışan adı AI isteğine dahil edilmedi; analiz yalnızca seans notlarından üretildi.'
  };
}

function parseGeminiJson(text) {
  return JSON.parse(String(text || '').replace(/```json|```/g, '').trim());
}

function requestTimeout(ms = 9000) {
  return AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined;
}

export async function analyzeSessionNotes(notes) {
  const cleanedNotes = String(notes || '').replace(/\s+/g, ' ').trim();
  const fallback = localSessionAnalysis(cleanedNotes);

  if (!process.env.GEMINI_API_KEY) return fallback;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const prompt = [
      'Bir psikolog seans notunu Türkçe analiz et.',
      'Danışanın adı, telefonu veya e-postası yok. Kişisel veri üretme.',
      'Yalnızca verilen anonim notlara dayan. Notta olmayan terapi türünü, ilişki durumunu, gelişimi veya risk bilgisini uydurma.',
      'Notlar yetersizse bunu açıkça söyle ve kısa kal.',
      'Yalnızca JSON döndür: {"summary":"kısa klinik özet","riskLevel":"rutin takip veya yakın klinik takip önerilir","focusAreas":["alan"],"nextSessionSuggestions":["öneri"],"privacyNote":"kısa not"}',
      `Anonim seans notları: ${cleanedNotes}`
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

    return {
      provider: `Gemini ${model}`,
      summary: String(parsed.summary || fallback.summary),
      riskLevel: String(parsed.riskLevel || fallback.riskLevel),
      focusAreas: Array.isArray(parsed.focusAreas) && parsed.focusAreas.length ? parsed.focusAreas.slice(0, 5) : fallback.focusAreas,
      nextSessionSuggestions: Array.isArray(parsed.nextSessionSuggestions) && parsed.nextSessionSuggestions.length
        ? parsed.nextSessionSuggestions.slice(0, 5)
        : fallback.nextSessionSuggestions,
      privacyNote: String(parsed.privacyNote || fallback.privacyNote)
    };
  } catch (error) {
    console.warn(error.message);
    return fallback;
  }
}
