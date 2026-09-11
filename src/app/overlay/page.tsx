import type { Metadata } from 'next';
import OverlayClient from './OverlayClient';

export const metadata: Metadata = {
  title: 'Tilago Overlay',
  description:
    'تركيبات بث بتتحرك مع كل هدية ومتابع. رابط واحد تحطه في OBS، بألوانك وشعارك، وتركيبات جديدة كل أسبوع.',
};

// نفس سياسة باقي الصفحات: مخزّنة على الحافة، ولوحة الأدمن بتلغي الكاش
// عند أي تعديل. الرقم ده شبكة أمان مش أكتر.
export const revalidate = 300;

export default function OverlayPage() {
  return <OverlayClient />;
}
