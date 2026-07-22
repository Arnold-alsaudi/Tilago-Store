import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { isAdminAuthorized } from './adminAuth';

// حارس موحّد لكل مسارات الأدمن:
// يقبل جلسة NextAuth بدور ADMIN، أو توكن HMAC موقّع في هيدر Authorization.
export async function isRequestAdmin(req: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role === 'ADMIN') return true;
  return isAdminAuthorized(req.headers.get('authorization'));
}
