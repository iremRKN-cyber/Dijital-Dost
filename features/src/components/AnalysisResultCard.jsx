import { useState, useEffect } from 'react'

export default function AnalysisResultCard({ status, message, originalText, nedenler = [], mode }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [message])

  if (!status) return null

  const isElderly = mode === 'elderly'
  const config = {
    tehlikeli: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', title: '🔴 Tehlikeli Olabilir', icon: '🚫' },
    supheli: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', title: '🟡 Şüpheli İçerik', icon: '⚠️' },
    guvenli: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', title: '🟢 Güvenli Görünüyor', icon: '✅' }
  }[status] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', title: 'Sonuç', icon: '🔍' }

  const handleSpeak = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return }
    const textToRead = isElderly || !nedenler?.length ? message : `${message}. Nedenleri şunlardır: ${nedenler.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = 'tr-TR'; utterance.onend = () => setIsSpeaking(false)
    setIsSpeaking(true); window.speechSynthesis.speak(utterance)
  }

  const shareOnWhatsApp = () => {
    const content = originalText ? `\n\n🔍 İncelenen:\n"${originalText}"` : `\n\n🔍 Bir görsel analiz edildi.`;
    const shareText = `*Dijital Dost Analizi* 🛡️\n*Durum:* ${status.toUpperCase()}\n*Sonuç:* ${message}${content}`
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  return (
    <div className={`p-8 rounded-[2.5rem] border-4 ${config.bg} ${config.border} shadow-2xl animate-in zoom-in duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{config.icon}</span>
        <h3 className={`text-3xl font-black ${config.text}`}>{config.title}</h3>
      </div>
      <p className="text-xl leading-relaxed text-slate-800 mb-8 font-medium italic">{message}</p>

      {/* Sadece çocuk modunda ve nedenler varsa göster */}
      {!isElderly && nedenler && nedenler.length > 0 && (
        <div className="bg-white/70 rounded-3xl p-6 mb-8 border-2 border-emerald-100">
          <h4 className="font-black text-emerald-900 mb-4 flex items-center gap-2 text-xl">🎓 Nedenini Öğrenelim mi?</h4>
          <ul className="space-y-3">
            {nedenler.map((item, index) => (
              <li key={index} className="text-slate-700 flex gap-3 text-lg leading-snug">
                <span className="text-emerald-500 font-bold">★</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-end">
        <button onClick={handleSpeak} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-slate-700">{isSpeaking ? '🛑 Durdur' : '🔊 Sesli Dinle'}</button>
        <button onClick={shareOnWhatsApp} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md">📱 Yakınıma Danış</button>
      </div>
    </div>
  )
}