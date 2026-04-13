import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'FENGYE LOGISTICS News';
  const category = searchParams.get('category') || 'Industry News';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f3d91',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: Category badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(158, 241, 248, 0.2)',
              color: '#9ef1f8',
              padding: '8px 20px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? '36px' : '44px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: Brand */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#98f7e8',
              letterSpacing: '0.05em',
            }}
          >
            FENGYE LOGISTICS
          </div>
          <div
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            fywarehouse.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
