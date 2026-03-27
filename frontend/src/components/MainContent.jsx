import { useEffect, useMemo, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import AnalysisResultCard from './AnalysisResultCard.jsx'

// B PLANI HAVUZU (Sadece YZ kotası dolarsa devreye girer)
const FALLBACK_SCENARIOS = [
  { id: 1, icon: "📞", title: "\"Polisim, Adınız Terör Örgütüne Karıştı\"", desc: "Dolandırıcılar telefonda polis veya savcı taklidi yapar.", action: "Telefonu hemen kapatın.", bg: "bg-red-50", border: "border-red-500", titleColor: "text-red-900", actionColor: "text-red-700" },
  { id: 2, icon: "💬", title: "\"Oyun Hesabın Kapatılacak!\"", desc: "Oyun içi sahte yetkili mesajı.", action: "Linke tıklamadan ailenize gösterin.", bg: "bg-amber-50", border: "border-amber-500", titleColor: "text-amber-900", actionColor: "text-amber-700" }
]
const FALLBACK_LAWS = [
  { id: 1, icon: "⚖️", title: "Siber Zorbalık Suçtur!", desc: "İnternetten hakaret etmek veya tehdit etmek hapis cezası gerektirebilir." },
  { id: 2, icon: "🔐", title: "KVKK (Kişisel Veriler)", desc: "Kimse izniniz olmadan verilerinizi kaydedemez ve paylaşamaz." }
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

  // Eğitim Modülü State'leri
  const [eduTab, setEduTab] = useState('scenarios')
  const [quizData, setQuizData] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [currentScenarios, setCurrentScenarios] = useState([])
  const [currentLaws, setCurrentLaws] = useState([])
  const [isEduLoading, setIsEduLoading] = useState(false)

  const ERROR_MESSAGE = 'Üzgünüm, şu an analiz yapamıyorum. Lütfen internet bağlantını kontrol et.'

  // GÜVENLİK GÜNCELLEMESİ: API Anahtarını Netlify'ın güvenli kasasından çekiyoruz
  const getGenAI = () => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (!imagePreviewUrl) return
    return () => URL.revokeObjectURL(imagePreviewUrl)
  }, [imagePreviewUrl])

  // --- YAPAY ZEKA İLE SONSUZ İÇERİK ÜRETİCİSİ ---
  async function fetchDynamicEduContent(type) {
    setIsEduLoading(true)
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    try {
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
      console.warn("YZ içeriği üretemedi, B planına geçildi.")
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
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const elderlyPrompt = "Sen yaşlılar için şefkatli bir asistanısın. 'mesaj' kısmında SADECE 2-3 cümlelik çok sade bir özet yaz. 'nedenler' listesi BOŞ olsun."
    const childPrompt = "Sen çocuklar için siber güvenlik ablasısın. 'mesaj' kısmında kısa bir uyarı geç. 'nedenler' kısmında 2 teknik madde yaz."

    const prompt = `${mode === 'child' ? childPrompt : elderlyPrompt}
    Format (JSON): {"durum": "guvenli" | "supheli" | "tehlikeli", "mesaj": "Anlatım", "nedenler": []}
    İçerik: ${text.trim() || 'Görsel yüklendi.'}`

    try {
      const parts = [prompt]
      if (imageFile) parts.push(await fileToGenerativePart(imageFile))
      const result = await model.generateContent(parts)
      const raw = result.response.text()
      const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    } catch (err) {
      throw new Error("Sistem şu an meşgul, lütfen birazdan tekrar deneyin.")
    }
  }

  async function generateQuiz() {
    setIsLoading(true); setQuizData(null); setSelectedAnswer(null)
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Çok güncel bir siber dolandırıcılık senaryosu ve çoktan seçmeli bir soru hazırla.
    Format JSON: {"senaryo": "...", "soru": "...", "secenekler": [{"id": "A", "metin": "..."}], "dogruCevapId": "A", "aciklama": "..."}`

    try {
      const result = await model.generateContent(prompt)
      const raw = result.response.text()
      setQuizData(JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)))
    } catch (err) {
      alert("Soru üretilemedi, tekrar deneyin.")
    } finally { setIsLoading(false) }
  }

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h2 className="text-5xl font-extrabold text-sky-900 mb-6 italic">Dijital Dost</h2>
        <p className="text-2xl text-slate-700 mb-12">Bugün kime yardımcı olalım? 🤝</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <button onClick={() => setMode('elderly')} className="p-10 bg-white border-4 border-sky-200 rounded-[3rem] shadow-2xl hover:border-sky-500 transition-all">
            <span className="text-7xl block mb-6">👵</span>
            <span className="text-2xl font-black text-sky-900">Büyükler İçin<br />Koruma</span>
          </button>
          <button onClick={() => setMode('child')} className="p-10 bg-white border-4 border-emerald-200 rounded-[3rem] shadow-2xl hover:border-emerald-500 transition-all">
            <span className="text-7xl block mb-6">🛡️</span>
            <span className="text-2xl font-black text-emerald-900">Çocuklar İçin<br />Kalkan</span>
          </button>
          <button onClick={() => setMode('education')} className="p-10 bg-white border-4 border-indigo-200 rounded-[3rem] shadow-2xl hover:border-indigo-500 transition-all">
            <span className="text-7xl block mb-6">📚</span>
            <span className="text-2xl font-black text-indigo-900">Eğitim &<br />Simülasyon</span>
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

          <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl overflow-hidden">
            <div className="flex border-b-2 border-indigo-50 flex-wrap">
              <button onClick={() => setEduTab('scenarios')} className={`flex-1 py-4 font-black text-lg transition-colors ${eduTab === 'scenarios' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'}`}>🎭 Örnek Senaryolar</button>
              <button onClick={() => setEduTab('laws')} className={`flex-1 py-4 font-black text-lg transition-colors ${eduTab === 'laws' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'}`}>📖 Bilgi Bankası</button>
              <button onClick={() => setEduTab('quiz')} className={`flex-1 py-4 font-black text-lg transition-colors ${eduTab === 'quiz' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'}`}>🧠 Canlı Test (YZ)</button>
            </div>

            <div className="p-8 sm:p-12 min-h-[400px] relative">
              {isEduLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-b-[2.5rem]">
                  <p className="text-xl font-bold text-indigo-600 animate-pulse">🤖 Yapay Zeka İçerik Üretiyor...</p>
                </div>
              )}

              {eduTab === 'scenarios' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <h3 className="text-3xl font-black text-indigo-900 mb-6">Canlı Senaryo Radarı</h3>
                  {currentScenarios.map((item, idx) => (
                    <div key={idx} className={`${item.bg} p-6 rounded-2xl border-l-8 ${item.border} shadow-sm`}>
                      <h4 className={`font-bold text-xl ${item.titleColor} mb-2`}>{item.icon} {item.title}</h4>
                      <p className="text-slate-700 mb-3 text-lg">{item.desc}</p>
                      <p className={`font-black ${item.actionColor}`}>Doğru Hamle: {item.action}</p>
                    </div>
                  ))}
                  <button onClick={() => fetchDynamicEduContent('scenarios')} disabled={isEduLoading} className="text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all mt-4 inline-block flex items-center gap-2">
                    🔄 YZ ile Yeni Senaryolar Üret
                  </button>
                </div>
              )}

              {eduTab === 'laws' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <h3 className="text-3xl font-black text-indigo-900 mb-6">Siber Haklarımız ve Güvenlik</h3>
                  <div className="space-y-4">
                    {currentLaws.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                        <h4 className="font-bold text-xl text-slate-800 mb-2">{item.icon} {item.title}</h4>
                        <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => fetchDynamicEduContent('laws')} disabled={isEduLoading} className="text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all mt-4 inline-block flex items-center gap-2">
                    🔄 YZ ile Yeni Bilgiler Üret
                  </button>
                </div>
              )}

              {eduTab === 'quiz' && (
                <div className="animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-indigo-900 mb-4">Siber Güvenlik Zekanı Test Et</h3>
                    <p className="text-slate-600 text-lg">Yapay zeka senin için anlık bir dolandırıcılık senaryosu oluşturacak.</p>
                  </div>

                  {!quizData ? (
                    <button onClick={generateQuiz} disabled={isLoading} className="mx-auto block bg-indigo-600 text-white font-black text-2xl py-5 px-10 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50">
                      {isLoading ? 'Senaryo Üretiliyor...' : 'YENİ SENARYO GETİR 🚀'}
                    </button>
                  ) : (
                    <div className="bg-slate-50 p-8 rounded-3xl border-2 border-indigo-100">
                      <h4 className="text-xl font-bold text-slate-500 mb-2">Olay:</h4>
                      <p className="text-2xl font-medium text-slate-800 mb-8">{quizData.senaryo}</p>

                      <h4 className="text-xl font-bold text-indigo-900 mb-4">{quizData.soru}</h4>
                      <div className="space-y-3">
                        {quizData.secenekler.map((secenek) => {
                          const isSelected = selectedAnswer === secenek.id;
                          const isCorrect = secenek.id === quizData.dogruCevapId;
                          const showResult = selectedAnswer !== null;

                          let btnClass = "w-full text-left p-5 rounded-xl font-medium text-lg border-2 transition-all "
                          if (!showResult) btnClass += "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50"
                          else {
                            if (isCorrect) btnClass += "bg-emerald-100 border-emerald-500 text-emerald-900"
                            else if (isSelected) btnClass += "bg-red-100 border-red-500 text-red-900"
                            else btnClass += "bg-white border-slate-200 opacity-50"
                          }

                          return (
                            <button key={secenek.id} disabled={showResult} onClick={() => setSelectedAnswer(secenek.id)} className={btnClass}>
                              <span className="font-black mr-3">{secenek.id})</span> {secenek.metin}
                            </button>
                          )
                        })}
                      </div>

                      {selectedAnswer && (
                        <div className={`mt-8 p-6 rounded-2xl border-l-8 animate-in fade-in ${selectedAnswer === quizData.dogruCevapId ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
                          <h4 className="font-black text-2xl mb-2">{selectedAnswer === quizData.dogruCevapId ? '🎉 Tebrikler, Doğru Cevap!' : '🚨 Yanlış Hamle! Tuzağa Düştün.'}</h4>
                          <p className="text-lg text-slate-700">{quizData.aciklama}</p>
                          <button onClick={generateQuiz} className="mt-6 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700">Başka Soru Çöz</button>
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

  // ANALİZ EKRANI (Büyükler ve Çocuklar İçin)
  return (
    <main className="flex-1 w-full animate-in fade-in duration-500">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <button onClick={() => { setMode(null); resetResults(); setText('') }} className="mb-6 text-slate-500 font-bold flex items-center gap-2 hover:text-sky-700 transition-colors underline text-lg">← Ana Menüye Dön</button>
        <section className={`bg-white rounded-[2.5rem] border-2 ${mode === 'child' ? 'border-emerald-100' : 'border-sky-100'} shadow-2xl p-6 sm:p-10`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <h2 className={`text-3xl font-black mb-6 ${mode === 'child' ? 'text-emerald-900' : 'text-sky-900'}`}>{mode === 'child' ? 'Siber Kalkan Aktif 🛡️' : 'Güvenli Analiz Odası 🔍'}</h2>
              <div className="space-y-6">
                <textarea className="w-full min-h-[180px] p-6 text-2xl rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none" placeholder="Buraya yaz..." value={text} onChange={(e) => setText(e.target.value)} />
                <div className="flex gap-4">
                  <button onClick={handleListen} className={`flex-1 py-3 rounded-xl font-bold ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-sky-100 text-sky-700'}`}>{isListening ? '🛑 Durdur' : '🎤 Sesle Yaz'}</button>
                  <div className="flex-1 relative border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input type="file" accept="image/*" onChange={onSelectImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <p className="text-slate-500 font-bold text-sm">{imageFile ? '✅ Resim Seçildi' : '📸 Fotoğraf Yükle'}</p>
                  </div>
                </div>
                <button disabled={!canAnalyze || isLoading} onClick={async () => {
                  setIsLoading(true); resetResults();
                  try {
                    const res = await analyzeWithGemini()
                    setResultStatus(res.durum); setResultMessage(res.mesaj); setResultReasons(res.nedenler || [])
                    if (mode === 'child' && res.durum === 'tehlikeli') setAutoNotified(true)
                  } catch (e) { setResultMessage(e.message || ERROR_MESSAGE) } finally { setIsLoading(false) }
                }} className={`w-full py-6 rounded-2xl font-black text-2xl text-white shadow-xl ${mode === 'child' ? 'bg-emerald-600' : 'bg-sky-600'} disabled:opacity-30`}>
                  {isLoading ? 'ANALİZ EDİLİYOR...' : 'ŞİMDİ İNCELE'}
                </button>
              </div>
              <div className="mt-10">
                {autoNotified && (
                  <div className="mb-6 bg-red-600 text-white p-6 rounded-2xl shadow-lg border-4 border-red-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-2xl font-black flex items-center gap-2 mb-2">🚨 ACİL DURUM TESPİT EDİLDİ</h3>
                    <p className="text-lg font-medium mb-4">Bu içerik tehlikeli! Lütfen hemen ailene haber ver.</p>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🚨 ACİL DURUM: Dijital Dost, çocuğunuzun cihazında tehlikeli bir mesaj tespit etti!\n\n*İncelenen:* "${text}"\n*Analiz:* ${resultMessage}`)}`, '_blank')} className="w-full bg-white text-red-700 font-black py-4 rounded-xl text-xl hover:bg-red-50 transition-all shadow-md flex items-center justify-center gap-2">📱 AİLEME HEMEN HABER VER</button>
                  </div>
                )}
                <AnalysisResultCard status={resultStatus} message={resultMessage} originalText={text} nedenler={resultReasons} mode={mode} />
              </div>
            </div>
            <aside className="lg:col-span-1">
              <div className={`p-8 rounded-[2rem] border-4 ${mode === 'child' ? 'bg-emerald-50 border-emerald-100' : 'bg-sky-50 border-sky-100'}`}>
                <h3 className="font-black text-2xl mb-4">🚨 Tehdit Radarı</h3>
                <div className="bg-white p-4 rounded-xl border-l-8 border-red-500 shadow-sm">
                  <p className="text-slate-600 text-sm font-medium">{mode === 'child' ? "'Bedava oyun parası' linklerine dikkat!" : "PTT Kargo taklidi yapan mesajlar arttı!"}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}