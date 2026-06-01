const supportTopics = {
  beginner: ['duygu farkındalığı', 'kısa nefes egzersizi', 'günlük takip'],
  intermediate: ['tetikleyici analizi', 'düşünce kaydı', 'seans hazırlığı'],
  advanced: ['kriz planı hatırlatması', 'destek ağı aktivasyonu', 'profesyonel görüşmeye hazırlık']
};

function localPlan({ goal, level, weeklyHours }) {
  // API anahtarı yokken demo kırılmasın diye yerel iyi oluş planlayıcı kullanılır.
  // Cevap formatı gerçek AI cevabıyla aynı tutulur.
  const hours = Number(weeklyHours || 4);
  const daily = Math.max(10, Math.round((hours * 60) / 5));
  const topics = supportTopics[level] || supportTopics.intermediate;

  return {
    provider: 'Local Klinik',
    title: `${goal} için 7 günlük iyi oluş destek planı`,
    overview:
      `Bu plan tanı koymaz; ${goal} konusu için haftada yaklaşık ${hours} saatlik güvenli ` +
      'farkındalık, seans hazırlığı ve öz bakım adımları önerir.',
    days: [
      `Gün 1: ${topics[0]} için ${daily} dakika ayır, o gün en baskın 3 duygunu not et.`,
      `Gün 2: ${topics[1]} uygula ve öncesi/sonrası beden duyumlarını kısa yaz.`,
      'Gün 3: Zorlayan düşünceyi tek cümleyle yaz, kanıtlar ve alternatif düşünce notu ekle.',
      `Gün 4: ${topics[2]} için psikoloğa sormak istediğin 3 soruyu hazırla.`,
      'Gün 5: Küçük bir öz bakım aktivitesi seç; yürüyüş, uyku rutini veya dijital mola olabilir.',
      'Gün 6: Destek alabileceğin bir kişi veya profesyonel kaynak listesini güncelle.',
      'Gün 7: Haftanın kısa değerlendirmesini yaz ve bir sonraki seans için öncelikli konuyu belirle.'
    ],
    tips: [
      'Bu plan klinik tanı veya tedavi yerine geçmez.',
      'Kendine zarar verme düşüncesi varsa acil destek hattı veya en yakın sağlık kuruluşuna başvur.',
      'Notları psikolog görüşmesine hazırlık amacıyla kullan.'
    ]
  };
}

function parseGeminiJson(text) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

function safePlanShape(parsed, fallback, provider) {
  const days = Array.isArray(parsed.days) && parsed.days.length
    ? parsed.days.map((item) => String(item)).slice(0, 7)
    : fallback.days;
  const tips = Array.isArray(parsed.tips) && parsed.tips.length
    ? parsed.tips.map((item) => String(item)).slice(0, 4)
    : fallback.tips;

  return {
    provider,
    title: String(parsed.title || fallback.title),
    overview: String(parsed.overview || fallback.overview),
    days,
    tips
  };
}

async function generateWithGemini(input, fallback) {
  if (!process.env.GEMINI_API_KEY) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const prompt = [
    'Türkçe cevap ver.',
    'Klinik tanı koyma, ilaç veya kesin tedavi iddiası verme.',
    'Danışanın adı, e-posta adresi, telefonu gibi kişisel bilgileri kullanma.',
    'Yalnızca şu JSON formatında dön:',
    '{"title":"kısa başlık","overview":"doktor için kısa klinik özet","days":["madde 1","madde 2","madde 3"],"tips":["uyarı 1","uyarı 2"]}',
    `Analiz konusu: ${input.goal}`,
    `Destek seviyesi: ${input.level}`,
    `Haftalık süre: ${input.weeklyHours} saat`
  ].join('\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return safePlanShape(parseGeminiJson(raw), fallback, `Gemini ${model}`);
}

async function generateWithHuggingFace(input, fallback) {
  if (!process.env.HF_API_TOKEN) return null;

  const prompt =
    `Türkçe cevap ver. Tanı koymadan ve tıbbi iddia sunmadan, ${input.goal} konusu için ` +
    `${input.level} destek seviyesinde, haftada ${input.weeklyHours} saat ayırabilecek bir danışana ` +
    '7 günlük psikolojik iyi oluş ve seans hazırlık planı üret.';

  const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-large', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt })
  });

  if (!response.ok) throw new Error(`HF request failed: ${response.status}`);

  const data = await response.json();
  const text = data?.[0]?.generated_text || '';
  if (!text) return null;

  return {
    ...fallback,
    provider: 'HuggingFace flan-t5-large',
    overview: text
  };
}

export async function generateStudyPlan(input) {
  const fallback = localPlan(input);

  try {
    const geminiPlan = await generateWithGemini(input, fallback);
    if (geminiPlan) return geminiPlan;
  } catch (error) {
    console.warn(error.message);
  }

  try {
    const hfPlan = await generateWithHuggingFace(input, fallback);
    if (hfPlan) return hfPlan;
  } catch (error) {
    console.warn(error.message);
  }

  return fallback;
}
