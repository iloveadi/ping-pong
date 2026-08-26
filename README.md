# 🚀 블로그 백링크 RSS 자동 수집 웹사이트

Next.js(App Router), Tailwind CSS, `rss-parser`, Supabase 및 Vercel Cron Job을 활용한 고품질 dofollow 백링크 생성 및 블로그 피드 자동 수집 플랫폼입니다.

---

## 📌 주요 특징 및 설계

1. **엄격한 150자 요약 제한 (스팸 및 유사 문서 패널티 원천 차단)**
   - RSS 피드의 본문 전체는 절대로 저장하거나 노출하지 않습니다.
   - HTML 태그를 완전 정제하고 최대 150자 요약문만 추출하여 검색엔진의 중복 문서 패널티를 방지합니다.

2. **SEO 최적화된 `rel="dofollow"` 백링크 제공**
   - 모든 카드의 "원문 보러 가기" 버튼에 `<a href="..." target="_blank" rel="dofollow">` 속성이 적용되어 있어 타겟 블로그로의 양질의 백링크 전달을 수행합니다.

3. **Vercel Cron Job 자동 스케줄러 (`/api/cron`)**
   - `vercel.json`의 cron 스케줄 설정을 통해 매 시간 주기적으로 RSS 피드를 자동 수집합니다.
   - 중복 URL 방어 로직으로 이미 수집된 글은 INSERT되지 않습니다.

4. **100% 서버 컴포넌트(RSC) 렌더링**
   - 번들 크기 최소화 및 최고의 검색엔진 크롤링(TTFB) 성능을 보장합니다.

5. **하이브리드 데이터베이스 (Supabase + Local Fallback)**
   - Supabase 설정 시 클라우드 PostgreSQL에 저장되며, 설정 전이라도 `data/posts.json` 로컬 파일 스토리지로 즉시 테스트 및 실행 가능합니다.

---

## 🛠 실행 방법

### 1. 의존성 설치 및 로컬 실행
```bash
npm install
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

### 2. 수동 RSS 동기화 테스트
- 웹 UI 상단의 **[지금 RSS 동기화]** 버튼 클릭 또는
- `GET http://localhost:3000/api/cron` 호출

---

## 🗄 Supabase 연동 방법 (선택 사항)

1. [Supabase](https://supabase.com) 프로젝트를 생성합니다.
2. `supabase/schema.sql` 내용을 Supabase SQL Editor에 복사하여 테이블 및 인덱스를 생성합니다.
3. 프로젝트 루트의 `.env.local` 파일에 환경변수를 등록합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-cron-secret
```

---

## 🌐 Vercel 배포 및 Cron 활성화

1. GitHub 저장소로 Push 후 Vercel에 프로젝트를 연동하여 배포합니다.
2. 배포 즉시 `vercel.json`의 `crons` 설정에 따라 `/api/cron`이 매 시간 주기적으로 자동 실행됩니다.
