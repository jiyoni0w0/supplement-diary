# 🐰 Usagi Supplement Diary

우사기 테마의 모바일 영양제 기록 및 브랜드 비교 웹앱입니다.

## 기능
- 오늘의 영양제 체크리스트 및 섭취율
- 복용 주기와 시작일 관리, 월별 캘린더 및 타임라인
- 날짜별 컨디션·효과·부작용 메모
- 브랜드·가격·함량·제형 비교
- LocalStorage 자동 저장
- JSON 백업 및 복원

## 로컬 실행
`index.html`을 브라우저에서 열면 됩니다.

## GitHub Pages 배포
1. GitHub에서 새 Repository를 만듭니다. 예: `usagi-supplement-diary`
2. `index.html`과 `assets/` 폴더를 Repository 최상위에 업로드합니다.
3. Repository의 **Settings → Pages**로 이동합니다.
4. **Build and deployment**에서 `Deploy from a branch`를 선택합니다.
5. Branch `main`, 폴더 `/(root)`를 선택하고 저장합니다.
6. 표시되는 `https://사용자명.github.io/usagi-supplement-diary/` 주소로 접속합니다.

## 백업과 복원
- 기록은 접속한 브라우저의 LocalStorage에 저장됩니다.
- 홈 화면의 JSON 백업 버튼으로 `usagi_backup_YYYY-MM-DD.json`을 다운로드합니다.
- 복원 버튼에서 백업 JSON을 선택하면 현재 브라우저 기록을 백업 내용으로 교체합니다.
- 복원 전 현재 기록도 백업하는 것을 권장합니다.
- 브라우저 데이터 삭제, 시크릿 모드, 다른 브라우저·기기에서는 기존 기록이 자동으로 나타나지 않습니다.

## 향후 자동 동기화
현재 버전은 자동 동기화를 수행하지 않습니다. `window.UsagiDiary` 인터페이스를 통해 향후 Supabase/Firebase 같은 백엔드와 인증 기능을 연결할 수 있도록 확장 지점을 마련했습니다.
GitHub Pages는 정적 호스팅이므로 비밀키나 관리자 키를 프론트엔드에 넣으면 안 됩니다. 향후 동기화 구현 시 보안 규칙과 사용자별 접근 제어를 반드시 적용해야 합니다.

## 개인정보
복용 및 컨디션 메모는 개인 정보일 수 있습니다. JSON 백업 파일은 공개 GitHub 저장소에 올리지 말고 비공개 저장 공간에 보관하세요.


## 캐릭터 이미지
사용자가 제공한 투명 PNG 7장을 `assets/images/` 폴더에 보관하며, 헤더·빈 화면·타임라인 등에 실제 이미지로 표시합니다. 이미지 경로는 GitHub Pages 호환 상대경로입니다.
