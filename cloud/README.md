# RSM-EMLAK — Cloudflare sürümü

RSM-EMLAK için yeni dağıtım kökü depo köküdür. AtaPro'dan ayrı tutulur. Canlı veriler GitHub'a yazılmaz; Cloudflare D1 veritabanında tutulur.

## Mimari
- Cloudflare Workers: API ve statik uygulama.
- Cloudflare D1: kişiler, taşınmazlar ve sözleşmeler.
- Cloudflare Access: e-posta ile erişim kontrolü. Worker, Access JWT imzasını ve uygulama Audience değerini sunucu tarafında doğrular.
- `public/`: tarayıcı arayüzü.
- `src/index.js`: API ve Access JWT doğrulaması.
- `migrations/0001_init.sql`: ilk D1 şeması.
- `wrangler.jsonc`: Worker, statik dosyalar ve D1 bağlantı tanımı.

## Güvenlik ve veri koruma
- API, geçerli Cloudflare Access JWT olmadan kayıt verisi döndürmez veya yazmaz.
- Her kayıt doğrulanmış e-posta adresiyle ilişkilendirilir; sorgular yalnızca o hesaba ait satırları getirir.
- API'de kayıt silme işlemi yoktur.
- Kişi/taşınmaz/sözleşme ilişkileri aynı kullanıcıya ait kayıtlarla sınırlandırılır.
- GitHub deposuna gerçek müşteri verisi, kimlik numarası, yedek, parola veya gizli anahtar koymayın.
- Canlı kullanım öncesi yedek alma ve iki cihazda senkronizasyon testi yapılmalıdır.

## Cloudflare'da gerekli kurulum
1. Cloudflare hesabında Workers & Pages üzerinden bu GitHub deposunu ve `rsm-web-cloud` dalını Worker olarak bağlayın. Build/deploy komutu `npx wrangler deploy` olmalıdır.
2. Wrangler yapılandırmasındaki D1 binding adı `DB`; ilk dağıtımda D1 veritabanı `rsm-emlak-db` olarak oluşturulmalıdır. Oluştuğunu doğrulayın.
3. D1 migrations bölümünden `migrations/0001_init.sql` migration'ını uygulayın. Migration uygulanmadan gerçek kayıt girmeyin.
4. Worker için `workers.dev` adresini etkinleştirin ve ilk dağıtımı yapın.
5. Cloudflare Zero Trust / Access altında Self-hosted uygulama oluşturun; hostname olarak Worker'ın tam `workers.dev` adresini girin. İzin politikasında yalnızca kullanıcının RSM-EMLAK için kullanacağı e-posta adresine izin verin.
6. Access uygulamasının Audience (AUD) değerini alın. Worker Variables bölümüne:
   - `ACCESS_TEAM_DOMAIN`: takım alan adı, ör. `takimadi.cloudflareaccess.com` (https olmadan)
   - `ACCESS_AUD`: Access uygulamasının Audience değeri
   ekleyin. Bunlar gizli anahtar değildir; ancak yalnızca doğru Worker'a tanımlanmalıdır.
7. Worker'ı yeniden dağıtın ve Access girişinden sonra `/api/me`, kişi ekleme/listeleme ve yedek indirme testlerini yapın.

## Önemli
Bu kaynak kodu henüz canlı dağıtılmış veya uçtan uca test edilmiş değildir. GitHub bağlantısının yapılmış olması uygulamanın yayınlandığı anlamına gelmez. D1 veritabanı ve Access ayarları tamamlanmadan gerçek kişi/taşınmaz/kira verisi girmeyin. Ücretsiz plan limitleri aşılırsa hizmet kısıtlanabilir; ücretsiz plan kesintisiz çalışma garantisi değildir.
