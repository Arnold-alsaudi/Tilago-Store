// محتوى صفحة المطوّر القابل للتعديل من لوحة الأدمن
// يُخزَّن في SiteSetting تحت المفتاح "developerContent" — ولو مش موجود نستخدم الافتراضي

export interface DevProject { id: string; title: string; desc: string; images: string[]; link?: string; }
export interface DevCategory { id: string; title: string; icon: string; color: string; cover: string; desc: string; projects: DevProject[]; }
export interface DevDiscordService { id: string; title: string; icon: string; color: string; desc: string; }
export interface DevFeature { id: string; title: string; icon: string; desc: string; }
export interface DevContact { id: string; icon: string; label: string; sub: string; href: string; color: string; }

export interface DeveloperContent {
  heroImage: string;
  servicesTitle: string;
  servicesSubtitle: string;
  categories: DevCategory[];
  discordTitle: string;
  discordSubtitle: string;
  discordServices: DevDiscordService[];
  featuresTitle: string;
  features: DevFeature[];
  ctaTitle: string;
  ctaSubtitle: string;
  contacts: DevContact[];
  orderWhatsapp: string;
}

export const DEFAULT_DEVELOPER_CONTENT: DeveloperContent = {
  heroImage: '/55.png',
  servicesTitle: 'كل ما يخص المطوّرين',
  servicesSubtitle: 'حلول برمجية متكاملة من الفكرة للتنفيذ — بأعلى جودة وأحدث التقنيات.',
  categories: [
    {
      id: 'web', title: 'تطوير المواقع', icon: 'fas fa-globe', color: '#7dd3fc',
      cover: '/55.png',
      desc: 'مواقع ومتاجر إلكترونية سريعة وآمنة بتصميم متجاوب يظهر مثالي على كل الأجهزة.',
      projects: [
        { id: 'w1', title: 'متجر إلكتروني', desc: 'متجر متكامل بلوحة تحكم ودفع أونلاين وتصميم عصري.', images: ['/55.png', '/images.png'], link: 'https://tilago-store-rtp2.vercel.app' },
        { id: 'w2', title: 'موقع تعريفي',   desc: 'موقع شركة/براند بتصميم احترافي وأداء عالي.',        images: ['/images.png', '/55.png'] },
      ],
    },
    {
      id: 'apps', title: 'تطوير التطبيقات', icon: 'fas fa-mobile-screen-button', color: '#c084f5',
      cover: '/photo/anime.png',
      desc: 'تطبيقات موبايل احترافية (أندرويد و iOS) بتجربة استخدام سلسة وواجهات عصرية.',
      projects: [
        { id: 'a1', title: 'تطبيق متجر',  desc: 'تطبيق تسوّق بواجهة سلسة وربط كامل بالـ API.', images: ['/photo/anime.png', '/photo/alert-gift.png'] },
        { id: 'a2', title: 'تطبيق خدمات', desc: 'تطبيق حجوزات وخدمات بتصميم حديث.',            images: ['/photo/alert-3d.png', '/photo/anime.png'] },
      ],
    },
    {
      id: 'games', title: 'تطوير الألعاب', icon: 'fas fa-gamepad', color: '#ff8a3d',
      cover: '/photo/venom-1.png',
      desc: 'ألعاب ومشاريع تفاعلية بجرافيك مميز وأداء عالي — من الفكرة للتنفيذ الكامل.',
      projects: [
        { id: 'g1', title: 'لعبة أكشن',  desc: 'لعبة بجرافيك مميز وأنظمة داخل اللعبة.', images: ['/photo/venom-1.png', '/photo/venom-2.png'] },
        { id: 'g2', title: 'مشروع 3D',   desc: 'تجربة تفاعلية ثلاثية الأبعاد.',          images: ['/photo/venom-5.png', '/photo/venom-1.png'] },
      ],
    },
  ],
  discordTitle: 'تنظيم الديسكورد وبناء البوتات',
  discordSubtitle: 'سيرفرات احترافية من الصفر — تنظيم، بوتات، رولات، وحماية كاملة.',
  discordServices: [
    { id: 'd1', title: 'بوتات مخصصة',   icon: 'fas fa-robot',       color: '#5865F2', desc: 'بوتات ديسكورد بأي مهام تحتاجها — إدارة، ترحيب، حماية، تذاكر دعم، اقتصاد، وأكثر.' },
    { id: 'd2', title: 'تنظيم السيرفرات', icon: 'fas fa-users-gear',  color: '#9B59D0', desc: 'هيكلة كاملة للسيرفر: رومات مرتبة، أقسام، صلاحيات، وتصميم منظّم واحترافي.' },
    { id: 'd3', title: 'رولات وصلاحيات', icon: 'fas fa-user-shield', color: '#4FE3B8', desc: 'نظام رولات متكامل بألوان وصلاحيات مدروسة، ونظام مستويات (Levels) وتفاعل.' },
    { id: 'd4', title: 'إعداد سيرفر كامل', icon: 'fas fa-server',      color: '#F5C542', desc: 'سيرفر ديسكورد جاهز من الصفر — تصميم، بوتات، حماية، وتنظيم كامل باحترافية.' },
  ],
  featuresTitle: 'ليه Tilago؟',
  features: [
    { id: 'f1', icon: 'fas fa-gem',     title: 'جودة احترافية', desc: 'شغل نظيف ومدروس بأعلى المعايير، يليق باسمك ومشروعك.' },
    { id: 'f2', icon: 'fas fa-bolt',    title: 'تسليم سريع',    desc: 'ننجز مشروعك في أسرع وقت ممكن دون أي تنازل عن الجودة.' },
    { id: 'f3', icon: 'fas fa-sliders', title: 'تخصيص كامل',    desc: 'كل شيء مبني حسب احتياجك بالظبط — من الفكرة للتفاصيل.' },
    { id: 'f4', icon: 'fas fa-headset', title: 'دعم مستمر',     desc: 'فريقنا معاك خطوة بخطوة، وبعد التسليم كمان.' },
  ],
  ctaTitle: 'جاهز تبدأ مشروعك؟',
  ctaSubtitle: 'احكيلنا فكرتك، وإحنا نحوّلها لواقع احترافي يليق بك.',
  contacts: [
    { id: 'c1', icon: 'fab fa-whatsapp', label: 'واتساب',      sub: 'ابدأ مشروعك الآن',  href: 'https://wa.me/1234567890',      color: '#25D366' },
    { id: 'c2', icon: 'fab fa-telegram', label: 'تيليجرام',    sub: 'تواصل معنا مباشرة', href: 'https://t.me/yourchannel',      color: '#0088cc' },
    { id: 'c3', icon: 'fab fa-discord',  label: 'ديسكورد',     sub: 'انضم لسيرفر الدعم', href: 'https://discord.gg/yourserver', color: '#5865F2' },
    { id: 'c4', icon: 'fas fa-headset',  label: 'الدعم الفني', sub: 'نرد خلال 24 ساعة',  href: 'mailto:support@tilago.com',     color: '#9B59D0' },
  ],
  orderWhatsapp: 'https://wa.me/1234567890',
};
