// محتوى الصفحة الرئيسية القابل للتعديل من لوحة الأدمن
// يُخزَّن في SiteSetting تحت المفتاح "homeContent" — ولو مش موجود نستخدم الافتراضي

export interface HomeStat { num: string; label: string; }
// كروت شبكة "أكثر من مجرد تصميم" — featured = الكارت الكبير في النص
export interface HomeGalleryItem { img: string; name: string; tag: string; featured?: boolean; }
// كروت قسم "Welcome To Tilago" — صورة + عنوان + وصف
export interface HomeFeature { img: string; title: string; desc: string; }

export interface HomeContent {
  heroImage: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: HomeFeature[];
  stats: HomeStat[];
  gallery: HomeGalleryItem[];
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroImage: '/55.png',
  featuresTitle: 'Welcome To Tilago',
  featuresSubtitle: 'تصاميم حصرية بلمسة سينمائية تخلّي قناتك تتميّز عن الجميع',
  features: [
    { img: '/photo/alert-special.png', title: '3D',     desc: 'اليرتات جاهزة ومصمّمة باحترافية ترفع تفاعل مشاهديك وتخلّي قناتك مميّزة عن الجميع.' },
    { img: '/photo/venom-1.png',       title: 'Stream', desc: 'أوفرلاي وشاشات بدء وإنهاء ويرتات — كل ما يحتاجه بثّك في باقة واحدة متكاملة.' },
    { img: '/photo/alert-special.png', title: 'Alert',  desc: 'شعارات وإنتروهات ومشاهد ثلاثية الأبعاد سينمائية تمنح قناتك بُعداً احترافياً مبهراً.' },
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
