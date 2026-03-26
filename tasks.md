# Dijital Dost - Geliştirme Görevleri (tasks.md)

Bu dosya, Cursor AI ajanı için adım adım geliştirme talimatlarını içerir. Lütfen görevleri sırasıyla tamamla ve her görev bittiğinde onayı bekle. Referans olarak `prd.md` dosyasını kullan.

- [ ] **Görev 1: Proje Kurulumu ve İskelet**
  - Vite ile temel bir React projesi oluştur.
  - TailwindCSS kurulumunu yap.
  - Sayfa yapısını (Header, Main Content, Footer) oluştur. Renk paleti olarak yaşlı dostu, yüksek kontrastlı ve güven veren pastel tonlar (örn. mavi ve beyaz) kullan.

- [ ] **Görev 2: UI (Kullanıcı Arayüzü) Geliştirme**
  - "Şüpheli Metni/Linki Yapıştır" için büyük bir metin kutusu ve "Görsel Yükle" için belirgin bir dosya yükleme alanı oluştur.
  - Kocaman, okunaklı bir "Bunu İncele" butonu ekle.
  - Analiz sonuçlarının gösterileceği (Kırmızı/Sarı/Yeşil) bir sonuç kartı bileşeni (component) hazırla.
  - Arayüzün mobilde (telefonda) kusursuz görünmesini sağla.

- [ ] **Görev 3: Google Gemini API Entegrasyonu**
  - `.env` dosyasından `VITE_GEMINI_API_KEY` değerini okuyacak yapıyı kur.
  - Kullanıcının girdiği metni veya görseli Gemini modeline (gemini-1.5-flash) gönderecek API çağrısını yaz.
  - AI'a şu Sistem Mesajını (Prompt) ver: "Sen, teknoloji bilmeyen yaşlılara yardım eden şefkatli bir siber güvenlik asistanısın. Gelen metin, link veya görseldeki oltalama (phishing) riskini ve psikolojik manipülasyonu analiz et. Anlaşılır ve teknik olmayan bir dille, kısa bir uyarı yaz. Sonucu JSON formatında dön: { durum: 'tehlikeli' | 'supheli' | 'guvenli', mesaj: 'kullanıcıya gösterilecek açıklama' }"

- [ ] **Görev 4: Sesli Okuma (Erişilebilirlik)**
  - Tarayıcının yerleşik `Web Speech API`'sini kullanarak, ekranda çıkan analiz sonucunu (AI'ın yanıtını) sesli okuyacak bir "Sesli Dinle" butonu ekle.