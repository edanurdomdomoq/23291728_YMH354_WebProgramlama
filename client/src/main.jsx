import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  HeartHandshake,
  Instagram,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Monitor,
  Play,
  Phone,
  ShieldCheck,
  Send,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Video
} from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const iconMap = { Monitor, Users, Heart };
const statusLabels = {
  pending: 'Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  completed: 'Tamamlandı',
  session_done: 'Seans Bitti',
  cancelled: 'İptal'
};

function statusLabel(status) {
  return statusLabels[status] || status || '-';
}

function localDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function scrollToHash(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 92;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.history.replaceState(null, '', hash);
  window.scrollTo({ top, behavior: 'smooth' });
}

function useAuth() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('mindcare-session');
    return saved ? JSON.parse(saved) : null;
  });

  function save(nextSession) {
    setSession(nextSession);
    localStorage.setItem('mindcare-session', JSON.stringify(nextSession));
  }

  function logout() {
    setSession(null);
    localStorage.removeItem('mindcare-session');
  }

  return { session, save, logout };
}

function useGuestAuth() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('mindcare-guest-session');
    return saved ? JSON.parse(saved) : null;
  });

  function save(nextSession) {
    setSession(nextSession);
    localStorage.setItem('mindcare-guest-session', JSON.stringify(nextSession));
  }

  function logout() {
    setSession(null);
    localStorage.removeItem('mindcare-guest-session');
  }

  return { session, save, logout };
}

async function api(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const apiError = new Error(error.message || 'Request failed');
    apiError.status = response.status;
    apiError.code = error.code;
    throw apiError;
  }

  if (response.status === 204) return null;
  return response.json();
}

function Brand({ compact = false }) {
  return (
    <a className="brand" href="#anasayfa" aria-label="Sibel Domdomoğulları Danışmanlık Merkezi Anasayfa">
      <img src="/brand/sibel-logo.png" alt="" aria-hidden="true" />
      <span>
        <span>PSİKOLOG</span>
        <strong>Sibel Domdomoğulları</strong>
        {!compact && <small>Danışmanlık Merkezi</small>}
      </span>
    </a>
  );
}

function PublicHeader({ onAdmin }) {
  const [open, setOpen] = useState(false);
  const links = [
    ['Anasayfa', '#anasayfa'],
    ['Hakkımda', '#hakkimda'],
    ['Blog', '#blog'],
    ['Randevu Al', '#randevu']
  ];

  return (
    <header className="site-header">
      <Brand />
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Menu">
        <Menu />
      </button>
      <nav className={open ? 'open' : ''}>
        {links.map(([label, href]) => (
          <a
            key={label}
            href={href}
            onClick={(event) => {
              event.preventDefault();
              setOpen(false);
              scrollToHash(href);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero({ onAppointment }) {
  return (
    <section id="anasayfa" className="hero-section">
      <div className="hero-copy">
        <span className="eyebrow">Online ve yüz yüze psikolojik danışmanlık</span>
        <h1>İç sesinizi duyacak sakin, güvenli ve profesyonel bir <em>alan.</em></h1>
        <div className="hero-actions">
          <button className="primary-button gold-button" onClick={onAppointment}>Randevu Al <Calendar /></button>
          <a className="text-link soft-link" href="#hakkimda" onClick={(event) => { event.preventDefault(); scrollToHash('#hakkimda'); }}>Yaklaşımı İncele <ArrowUpRight /></a>
        </div>
        <div className="trust-row">
          <span><ShieldCheck /> KVKK odaklı akış</span>
          <span><Video /> Online seans</span>
          <span><Users /> Yüz yüze seans</span>
        </div>
      </div>
      <div className="hero-card">
        <img src="/social-media/instagram/ana-gorsel.png" alt="Psikolog danışan görüşmesi" />
        <div className="floating-metric">
          <Clock />
          <strong>24s</strong>
          <span>Başvuru geri dönüş hedefi</span>
        </div>
      </div>
    </section>
  );
}
function Services({ services }) {
  const sliderServices = services.length > 1 ? [...services, ...services] : services;

  return (
    <section className="services-section">
      <p className="quote">"Değişim Bir Adımla Başlar."</p>
      <div className="service-slider" aria-label="Hizmetler">
        <div className="service-track">
        {sliderServices.map((service, index) => {
          const Icon = iconMap[service.icon] || HeartHandshake;
          return (
            <article className="service-card" key={`${service.id}-${index}`}>
              <Icon />
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <a href="#randevu">Detaylı Bilgi</a>
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
}

function About() {
  const areas = ['Anksiyete ve Kaygı Bozuklukları', 'Depresyon ve duygudurum', 'Travma ve ilişki', 'Özgüven ve öz şefkat', 'Stres yönetimi', 'İlişki ve İletişim Problemleri'];
  return (
    <section id="hakkimda" className="about-section">
      <div className="portrait-wrap">
        <img src="/social-media/instagram/sibel-profil.jpg" alt="Psikolog Sibel Domdomoğulları portre" />
      </div>
      <div>
        <span className="eyebrow">Tanışalım</span>
        <h2>Hikayeniz, dinlenmeyi hak ediyor.</h2>
        <p>
          Sibel Domdomoğulları, 2024 yılında TOBB Ekonomi ve Teknoloji Üniversitesi Psikoloji Bölümü’nden mezun olmuştur. Öğrencilik hayatı boyunca psikolojinin farklı alanlarında kendini geliştirmeye önem vermiş, mesleki donanımını çeşitli saha deneyimleriyle güçlendirmiştir.

Psikolojinin alt dallarına bütüncül bir bakış açısı kazanmak amacıyla Adalet Bakanlığı bünyesinde; mahkumlar ile kadın ve çocuk cezaevlerinde bulunan bireylerle çalışmalar yürütmüştür. Bu süreçte farklı yaşam öykülerine sahip bireylerle çalışarak güçlü bir gözlem ve değerlendirme becerisi edinmiştir.

Spor psikolojisi alanında ise Karayolları Spor Kulübü kız voleybol takımında spor psikoloğu olarak görev almış; sporcuların performanslarını, motivasyonlarını ve psikolojik dayanıklılıklarını desteklemeye yönelik çalışmalar gerçekleştirmiştir.

Ergen ve yetişkinlerle; Bilişsel Davranışçı Terapi, Şema Terapi, Aile ve Çift Terapisi ve Cinsel Terapi yaklaşımları doğrultusunda danışan kabul etmektedir. Çalışmalarında etik ilkelere bağlı, güvene dayalı ve bireye özgü bir terapi süreci yürütmeyi benimsemektedir. Yüz yüze ve online danışmanlık hizmeti sunmaktadır.
        </p>
        <div className="area-list">
          {areas.map((area) => <span key={area}><Check /> {area}</span>)}
        </div>
        <a className="primary-button small" href="#randevu" onClick={(event) => { event.preventDefault(); scrollToHash('#randevu'); }}>Randevu Al</a>
      </div>
    </section>
  );
}

function BlogPreview({ posts }) {
  return (
    <section id="blog" className="blog-section">
      <div className="section-title">
        <span className="eyebrow">Blog</span>
        <h2>Son Bloglar</h2>
      </div>
      <div className="blog-grid">
        {posts.map((post) => (
          <article className="blog-card" key={post.id}>
            <img src={post.image} alt={post.title} />
            <div>
              <span>{post.date}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <a href="#blog">Yazıyı Oku</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([^?&/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : '';
}

const defaultSocialProfiles = [
  {
    type: 'youtube',
    name: 'Sibel Domdomoğulları',
    handle: '@PsikologSibelDomdomogullari',
    platform: 'YouTube',
    profileUrl: 'https://www.youtube.com/@PsikologSibelDomdomogullari',
    accent: '#ff0033',
    avatar: '/social-media/youtube/profile.png',
    fallbackAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    cover: 'Sibel Domdomoğulları',
    subtitle: 'Kaygı, stres ve ilişki dinamikleri üzerine video içerikler',
    items: [
      {
        title: 'Kaygının Tuzağına Neden Düşersin?',
        meta: '9:29',
        image: '/social-media/youtube/video-1.png',
        fallbackImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
        videoUrl: '',
        localVideo: ''
      },
      {
        title: 'Toksik ilişki ve durumsal farkındalık',
        meta: '2:28',
        image: '/social-media/youtube/video-2.png',
        fallbackImage: 'https://images.unsplash.com/photo-1590650046871-92c887180603?auto=format&fit=crop&w=900&q=80',
        videoUrl: '',
        localVideo: ''
      }
    ]
  },
  {
    type: 'instagram',
    name: 'psk.sibeldomdomogullari',
    handle: 'Psikolog Sibel Domdomoğulları',
    platform: 'Instagram',
    profileUrl: 'https://www.instagram.com/psk.sibeldomdomogullari/',
    accent: '#e1306c',
    avatar: '/social-media/instagram/profile.png',
    fallbackAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    cover: 'Randevu • Reels • Psikoeğitim',
    subtitle: 'Günlük psikoeğitim notları, reels içerikleri ve randevu duyuruları',
    items: [
      {
        title: 'Toksik İlişki Nasıl Görünür?',
        meta: 'Reels',
        image: '/social-media/instagram/post-1.png',
        fallbackImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        videoUrl: '',
        localVideo: ''
      },
      {
        title: 'Duyguları Bastırmak',
        meta: 'Post',
        image: '/social-media/instagram/post-2.png',
        fallbackImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
        videoUrl: '',
        localVideo: ''
      },
      {
        title: 'Kaygıyla Nasıl Baş Edebiliriz?',
        meta: 'Reels',
        image: '/social-media/instagram/post-3.png',
        fallbackImage: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?auto=format&fit=crop&w=900&q=80',
        videoUrl: '',
        localVideo: ''
      }
    ]
  }
];

function SocialShowcase() {
  const [activeItem, setActiveItem] = useState(null);
  const [profiles, setProfiles] = useState(defaultSocialProfiles.filter((profile) => profile.type === 'instagram'));

  useEffect(() => {
    fetch('/social-media/social-data.json')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length) setProfiles(data.filter((profile) => profile.type === 'instagram'));
      })
      .catch(() => setProfiles(defaultSocialProfiles.filter((profile) => profile.type === 'instagram')));
  }, []);

  return (
    <section className="social-showcase">
      <div className="section-title social-title">
        <span className="eyebrow">Instagram</span>
      </div>
      <div className="social-stack">
        {profiles.map((profile) => (
          <motion.article
            className={`social-profile-card ${profile.type}`}
            key={profile.type}
            whileHover={{ rotateX: 1.2, rotateY: 1.8, y: -4 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            style={{ '--accent': profile.accent }}
          >
            <div className="social-topbar">
              <Instagram />
              <strong>{profile.name}</strong>
              <span>...</span>
            </div>
            <div className="social-profile-head">
              <a href={profile.profileUrl} target="_blank" rel="noreferrer" aria-label={`${profile.platform} profiline git`}>
                <img src={profile.avatar} alt={`${profile.name} profil`} onError={(event) => { event.currentTarget.src = profile.fallbackAvatar; }} />
              </a>
              <div>
                <h3>{profile.name}</h3>
                <p>{profile.handle}</p>
                <small>{profile.subtitle}</small>
              </div>
              <div className="instagram-stats">
                <span><strong>{profile.postCount || profile.items.length}</strong> gönderi</span>
                <span><strong>2.421</strong> takipçi</span>
                <span><strong>85</strong> takip</span>
              </div>
            </div>
            <div className="instagram-actions">
              <a href={profile.profileUrl} target="_blank" rel="noreferrer">Takip Et</a>
              <button type="button">Mesaj Gönder</button>
              <button type="button">Paylaş</button>
            </div>
            <div className="instagram-highlights">
              <a className="instagram-highlight-item" href={profile.profileUrl} target="_blank" rel="noreferrer">
                <img
                  src="/social-media/instagram/Highlightphoto.jpg"
                  alt="Randevu highlight"
                  onError={(event) => {
                    if (!event.currentTarget.dataset.fallbackTried) {
                      event.currentTarget.dataset.fallbackTried = 'true';
                      event.currentTarget.src = '/social-media/instagram/randevuH.jpg';
                    } else {
                      event.currentTarget.style.display = 'none';
                    }
                  }}
                />
                <span>Randevu</span>
              </a>
            </div>
            <div className="instagram-tabs">
              <span className="active">▦</span>
              <span>▷</span>
              <span>◎</span>
            </div>
            <div className="social-content-grid instagram-grid">
              {profile.items.map((item) => (
                <button key={item.title} className="social-media-tile instagram-tile" onClick={() => setActiveItem({ ...item, platform: profile.platform, accent: profile.accent })}>
                  <img src={item.image} alt={item.title} onError={(event) => { event.currentTarget.src = item.fallbackImage; }} />
                  <span><Play /> {item.meta}</span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>
            <a className="instagram-more-link" href={profile.profileUrl} target="_blank" rel="noreferrer">
              Diğer {Math.max((profile.postCount || profile.items.length) - profile.items.length, 0)} gönderiyi Instagram'da gör
            </a>
          </motion.article>
        ))}
      </div>
      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="media-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              className={activeItem.localVideo ? 'media-modal reel-modal' : 'media-modal'}
              initial={{ scale: 0.82, rotateX: 8, y: 30 }}
              animate={{ scale: 1, rotateX: 0, y: 0 }}
              exit={{ scale: 0.86, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 18 }}
              onClick={(event) => event.stopPropagation()}
              style={{ '--accent': activeItem.accent }}
            >
              <button className="media-close-button" type="button" aria-label="Videoyu kapat" onClick={() => setActiveItem(null)}>×</button>
              <div className="modal-video-frame">
                {activeItem.localVideo ? (
                  <video controls autoPlay muted playsInline poster={activeItem.image}>
                    <source src={activeItem.localVideo} type="video/mp4" />
                  </video>
                ) : (
                  <img src={activeItem.image} alt={activeItem.title} onError={(event) => { event.currentTarget.src = activeItem.fallbackImage; }} />
                )}
                {!activeItem.localVideo && <div><Play /><span>{activeItem.platform} önizleme</span></div>}
                {activeItem.localVideo && (
                  <>
                    <div className="reel-action-rail">
                      <Heart />
                      <MessageCircle />
                      <Send />
                      <span>•••</span>
                    </div>
                    <div className="reel-caption">
                      <strong>psk.sibeldomdomogullari</strong>
                      <span>{activeItem.title}</span>
                    </div>
                  </>
                )}
              </div>
              <h3>{activeItem.title}</h3>
              <p>Bu içerik siteden ayrılmadan büyütülmüş önizleme olarak gösterilir. Gerçek video embed bağlantısı eklendiğinde aynı alanda oynatılabilir.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Testimonials({ testimonials }) {
  return (
    <section className="testimonial-section">
      <div className="section-title">
        <span className="eyebrow">Danışan Deneyimi</span>
        <h2>Danışanlarımızın Gözünden</h2>
      </div>
      <div className="testimonial-slider" aria-label="Danışan yorumları">
        <div className="testimonial-track">
        {[...testimonials, ...testimonials].map((item, index) => (
          <article className="testimonial-card" key={`${item.name}-${index}`}>
            <strong>{'★'.repeat(item.rating)} / 5 Memnuniyet</strong>
            <p>"{item.text}"</p>
            <span>- {item.name}</span>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}

function AppointmentForm({ services }) {
  const today = localDateKey();
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: 'Online Terapi', preferredDate: today, preferredTime: '', message: '' });
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const slotRequestRef = useRef(0);

  useEffect(() => {
    if (services[0]?.title && form.service === 'Online Terapi') {
      setForm((current) => ({ ...current, service: services[0].title }));
    }
  }, [services]);

  async function loadPublicSlots(date) {
    const requestId = slotRequestRef.current + 1;
    slotRequestRef.current = requestId;
    setSlotError('');
    if (!date || date < today) {
      setSlots([]);
      return;
    }
    setSlotLoading(true);
    try {
      const data = await api(`/appointments/slots?date=${encodeURIComponent(date)}`);
      if (slotRequestRef.current !== requestId) return;
      setSlots(data.slots || []);
    } catch {
      if (slotRequestRef.current !== requestId) return;
      setSlots([]);
      setSlotError('Saatler alınamadı. Lütfen tarihi tekrar seçin veya birkaç saniye sonra deneyin.');
    } finally {
      if (slotRequestRef.current === requestId) setSlotLoading(false);
    }
  }

  useEffect(() => {
    loadPublicSlots(form.preferredDate);
  }, [form.preferredDate]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.phone.trim().length < 10) {
      setError('Lütfen ad, geçerli e-posta ve telefon bilgilerini doldurun.');
      return;
    }

    if (!form.preferredDate || form.preferredDate < today) {
      setError('Lütfen bugün veya sonrasından bir tarih seçin.');
      return;
    }
    if (!form.preferredTime) {
      setError('Lütfen müsait bir saat seçin.');
      return;
    }

    try {
      await api('/appointments', { method: 'POST', body: JSON.stringify(form) });
      setStatus('Başvurunuz alındı. Klinik en kısa sürede sizinle iletişime geçecek.');
      setForm({ name: '', email: '', phone: '', service: services[0]?.title || 'Online Terapi', preferredDate: today, preferredTime: '', message: '' });
      await loadPublicSlots(today);
    } catch (err) {
      setError(`Başvuru gönderilemedi: ${err.message}`);
    }
  }

  return (
    <section id="randevu" className="appointment-section">
      <div>
        <span className="eyebrow">Randevu</span>
        <h2>Başvurunuzdan sonra mailinizi kontrol ediniz.</h2>
        
      </div>
      <form className="appointment-form" onSubmit={submit}>
        <input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="E-posta" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
          {services.map((service) => <option key={service.id}>{service.title}</option>)}
        </select>
        <input type="date" min={today} value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value, preferredTime: '' })} />
        <div className="public-slot-picker">
          {slotLoading && <p>Uygun saatler yükleniyor...</p>}
          {!slotLoading && slots.map((slot) => (
            <button
              type="button"
              key={slot.time}
              disabled={!slot.available}
              className={form.preferredTime === slot.time ? 'active' : ''}
              onClick={() => setForm({ ...form, preferredTime: slot.time })}
            >
              {slot.time}
              <span>{slot.available ? 'Müsait' : 'Dolu'}</span>
            </button>
          ))}
          {!slotLoading && slotError && <p>{slotError}</p>}
          {!slotLoading && !slotError && !slots.length && <p>Bu tarih için uygun saat bulunamadı.</p>}
        </div>
        <textarea placeholder="Kısaca görüşme sebebiniz" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {error && <p className="form-error">{error}</p>}
        {status && <p className="form-success">{status}</p>}
        <button className="primary-button">Başvuru Gönder</button>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Brand compact />
        <p>Kendinizi daha iyi anlamanız ve yaşamın getirdiği zorluklarla daha sağlıklı başa çıkabilmeniz için profesyonel destek sunuyorum.</p>
      </div>
      <div>
        <h4>Sayfalar</h4>
        <a href="#anasayfa">Anasayfa</a>
        <a href="#hakkimda">Hakkımda</a>
        <a href="#blog">Blog</a>
        <a href="#randevu">Randevu Al</a>
      </div>
      <div>
        <h4>İletişim</h4>
        <span><Phone /> 0542 104 88 74</span>
        <span><Mail /> Ankara / Türkiye</span>
      </div>
    </footer>
  );
}

function ReviewPage() {
  const params = new URLSearchParams(window.location.search);
  const appointmentId = params.get('appointment');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    if (text.trim().length < 10) {
      setError('Lütfen deneyiminizi biraz daha detaylı yazın.');
      return;
    }
    setLoading(true);
    try {
      await api('/reviews', { method: 'POST', body: JSON.stringify({ appointmentId, text }) });
      setText('');
      setResult({ ok: true });
    } catch (err) {
      setError(`Yorum gönderilemedi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="review-page">
      <Brand />
      <section className="review-card">
        <span className="eyebrow">Geri Bildirim</span>
        <h1>Deneyiminizi paylaşın.</h1>
        <p>Yorumunuz sisteme kaydedilir ve klinik tarafından değerlendirilir.</p>
        <form onSubmit={submit}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Seans deneyiminizi yazın..." />
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" disabled={loading}>{loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}</button>
        </form>
        {result && (
          <div className="review-thank-you">
            <strong>Teşekkür ederiz.</strong>
            <p>Yorumunuz alındı. Değerlendirmeniz sisteme kaydedildi.</p>
          </div>
        )}
      </section>
    </main>
  );
}
function AuthPanel({ auth, onClose }) {
  const [form, setForm] = useState({ email: 'admin@mindcare.test', password: '123456' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
      auth.save(data);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="auth-modal" onSubmit={submit}>
        <button type="button" className="close-button" onClick={onClose}>x</button>
        <Lock />
        <h2>Doktor Girişi</h2>
        <p>Bu alan sadece veritabanında kayıtlı doktor/admin kullanıcısı ile açılır.</p>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button">Panele Gir</button>
      </form>
    </div>
  );
}

function AdminShell({ auth }) {
  const [view, setView] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [adminServices, setAdminServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [refreshError, setRefreshError] = useState('');
  const token = auth.session.token;

  async function refresh() {
    const requests = [
      ['dashboard', api('/dashboard', {}, token)],
      ['appointments', api('/appointments', {}, token)],
      ['posts', api('/content/posts', {}, token)],
      ['services', api('/content/services', {}, token)],
      ['reviews', api('/content/reviews', {}, token)]
    ];
    const results = await Promise.allSettled(requests.map(([, request]) => request));
    const setters = {
      dashboard: setDashboard,
      appointments: setAppointments,
      posts: setPosts,
      services: setAdminServices,
      reviews: setReviews
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        setters[requests[index][0]](result.value);
      }
    });

    setRefreshError(results.some((result) => result.status === 'rejected')
      ? 'Bazı veriler şu an geç yüklendi; panel kullanılabilir, yenileme otomatik devam ediyor.'
      : '');
  }

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 20000);
    return () => window.clearInterval(timer);
  }, []);

  const items = [
    ['overview', 'Genel Bakış', LayoutDashboard],
    ['applications', 'Yeni Başvurular', Users],
    ['calendar', 'Seans Takvimi', Calendar],
    ['session', 'Seans Odası', Video],
    ['blog', 'Blog Yönetimi', FileText],
    ['services', 'Hizmetler', HeartHandshake],
  ];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo"><Brain /> Klinik Pro</div>
        {items.map(([id, label, Icon]) => (
          <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
            <Icon /> {label}
          </button>
        ))}
        <button onClick={auth.logout}><LogOut /> Çıkış</button>
      </aside>
      <section className="admin-content">
        {refreshError && <p className="form-error">{refreshError}</p>}
        {view === 'overview' && <Overview dashboard={dashboard} appointments={appointments} />}
        {view === 'applications' && <Applications appointments={appointments} token={token} refresh={refresh} />}
        {view === 'calendar' && <CalendarView appointments={appointments} token={token} refresh={refresh} />}
        {view === 'session' && <SessionRoom token={token} appointments={appointments} refresh={refresh} />}
        {view === 'blog' && <BlogManager posts={posts} token={token} refresh={refresh} />}
        {view === 'services' && <ServicesManager services={adminServices} token={token} refresh={refresh} />}
      </section>
    </main>
  );
}

function Overview({ dashboard, appointments }) {
  if (!dashboard) return <div className="admin-card">Yükleniyor...</div>;
  const total = dashboard.summary.appointmentCount || 0;
  const pending = dashboard.summary.pendingAppointments || 0;
  const todaySessions = dashboard.summary.todaySessions || 0;
  const maxService = Math.max(1, ...dashboard.serviceDistribution.map((item) => item.count), 1);
  const maxDaily = Math.max(1, ...dashboard.appointmentsByDate.map((item) => item.total), 1);
  const maxStatus = Math.max(1, ...dashboard.statusDistribution.map((item) => item.count), 1);
  const summary = dashboard.summary;
  const maxMonthly = Math.max(1, ...dashboard.monthlyMatrix.flatMap((item) => [item.pending, item.approved, item.completed]), 1);

  return (
    <>
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Canlı Operasyon Merkezi</span>
          <h1>Genel Bakış Dashboard</h1>
          <p>Başvuru, mesaj, seans, yorum ve hizmet verileri önce bu ekranda toplanır; klinik paneli aynı API verisini kullanır.</p>
        </div>
        <div className="live-pill"><TrendingUp /> 10 saniyede bir yenilenir</div>
      </div>
      <div className="admin-stats">
        <article><span>Toplam Danışan</span><strong>{total}</strong></article>
        <article><span>Bugünkü Seanslar</span><strong>{todaySessions}</strong></article>
        <article className="highlight"><span>Bekleyen Başvuru</span><strong>{pending}</strong></article>
      </div>
      <div className="admin-grid">
        <div className="admin-card wide">
          <h2>Günlere Göre Başvuru Akışı</h2>
          <div className="line-chart real-chart" aria-label="Günlere göre başvuru akışı">
            {dashboard.appointmentsByDate.map((item) => (
              <div className="chart-column" key={item.date}>
                <i style={{ height: `${Math.max(8, (item.total / maxDaily) * 100)}%` }} />
                <span>{item.date.slice(5)}</span>
                <b>{item.total}</b>
              </div>
            ))}
            {!dashboard.appointmentsByDate.length && <p>Başvuru geldikçe grafik burada canlı oluşur.</p>}
          </div>
        </div>
        <div className="admin-card">
          <h2>Başvuru Durumları</h2>
          {dashboard.statusDistribution.map((item) => (
            <div className="bar-row admin-bar" key={item.status}>
              <span>{statusLabel(item.status)}</span>
              <div className="bar-track"><div style={{ width: `${(item.count / maxStatus) * 100}%` }} /></div>
              <b>{item.count}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-card">
        <h2>Hizmet Dağılımı</h2>
        {dashboard.serviceDistribution.map((item) => (
          <div className="bar-row admin-bar" key={item.service}>
            <span>{item.service}</span>
            <div className="bar-track"><div style={{ width: `${(item.count / maxService) * 100}%` }} /></div>
            <b>{item.count}</b>
          </div>
        ))}
        {!dashboard.serviceDistribution.length && <p>Henüz hizmet başvurusu yok.</p>}
      </div>
      <div className="dashboard-mosaic">
        <div className="admin-card">
          <h2>Operasyon Oranları</h2>
          <div className="ratio-grid">
            <div><strong>{summary.approvalRate}%</strong><span>Onay oranı</span></div>
            <div><strong>{summary.completionRate}%</strong><span>Tamamlanma</span></div>
            <div><strong>{summary.sessionNoteCount}</strong><span>Seans notu</span></div>
            <div><strong>{summary.reviewCount}</strong><span>Geri bildirim</span></div>
          </div>
        </div>
        <div className="admin-card wide">
          <h2>Aylık Operasyon Matrisi</h2>
          <div className="stacked-chart">
            {dashboard.monthlyMatrix.map((item) => (
              <div className="stacked-row" key={item.month}>
                <span>{item.month}</span>
                <div>
                  <i className="pending" style={{ width: `${(item.pending / maxMonthly) * 100}%` }} />
                  <i className="approved" style={{ width: `${(item.approved / maxMonthly) * 100}%` }} />
                  <i className="completed" style={{ width: `${(item.completed / maxMonthly) * 100}%` }} />
                </div>
                <b>{item.pending + item.approved + item.completed}</b>
              </div>
            ))}
            {!dashboard.monthlyMatrix.length && <p>Veri geldikçe aylık matris oluşur.</p>}
          </div>
        </div>
      </div>
      <div className="admin-card">
        <h2>Son Başvurular ve İşlemler</h2>
        <table>
          <thead><tr><th>Danışan</th><th>Hizmet</th><th>Tarih</th><th>Durum</th></tr></thead>
          <tbody>
            {appointments.slice(0, 5).map((item) => (
              <tr key={item.id}><td>{item.name}</td><td>{item.service}</td><td>{item.preferredDate || '-'}</td><td>{statusLabel(item.status)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Applications({ appointments, token, refresh }) {
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [visibleAppointments, setVisibleAppointments] = useState(appointments);
  const [aiSummaryById, setAiSummaryById] = useState({});
  const [aiBusyId, setAiBusyId] = useState('');

  useEffect(() => {
    setVisibleAppointments(appointments);
  }, [appointments]);

  const newApplications = visibleAppointments.filter((item) => item.status === 'pending');
  const historyApplications = visibleAppointments.filter((item) => item.status !== 'pending');

  async function updateStatus(id, status) {
    setActionError('');
    setActionStatus('');
    setBusyId(id);
    try {
      const updated = await api(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      setVisibleAppointments((current) => current.map((item) => (item.id === id ? updated : item)));
      setActionStatus(status === 'approved' ? 'Başvuru onaylandı.' : 'Başvuru reddedildi.');
      await refresh();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId('');
    }
  }

  async function deleteAppointment(id) {
    setActionError('');
    setActionStatus('');
    setBusyId(id);
    try {
      await api(`/appointments/${id}`, { method: 'DELETE' }, token);
      setVisibleAppointments((current) => current.filter((item) => item.id !== id));
      setActionStatus('Başvuru veritabanından silindi.');
      await refresh();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId('');
    }
  }

  async function readAiSummary(id) {
    setActionError('');
    setActionStatus('');
    setAiBusyId(id);
    try {
      const result = await api(`/sessions/summary/${id}`, { method: 'POST', body: JSON.stringify({ notes: '' }) }, token);
      setAiSummaryById((current) => ({ ...current, [id]: result.analysis }));
    } catch (error) {
      setActionError(error.message || 'Bu danışan için AI özeti oluşturulamadı.');
    } finally {
      setAiBusyId('');
    }
  }

  function AppointmentRows({ items, mode }) {
    return (
      <tbody>
        {items.map((item) => {
          const aiSummary = aiSummaryById[item.id];
          return (
            <React.Fragment key={item.id}>
              <tr>
                <td><strong>{item.name}</strong><span>{item.email}<br />{item.phone}</span></td>
                <td>{item.service}</td>
                <td>
                  {item.preferredDate || 'Belirtilmedi'} {item.preferredTime || ''}<br />
                  <em>{statusLabel(item.status)}</em>
                  {item.mailDelivery && (
                    <small>
                      Mail: {item.mailDelivery.status === 'sent'
                        ? 'Gönderildi'
                        : item.mailDelivery.status === 'failed'
                          ? 'Mail hatası'
                          : 'SMTP tanımlı değil'}
                    </small>
                  )}
                </td>
                <td className="table-actions">
                  {mode === 'new' ? (
                    <>
                      <button className="success-button" disabled={busyId === item.id} onClick={() => updateStatus(item.id, 'approved')}>
                        {busyId === item.id ? 'İşleniyor...' : 'Onayla'}
                      </button>
                      <button className="danger-button" disabled={busyId === item.id} onClick={() => updateStatus(item.id, 'rejected')}>Reddet</button>
                    </>
                  ) : (
                    <button className="outline-pill" disabled={aiBusyId === item.id} onClick={() => readAiSummary(item.id)}>
                      {aiBusyId === item.id ? 'Okunuyor...' : 'Yapay Zeka Özetini Oku'}
                    </button>
                  )}
                  <button className="danger-button" disabled={busyId === item.id} onClick={() => deleteAppointment(item.id)}><Trash2 /> Sil</button>
                </td>
              </tr>
              {aiSummary && (
                <tr className="ai-history-row">
                  <td colSpan="4">
                    <div className="ai-summary-panel compact">
                      <span>{aiSummary.provider}</span>
                      <h3>Terapi Süreci Özeti</h3>
                      <p>{aiSummary.summary}</p>
                      <strong>Odak Alanları</strong>
                      <ul>{(aiSummary.focusAreas || []).map((focus) => <li key={focus}>{focus}</li>)}</ul>
                      <strong>Sonraki Seans İçin Öneriler</strong>
                      <ul>{(aiSummary.nextSessionSuggestions || []).map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
        {!items.length && <tr><td colSpan="4">Bu bölümde kayıt yok.</td></tr>}
      </tbody>
    );
  }

  return (
    <>
      <div className="admin-title-row">
        <h1>Başvurular</h1>
      </div>
      {actionError && <p className="form-error">{actionError}</p>}
      {actionStatus && <p className="form-success">{actionStatus}</p>}
      <div className="admin-card">
        <h2>Yeni Başvurular</h2>
        <table>
          <thead><tr><th>Danışan</th><th>Hizmet</th><th>Tarih</th><th>İşlem</th></tr></thead>
          <AppointmentRows items={newApplications} mode="new" />
        </table>
      </div>
      <div className="admin-card">
        <h2>Geçmiş Başvurular ve Aktif Süreçler</h2>
        <table>
          <thead><tr><th>Danışan</th><th>Hizmet</th><th>Tarih</th><th>İşlem</th></tr></thead>
          <AppointmentRows items={historyApplications} mode="history" />
        </table>
      </div>
    </>
  );
}
function CalendarView({ appointments, token, refresh }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const today = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ name: '', service: 'Online Terapi', message: '' });
  const [calendarError, setCalendarError] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const calendarRequestRef = useRef(0);
  const approved = appointments.filter((item) => item.status === 'approved');
  const daysInSelectedMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const sessionCountsByDate = appointments.reduce((acc, item) => {
    if (!item.preferredDate || !['approved', 'completed'].includes(item.status)) return acc;
    acc[item.preferredDate] = (acc[item.preferredDate] || 0) + 1;
    return acc;
  }, {});

  function dateForDay(day) {
    return `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isPastDate(day) {
    return selectedMonth < currentMonth || (selectedMonth === currentMonth && day < currentDay);
  }

  function isPastMonth(monthIndex) {
    return monthIndex < currentMonth;
  }

  async function loadSlots(date) {
    const requestId = calendarRequestRef.current + 1;
    calendarRequestRef.current = requestId;
    if (date < today) return;
    setSelectedDate(date);
    setCalendarError('');
    setCalendarLoading(true);
    try {
      const data = await api(`/appointments/slots?date=${encodeURIComponent(date)}`, {}, token);
      if (calendarRequestRef.current !== requestId) return;
      setSlots(data.slots || []);
      setSelectedSlot('');
    } catch (err) {
      if (calendarRequestRef.current !== requestId) return;
      setSlots([]);
      setSelectedSlot('');
      setCalendarError(`Saatler alınamadı: ${err.message}`);
    } finally {
      if (calendarRequestRef.current === requestId) setCalendarLoading(false);
    }
  }

  useEffect(() => {
    const day = selectedMonth === currentMonth ? currentDay : 1;
    loadSlots(dateForDay(day));
  }, [selectedMonth]);

  async function createFromSlot() {
    setCalendarError('');
    if (!selectedSlot) return;
    if (form.name.trim().length < 2) {
      setCalendarError('Lütfen seansın kimin için oluşturulduğunu yazın.');
      return;
    }
    await api('/appointments/doctor-create', {
      method: 'POST',
      body: JSON.stringify({ ...form, preferredDate: selectedDate, preferredTime: selectedSlot })
    }, token);
    setForm({ name: '', service: form.service, message: '' });
    await refresh();
    await loadSlots(selectedDate);
  }

  return (
    <>
      <h1>Seans Takvimi</h1>
      <div className="month-strip">
        {monthNames.map((month, index) => (
          <button
            key={month}
            disabled={isPastMonth(index)}
            className={selectedMonth === index ? 'active' : isPastMonth(index) ? 'past' : ''}
            onClick={() => setSelectedMonth(index)}
          >
            {month}
          </button>
        ))}
      </div>
      <div className="admin-card">
        <h2>Yaklaşan Seanslar</h2>
        {approved.map((item) => <div className="calendar-row" key={item.id}><strong>{item.preferredDate || 'Tarih bekliyor'}</strong><span>{item.name}</span><em>Aktif</em></div>)}
        {!approved.length && <p>Onaylanmış seans bulunmuyor.</p>}
      </div>
      <div className="calendar-layout">
        <div className="calendar-grid">
          {Array.from({ length: daysInSelectedMonth }, (_, i) => {
            const day = i + 1;
            const date = dateForDay(day);
            const sessionCount = sessionCountsByDate[date] || 0;
            const past = isPastDate(day);
            return (
              <button disabled={past} className={`${selectedDate === date ? 'active' : ''} ${past ? 'past-day' : ''}`} key={date} onClick={() => loadSlots(date)}>
                <strong>{day}</strong>
                {sessionCount > 0 && <span className="day-session-badge">{sessionCount} seans</span>}
                {past && <span className="day-locked">Geçmiş</span>}
              </button>
            );
          })}
        </div>
        <div className="admin-card day-panel">
          <h2>{selectedDate}</h2>
          <p>Doluluk ve boş saatler</p>
          <div className="slot-grid">
            {calendarLoading && <p>Saatler yükleniyor...</p>}
            {!calendarLoading && slots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                className={selectedSlot === slot.time ? 'active' : ''}
                onClick={() => setSelectedSlot(slot.time)}
              >
                <strong>{slot.time}</strong>
                <span>{slot.available ? 'Boş' : `Dolu - ${slot.appointment.codeName}`}</span>
              </button>
            ))}
            {!calendarLoading && !slots.length && <p>Bu gün için saat bilgisi alınamadı.</p>}
          </div>
          <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            <option>Online Terapi</option>
            <option>Ergen Terapisi</option>
            <option>Evlilik ve Çift Terapisi</option>
            <option>Cinsel Terapi</option>
          </select>
          <input placeholder="Danışan adı soyadı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Manuel başvuru notu" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          {calendarError && <p className="form-error">{calendarError}</p>}
          <button className="primary-button" disabled={!selectedSlot} onClick={createFromSlot}>Boş Saate Başvuru Oluştur</button>
        </div>
      </div>
    </>
  );
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function SessionRoom({ token, appointments, refresh }) {
  const today = localDateKey();
  const todaysAppointments = appointments.filter((item) => item.status === 'approved' && item.preferredDate === today);
  const selectable = todaysAppointments;
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [sessionRunning, setSessionRunning] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [finishedAppointment, setFinishedAppointment] = useState(null);
  const [followUpDate, setFollowUpDate] = useState(today);
  const [followUpSlots, setFollowUpSlots] = useState([]);
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const selected = selectable.find((item) => item.id === selectedId) || selectable[0];

  useEffect(() => {
    if (!sessionRunning || !selected) return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [sessionRunning, selected?.id]);

  useEffect(() => {
    setAiSummary(null);
    setSessionStatus('');
    if (!selected) {
      setSessionRunning(false);
      setElapsed(0);
      setNotes('');
    }
  }, [selected?.id]);

  async function saveNotes({ silent = false } = {}) {
    if (!selected || !notes.trim()) return;
    await api(`/sessions/${selected.id}`, {
      method: 'POST',
      body: JSON.stringify({ anonymousNotes: notes })
    }, token);
    if (!silent) setSessionStatus('Seans notu kaydedildi.');
    setNotes('');
  }

  async function loadFollowUpSlots(date) {
    setFollowUpDate(date);
    setFollowUpTime('');
    setFollowUpLoading(true);
    try {
      const data = await api(`/appointments/slots?date=${encodeURIComponent(date)}`, {}, token);
      setFollowUpSlots(data.slots || []);
    } catch (error) {
      setSessionStatus(`Boş saatler alınamadı: ${error.message}`);
      setFollowUpSlots([]);
    } finally {
      setFollowUpLoading(false);
    }
  }

  async function finishCurrentSession() {
    if (!selected) return;
    const current = selected;
    if (notes.trim()) await saveNotes({ silent: true });
    setSessionRunning(false);
    setElapsed(0);
    await api(`/appointments/${current.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'session_done' }) }, token);
    setFinishedAppointment(current);
    setSelectedId('');
    setSessionStatus('Seans bitirildi. Danışan bugünkü seans listesinden çıkarıldı; gelecek seansı aşağıdan planlayabilirsiniz.');
    await refresh();
    await loadFollowUpSlots(followUpDate);
  }

  async function planFollowUp() {
    if (!finishedAppointment || !followUpDate || !followUpTime) return;
    await api('/appointments/doctor-create', {
      method: 'POST',
      body: JSON.stringify({
        sourceAppointmentId: finishedAppointment.id,
        name: finishedAppointment.name,
        service: finishedAppointment.service,
        preferredDate: followUpDate,
        preferredTime: followUpTime,
        message: 'Önceki seans sonrası doktor tarafından planlanan takip seansı'
      })
    }, token);
    setSessionStatus('Gelecek seans başarıyla planlandı.');
    setFinishedAppointment(null);
    setFollowUpTime('');
    await refresh();
    await loadFollowUpSlots(followUpDate);
  }

  async function analyzeWithAi() {
    if (!selected) return;
    setAiLoading(true);
    setSessionStatus('');
    try {
      const result = await api(`/sessions/summary/${selected.id}`, {
        method: 'POST',
        body: JSON.stringify({ notes: '' })
      }, token);
      setAiSummary(result.analysis);
      setSessionStatus('Terapi süreci AI ile özetlendi. Yalnızca kaydedilmiş seans notları kullanıldı.');
    } catch (error) {
      setSessionStatus(error.message || 'Yapay zeka analizi oluşturulamadı.');
    } finally {
      setAiLoading(false);
    }
  }

  async function completeTherapy() {
    if (!selected && !finishedAppointment) return;
    const target = selected || finishedAppointment;
    const first = window.confirm('Terapi sürecini tamamen sonlandırmak üzeresiniz. Bu işlem normal seans bitirme değildir. Devam edilsin mi?');
    if (!first) return;
    const second = window.confirm('Son onay: Terapi süreci kapatılsın ve danışana yorum maili gönderilmeye çalışılsın mı?');
    if (!second) return;
    if (selected && notes.trim()) await saveNotes({ silent: true });
    setSessionRunning(false);
    await api(`/appointments/${target.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }, token);
    await refresh();
    setFinishedAppointment(null);
    setSessionStatus('Terapi süreci tamamen kapatıldı. SMTP bilgileri tanımlıysa danışana yorum bağlantısı içeren e-posta gönderildi.');
  }

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Seans Odası</h1>
          <p>Bugünkü onaylanmış seansı başlatın, not alın, seansı bitirin ve gerekirse takip seansı planlayın.</p>
        </div>
        <div className={sessionRunning ? 'session-timer running' : 'session-timer'}>
          <Clock /> {formatDuration(elapsed)}
        </div>
      </div>
      {!selected && !finishedAppointment && (
        <div className="session-break-card">
          <strong>Seans arası modu aktif</strong>
          <p>Bugün onaylanmış seans yok. Seans odası sadece bugün yapılacak onaylı görüşmeler için aktif olur.</p>
        </div>
      )}
      <div className="session-room-layout">
        <div className="admin-card session-focus-card">
          <h2>Danışan Bilgisi</h2>
          <select disabled={!selected} value={selected?.id || ''} onChange={(e) => setSelectedId(e.target.value)}>
            {selectable.map((item) => (
              <option key={item.id} value={item.id}>{item.name} - {item.service} - {item.preferredDate || 'tarih yok'} {item.preferredTime || ''}</option>
            ))}
          </select>
          {selected ? (
            <div className="patient-summary">
              <p><strong>Danışan:</strong> {selected.name}</p>
              <p><strong>E-posta:</strong> {selected.email}</p>
              <p><strong>Telefon:</strong> {selected.phone}</p>
              <p><strong>Hizmet:</strong> {selected.service}</p>
              <p><strong>Başvuru Notu:</strong> {selected.message || 'Not yok'}</p>
            </div>
          ) : <p>Bugün onaylanmış aktif seans yok.</p>}
          {aiSummary && (
            <div className="ai-summary-panel">
              <span>{aiSummary.provider}</span>
              <h3>Terapi Süreci Özeti</h3>
              <p>{aiSummary.summary}</p>
              <div className="ai-summary-grid">
                <div><strong>Takip Durumu</strong><p>{aiSummary.riskLevel}</p></div>
                <div><strong>Gizlilik</strong><p>{aiSummary.privacyNote}</p></div>
              </div>
              <strong>Odak Alanları</strong>
              <ul>{(aiSummary.focusAreas || []).map((item) => <li key={item}>{item}</li>)}</ul>
              <strong>Sonraki Seans İçin Öneriler</strong>
              <ul>{(aiSummary.nextSessionSuggestions || []).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
        </div>
        <div className="admin-card session-notes-card">
          <h2>Canlı Seans Notları</h2>
          <div className="timer-display">
            <span>{sessionRunning ? 'Seans sürüyor' : selected ? 'Seans beklemede' : 'Pasif'}</span>
            <strong>{formatDuration(elapsed)}</strong>
          </div>
          <div className="session-actions">
            <button className="primary-button" disabled={!selected} onClick={() => setSessionRunning((value) => !value)}>
              <Play /> {sessionRunning ? 'Duraklat' : 'Seansı Başlat'}
            </button>
            <button className="outline-pill" disabled={!selected || elapsed === 0} onClick={() => setElapsed(0)}>Sıfırla</button>
            <button className="success-button" disabled={!selected || elapsed === 0} onClick={finishCurrentSession}>Seansı Bitir</button>
          </div>
          <textarea disabled={!selected || !sessionRunning} className={!selected || !sessionRunning ? 'disabled-note' : ''} placeholder={selected ? 'Seans sırasında not alın. Kaydedilen notlar doktor panelinde saklanır ve AI özeti için kullanılabilir.' : 'Bugün onaylı seans gelince aktif olur.'} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="session-secondary-actions">
            <button className="success-button" disabled={!selected || !notes.trim()} onClick={() => saveNotes()}>Notu Kaydet</button>
            <button className="outline-pill" disabled={!selected || aiLoading} onClick={analyzeWithAi}>{aiLoading ? 'AI Analiz Ediyor...' : 'Kaydedilmiş Notlardan Terapiyi Özetle'}</button>
          </div>
          <p className="session-action-hint">AI özeti yalnızca kaydedilmiş seans notlarından üretilir. Not yoksa sistem özet oluşturmaz.</p>
          {sessionStatus && <p className="form-success">{sessionStatus}</p>}
        </div>
      </div>

      {finishedAppointment && (
        <div className="admin-card follow-up-panel">
          <h2>Gelecek Seansı Planla</h2>
          <p>{finishedAppointment.name} için yeni tarih ve boş saat seçin.</p>
          <input type="date" min={today} value={followUpDate} onChange={(e) => loadFollowUpSlots(e.target.value)} />
          <div className="slot-grid compact-slots">
            {followUpLoading && <p>Saatler yükleniyor...</p>}
            {!followUpLoading && followUpSlots.map((slot) => (
              <button key={slot.time} disabled={!slot.available} className={followUpTime === slot.time ? 'active' : ''} onClick={() => setFollowUpTime(slot.time)}>
                <strong>{slot.time}</strong>
                <span>{slot.available ? 'Boş' : `Dolu - ${slot.appointment.codeName}`}</span>
              </button>
            ))}
          </div>
          <button className="primary-button" disabled={!followUpTime} onClick={planFollowUp}>Gelecek Seansı Kaydet</button>
        </div>
      )}

      <div className="therapy-complete-footer">
        <button className="danger-button" disabled={!selected && !finishedAppointment} onClick={completeTherapy}>Terapi Sürecini Tamamen Sonlandır</button>
      </div>
    </>
  );
}
function MailLogPanel({ mailLog }) {
  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Mail Simülasyonu</h1>
          <p>SMTP eklenene kadar onay, ret ve teşekkür mailleri bu canlı kayıtta simüle edilir.</p>
        </div>
      </div>
      <div className="admin-card mail-log-list">
        {mailLog.map((mail) => (
          <article key={mail.id}>
            <span>{mail.type} - {mail.provider}</span>
            <h2>{mail.subject}</h2>
            <p>{mail.message}</p>
            <small>{mail.to} - {new Date(mail.createdAt).toLocaleString('tr-TR')}</small>
          </article>
        ))}
        {!mailLog.length && <p>Henüz simüle edilmiş mail yok. Başvuru onayla, reddet veya seans tamamla işlemleri burada görünür.</p>}
      </div>
    </>
  );
}

function BlogManager({ posts, token, refresh }) {
  const [form, setForm] = useState({ title: '', excerpt: '', image: '', date: '' });
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ title: '', excerpt: '', image: '', date: '' });
  const [blogError, setBlogError] = useState('');

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function selectBlogImage(event, setter) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBlogError('');
    if (!file.type.startsWith('image/')) {
      setBlogError('Lütfen sadece görsel dosyası seçin.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setBlogError('Görsel 3 MB altında olmalıdır. Büyük dosyalar siteyi yavaşlatır.');
      event.target.value = '';
      return;
    }
    const image = await readImageFile(file);
    setter((current) => ({ ...current, image }));
    event.target.value = '';
  }

  async function addPost(event) {
    event.preventDefault();
    setBlogError('');
    await api('/content/posts', { method: 'POST', body: JSON.stringify(form) }, token);
    setForm({ title: '', excerpt: '', image: '', date: '' });
    refresh();
  }

  function startEdit(post) {
    setEditingId(post.id);
    setEditForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      image: post.image || '',
      date: post.date || ''
    });
  }

  function cancelEdit() {
    setBlogError('');
    setEditingId('');
    setEditForm({ title: '', excerpt: '', image: '', date: '' });
  }

  async function updatePost(post, updates) {
    setBlogError('');
    await api(`/content/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
    cancelEdit();
    refresh();
  }

  async function deletePost(id) {
    await api(`/content/posts/${id}`, { method: 'DELETE' }, token);
    refresh();
  }

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Blog Yönetimi</h1>
          <p>Blog yazıları backend veritabanına kaydedilir; public sitedeki Son Yazılar bölümü API'den beslenir.</p>
        </div>
      </div>
      <form className="admin-card content-form" onSubmit={addPost}>
        <h2>Yeni Blog Yazısı</h2>
        <input placeholder="Başlık" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <input placeholder="Tarih örn. 30 May 2026" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        <input placeholder="Görsel URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
        <label className="file-picker">
          <input type="file" accept="image/*" onChange={(event) => selectBlogImage(event, setForm)} />
          Bilgisayardan Görsel Seç
        </label>
        {form.image && <img className="blog-image-preview" src={form.image} alt="Seçilen blog görseli önizlemesi" />}
        <textarea placeholder="Kısa açıklama" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
        {blogError && <p className="form-error">{blogError}</p>}
        <button className="primary-button">Blog Ekle</button>
      </form>
      <div className="admin-card blog-admin-list">
        {posts.map((post) => (
          <div key={post.id}>
            <img src={post.image} alt="" />
            {editingId === post.id ? (
              <form className="inline-edit-form" onSubmit={(event) => {
                event.preventDefault();
                updatePost(post, editForm);
              }}>
                <input placeholder="Başlık" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
                <input placeholder="Tarih" value={editForm.date} onChange={(event) => setEditForm({ ...editForm, date: event.target.value })} />
                <input placeholder="Görsel URL" value={editForm.image} onChange={(event) => setEditForm({ ...editForm, image: event.target.value })} />
                <label className="file-picker">
                  <input type="file" accept="image/*" onChange={(event) => selectBlogImage(event, setEditForm)} />
                  Bilgisayardan Görsel Seç
                </label>
                {editForm.image && <img className="blog-image-preview" src={editForm.image} alt="Düzenlenen blog görseli önizlemesi" />}
                <textarea placeholder="Kısa açıklama" value={editForm.excerpt} onChange={(event) => setEditForm({ ...editForm, excerpt: event.target.value })} />
                {blogError && <p className="form-error">{blogError}</p>}
                <div className="inline-edit-actions">
                  <button className="success-button" type="submit"><Check /> Kaydet</button>
                  <button className="outline-pill" type="button" onClick={cancelEdit}>İptal</button>
                </div>
              </form>
            ) : (
              <>
                <span>
                  <strong>{post.title}</strong>
                  <small>{post.published ? 'Yayında' : 'Taslak'} - {post.date}</small>
                </span>
                <button className="primary-button small" onClick={() => startEdit(post)}>Düzenle</button>
                <button className="success-button" onClick={() => updatePost(post, { published: !post.published })}>{post.published ? 'Taslağa Al' : 'Yayınla'}</button>
                <button className="danger-button" onClick={() => deletePost(post.id)}><Trash2 /> Kaldır</button>
              </>
            )}
          </div>
        ))}
        {!posts.length && <p>Henüz blog yazısı yok.</p>}
      </div>
    </>
  );
}

function ServicesManager({ services, token, refresh }) {
  const [form, setForm] = useState({ title: '', summary: '', icon: 'Heart' });
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ title: '', summary: '', icon: 'Heart' });
  const [error, setError] = useState('');

  async function addService(event) {
    event.preventDefault();
    setError('');
    if (form.title.trim().length < 3) {
      setError('Hizmet başlığı en az 3 karakter olmalıdır.');
      return;
    }
    await api('/content/services', { method: 'POST', body: JSON.stringify(form) }, token);
    setForm({ title: '', summary: '', icon: 'Heart' });
    refresh();
  }

  async function toggleService(service) {
    await api(`/content/services/${service.id}`, { method: 'PATCH', body: JSON.stringify({ published: !service.published }) }, token);
    refresh();
  }

  function startEdit(service) {
    setError('');
    setEditingId(service.id);
    setEditForm({
      title: service.title || '',
      summary: service.summary || '',
      icon: service.icon || 'Heart'
    });
  }

  function cancelEdit() {
    setEditingId('');
    setEditForm({ title: '', summary: '', icon: 'Heart' });
  }

  async function saveService(service) {
    setError('');
    if (editForm.title.trim().length < 3) {
      setError('Hizmet başlığı en az 3 karakter olmalıdır.');
      return;
    }
    await api(`/content/services/${service.id}`, { method: 'PATCH', body: JSON.stringify(editForm) }, token);
    cancelEdit();
    refresh();
  }

  async function deleteService(id) {
    await api(`/content/services/${id}`, { method: 'DELETE' }, token);
    refresh();
  }

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Hizmetler</h1>
          <p>Public randevu formu ve hizmet kartları bu listeden beslenir. Cinsel Terapi de hizmetler arasında yer alır.</p>
        </div>
      </div>
      <form className="admin-card content-form" onSubmit={addService}>
        <h2>Yeni Hizmet Ekle</h2>
        <input placeholder="Hizmet başlığı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Kısa açıklama" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
          <option value="Heart">Kalp</option>
          <option value="Users">Danışanlar</option>
          <option value="Monitor">Online</option>
        </select>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button">Hizmet Ekle</button>
      </form>
      <div className="admin-card services-admin-list">
        {services.map((service) => (
          <article key={service.id}>
            <HeartHandshake />
            {editingId === service.id ? (
              <form className="inline-edit-form service-edit-form" onSubmit={(event) => {
                event.preventDefault();
                saveService(service);
              }}>
                <input placeholder="Hizmet başlığı" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
                <textarea placeholder="Kısa açıklama" value={editForm.summary} onChange={(event) => setEditForm({ ...editForm, summary: event.target.value })} />
                <select value={editForm.icon} onChange={(event) => setEditForm({ ...editForm, icon: event.target.value })}>
                  <option value="Heart">Kalp</option>
                  <option value="Users">Danışanlar</option>
                  <option value="Monitor">Online</option>
                </select>
                <div className="inline-edit-actions">
                  <button className="success-button" type="submit"><Check /> Kaydet</button>
                  <button className="outline-pill" type="button" onClick={cancelEdit}>İptal</button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h2>{service.title}</h2>
                  <p>{service.summary}</p>
                </div>
                <button className="primary-button small" onClick={() => startEdit(service)}>Düzenle</button>
                <button className={service.published ? 'success-button' : 'primary-button small'} onClick={() => toggleService(service)}>
                  {service.published ? 'Yayında' : 'Yayınla'}
                </button>
                <button className="danger-button" onClick={() => deleteService(service.id)}><Trash2 /> Kaldır</button>
              </>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function App() {
  const auth = useAuth();
  const [site, setSite] = useState({ services: [], posts: [], testimonials: [] });
  const path = window.location.pathname;
  const isDoctorRoute = path === '/doctor';
  const isReviewRoute = path === '/review';

  useEffect(() => {
    api('/public/site').then(setSite);
  }, []);

  const services = useMemo(() => site.services.length ? site.services : [], [site.services]);

  if (isReviewRoute) return <ReviewPage />;
  if (auth.session) return <AdminShell auth={auth} />;
  if (isDoctorRoute) return <AuthPanel auth={auth} onClose={() => { window.location.href = '/'; }} />;

  return (
    <>
      <PublicHeader />
      <Hero onAppointment={() => scrollToHash('#randevu')} />
      <Services services={services} />
      <About />
      <BlogPreview posts={site.posts} />
      <SocialShowcase />
      <Testimonials testimonials={site.testimonials} />
      <AppointmentForm services={services} />
      <Footer />
      <a className="floating-call" href="tel:+905421048874"><Phone /></a>
      <a className="floating-whatsapp" href="https://wa.me/905421048874"><MessageCircle /></a>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);




