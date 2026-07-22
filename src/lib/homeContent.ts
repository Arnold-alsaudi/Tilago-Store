// محتوى الصفحة الرئيسية القابل للتعديل من لوحة الأدمن
// يُخزَّن في SiteSetting تحت المفتاح "homeContent" — ولو مش موجود نستخدم الافتراضي

export interface HomeWork { img: string; title: string; tag: string; href: string; }
export interface HomeStat { num: string; label: string; }
// كروت شبكة "أكثر من مجرد تصميم" — featured = الكارت الكبير في النص
export interface HomeGalleryItem { img: string; name: string; tag: string; featured?: boolean; }

export interface HomeContent {
  heroImage: string;
  works: HomeWork[];
  stats: HomeStat[];
  gallery: HomeGalleryItem[];
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroImage: '/55.png',
  works: [
    { tag: 'باكدج ستريم', title: 'Venom Pack',     img: '/photo/venom-1.png',       href: '/stream' },
    { tag: 'يرتات',       title: 'Alert Designs',   img: '/photo/alert-special.png', href: '/alerts' },
    { tag: 'أوفرلاي',    title: 'Stream Overlay',  img: '/photo/venom-5.png',       href: '/stream' },
    { tag: 'ستريم',       title: 'Venom Pack II',   img: '/photo/venom-7.png',       href: '/stream' },
    { tag: 'ستريم',       title: 'Pack Details',    img: '/photo/venom-9.png',       href: '/stream' },
    { tag: 'يرتات',       title: 'Special Alerts',  img: '/photo/venom-10.png',      href: '/alerts' },
  ],
  stats: [
    { num: '500+', label: 'عميل راضي' },
    { num: '200+', label: 'تصميم منجز' },
    { num: '24/7', label: 'دعم فني' },
    { num: '100%', label: 'ضمان الجودة' },
  ],
  gallery: [
    { img: '/photo/venom-9.png',       tag: 'ستريم',   name: 'Pack Details' },
    { img: '/photo/venom-1.png',       tag: 'باكدج',   name: 'Venom Pack', featured: true },
    { img: '/photo/alert-special.png', tag: 'يرتات',   name: 'Alert Special' },
    { img: '/photo/venom-7.png',       tag: 'ستريم',   name: 'Venom Pack II' },
    { img: '/photo/venom-5.png',       tag: 'أوفرلاي', name: 'Stream Overlay' },
  ],
};
