import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not defined. Bypassing check for development.');
      // Bypass if keys aren't set up yet, to not break the app.
      return NextResponse.json({ success: true });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();

    if (recaptchaData.success && recaptchaData.score >= 0.5) {
      return NextResponse.json({ success: true, score: recaptchaData.score });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed reCAPTCHA validation' },
        { status: 403 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
