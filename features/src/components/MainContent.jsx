import { useEffect, useMemo, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import AnalysisResultCard from './AnalysisResultCard.jsx'

// B PLANI HAVUZU
const FALLBACK_SCENARIOS = [
  { id: 1, icon: "📞", title: "\"Polisim, Adınız Terör Örgütüne Karıştı\"", desc: "Dolandırıcılar telefonda polis veya savcı taklidi yapar.", action: "Telefonu hemen kapatın.", bg: "bg-red-50", border: "border-red-500", titleColor: "text-red-900", actionColor: "text-red-700" },
  { id: 2, icon: "💬", title: "\"Oyun Hesabın Kapatılacak!\"", desc: "Oyun içi sahte yetkili mesajı.", action: "Linke tıklamadan ailenize gösterin.", bg: "bg-amber-50", border: "border-amber-500", titleColor: "text-amber-900", actionColor: "text-amber-700" }
]
const FALLBACK_LAWS = [
  { id: 1, icon: "⚖️", title: "Siber Zorbalık Suçtur!", desc: "İnternetten hakaret etmek veya tehdit etmek hapis cezası gerektirebilir." },
  { id: 2, icon: "🔐", title: "KVKK (Kişisel Veriler)", desc: "Kimse izniniz olmadan verilerinizi kaydedemez ve paylaşamaz." }
]

// YENİ: CANLI RADAR VERİLERİ
const THREATS_CHILD = [
  "🚨 'Bedava oyun parası' linklerine dikkat!",
  "⚠️ Tanımadığın kişilerden gelen mesajları açma.",
  "🛑 Oyunlarda şifreni en yakın arkadaşına bile verme!",
  "🕵️‍♀️ Biri seni rahatsız ederse hemen ailene haber ver."
]

const THREATS_ELDERLY = [
  "🚨 PTT Kargo taklidi yapan sahte SMS'ler arttı!",
  "⚠️ 'Polisim, savcıyım' diyerek para isteyenlere inanmayın.",
  "🛑 Banka şifrenizi telefonda kimseye söylemeyin.",
  "🕵️‍♀️ E-Devlet görünümlü sahte sitelere dikkat edin."
]

export default function MainContent() {
  const [mode, setMode] = useState(null)
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [resultStatus, setResultStatus] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [resultReasons, setResultReasons] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [autoNotified, setAutoNotified] = useState(false)

  // Radar Animasyonu İçin State
  const [radarIndex, setRadarIndex] = useState(0)

  // Eğitim Modülü State'leri
  const [eduTab, setEduTab] = useState('scenarios')
  const [quizData, setQuizData] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [currentScenarios, setCurrentScenarios] = useState([])
  const [currentLaws, setCurrentLaws] = useState([])
  const [isEduLoading, setIsEduLoading] = useState(false)

  const ERROR_MESSAGE = 'Üzgünüm, şu an analiz yapamıyorum. Lütfen internet bağlantını kontrol et.'
  const getGenAI = () => new (import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (!imagePreviewUrl) return
    return () => URL.revokeObjectURL(imagePreviewUrl)
  }, [imagePreviewUrl])

  // YENİ: Radarı saniyede bir döndüren animasyon efekti
  useEffect(() => {
    if (mode === 'child' || mode === 'elderly') {
      const interval = setInterval(() => {
        setRadarIndex((prev) => (prev + 1) % 4) // 4 mesaj arasında döner
      }, 3500) // Her 3.5 saniyede bir değişir
      return () => clearInterval(interval)
    }
  }, [mode])

  async function fetchDynamicEduContent(type) {
    setIsEduLoading(true)
    try {
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      if (type === 'scenarios') {
        const prompt = `Şu an internette sıkça rastlanan, BİRBİRİNDEN ÇOK FARKLI 2 güncel siber dolandırıcılık veya zorbalık senaryosu (örn: yapay zeka ses taklidi, sahte kargo vb.) üret. SADECE JSON dizisi dön:
        [{"id": 1, "icon": "🚨", "title": "Başlık", "desc": "Olayın açıklaması", "action": "Ne yapılmalı?", "bg": "bg-red-50", "border": "border-red-500", "titleColor": "text-red-900", "actionColor": "text-red-700"}]`
        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        const jsonStr = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)
        setCurrentScenarios(JSON.parse(jsonStr))
      } else {
        const prompt = `Siber güvenlik, KVKK veya dijital haklar konusunda BİRBİRİNDEN ÇOK FARKLI 2 güncel yasa veya kural üret. SADECE JSON dizisi dön:
        [{"id": 1, "icon": "⚖️", "title": "Kural Başlığı", "desc": "Kısa ve net açıklaması"}]`
        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        const jsonStr = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)
        setCurrentLaws(JSON.parse(jsonStr))
      }
    } catch (e) {
      console.warn("YZ içeriği üretemedi, B planına geçildi.", e)
      if (type === 'scenarios') setCurrentScenarios(FALLBACK_SCENARIOS)
      else setCurrentLaws(FALLBACK_LAWS)
    } finally {
      setIsEduLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'education') {
      setEduTab('scenarios')
      setQuizData(null)
      setSelectedAnswer(null)
      fetchDynamicEduContent('scenarios')
      fetchDynamicEduContent('laws')
    }
  }, [mode])

  const canAnalyze = useMemo(() => text.trim().length > 0 || Boolean(imageFile), [text, imageFile])

  function onSelectImage(e) {
    const file = e.target.files?.[0] || null
    setImageFile(file); if (file) setImagePreviewUrl(URL.createObjectURL(file))
    resetResults()
  }

  function resetResults() {
    setResultStatus(null); setResultMessage(''); setResultReasons([]); setAutoNotified(false)
  }

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return alert("Tarayıcı desteği yok.")
    const recognition = new SpeechRecognition()
    recognition.lang = 'tr-TR'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => setText((p) => p + (p ? ' ' : '') + event.results[0][0].transcript)
    recognition.start()
  }

  async function fileToGenerativePart(file) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file)
    })
    return { inlineData: { data: dataUrl.split(',')[1], mimeType: file.type || 'image/jpeg' } }
  }

  async function analyzeWithGemini() {
    try {
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const elderlyPrompt = "Sen yaşlılar için şefkatli bir asistanısın. 'mesaj' kısmında SADECE 2-3 cümlelik çok sade bir özet yaz. 'nedenler' listesi BOŞ olsun."
      const childPrompt = "Sen çocuklar için siber güvenlik ablasısın. 'mesaj' kısmında kısa bir uyarı geç. 'nedenler' kısmında 2 teknik madde yaz."

      const prompt = `${mode === 'child' ? childPrompt : elderlyPrompt}
      Format (JSON): {"durum": "guvenli" | "supheli" | "tehlikeli", "mesaj": "Anlatım", "nedenler": []}
      İçerik: ${text.trim() || 'Görsel yüklendi.'}`

      const parts = [prompt]
      if (imageFile) parts.push(await fileToGenerativePart(imageFile))
      const result = await model.generateContent(parts)
      const raw = result.response.text()
      const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    } catch (err) {
      console.error("Gemini Hatası:", err)
      throw new Error("Sistem şu an meşgul, lütfen birazdan tekrar deneyin.")
    }
  }

  async function generateQuiz() {
    setIsLoading(true); setQuizData(null); setSelectedAnswer(null)
    try {
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const prompt = `Çok güncel bir siber dolandırıcılık senaryosu ve çoktan seçmeli bir soru hazırla.
      Format JSON: {"senaryo": "...", "soru": "...", "secenekler": [{"id": "A", "metin": "..."}], "dogruCevapId": "A", "aciklama": "..."}`

      const result = await model.generateContent(prompt)
      const raw = result.response.text()
      setQuizData(JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)))
    } catch (err) {
      alert("Soru üretilemedi, tekrar deneyin.")
    } finally { setIsLoading(false) }
  }

  // --- ANA EKRAN (YENİLENMİŞ UI) ---
  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 mb-6 drop-shadow-sm tracking-tight">Dijital Dost</h2>
        <p className="text-2xl text-slate-600 mb-14 font-medium">Bugün kime yardımcı olalım? 🤝</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {/* Buton 1: Büyükler */}
          <button onClick={() => setMode('elderly')} className="group relative p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <span className="text-8xl block mb-6 transform group-hover:scale-110 transition-transform duration-300">👵</span>
              <span className="text-3xl font-black text-sky-900 leading-tight">Büyükler İçin<br />Koruma</span>
            </div>
          </button>

          {/* Buton 2: Çocuklar */}
          <button onClick={() => setMode('child')} className="group relative p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <span className="text-8xl block mb-6 transform group-hover:scale-110 transition-transform duration-300">🛡️</span>
              <span className="text-3xl font-black text-emerald-900 leading-tight">Çocuklar İçin<br />Kalkan</span>
            </div>
          </button>

          {/* Buton 3: Eğitim */}
          <button onClick={() => setMode('education')} className="group relative p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <span className="text-8xl block mb-6 transform group-hover:scale-110 transition-transform duration-300">📚</span>
              <span className="text-3xl font-black text-indigo-900 leading-tight">Eğitim &<br />Simülasyon</span>
            </div>
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'education') {
    return (
      <main className="flex-1 w-full animate-in fade-in duration-500">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <button onClick={() => setMode(null)} className="mb-6 text-slate-500 font-bold flex items-center gap-2 hover:text-indigo-700 transition-colors underline text-lg">← Ana Menüye Dön</button>

          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex border-b border-slate-100 flex-wrap bg-slate-50">
              <button onClick={() => setEduTab('scenarios')} className={`flex-1 py-5 font-black text-lg transition-all ${eduTab === 'scenarios' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-inner' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}>🎭 Örnek Senaryolar</button>
              <button onClick={() => setEduTab('laws')} className={`flex-1 py-5 font-black text-lg transition-all ${eduTab === 'laws' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-inner' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}>📖 Bilgi Bankası</button>
              <button onClick={() => setEduTab('quiz')} className={`flex-1 py-5 font-black text-lg transition-all ${eduTab === 'quiz' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-inner' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}>🧠 Canlı Test (YZ)</button>
            </div>

            <div className="p-8 sm:p-12 min-h-[400px] relative">
              {isEduLoading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-6xl mb-4 animate-bounce">🤖</span>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse">Yapay Zeka İçerik Üretiyor...</p>
                  </div>
                </div>
              )}

              {eduTab === 'scenarios' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <h3 className="text-3xl font-black text-indigo-900 mb-8 flex items-center gap-3">
                    <span className="p-2 bg-indigo-100 rounded-lg">🎯</span> Canlı Senaryo Radarı
                  </h3>
                  {currentScenarios.map((item, idx) => (
                    <div key={idx} className={`${item.bg} p-8 rounded-3xl border border-white shadow-md hover:shadow-lg transition-shadow relative overflow-hidden`}>
                      <div className={`absolute top-0 left-0 w-2 h-full ${item.border} bg-current`}></div>
                      <h4 className={`font-black text-2xl ${item.titleColor} mb-3 flex items-center gap-2`}>{item.icon} {item.title}</h4>
                      <p className="text-slate-700 mb-4 text-xl leading-relaxed">{item.desc}</p>
                      <div className={`inline-block px-4 py-2 rounded-xl bg-white/60 font-black text-lg ${item.actionColor}`}>Doğru Hamle: {item.action}</div>
                    </div>
                  ))}
                  <button onClick={() => fetchDynamicEduContent('scenarios')} disabled={isEduLoading} className="w-full sm:w-auto bg-slate-100 text-indigo-700 font-black py-4 px-8 rounded-2xl hover:bg-indigo-50 transition-colors mt-6 flex items-center justify-center gap-3 text-lg">
                    <span className="animate-spin-slow">🔄</span> YZ ile Yeni Senaryolar Üret
                  </button>
                </div>
              )}

              {eduTab === 'laws' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <h3 className="text-3xl font-black text-indigo-900 mb-8 flex items-center gap-3">
                    <span className="p-2 bg-indigo-100 rounded-lg">⚖️</span> Siber Haklarımız
                  </h3>
                  <div className="grid gap-6">
                    {currentLaws.map((item, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                        <h4 className="font-black text-2xl text-slate-800 mb-3 flex items-center gap-2">{item.icon} {item.title}</h4>
                        <p className="text-slate-600 leading-relaxed text-xl">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => fetchDynamicEduContent('laws')} disabled={isEduLoading} className="w-full sm:w-auto bg-slate-100 text-indigo-700 font-black py-4 px-8 rounded-2xl hover:bg-indigo-50 transition-colors mt-6 flex items-center justify-center gap-3 text-lg">
                    <span className="animate-spin-slow">🔄</span> YZ ile Yeni Bilgiler Üret
                  </button>
                </div>
              )}

              {eduTab === 'quiz' && (
                <div className="animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-10">
                    <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">Siber Zekanı Test Et</h3>
                    <p className="text-slate-500 text-xl font-medium">Yapay zeka senin için anlık bir siber güvenlik olayı kurgulayacak.</p>
                  </div>

                  {!quizData ? (
                    <button onClick={generateQuiz} disabled={isLoading} className="mx-auto flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-2xl py-6 px-12 rounded-[2rem] hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50">
                      {isLoading ? 'Senaryo Üretiliyor...' : <>YENİ SENARYO GETİR <span className="text-3xl">🚀</span></>}
                    </button>
                  ) : (
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-wider">Olay:</h4>
                        <p className="text-2xl font-bold text-slate-800 leading-relaxed">{quizData.senaryo}</p>
                      </div>

                      <h4 className="text-2xl font-black text-indigo-900 mb-6">{quizData.soru}</h4>
                      <div className="space-y-4">
                        {quizData.secenekler.map((secenek) => {
                          const isSelected = selectedAnswer === secenek.id;
                          const isCorrect = secenek.id === quizData.dogruCevapId;
                          const showResult = selectedAnswer !== null;

                          let btnClass = "w-full text-left p-6 rounded-2xl font-bold text-xl border-2 transition-all "
                          if (!showResult) btnClass += "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50"
                          else {
                            if (isCorrect) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md"
                            else if (isSelected) btnClass += "bg-red-50 border-red-500 text-red-900 shadow-md"
                            else btnClass += "bg-white border-slate-100 text-slate-400"
                          }

                          return (
                            <button key={secenek.id} disabled={showResult} onClick={() => setSelectedAnswer(secenek.id)} className={btnClass}>
                              <span className="font-black mr-4 opacity-50">{secenek.id})</span> {secenek.metin}
                            </button>
                          )
                        })}
                      </div>

                      {selectedAnswer && (
                        <div className={`mt-10 p-8 rounded-3xl border-2 animate-in slide-in-from-bottom-4 ${selectedAnswer === quizData.dogruCevapId ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                          <h4 className={`font-black text-3xl mb-4 flex items-center gap-3 ${selectedAnswer === quizData.dogruCevapId ? 'text-emerald-700' : 'text-red-700'}`}>
                            {selectedAnswer === quizData.dogruCevapId ? '🎉 Harika, Doğru Bildin!' : '🚨 Yanlış Hamle! Tuzağa Düştün.'}
                          </h4>
                          <p className="text-xl text-slate-700 leading-relaxed mb-8">{quizData.aciklama}</p>
                          <button onClick={generateQuiz} className="bg-slate-800 text-white font-black py-4 px-8 rounded-2xl hover:bg-black transition-colors text-lg">Başka Soru Çöz</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ANALİZ EKRANI (YENİLENMİŞ UI VE CANLI RADAR)
  const isChild = mode === 'child';
  const currentRadarText = isChild ? THREATS_CHILD[radarIndex] : THREATS_ELDERLY[radarIndex];

  return (
    <main className="flex-1 w-full animate-in fade-in duration-500">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <button onClick={() => { setMode(null); resetResults(); setText('') }} className="mb-8 text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-colors text-lg">
          <span className="text-2xl">←</span> Ana Menüye Dön
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Sol Taraf: Analiz Bölümü */}
          <div className="lg:col-span-3">
            <section className={`bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-slate-100 relative overflow-hidden`}>
              {/* Dekoratif Arka Plan Parıltısı */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${isChild ? 'bg-emerald-400' : 'bg-sky-400'}`}></div>

              <h2 className={`text-4xl font-black mb-8 relative z-10 flex items-center gap-4 ${isChild ? 'text-emerald-900' : 'text-sky-900'}`}>
                <span className="text-5xl">{isChild ? '🛡️' : '🔍'}</span>
                {isChild ? 'Siber Kalkan Aktif' : 'Güvenli Analiz Odası'}
              </h2>

              <div className="space-y-6 relative z-10">
                <textarea
                  className="w-full min-h-[180px] p-6 text-2xl rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none transition-all resize-none shadow-inner"
                  placeholder="Şüpheli mesajı buraya yapıştır veya fotoğrafını yükle..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="flex gap-4">
                  <button onClick={handleListen} className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <span className="text-2xl">{isListening ? '🛑' : '🎤'}</span> {isListening ? 'Dinleniyor...' : 'Sesle Yaz'}
                  </button>
                  <div className={`flex-1 relative border-2 border-dashed rounded-2xl flex items-center justify-center transition-all cursor-pointer ${imageFile ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}>
                    <input type="file" accept="image/*" onChange={onSelectImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <p className={`font-black text-lg flex items-center gap-3 ${imageFile ? 'text-blue-600' : 'text-slate-500'}`}>
                      <span className="text-2xl">{imageFile ? '✅' : '📸'}</span> {imageFile ? 'Resim Hazır' : 'Fotoğraf Yükle'}
                    </p>
                  </div>
                </div>

                <button
                  disabled={!canAnalyze || isLoading}
                  onClick={async () => {
                    setIsLoading(true); resetResults();
                    try {
                      const res = await analyzeWithGemini()
                      setResultStatus(res.durum); setResultMessage(res.mesaj); setResultReasons(res.nedenler || [])
                      if (mode === 'child' && res.durum === 'tehlikeli') setAutoNotified(true)
                    } catch (e) { setResultMessage(e.message || ERROR_MESSAGE) } finally { setIsLoading(false) }
                  }}
                  className={`w-full py-6 rounded-[2rem] font-black text-2xl text-white shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 ${isChild ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-sky-500 to-blue-600'}`}
                >
                  {isLoading ? (
                    <><span className="animate-spin text-3xl">⚙️</span> YAPAY ZEKA İNCELİYOR...</>
                  ) : (
                    <>ŞİMDİ İNCELE <span className="text-3xl">🚀</span></>
                  )}
                </button>
              </div>

              <div className="mt-12 relative z-10">
                {autoNotified && (
                  <div className="mb-8 bg-red-600 text-white p-8 rounded-[2rem] shadow-2xl border-4 border-red-500 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-3xl font-black flex items-center gap-3 mb-4">🚨 ACİL DURUM TESPİT EDİLDİ</h3>
                    <p className="text-xl font-medium mb-6 opacity-90">Bu içerik tehlikeli! Lütfen hemen ailene haber ver.</p>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🚨 ACİL DURUM: Dijital Dost, çocuğunuzun cihazında tehlikeli bir mesaj tespit etti!\n\n*İncelenen:* "${text}"\n*Analiz:* ${resultMessage}`)}`, '_blank')} className="w-full bg-white text-red-700 font-black py-5 rounded-2xl text-2xl hover:bg-red-50 transition-all shadow-lg flex items-center justify-center gap-3">
                      📱 AİLEME HEMEN HABER VER
                    </button>
                  </div>
                )}
                <AnalysisResultCard status={resultStatus} message={resultMessage} originalText={text} nedenler={resultReasons} mode={mode} />
              </div>
            </section>
          </div>

          {/* Sağ Taraf: Canlı Tehdit Radarı */}
          <aside className="lg:col-span-1">
            <div className={`p-8 rounded-[2.5rem] shadow-xl border border-slate-100 ${isChild ? 'bg-gradient-to-b from-emerald-50 to-white' : 'bg-gradient-to-b from-sky-50 to-white'} h-full`}>
              <div className="flex items-center gap-3 mb-6">
                {/* Yanıp sönen radar ledi */}
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
                <h3 className="font-black text-2xl text-slate-800">Canlı Radar</h3>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden min-h-[160px] flex items-center justify-center text-center">
                {/* Tarayıcı animasyonu çizgisi */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50 animate-[pulse_2s_ease-in-out_infinite]"></div>

                {/* Değişen metin (Fade animasyonlu) */}
                <p key={radarIndex} className="text-slate-700 text-lg font-bold animate-in fade-in zoom-in-95 duration-500">
                  {currentRadarText}
                </p>
              </div>
              <p className="text-center text-slate-400 font-medium text-sm mt-6 flex items-center justify-center gap-2">
                <span className="animate-spin-slow">📡</span> Bölge taranıyor...
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}