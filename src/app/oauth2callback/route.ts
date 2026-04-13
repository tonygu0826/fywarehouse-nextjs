import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new NextResponse(`<h1>Authorization Failed</h1><p>${error}</p>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!code) {
    return new NextResponse('<h1>No code received</h1>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse(
    `<html>
      <head><title>GBP Authorization Success</title></head>
      <body style="font-family:system-ui;padding:60px;text-align:center;">
        <h1 style="color:#0f3d91;">Authorization Successful!</h1>
        <p style="font-size:18px;">Your authorization code:</p>
        <div style="background:#f0f0f0;padding:20px;border-radius:8px;font-family:monospace;font-size:16px;word-break:break-all;max-width:600px;margin:20px auto;">
          ${code}
        </div>
        <p style="color:#666;">Copy this code and close the window.</p>
      </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
