# WPA v1 Design Document

## 목적

이 설계서는 **웹 푸시 테스트용 프로그램**을 명세한다. 주요 목표는:

- Firebase Realtime Database를 데이터 저장소로 사용
- Vercel(무료 서비스)에 웹 서버 배포
- 클라이언트(브라우저)로 웹 푸시 알림 발송
- 간단하고 확장 가능한 구조 유지

## 아키텍처 개요

```
┌───────────┐      HTTPS     ┌────────────┐
│  브라우저 │ <──────────-> │  Vercel    │
│ (푸시 구독)│               │  서버      │
└───────────┘               └────────────┘
       │                            │
       │                            │
       │                            ▼
       │                     Firebase Realtime
       │                     Database (프로비저닝)
       │                            │
       └────────ON-SUBSCRIBE────────┘
```

- **브라우저**: 서비스 워커 등록 후 푸시 구독, 사용자 인터페이스는 테스트 버튼 제공
- **Vercel 서버**: Node.js/Next.js 또는 간단한 Express API로 구현. 푸시 트리거, 서브스크립션 저장 및 조회
- **Firebase Realtime Database**: 구독 정보, 테스트 메시지 저장. 간단한 JSON 트리 구조

## 기술 스택

- **프론트엔드**: HTML, JavaScript, Service Worker API, Web Push API
- **백엔드**: Node.js (express/next), Vercel 배포
- **데이터**: Firebase Realtime Database
- **푸시 라이브러리**: `web-push` npm 패키지

## 데이터 모델

### Firebase Realtime Database 구조

```
{
  "subscriptions": {
    "<uuid>": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/..",
      "keys": { "p256dh": "...", "auth": "..." },
      "createdAt": 167...,
      "userAgent": "..."
    }
  },
  "messages": {
    "<uuid>": {
      "title": "Test",
      "body": "Hello from WPA!",
      "sentAt": 167...
    }
  }
}
```

### SQL 테이블 구조 (Backend Database)

#### 1. **user** 테이블 (CS팀원 관리)
```sql
CREATE TABLE user (
  cs_id VARCHAR(50) PRIMARY KEY,
  pw VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  dept VARCHAR(100),
  allow_yn VARCHAR(1) DEFAULT 'N'    -- 웹 푸시 구독 여부 (Y/N)
);
```

#### 2. **admin** 테이블 (관리자 관리)
```sql
CREATE TABLE admin (
  admin_id VARCHAR(50) PRIMARY KEY,
  pw VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL
);
```

#### 3. **cs** 테이블 (고객 지원 내용)
```sql
CREATE TABLE cs (
  no INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  contents TEXT NOT NULL,
  status INT DEFAULT 1,              -- 1:new, 2:assign, 3:fixing, 4:fixed, 5:finish
  open_date DATETIME NOT NULL,
  finish_date DATETIME,
  cs_id VARCHAR(50) NOT NULL,
  assign_date DATETIME,
  FOREIGN KEY (cs_id) REFERENCES user(cs_id)
);
```

#### 4. **push** 테이블 (푸시 메시지 관리)
```sql
CREATE TABLE push (
  push_no INT PRIMARY KEY AUTO_INCREMENT,
  push_content TEXT NOT NULL,
  write_date DATETIME NOT NULL,
  admin_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
);
```

#### 5. **push_recv** 테이블 (푸시 수신 기록)
```sql
CREATE TABLE push_recv (
  recv_no INT PRIMARY KEY AUTO_INCREMENT,
  push_no INT NOT NULL,
  cs_id VARCHAR(50) NOT NULL,
  send_status INT,                   -- 0:미전송, 1:전송완료
  read_status INT,                   -- 0:미읽음, 1:읽음
  send_date DATETIME,
  read_date DATETIME,
  FOREIGN KEY (push_no) REFERENCES push(push_no),
  FOREIGN KEY (cs_id) REFERENCES user(cs_id)
);
```

## 흐름

1. 브라우저에서 앱 로드 → 서비스 워커 등록
2. 사용자가 `구독` 버튼 클릭 → 브라우저가 푸시 구독 생성
3. 구독 정보 POST `/api/subscribe`로 전송
4. 서버가 정보 받아 Firebase에 저장
5. 테스트 푸시를 보내려면 `/api/trigger` 호출
6. 서버는 DB에서 구독 목록을 읽고 `web-push`를 통해 푸시 메시지 전송
7. 푸시가 브라우저에 도달하고 서비스 워커가 알림을 표시

## 사용자 웹 흐름

1. 앱 접근 시 **사용자 로그인** 필요
2. 아이디/비밀번호 입력 후 로그인 수행
3. 로그인 완료 후
   - 푸시 권한이 **허용되지 않은 경우**: 웹푸시 허용 알림을 표시하고 권한 요청 페이지로 이동
   - **허용된 경우**: CS(고객지원) 내용 목록을 조회하여 화면에 표시
4. CS 목록에서 항목 선택 시 상세 내용 화면으로 이동
5. 관리자가 푸시를 전송하면 로그인 상태의 사용자에게 푸시 알림 표시
6. 알림 클릭 시 해당 상세 내용으로 이동하며, 서버에 **읽음 플래그** 전송

## 관리자 기능

- **관리자 버튼**: 테스트용 앱에 별도의 관리자 버튼을 두어 로그인 화면으로 이동.
  - 로그인은 **admin/12345** 자격증명일 때만 허용.
- **관리자 페이지 구성**:
  1. 푸시 내용 등록/수정 기능
  2. 등록된 메시지를 실제로 전송할 수 있는 "전송" 버튼
  3. 전송 결과 확인(누가 읽었는지 확인 가능)
- **전송 흐름**:
  - 사용자가 관리자 페이지에서 "전송" 클릭
  - 받을 대상 구독자 및 보낼 내용을 선택
  - 서버는 선택된 구독자에게 push를 발송하고 결과를 DB에 기록
  - 관리자 페이지에서 전송 결과 조회 시 읽은 사용자 목록 표시


## 배포

- Vercel 계정 생성, GitHub 리포지토리 연동
- `vercel.json` 혹은`next.config.js` 설정
- 환경 변수: `FIREBASE_CONFIG`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- 자동 빌드/배포: 푸시 때마다 Vercel이 갱신

## 개발 및 테스트

- 로컬 개발: Firebase 에뮬레이터 혹은 자체 프로젝트
- `npm run dev`로 서버 실행
- 브라우저에서 `localhost` 접속, 구독 후 테스트 메시지 전송

## 보안

- VAPID 키쌍 사용
- Firebase 인증은 단순, 공개 읽기 가능으로 유지(테스트 목적)
- 서버에서 구독 정보 검증

## 프론트엔드 폴더 구조

```
frontend/
  ├─ login/                → 로그인 관련 추가
  ├─ js/                   → 자바스크립트 폴더
  ├─ images/               → 이미지 관련 폴더
  ├─ admin/                → 어드민 기능용 폴더
  ├─ css/                  → 스타일 관련 소스 저장
  ├─ config/               → 설정 파일 소스 저장
  ├─ index.html            → 메인 UI
  ├─ admin.html            → 어드민 페이지
  ├─ style.css             → 기본 스타일시트
  └─ sw.js                 → 서비스 워커 (푸시 수신)
```

### 폴더별 설명

- **login/**: 로그인 화면 HTML, CSS, 인증 검증 JS 등
- **js/**: 사용자 웹 기능(구독, 푸시 수신), 관리자 기능(메시지 관리, 전송) 등 일반적인 자바스크립트 단위 기능
- **images/**: 로고, 아이콘, UI 비주얼 자원
- **admin/**: 어드민 로그인, 메시지 등록/수정, 전송, 결과 조회 관련 파일
 - **css/**: 공통 스타일, 테마 및 컴포넌트별 CSS/SCSS 소스
 - **config/**: 환경별 설정 파일들(e.g., firebase 설정, VAPID keys, 기타 JSON/YAML 설정)


---

이 문서는 WPA 프로젝트에 대한 첫 버전 설계입니다. 필요 시 확장 및 개선 가능합니다.
