import React, { useState } from 'react';
import { Shield, Upload, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Netlify'daki Environment Variable'ı okur
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64Data = image.split(',')[1];

      const prompt = "Bu bir ekran görüntüsü. Lütfen içindeki metinleri ve linkleri incele. Bu bir phishing (oltalama) saldırısı mı, dolandırıcılık mı yoksa güvenli mi? Nedenlerini madde madde açıkla ve yaşlı birinin anlayabileceği kadar sade bir dil kullan.";

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
      ]);

      setResult(result.response.text());
    } catch (error) {
      console.error("Analiz hatası:", error);
      setResult("Maalesef bir hata oluştu. Lütfen API anahtarını kontrol edin.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-2">
          <Shield size={32} />
          <h1 className="text-2xl font-bold tracking-tight">Dijital Dost</h1>
        </div>
      </nav>

      <main className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Şüpheli Bir Mesaj mı Aldınız?</h2>
            <p className="text-slate-600">Ekran görüntüsünü yükleyin, sizin için inceleyelim.</p>
          </div>

          <div className="border-4 border-dashed border-slate-200 rounded-xl p-10 text-center mb-6">
            <input type="file" onChange={handleImageUpload} className="hidden" id="upload" accept="image/*" />
            <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-4">
              {image ? (
                <img src={image} className="max-h-64 rounded-lg shadow-md" alt="Yüklenen" />
              ) : (
                <div className="bg-blue-50 p-6 rounded-full text-blue-500">
                  <Upload size={48} />
                </div>
              )}
              <span className="text-lg font-medium text-slate-700">Resim Seç veya Buraya Bırak</span>
            </label>
          </div>

          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${!image || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:-translate-y-1'
              }`}
          >
            {loading ? 'İnceleme Yapılıyor...' : 'Şimdi İncele'}
          </button>

          {result && (
            <div className="mt-10 p-6 bg-slate-50 rounded-xl border-l-8 border-blue-500 animate-fade-in">
              <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl">
                <Search /> 🔍 Analiz Sonucu
              </div>
              <div className="prose prose-slate text-slate-700 leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;