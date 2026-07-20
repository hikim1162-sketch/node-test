# Value Time 비공개 배포

## 로컬 실행

1. 이 폴더에서 `npm install`을 실행합니다.
2. `.env.example`을 복사해 `.env`를 만듭니다.
3. `.env`의 `SITE_PASSWORD`와 `AUTH_SECRET`을 실제 값으로 바꿉니다.
4. `npm run netlify:dev`를 실행합니다. 처음 한 번은 `npx`가 Netlify CLI 실행을 확인할 수 있습니다.
5. `http://localhost:8888`로 접속합니다.

`npm run dev`만 실행하면 Netlify Functions가 실행되지 않으므로 로그인 기능을 시험할 때는 반드시 `netlify dev`를 사용합니다.

## 비밀번호 변경

`.env`의 `SITE_PASSWORD` 값을 바꾸면 로컬 로그인 비밀번호가 바뀝니다. 변경 후 `netlify dev`를 다시 시작하세요.

Netlify 배포 환경에서는 Site configuration → Environment variables에 아래 두 값을 등록합니다.

- `SITE_PASSWORD`: 가족이 로그인할 실제 비밀번호
- `AUTH_SECRET`: 토큰 서명용으로 사용하는 길고 무작위인 문자열

Netlify 대시보드에도 로컬 `.env`와 같은 `SITE_PASSWORD` 값을 넣어야 배포된 사이트에서 같은 비밀번호로 로그인할 수 있습니다. 환경변수를 변경한 뒤에는 새 배포를 실행하세요.

`AUTH_SECRET`은 비밀번호와 다른 값으로 만들고 32자 이상을 권장합니다. `.env`는 Git에 커밋하지 않습니다.
