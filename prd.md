# 🤝 Dijital Dost (Digital Friend) - Ürün Gereksinim Belgesi (PRD)

## 1. Ürün Vizyonu
Dijital Dost; teknoloji okuryazarlığı düşük bireyleri (ev hanımları, emekliler), Türkiye'ye özgü sosyal mühendislik ve oltalama (phishing) saldırılarına karşı koruyan, sıfır karmaşa prensibiyle çalışan yapay zeka tabanlı bir siber güvenlik asistanıdır. Pazardaki kurumsal veya İngilizce ağırlıklı rakiplerin aksine, tamamen yerel dolandırıcılık bağlamına (e-Devlet, PTT, banka taklidi vb.) hakimdir ve kullanıcıya "teknik bir araç" değil, "şefkatli bir rehber" hissi verir.

## 2. Kullanıcı Akışı (User Flow Özeti)
Kullanıcı platforma girer, karmaşık menüler görmez. İki ana seçenek vardır: "Şüpheli Metni/Linki Yapıştır" veya "Ekran Görüntüsü Yükle". Analiz butonuna basıldıktan sonra yapay zeka saniyeler içinde renk kodlu (Kırmızı/Sarı/Yeşil) ve teknik jargon içermeyen, anlaşılır bir uyarı metni üretir.

## 3. Temel Özellikler (MVP - 7 Günlük Buildathon Hedefi)
* **Metin ve URL Analizi:** Girilen linklerin typosquatting (örn. trendy0l.com) veya oltalama riski taşıyıp taşımadığını anında tespit etme.
* **Görsel (Ekran Görüntüsü) Analizi:** WhatsApp'tan gelen sahte mesajların veya Instagram'daki sahte "yardım" reklamlarının ekran görüntülerini okuyup yorumlama (OCR + Vision).
* **Yerel Bağlamlı Sistem Promptu:** AI'ın, "hukuk bürosu icra takibi", "kredi kartı aidat iadesi" gibi Türkiye'ye özgü dolandırıcılık senaryolarını tanımasını sağlayan özel talimat seti.
* **Psikolojik Manipülasyon Radarı:** Mesajdaki "Aciliyet" (Hemen tıkla!) veya "Korku" (Hesabınız kapanacak!) öğelerini tespit edip kullanıcıya bildirme.
* **Sesli Okuma (Erişilebilirlik):** Üretilen AI tavsiyesini metin okumakta zorlanan kullanıcılar için sese dönüştürme.

## 4. Başarı Metrikleri
Çalışan bir web arayüzü üzerinden 3 farklı sahte senaryonun (1 link, 1 metin, 1 görsel) doğru tespit edilip, jüriye anlaşılır bir dille demo edilmesi.