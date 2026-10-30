# RSM-EMLAK — web/cloud sürümü (ilk altyapı)

Bu klasör, tablet ve bilgisayarda aynı hesaptaki kayıtları gösterecek web uygulamasının ilk altyapısıdır. AtaPro projesine dokunmaz.

## Şu anki kapsam
- Mobil/tablet/bilgisayar uyumlu başlangıç ekranı
- E-posta/şifre ile hesap oluşturma ve giriş
- Supabase bağlantı ayarı
- Kişi, taşınmaz ve sözleşme için ilk kayıt/listeleme ekranları
- Kullanıcı satır güvenliği (RLS): her hesap yalnızca kendi kayıtlarını görür
- Kayıt silme yetkisi/politikası yoktur

Bu ilk sürüm henüz tamamlanmış ürün değildir: kayıt düzenleme, kişi-taşınmaz-sözleşme seçim bağlantıları, PDF şablonları, tarih kuralları, dosya ekleri, yedekleme/geri yükleme ve uçtan uca testler tamamlanmalıdır.

## Kurulum — kullanıcı hesabı gereklidir
1. Kullanıcı kendi Supabase hesabını açar ve yeni bir proje oluşturur.
2. Supabase SQL Editor ekranında `schema.sql` dosyasının tamamı, boş projede bir kez çalıştırılır.
3. Supabase Project Settings / API ekranından Project URL ve public anon/publishable key alınır.
4. Web uygulaması açılınca bu iki değer bağlantı ekranına girilir.
5. Supabase Authentication ayarlarında e-posta doğrulaması etkin tutulur; güçlü parola kullanılır.

**Gizli service_role/secret key hiçbir zaman tarayıcıya, bu depoya veya sohbete konmaz.** Yalnızca public anon/publishable key kullanılır; veri erişimi RLS politikalarıyla sınırlandırılır. Kullanıcı şifresi de kimseyle paylaşılmaz.

## Ücretsiz kullanım notu
Supabase Free planı küçük deneme için ücretsiz başlayabilir; güncel resmi sınırlarda proje başına 500 MB veritabanı ve 1 GB dosya depolama bulunur. Free projeler bir hafta düşük etkinlikte duraklatılabilir. Bu nedenle ücretsiz hizmeti kesintisiz ve kalıcı hizmet garantisi gibi görmeyin; düzenli dışa aktarılan yedek şarttır. Kota ve şartlar değişebilir.

## Yayınlama / gizlilik
GitHub Pages, hassas kayıt toplayan ticari SaaS kullanımı için uygun yayın yeri değildir. Bu klasör kaynak kodu olarak tutulur; canlı uygulama, uygun bir statik web barındırıcısına dağıtılmalı ve veriler yalnızca Supabase projesinde saklanmalıdır. Depo herkese açık olduğu için buraya müşteri/kişisel veri, yedek dosyası, parola veya servis anahtarı yüklenmemelidir.

## Güvenli geçiş
Gerçek müşteri kayıtları girmeden önce test hesabı ve örnek verilerle giriş, farklı hesapların birbirinin kayıtlarını görememesi, kayıt ekleme, yeniden giriş, yedek alma ve geri yükleme testleri yapılmalıdır.
