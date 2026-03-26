# 🛡️ Dijital Dost | Siber Güvenlik Kalkanı

**Dijital Dost**, internetin karmaşık ve bazen tehlikeli dünyasında dezavantajlı gruplara (çocuklar ve yaşlılar) rehberlik etmek için geliştirilmiş yapay zeka destekli bir siber güvenlik asistanıdır. 

Bu proje, **UP School AI Buildathon** kapsamında, teknolojiye aşina olmayan kullanıcıları oltalama (phishing) saldırılarından, dolandırıcılıklardan ve siber zorbalıktan korumak amacıyla tasarlanmıştır.

## 🎯 Çözülen Problem
Günümüzde siber saldırılar giderek daha karmaşık hale geliyor. Özellikle internet okuryazarlığı düşük olan yaşlı bireyler dolandırıcılık SMS'lerinin (sahte kargo, aidat iadesi vb.), çocuklar ise oyun içi siber zorbalık ve hırsızlıkların bir numaralı hedefi konumunda. "Dijital Dost", bu iki farklı grubun ihtiyaçlarına özel, şefkatli ve koruyucu bir yapay zeka kalkanı sunar.

## ✨ Temel Özellikler

👵 **Büyükler İçin Şefkatli Mod:**
* Şüpheli SMS veya linkleri teknik jargon kullanmadan, sade ve güven veren bir dille analiz eder.
* Kafa karıştırıcı detaylardan kaçınarak net bir "Güvenli / Şüpheli / Tehlikeli" kararı verir.

🛡️ **Çocuklar İçin Koruyucu & Eğitici Mod:**
* Oyun sohbetlerindeki zorbalıkları veya hediye vaadiyle şifre çalmaya çalışanları tespit eder.
* **Acil Durum Protokolü:** Eğer içerik çocuk için "Tehlikeli" bulunursa, tek tıkla WhatsApp üzerinden aileye otomatik acil durum mesajı gönderir.
* **"Nedenini Öğrenelim":** Çocuğu sadece engellemekle kalmaz, tehdidin neden tehlikeli olduğunu maddeler halinde açıklar.

🧠 **Dinamik Eğitim & Simülasyon Modülü (Yapay Zeka Destekli):**
* Sabit bir veri tabanı kullanmaz. Gemini AI altyapısı ile internetteki en güncel dolandırıcılık senaryolarını canlı olarak üretir.
* Siber güvenlik hakları ve yasaları hakkında dinamik bir bilgi bankası sunar.
* Kullanıcının siber farkındalığını ölçmek için yapay zeka destekli otonom çoktan seçmeli "Canlı Testler" oluşturur.

🔊 **Gelişmiş Erişilebilirlik (A11y):**
* **Sesle Yazma:** Klavye kullanamayanlar için Speech-to-Text (STT) entegrasyonu.
* **Sesli Okuma:** Görme zorluğu çekenler için yapay zekanın analizini sesli okuyan Text-to-Speech (TTS) altyapısı.
* **Görsel Analizi (OCR/Vision):** Şüpheli ekran görüntülerini veya fotoğrafları anında analiz edebilme yeteneği.

## 💻 Kullanılan Teknolojiler
* **Frontend:** React, Vite, Tailwind CSS
* **Yapay Zeka:** Google Gemini 2.5 Flash API (Text & Multimodal Vision)
* **Web API'leri:** Web Speech API (Sesli komut ve okuma)
* **Entegrasyonlar:** WhatsApp URL Scheme

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1. Projeyi klonlayın:
   ```bash
   git clone [https://github.com/kullaniciadiniz/dijital-dost.git](https://github.com/kullaniciadiniz/dijital-dost.git)