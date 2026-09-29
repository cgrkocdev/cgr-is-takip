# İş Pusulası

Birden fazla yazılım projesini; iş, alt iş, öncelik, durum, tarih ve bağımlılıklarıyla takip etmek için Türkçe web uygulaması.

## Kurulum

Gereksinimler: Node.js 20+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

İlk kullanıcıları oluşturmak için `.env.local` içindeki `MEYEKA_PASSWORD` ve `CGR_PASSWORD` değerlerini belirleyip aşağıdaki komutu çalıştırın:

```bash
node --env-file=.env.local scripts/setup-users.mjs
```

Ardından `http://localhost:3000` adresini açın. SQLite veritabanı `data/is-takip.db` dosyasında kalıcı olarak saklanır; bu dosyayı yedekleyerek tüm verileri yedekleyebilirsiniz.

Üretim için `SESSION_SECRET` değerini en az 32 karakterlik rastgele bir sırla değiştirin.

## Kullanım

- **Genel Görünüm:** Kritik, acil, geciken ve yaklaşan işleri görün.
- **Projeler:** Proje ayrıntısına girin; hızlı iş, alt iş ve bağımlılık ekleyin. Oklarla işleri elle sıralayın.
- **İş Listesi:** Başlıkta arayın; proje, durum, öncelik ve sorumluya göre filtreleyin.
- **Kanban:** İşin durumunu ilgili karttaki seçiciden değiştirin.
- **Takvim:** Teslim tarihlerini proje renkleriyle aylık görün.

Bir işin bağımlı olduğu iş tamamlanmadıysa sistem o işi “Devam Ediyor”, “Test Ediliyor” veya “Tamamlandı” aşamasına geçirmez. Gecikme ayrı bir etikettir ve işin mevcut durumunu değiştirmez. Silme işlemleri tarayıcı onayı ister.

## Kontroller

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Veriler kullanıcı hesabına göre ayrılır. Parolalar scrypt ile tuzlanarak saklanır; oturum çerezi HTTP-only ve SameSite=Lax olarak ayarlanır.
