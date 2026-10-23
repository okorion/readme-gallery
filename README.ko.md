# README Gallery

GitHub 프로필에 웹사이트 화면, 활동 기록 지형, 방문자가 남긴 오브젝트를 전시합니다.
**[okorion](https://github.com/okorion)**의 프로필 전시관에서 시작한 공개 템플릿입니다.

[내 전시관 만들기](https://github.com/okorion/readme-gallery/generate) · [디자인 비교](docs/designs.md) · [English](README.md)

## 처음 시작하기

1. 위 링크 또는 **Use this template → Create a new repository**를 선택합니다.
   저장소 이름을 자신의 GitHub 사용자명과 같게 정하고 **Public**으로 만듭니다.
2. 새 저장소의 **Actions → Build README gallery → Run workflow**를 엽니다.
   웹사이트가 있으면 `website`에 공개 HTTPS 주소를 입력합니다. 비워 두면 사용자명으로 프로필 카드를 만듭니다.
3. **Run workflow**를 누르고 초록색 완료 표시를 기다립니다. 프로필에 자신의 전시관이 표시됩니다.
   복사한 초기 안내문을 수정하지 않았다면 첫 실행에서 자동으로 정리됩니다.

PC 설치, 개인 토큰 발급, 서버 운영 없이 시작할 수 있습니다. GitHub Actions가 활성화되어 있어야 합니다.
프로필 저장소가 이미 있으면 아래의 기존 프로필 적용 절차를 사용하세요.

## 디자인과 화면 바꾸기

Actions의 같은 실행 화면에서 `variant`와 `style`을 고릅니다.

| 입력 | 결과 |
|---|---|
| `gallery` | A · 액자형 전시관 |
| `island` | B · 플랫폼형 전시관 |
| `wall` | C · 건축적인 벽면 전시관, 기본값 |
| `pavilion` | D · 금속 큐브와 유리 중심부가 있는 전시관 |
| `simple` / `advanced` | A·B·C의 재질과 조명 변경. 배치와 카메라는 동일 |
| `keep` | 현재 설정 유지 |
| `language: ko` | 이름표와 링크를 한국어로 표시 |
| `render_all: true` | 비교용으로 7개 디자인 × 라이트·다크 × 데스크톱·모바일 생성 |

D는 항상 Advanced입니다. 보통 실행은 선택한 디자인의 이미지 4장만 만들고,
GitHub가 화면 폭과 테마에 맞는 이미지를 선택합니다. 3D는 생성 과정에서 실행되며 README에는 PNG가 표시됩니다.

웹사이트를 바꾸려면 `website`에 새 주소를 넣습니다. 입력을 비우면 이전 주소가 유지되고,
`none`을 넣으면 프로필 카드로 돌아갑니다. 이름표는 기본적으로 사이트 호스트명 또는 사용자명만 표시합니다.
나머지 두 이름표는 `config/gallery.json`의 `showSectionLabels`를 `true`로 바꾸면 복원됩니다.

## 방문자가 함께 꾸미기

README의 **오브젝트 남기기 +**에서 도형과 색상을 선택하고 공개 표시 동의 후 Issue를 만듭니다.
GitHub 로그인이 필요합니다. 계정마다 가장 최근에 만든 열린 항목 하나를 사용하며, 최신 9개 계정을 전시합니다.
오브젝트를 바꾸려면 기존 Issue를 편집하거나 새 항목을 만듭니다. Issue를 닫으면 다음 갱신에서 제외됩니다.
같은 계정의 이전 항목이 열려 있으면 그것이 다시 표시되므로 완전히 제외하려면 자신의 관련 항목을 모두 닫습니다.

도형·색상만 이미지에 표시합니다. 데이터 파일에는 Issue 번호, 숫자형 작성자 ID, 생성 시각이 포함되고,
원본 Issue의 작성자와 내용은 GitHub에서 공개됩니다. 갱신으로 제거해도 과거 Git 커밋에는 기록이 남습니다.
참여를 끄려면 `maxVisitors`를 `0`으로 바꿉니다.

## 기존 프로필에 적용하기

원본 README를 보관한 후 이 저장소에서 다음 항목을 복사합니다.

- `scripts/gallery/`, `assets/fonts/`, `config/gallery.json`
- `.github/workflows/gallery.yml`, `.github/ISSUE_TEMPLATE/gallery.yml`
- `docs/template-guide.md`, `LICENSE`, `NOTICE.md`, `THIRD_PARTY_NOTICES.md`
- Node 프로젝트가 없다면 `package.json`과 `package-lock.json`

이미 Node 프로젝트라면 필요한 npm 스크립트와 `three`, `playwright` 버전을 병합하고 lockfile을 갱신합니다.
기존 `package.json`, lockfile, 라이선스를 통째로 덮어쓰지 마세요. 라이선스가 이미 있으면 이 프로젝트의
MIT 고지를 별도 파일에 보존하고 `NOTICE.md`에서 경로를 연결합니다.

갤러리를 넣을 위치에 아래 영역을 한 번 추가합니다. 영역 밖의 기존 소개는 이후 갱신에서도 보존됩니다.

```html
<!-- readme-gallery:start -->
<!-- readme-gallery:end -->
```

영역이 없으면 README 끝에 추가합니다. Actions를 수동 실행하면 `assets/gallery/`를 생성합니다.
첫 설치는 기본 브랜치에 반영해야 Issue 이벤트와 예약 실행을 사용할 수 있습니다.

## 웹사이트 캡처와 글꼴

사이트의 실제 웹폰트를 기다린 뒤 브라우저로 캡처합니다. 사이트 본문 글꼴을 덮어쓰지 않습니다.
전시관 이름표와 기본 프로필 카드에는 동봉한 Pretendard 1.3.9를 사용합니다.

기본 다크 화면은 `prefers-color-scheme`을 따릅니다. 사이트가 자체 테마 버튼을 사용한다면
`config/gallery.json`에서 아래 선택자를 지정합니다. 해당 기능이 없는 사이트에는 빈 문자열을 유지합니다.

```json
"capture": {
  "readySelector": "main",
  "darkToggleSelector": ".theme-toggle",
  "darkReadySelector": "[data-theme='dark']"
}
```

인증·로그인·봇 차단이 필요한 사이트는 지원 범위 밖입니다. 본인 소유이거나 재사용 허가를 받은 공개 사이트를
지정하세요. 준비 상태나 다크 테마 선택자가 틀리면 실행이 실패하며 기존 게시 이미지는 유지됩니다.
캡처 대신 기본 프로필 카드를 사용하려면 `website: none`으로 실행하세요.

## 자동 갱신과 운영

하루 한 번 03:23 UTC(한국 12:23), 관련 Issue 변경, 수동 실행 때 갱신합니다.
예약 시각은 GitHub 사정에 따라 늦어질 수 있고, 장기간 활동이 없으면 예약 실행이 중지될 수 있습니다.
`contents: write`는 생성 이미지·README·설정 게시에, `issues: read`는 방문자 선택 읽기에 사용합니다.
자격 증명은 캡처 브라우저에 전달하지 않습니다. 개인 저장소 이름이나 활동 내용은 조회하지 않고 일별 활동 수만 사용합니다.

공개 저장소의 표준 GitHub 호스팅 실행기를 사용합니다. 비공개 저장소에서는 계정의 Actions 사용 한도를 확인하세요.
배포용 서버나 별도 유료 API는 사용하지 않습니다. 조직 정책·브랜치 보호로 봇 쓰기가 막히면 관리자 정책에 맞는
게시 경로를 준비하거나 저장소 파일을 로컬에서 생성해 일반 커밋으로 반영해야 합니다.

## 문제 해결

| 증상 | 확인할 곳 |
|---|---|
| 프로필에 표시되지 않음 | 저장소 이름이 사용자명과 같은지, Public인지 확인 |
| Run workflow가 없음 | 기본 브랜치에 workflow가 있는지, Actions가 허용되었는지 확인 |
| 403 / 쓰기 실패 | 저장소 Actions 권한, 조직 제한, 브랜치 보호 확인 |
| 웹 캡처 실패 | 공개 HTTPS 주소·인증 여부·선택자 확인. `none`으로 기본 카드 실행 |
| 다크 화면이 밝음 | 사이트가 시스템 테마를 지원하는지 확인하고 필요하면 테마 버튼 선택자 지정 |
| 글자가 다르게 보임 | 사이트의 폰트 요청 성공 여부와 `assets/gallery/source.json`의 loadedFonts 확인 |
| README marker 오류 | start/end 영역이 한 쌍이며 순서가 올바른지 확인 |
| Branch changed during render | 렌더 중 다른 커밋이 올라온 경우이므로 다시 실행 |
| 방문자 오브젝트 없음 | 공식 양식, 동의 체크, 열린 Issue, 최신 9개 계정 조건 확인 |

중단하려면 **Actions → Build README gallery → Disable workflow**를 선택합니다.
삭제하려면 README의 갤러리 영역과 생성 자산, 전용 workflow·Issue 양식을 제거합니다.
공유 의존성과 기존 소개는 다른 사용처를 확인한 뒤 정리하세요.

## 개발과 업데이트

Node.js 22 이상에서 `npm ci`, `npx playwright install chromium` 후 `npm test`를 실행합니다.
`npm run gallery:demo`는 토큰 없이 예제 활동·방문자 데이터를 생성합니다. 실제 사용자의 활동으로 게시하지 마세요.
실제 데이터는 `GALLERY_REPOSITORY=사용자/저장소`와 환경 변수 `GH_TOKEN` 또는 `GITHUB_TOKEN`을 설정한 뒤
`npm run gallery:build`로 생성합니다. 토큰을 파일에 넣거나 저장소에 커밋하지 마세요.

템플릿은 생성 시점의 복사본이므로 업데이트가 자동으로 들어오지 않습니다.
[Releases](https://github.com/okorion/readme-gallery/releases)의 변경 사항을 확인해 해당 파일만 병합하고
자신의 `config/gallery.json`과 README 소개는 보존하세요. 상세 구조는 [영문 매뉴얼](docs/usage.md)을 참고하세요.

## 원작자 표시와 이용 조건

원작자는 **okorion**, 원본 프로젝트는 **README Gallery**입니다. MIT 라이선스로 개인·상업적 사용,
수정, 재배포가 가능합니다. 소프트웨어를 재배포할 때 라이선스와 저작권 고지를 유지해야 합니다.
생성 README에는 원작자 링크가 기본 표시됩니다. 이 화면 크레딧 유지는 권장 사항이며 MIT에 추가한 의무는 아닙니다.
폰트·의존성·캡처한 외부 콘텐츠에는 각각의 권리가 적용됩니다.

[LICENSE](LICENSE) · [원작자와 크레딧 정책](NOTICE.md) · [외부 구성요소 고지](THIRD_PARTY_NOTICES.md)
