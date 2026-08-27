import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '모아 퀘스트 (MOA.QUEST) | 엄선된 블로그 & 라이프 큐레이션';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #060814 0%, #151032 50%, #060814 100%)',
          position: 'relative',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 앰비언트 글로우 */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.25)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.25)',
            filter: 'blur(80px)',
          }}
        />

        {/* 상단 엠블럼 Q 심볼 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #78350f 100%)',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '28px',
          }}
        >
          <span style={{ fontSize: '54px', fontWeight: '900', color: '#ffffff' }}>Q</span>
        </div>

        {/* 브랜드 타이틀 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '56px',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            모아 퀘스트
          </span>
          <span
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#f59e0b',
              padding: '6px 16px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            MOA.QUEST
          </span>
        </div>

        {/* 서브 헤드라인 */}
        <p
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#cbd5e1',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: '1.4',
            marginBottom: '36px',
          }}
        >
          업무 생산성 도구부터 자동차 전문 라이프, 마음 치유 에세이까지 —
          엄선된 블로그 아티클 실시간 큐레이션 포털
        </p>

        {/* 카테고리 태그들 */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
          }}
        >
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              fontSize: '18px',
              fontWeight: '700',
            }}
          >
            💼 업무·생산성 툴
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fcd34d',
              fontSize: '18px',
              fontWeight: '700',
            }}
          >
            🚗 자동차·폐차 정보
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
              fontSize: '18px',
              fontWeight: '700',
            }}
          >
            🌿 마음·에세이 치유
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
