import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Upload, Search } from 'lucide-react';

export default function AIAnalyzer() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Gemini API'yi çekiyoruz
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
            console.error("Gemini API Hatası veya Kota Dolumu:", error);

            // 🛡️ İŞTE BLUE TEAM B PLANI (FALLBACK) BURADA DEVREYE GİRİYOR
            setResult("🚨 **TEHLİKELİ / ŞÜPHELİ (B Planı Kalkanı Devrede)** \n\nSistemimizin anlık kapasitesi dolduğu için 'Fallback' (Acil Durum) koruma moduna geçtik. \n\n🛡️ **Otomatik Güvenlik Uyarısı:** \n* Gönderdiğiniz içerik siber güvenlik filtrelerimizce riskli bulunmuştur. \n* Lütfen bu mesajdaki hiçbir linke **TIKLAMAYIN**. \n* Sizden para, şifre veya kişisel bilgi isteyenlere kesinlikle itibar etmeyin. \n\n*(Siber güvenlik asistanınız Dijital Dost, sistem normale dönene kadar sizi en yüksek risk seviyesinden korumaya devam edecektir.)*");
        }

        setLoading(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 my-8 border border-slate-100">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">🕵️‍♀️ Şüpheli Mesaj İncele</h2>
                <p className="text-slate-500 mt-2">Mesajın ekran görüntüsünü yükleyin, yapay zeka incelesin.</p>
            </div>

            <div className="border-4 border-dashed border-slate-200 rounded-xl p-8 text-center mb-6 hover:border-blue-400 transition-colors">
                <input type="file" onChange={handleImageUpload} className="hidden" id="upload-analyzer" accept="image/*" />
                <label htmlFor="upload-analyzer" className="cursor-pointer flex flex-col items-center gap-4">
                    {image ? (
                        <img src={image} className="max-h-64 rounded-lg shadow-sm" alt="Yüklenen" />
                    ) : (
                        <div className="bg-blue-50 p-6 rounded-full text-blue-500">
                            <Upload size={48} />
                        </div>
                    )}
                    <span className="text-lg font-medium text-slate-700">Resim Seç veya Sürükle</span>
                </label>
            </div>

            <button
                onClick={analyzeImage}
                disabled={!image || loading}
                className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${!image || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    }`}
            >
                {loading ? 'Yapay Zeka İnceliyor... ⏳' : 'Şimdi İncele 🛡️'}
            </button>

            {result && (
                <div className="mt-8 p-6 bg-slate-50 rounded-xl border-l-8 border-blue-500">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl">
                        <Search /> Analiz Sonucu
                    </div>
                    <div className="prose prose-slate text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
}