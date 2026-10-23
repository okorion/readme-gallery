# User manual

[Quick start](../README.md) · [한국어 매뉴얼](../README.ko.md) · [Designs](designs.md)

## New profile

Use [the template](https://github.com/okorion/readme-gallery/generate), create a public
repository named exactly like your personal GitHub account, then open **Actions →
Build README gallery → Run workflow**. Keep the default settings to use a generated
profile card. A public HTTPS website is optional. Wait for the successful run and
refresh your GitHub profile.

The account and issue repository come from GitHub's automatic `GITHUB_REPOSITORY`.
No personal access token or server is required. Only an untouched copy of the
template's setup guide is removed on the first run; custom text is preserved.
This version targets personal accounts. Organization contribution calendars are
not supported. A differently named repository works as a standalone exhibition,
but GitHub will not show it automatically on your personal profile.

## Settings

Run the same workflow to change the website, layout, finish or language. Blank
website input keeps the current URL; `none` returns to the built-in profile card.
`keep` preserves a layout/finish/language. D always uses Advanced.

| `config/gallery.json` key | Default | Meaning |
|---|---|---|
| `portfolioUrl` | empty | Public HTTPS website; empty uses a profile card |
| `variant` | `wall` | `gallery` (A), `island` (B), `wall` (C), `pavilion` (D) |
| `style` | `simple` | `simple` or `advanced`; pavilion uses advanced |
| `language` | `en` | English or `ko` for Korean |
| `showSectionLabels` | `false` | Show the two optional contribution/visitor labels |
| `maxVisitors` | `9` | 0–9; zero disables participation and its README link |
| `contributionWeeks` | `26` | 1–26 weeks of real aggregate contribution counts |
| `capture.readySelector` | empty | Optional CSS selector that signals website readiness |
| `capture.darkToggleSelector` | empty | Optional theme button to click after the light capture |
| `capture.darkReadySelector` | empty | Optional selector that signals dark theme readiness |

Gallery nameplates and the built-in card use the bundled Pretendard font. Website
captures keep the site's own fonts and wait for font loading. Inspect
`assets/gallery/source.json` for loaded font families, identity and capture hashes.
Default dark capture uses `prefers-color-scheme`; sites with their own theme state
can configure selectors. A site without a dark theme can appear light in both
captures. Captures use a 1184×760 viewport; final images are 1600×700 or 900×900.

Use only public sites you own or have permission to display. Authentication,
CAPTCHAs and private network sites are unsupported. Use a readiness selector for
apps that load their main content after the initial page load. The capture context
has no GitHub credentials; only Node processes receive the automatic token.

## Existing profile

Back up the current README. Copy these files into the profile repository:

- `scripts/gallery/`, `assets/fonts/`, `config/gallery.json`
- `.github/workflows/gallery.yml`, `.github/ISSUE_TEMPLATE/gallery.yml`
- `docs/template-guide.md`, `LICENSE`, `NOTICE.md`, `THIRD_PARTY_NOTICES.md`
- `package.json` and `package-lock.json` if there is no Node project already

For an existing Node project, merge the gallery npm scripts and exact Three.js /
Playwright versions, then regenerate its lockfile. Do not replace an unrelated
package manifest or license. Keep this project's MIT notice in a separate license
file if necessary and update the notice link. Adjust the workflow's `npm test`
step if your existing test command needs additional setup.

Insert one marker pair at the desired position:

```html
<!-- readme-gallery:start -->
<!-- readme-gallery:end -->
```

Only that section is regenerated. If the markers are absent, a gallery is appended.
Malformed or duplicate markers stop the run. Text outside the pair remains intact.
Commit the installation to the default branch, then run the workflow. Generated
images are created automatically in `assets/gallery/`.

## Visitor artwork

Visitors use **Leave an object +**, select a shape and color, agree to public
display and open an issue. A GitHub account is required. The newest open valid entry
per account is used; the newest nine accounts are shown. Edit an entry to change
its object. Close all of an account's gallery issues to remove its objects on the
next successful refresh; closing only the newest can reveal an older open entry.

Only allowlisted shape/color choices are rendered. Issue text is never executed or
drawn as free-form content. Pull requests, bots, unchecked consent and altered form
structures are ignored. Keep the form's field labels and choices unchanged unless
you also update the parser. English and the original Korean form are supported.

Data files contain day/count pairs and artwork shape, color, issue number, numeric
author ID and creation time. Usernames remain visible on public Issues. Closing an
issue removes its current display, not historical Git commits. No private repository
names or contribution details are queried. Token-visible aggregate counts can
reflect private contribution settings; use the workflow's default token as shipped.

## Updates, permissions and cost

The workflow runs daily at 03:23 UTC, on gallery issue changes and manually. Normal
runs render four files for the selected design. `render_all` renders all 28. GitHub
can delay scheduled runs or disable schedules after repository inactivity.

The job requests `contents: write` to publish README/config/generated files and
`issues: read` for visitor choices. Publishing uses a file allowlist and a
non-forced Git update; concurrent changes stop publishing rather than overwrite
them. Pull-request checks have read-only permissions and never publish.

Public repositories use standard GitHub-hosted runners. Private repository runs
consume the account's Actions allowance; review GitHub's current billing terms for
your account. There is no hosted backend or paid API in this project. Each visitor
event may run a build; repository owners can disable participation or automatic
issue triggers if activity becomes costly. Branch protection and organization
policies may prevent automated commits.

Templates are copies, not subscriptions. Review [releases](https://github.com/okorion/readme-gallery/releases)
and merge changed files to upgrade, retaining your config and custom README text.

## Local development

Node.js 22 or later:

```sh
npm ci
npx playwright install chromium
npm test
npm run gallery:demo
```

The demo is offline and uses explicitly marked sample activity and visitor objects.
It overwrites the local data and gallery block. It is suitable for a disposable
checkout; CI refuses to publish demo data as real activity.

For real data, set `GALLERY_REPOSITORY=owner/repository` and a `GH_TOKEN` or
`GITHUB_TOKEN` environment variable in your shell, then run `npm run gallery:build`.
The token needs access to that repository's issues and GitHub GraphQL. Keep tokens
out of files, command history and commits. Local builds do not publish automatically.

`GALLERY_RENDER_ALL=1` enables every design. `GALLERY_HEADED=1` shows the rendering
browser. The Windows launch includes the two Autofill feature-disabling flags to
avoid the affected Chromium account-check startup path. Linux CI is the supported
automated publishing environment.

The pipeline is `config → collect → capture → render → managed README → validate → publish`.
Scene geometry lives in `scripts/gallery/scene.mjs`; content parsing lives in
`model.mjs`. The font is self-hosted, and the render server exposes an explicit
file allowlist. Rendered pages have no access to the publishing token.

## Troubleshooting

| Symptom | Action |
|---|---|
| No gallery on profile | Confirm repository is public and named exactly like the account |
| No Run workflow button | Enable Actions and put the workflow on the default branch |
| API 403 or publish denied | Check Actions policy and protected-branch restrictions |
| Website capture failed | Check public HTTPS URL, bot protection and readiness selectors; try `website: none` |
| Light screenshot in dark theme | Configure a theme toggle if the website ignores the system preference |
| Font differs | Check the website's font requests and source.json loadedFonts |
| Branch changed during render | Rerun against the new default-branch head |
| Missing visitor object | Use the exact form, check consent, keep it open and check the latest-nine limit |
| Too many issues | Collector stops above 2,000 open issues; close obsolete issues or set maxVisitors to zero |
| Old images on GitHub | Confirm a successful commit, then allow GitHub's image cache to refresh |

Stop updates with **Actions → Build README gallery → Disable workflow**. To remove
the gallery, remove its README marker block, workflow, issue form and generated
assets. Check other consumers before deleting shared npm dependencies or fonts.

## Attribution

Original project and creator: **README Gallery by okorion**. The code is MIT
licensed; preserve the copyright and license notice in redistributed software.
Generated READMEs include a visible linked credit by default. Keeping it is
appreciated, not an additional license condition. See [NOTICE.md](../NOTICE.md)
and [third-party notices](../THIRD_PARTY_NOTICES.md).

## Platform references

- [GitHub profile README requirements](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme)
- [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)
- [GitHub Actions usage and billing](https://docs.github.com/en/actions/concepts/billing-and-usage)
- [Scheduled workflow behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [MIT license text](https://opensource.org/license/mit)
