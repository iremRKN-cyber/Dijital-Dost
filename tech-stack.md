# Kullanılan Teknolojiler ve Mimari (Tech Stack)

Projemiz, modern web teknolojileri ve gelişmiş yapay zeka entegrasyonu ile hızlı, güvenli ve ölçeklenebilir olacak şekilde tasarlanmıştır.

## Frontend (Kullanıcı Arayüzü)
* **React.js:** Bileşen (component) tabanlı yapısıyla dinamik, modüler ve hızlı bir kullanıcı arayüzü inşa etmek için kullanıldı.
* **Vite:** Geleneksel React derleyicilerine göre çok daha hızlı başlatma ve anında sıcak modül değişimi (HMR) sağladığı için tercih edildi.
* **Tailwind CSS:** Modern, duyarlı (responsive) ve şık kullanıcı arayüzlerini (UI) CSS dosyalarında kaybolmadan, doğrudan bileşenler üzerinden hızlıca kodlamak için kullanıldı.

## Yapay Zeka Entegrasyonu
* **Google Gemini 2.5 Flash API:** Projenin karar verme motorudur.
  * *Görsel ve Metin Analizi:* Yüklenen ekran görüntülerini OCR ve anlamsal analizle inceler.
  * *Dinamik Prompting:* Kullanıcının yaşına (çocuk/yaşlı) göre farklı persona ve formatlarda JSON çıktıları üretmek üzere yapılandırılmıştır.
  * *Prompt Engineering:* Simülasyon eğitimleri ve canlı radar verileri için özel komut setleri (promptlar) kullanılmıştır.

## Dağıtım ve Yayın (Deployment)
* **Vercel:** CI/CD süreçlerinin otomatikleştirilmesi, hızlı yayınlanması ve güvenli çevre değişkenleri (Environment Variables) yönetimi için ana sunucu olarak yapılandırılmıştır.
