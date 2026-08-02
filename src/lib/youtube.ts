// أدوات فيديوهات يوتيوب — الفيديوهات كلها بقت روابط يوتيوب بدل الرفع على Cloudinary

const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

// يقبل رابط يوتيوب بأي صيغة (watch?v=, youtu.be/, shorts/, embed/) أو الـ ID نفسه
export function getYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (YT_ID_RE.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return YT_ID_RE.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id && YT_ID_RE.test(id) ? id : null;
      }
      const match = url.pathname.match(/^\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    return null;
  }
  return null;
}

export function isYouTubeUrl(input: string | null | undefined): boolean {
  return getYouTubeId(input) !== null;
}

// صورة مصغّرة مجانية من يوتيوب — بديل عن رفع thumbnail لـ Cloudinary
export function youtubeThumbnail(
  input: string | null | undefined,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'maxresdefault' = 'hqdefault',
): string | null {
  const id = getYouTubeId(input);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

interface EmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
}

// رابط embed جاهز للـ iframe — youtube-nocookie لخصوصية أفضل
export function youtubeEmbedUrl(input: string | null | undefined, opts: EmbedOptions = {}): string | null {
  const id = getYouTubeId(input);
  if (!id) return null;

  const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
  if (opts.autoplay) params.set('autoplay', '1');
  if (opts.mute) params.set('mute', '1');
  if (opts.controls === false) params.set('controls', '0');
  if (opts.loop) {
    params.set('loop', '1');
    params.set('playlist', id); // مطلوب عشان loop يشتغل على فيديو واحد
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
