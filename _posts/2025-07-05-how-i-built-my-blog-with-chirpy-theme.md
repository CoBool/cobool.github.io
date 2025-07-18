---
title: GitHub Pages 블로그 처음 만들기 (2025년 Ver. Chirpy 테마)
date: 2025-07-05 15:00:00 +0900
categories: [개발, 블로그]
tags: [github-pages, jekyll, chirpy, 블로그, 튜토리얼, 초보자, macos, windows]
pin: false
---

## 🎯 30분으로 완성하는 나만의 전문 블로그

> **개발자가 아니어도 괜찮습니다!** 이 글을 따라하면 누구나 30분 안에 GitHub Pages와 Chirpy 테마를 사용해서 전문적인 블로그를 만들 수 있습니다.

### ✨ 완성 후 결과물
- 🌐 **완전 무료** GitHub Pages 호스팅
- 📱 **모바일/데스크톱** 반응형 디자인
- 🔍 **검색 기능** 내장
- 🏷️ **카테고리/태그** 시스템
- 💬 **댓글 시스템** 지원
- 📊 **SEO 최적화** 완료

### 📋 준비물
- 컴퓨터 (MacOS 또는 Windows)
- GitHub 계정
- 인터넷 연결
- 약 30분의 시간

---

## 📚 목차
1. [개발 환경 준비하기](#1-개발-환경-준비하기-약-15분) (약 15분)
2. [GitHub 저장소 만들기](#2-github-저장소-만들기-약-3분) (약 3분)
3. [블로그 가져오기 및 로컬 설정](#3-블로그-가져오기-및-로컬-설정-약-5분) (약 5분)
4. [블로그 초기화하기](#4-블로그-초기화하기-약-3분) (약 3분)
5. [⚠️ 문제 해결 가이드](#5-️-문제-해결-가이드)
6. [블로그 개인화 설정](#6-블로그-개인화-설정-약-5분) (약 5분)
7. [첫 글 작성하기](#7-첫-글-작성하기-약-4분) (약 4분)
8. [블로그 발행하기](#8-블로그-발행하기-약-3분) (약 3분)
9. [성공! 그리고 다음 단계](#9-성공-그리고-다음-단계)

---

## 1. 개발 환경 준비하기 (약 15분)

### 1-1. 터미널 열기

**MacOS 사용자:**
- `Cmd + Space`로 Spotlight 열기 → "터미널" 검색
- 또는 `Applications > Utilities > Terminal`

**Windows 사용자:**
- 시작 메뉴에서 "PowerShell" 검색 → "관리자 권한으로 실행"
- 또는 `Win + X` → "Windows PowerShell(관리자)"

### 1-2. 패키지 관리자 설치

**MacOS - Homebrew 설치:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치 확인:
```bash
brew --version
```

**Windows - Chocolatey 설치:**
PowerShell(관리자)에서 실행:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

설치 확인:
```powershell
choco --version
```

### 1-3. Git 설치

**MacOS:**
```bash
brew install git
```

**Windows:**
```powershell
choco install git
```

**공통 - Git 설정:**
```bash
git config --global user.name "당신의 이름"
git config --global user.email "당신의 이메일"
```

### 1-4. Ruby 설치

**MacOS - rbenv 사용:**
```bash
brew install rbenv
rbenv install 3.2.2
rbenv global 3.2.2
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc
```

**Windows - RubyInstaller 사용:**
1. [RubyInstaller 다운로드 페이지](https://rubyinstaller.org/downloads/) 방문
2. "Ruby+Devkit 3.2.x (x64)" 다운로드 및 설치
3. 설치 마지막에 "Run 'ridk install'" 체크박스 선택
4. 나타나는 창에서 `3` 입력 후 Enter

### 1-5. Node.js 설치

**MacOS - nvm 사용:**
```bash
brew install nvm
mkdir ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/bin/nvm" ] && \. "/opt/homebrew/bin/nvm"' >> ~/.zshrc
source ~/.zshrc
nvm install --lts
nvm use --lts
```

**Windows:**
1. [Node.js 공식 사이트](https://nodejs.org/) 방문
2. LTS 버전 다운로드 및 설치

### 1-6. 설치 확인

**양쪽 OS 공통:**
```bash
git --version
ruby --version
node --version
npm --version
```

✅ **성공 확인:** 모든 명령어가 버전 정보를 출력하면 성공!

---

## 2. GitHub 저장소 만들기 (약 3분)

### 2-1. Chirpy 템플릿 사용하기

1. 웹브라우저에서 [Chirpy 템플릿](https://github.com/cotes2020/jekyll-theme-chirpy) 방문
2. **"Fork"** 버튼 클릭
3. **"Create a new repository"** 선택

### 2-2. 저장소 설정

- **Repository name:** `[본인의GitHub아이디].github.io`
  - ⚠️ **중요:** 정확히 이 형식으로 입력해야 합니다!
  - 예시: GitHub 아이디가 "johndoe"라면 → "johndoe.github.io"
- **Description:** "My personal blog" (선택사항)
- **Public** 선택 (중요!)
- **"Create repository from template"** 클릭

✅ **성공 확인:** 새로운 저장소가 생성되고 `https://github.com/[사용자명]/[사용자명].github.io` 주소로 이동됨

---

## 3. 블로그 가져오기 및 로컬 설정 (약 5분)

### 3-1. 저장소 복제

**MacOS/Windows 공통:**
```bash
git clone https://github.com/[본인의GitHub아이디]/[본인의GitHub아이디].github.io.git
cd [본인의GitHub아이디].github.io
```

### 3-2. 의존성 설치

**양쪽 OS 공통:**
```bash
gem install bundler
bundle install
```

💡 **참고:** 설치 시간이 3-5분 정도 소요될 수 있습니다.

### 3-3. 로컬 서버 실행

```bash
bundle exec jekyll serve
```

브라우저에서 `http://127.0.0.1:4000` 접속

✅ **성공 확인:** Chirpy 테마의 기본 블로그가 표시됨 (예시 글들이 보임)

---

## 4. 블로그 초기화하기 (약 3분)

먼저 터미널에서 `Ctrl + C`로 로컬 서버를 종료합니다.

### 4-1. 초기화 스크립트 실행

**MacOS 사용자:**
```bash
bash tools/init.sh
```

**Windows 사용자:**
1. 프로젝트 폴더에서 우클릭 → **"Git Bash Here"** 선택
2. Git Bash에서 실행:
```bash
bash tools/init.sh
```

✅ **성공 확인:** 
- "Initialization successful!" 메시지 출력
- 일부 예시 파일들이 자동으로 삭제됨
- Git 히스토리가 새롭게 정리됨

---

## 5. ⚠️ 문제 해결 가이드

> **이 섹션은 순서를 지키지 않고 급하게 진행한 경우 발생할 수 있는 문제들입니다.**

### 문제 1: "This operation must be run in a Git repository" 오류
**원인:** git clone을 하지 않고 직접 다운로드한 경우
**해결:** 2-3번 섹션으로 돌아가서 git clone으로 다시 시작

### 문제 2: init.sh 실행 후 "Please commit and push your changes" 메시지
**원인:** init.sh 실행 전에 `_config.yml` 등을 미리 수정한 경우
**해결:**
```bash
git add .
git commit -m "chore: initialize blog with chirpy theme"
git push --force
```

### 문제 3: commitlint 오류 "subject may not be empty" 등
**원인:** 커밋 메시지가 conventional commits 규칙에 맞지 않음
**해결:** `chore: 설명` 형태로 **소문자**로 시작하여 커밋

### 문제 4: `_config.yml` 인코딩 오류
**원인:** 파일이 UTF-8 BOM으로 저장됨
**해결:** 
- VS Code에서: 우하단 "UTF-8" 클릭 → "Save with Encoding" → "UTF-8" 선택

### 문제 5: Ruby/Node.js 버전 충돌
**MacOS:** rbenv와 nvm으로 버전 변경
**Windows:** 최신 LTS 버전으로 재설치

🎯 **Pro Tip:** 이 문제들을 피하려면 정확히 1→2→3→4 순서로 진행하세요!

---

## 6. 블로그 개인화 설정 (약 5분)

### 6-1. _config.yml 파일 수정

텍스트 에디터로 `_config.yml` 파일을 열어서 다음 항목들을 수정합니다:

```yaml
# 언어 및 시간대
lang: ko-KR
timezone: Asia/Seoul

# 기본 정보
title: 나의 개발 블로그
tagline: 배움을 기록하는 공간
description: >-
  개발하면서 배운 것들과 일상을 기록하는 블로그입니다.

# 사이트 주소
url: "https://[본인의GitHub아이디].github.io"

# GitHub 정보
github:
  username: [본인의GitHub아이디]

# 소셜 정보
social:
  name: [본인 이름]
  email: [본인 이메일]
  links:
    - https://github.com/[본인의GitHub아이디]

# 테마 옵션
theme_mode: # [light | dark] - 비워두면 토글 버튼 제공

# 기타 설정
toc: true
paginate: 10
```

### 6-2. 설정 확인

```bash
bundle exec jekyll serve
```

브라우저에서 `http://127.0.0.1:4000` 접속하여 변경사항 확인

✅ **성공 확인:** 블로그 제목과 설명이 변경되어 표시됨

---

## 7. 첫 글 작성하기 (약 4분)

### 7-1. 글 파일 생성

`_posts` 폴더에서 새 파일 생성: `2025-07-05-my-first-post.md`

### 7-2. 글 내용 작성

```markdown
---
title: 안녕하세요! 첫 번째 글입니다
date: 2025-07-05 14:30:00 +0900
categories: [일상, 블로그]
tags: [첫글, 시작]
---

## 블로그를 시작하며

드디어 나만의 블로그를 만들었습니다! 🎉

앞으로 이곳에서:
- 개발하면서 배운 것들
- 일상 이야기
- 좋았던 책이나 영화 후기

등을 차근차근 기록해보려고 합니다.

### 목표

1. 주 1회 이상 꾸준히 글쓰기
2. 배운 것을 정리하는 습관 만들기
3. 나중에 돌아봤을 때 성장이 보이는 블로그 만들기

잘 부탁드립니다! 😊

### 블로그 만들기 과정

GitHub Pages와 Chirpy 테마를 사용해서 블로그를 만들어봤는데, 
생각보다 쉽고 재미있었습니다. 

무료로 이렇게 전문적인 블로그를 만들 수 있다니 정말 좋네요!
```

### 7-3. 미리보기

로컬 서버가 실행 중이라면 자동으로 새 글이 반영됩니다.
브라우저를 새로고침하여 확인하세요.

✅ **성공 확인:** 새로 작성한 글이 블로그 메인 페이지에 표시됨

---

## 8. 블로그 발행하기 (약 3분)

### 8-1. 변경사항 커밋 및 푸시

**MacOS/Windows 공통:**
```bash
git add .
git commit -m "chore: configure site settings and add first post"
git push
```

### 8-2. GitHub Pages 활성화 확인

1. GitHub 저장소 페이지 방문
2. **Settings** 탭 클릭
3. 왼쪽 사이드바에서 **"Pages"** 클릭
4. Source가 **"Deploy from a branch"**로 설정되어 있는지 확인
5. Branch가 **"main"**으로 설정되어 있는지 확인

### 8-3. 배포 완료 확인

- **Actions** 탭에서 배포 진행 상황 확인
- 초록색 체크마크가 나타날 때까지 기다림 (약 2-5분)
- `https://[본인의GitHub아이디].github.io` 주소로 접속

✅ **성공 확인:** 인터넷에서 본인의 블로그가 정상적으로 보임!

---

## 9. 성공! 그리고 다음 단계

### 🎉 축하합니다!

나만의 전문적인 블로그가 완성되었습니다. 이제 전 세계 누구나 `https://[본인의GitHub아이디].github.io` 주소로 당신의 블로그를 볼 수 있습니다.

### ✅ 완성된 것들

- ✅ 전문적인 디자인의 개인 블로그
- ✅ 모바일/데스크톱 반응형 디자인  
- ✅ SEO 최적화된 구조
- ✅ 댓글 시스템 지원 준비
- ✅ 검색 기능 내장
- ✅ RSS 피드 자동 생성
- ✅ 완전 무료 호스팅

### 🚀 다음 단계 (선택사항)

1. **댓글 시스템 추가**
   - Giscus (GitHub 기반, 추천)
   - Utterances (GitHub Issues 기반)

2. **구글 애널리틱스 연동**
   - 방문자 수 및 통계 확인

3. **SEO 최적화**
   - Google Search Console 등록
   - 사이트맵 제출

4. **프로필 이미지 및 파비콘 추가**
   - `/assets/img/` 폴더에 이미지 추가

### 💡 일상적인 블로깅 워크플로우

1. 새 글 작성 (`_posts/YYYY-MM-DD-제목.md`)
2. 로컬에서 확인 (`bundle exec jekyll serve`)
3. Git 커밋 & 푸시
   ```bash
   git add .
   git commit -m "post: 새 글 제목"
   git push
   ```
4. 2-5분 후 온라인 블로그에 자동 반영!

### 📝 글쓰기 팁

- **파일명:** `YYYY-MM-DD-제목.md` 형식 지키기
- **Front matter:** `---`로 둘러싸인 부분은 필수
- **이미지:** `/assets/img/posts/` 폴더에 저장 후 상대경로로 연결
- **카테고리:** `[대분류, 소분류]` 형태로 구성
- **태그:** 검색과 분류에 도움되는 키워드들

---

## 마무리

정말로 30분 만에 완성된 나만의 전문적인 블로그를 가지게 되었습니다! 🎊

이제 꾸준히 글을 작성하며 본인만의 색깔을 담은 블로그로 만들어가세요. 블로깅은 단순히 기록을 남기는 것 이상으로, 생각을 정리하고 지식을 공유하며 성장할 수 있는 훌륭한 도구입니다.

앞으로의 블로깅 여정을 응원합니다! 📚✨ 