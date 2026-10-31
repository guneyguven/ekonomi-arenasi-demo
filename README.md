# Ekonomi Arenası

**Tasarım ve oyun fikri: Güven Çalışkan**

Türkiye'nin gündelik ekonomik hayatından esinlenen, mizah tonlu, tek oyunculu strateji kart oyunu prototipi.

## Çalıştırma

İlk prototip statik HTML/CSS/JavaScript kullanır; paket kurulumu gerekmez.

1. Depoyu bilgisayarına klonla veya ZIP olarak indir.
2. `index.html` dosyasını tarayıcıda aç.
3. Oyun doğrudan başlar.

Yerel geliştirme sunucusu kullanmak istersen:

```bash
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini aç.

## Kontroller

- Elindeki kartlara tıklayarak oyna.
- Sahandaki hazır birime tıkla, ardından rakip birime veya rakip sahasına tıklayarak saldır.
- Sıranı bitirerek bilgisayar rakibin hamlesini başlat.
- Her üç turda ay sonu ekonomik etkileri çözülür.

## Prototip kapsamı

- Bütçe ve refah kaynakları
- Birim ve taktik kartları
- Saha sınırı ve saldırı/karşı saldırı
- Basit bilgisayar rakip
- Ay sonu olayları ve kart yetenekleri
- Kazanma/kaybetme koşulları

Bu sürüm bir erken oynanabilir prototiptir. Kart dengesi, yapay zekâ, ekonomi simülasyonu, animasyonlar, sesler, erişilebilirlik ve mobil arayüz ilerleyen sürümlerde geliştirilecektir.

## Fikri mülkiyet notu

Bu depoda ayrıca bir açık kaynak lisansı verilmemiştir. Kodun, görsellerin ve diğer içeriklerin kullanımı için hak sahibinden yazılı izin alınmalıdır. Bu not tek başına hukuki koruma veya tescil sağlamaz.

Geçici kart emojileri ve arayüz öğeleri, nihai illüstrasyonlar değildir. Özgün kart illüstrasyonları ve karakter tasarımları sonradan eklenecektir.
