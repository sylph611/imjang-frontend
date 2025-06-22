# Imjang Frontend

부동산 매물 관리 애플리케이션의 프론트엔드입니다.

## 설치 및 실행

```bash
npm install
npm start
```

## Google Maps 설정

이 애플리케이션은 Google Maps API를 사용하여 주소 검색 및 지도 표시 기능을 제공합니다.

### 1. Google Cloud Console에서 API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 다음 API들을 활성화:
   - Maps JavaScript API
   - Places API
4. 사용자 인증 정보에서 API 키 생성

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API 키 제한 설정 (권장)

보안을 위해 Google Cloud Console에서 API 키에 다음 제한을 설정하세요:

- **애플리케이션 제한**: HTTP 리퍼러 (웹사이트)
- **API 제한**: Maps JavaScript API, Places API

## 주요 기능

- 매물 목록 조회 및 검색
- 매물 상세 정보 조회 및 수정
- 이미지 업로드 및 관리
- Google Maps를 통한 주소 검색 및 위치 표시
- 반응형 디자인

## 기술 스택

- React
- Tailwind CSS
- Google Maps JavaScript API
- Lucide React (아이콘)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
