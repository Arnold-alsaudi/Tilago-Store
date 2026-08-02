import { NextResponse } from 'next/server';

// خدمة فوري متوقفة — بايموب هو طريقة الدفع الوحيدة بالإضافة لـ PayPal
export async function POST() {
  return NextResponse.json({ error: 'Fawry payments are no longer available' }, { status: 410 });
}
