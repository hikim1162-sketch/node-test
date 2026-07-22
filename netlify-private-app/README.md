# Value Time 배포

Value Time은 별도의 비밀번호 인증 없이 공개 페이지로 동작합니다.

## 로컬 실행

```powershell
npm install
npm run dev
```

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Vercel

- Root Directory를 `netlify-private-app`으로 지정하는 경우 이 폴더의 `vercel.json`을 사용합니다.
- 저장소 루트에서 배포하는 경우 상위 폴더의 `vercel.json`을 사용합니다.
- `SITE_PASSWORD`와 `AUTH_SECRET` 환경변수는 사용하지 않습니다.
