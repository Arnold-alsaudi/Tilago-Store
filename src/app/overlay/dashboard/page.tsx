import { redirect } from 'next/navigation';

// اللوحة اتدمجت في /overlay نفسها — الصفحة دي فضلت عشان أي رابط قديم
// كان بيوصل هنا مايوقعش في 404.
export default function OverlayDashboardRedirect() {
  redirect('/overlay');
}
