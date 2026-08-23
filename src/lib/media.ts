// أدوات موحّدة للوسائط — تفرّق بين يوتيوب / فيديو محلي (Cloudinary أو mp4) / صورة
// وتعطي صورة بوستر (أول فريم) للفيديو عشان نعرضها قبل التشغيل.

import { isYouTubeUrl, youtubeThumbnail } from './youtube';

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v|mkv)(\?|#|$)/i;

// فيديو مرفوع (مش يوتيوب): امتداد فيديو معروف أو رابط تسليم فيديو من Cloudinary
export function isVideoFileUrl(url?: string | null): boolean {
  if (!url) return false;
  if (VIDEO_EXT_RE.test(url)) return true;
  if (/\/video\/upload\//i.test(url)) return true;
  return false;
}

export type MediaKind = 'youtube' | 'video' | 'image';

// نوع الوسيط من الرابط
export function mediaKind(url?: string | null): MediaKind {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVideoFileUrl(url)) return 'video';
  return 'image';
}

// فيديو بأي شكل (يوتيوب أو ملف)؟
export function isAnyVideo(url?: string | null): boolean {
  return mediaKind(url) !== 'image';
}

// صورة بوستر للفيديو — thumbnail يوتيوب، أو أول فريم من فيديو Cloudinary، وإلا null
export function videoPoster(url?: string | null): string | null {
  const yt = youtubeThumbnail(url);
  if (yt) return yt;
  if (!url) return null;
  const m = url.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+?)\.(mp4|webm|ogg|ogv|mov|m4v|mkv)(\?.*)?$/i,
  );
  if (m) return `${m[1]}so_0/${m[2]}.jpg`;
  return null;
}
