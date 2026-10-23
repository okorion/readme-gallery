# README Gallery

Turn your GitHub profile into a small exhibition: a website or profile card,
contribution terrain, and objects visitors leave through GitHub Issues.
Created by **[okorion](https://github.com/okorion)**.

[Create your gallery](https://github.com/okorion/readme-gallery/generate) ·
[한국어 매뉴얼](README.ko.md) · [Full manual](docs/usage.md) ·
[Compare all designs](docs/designs.md) · [Original gallery](https://github.com/okorion)

## Start in three steps

1. Click **Use this template → Create a new repository**. Use your GitHub username
   as the repository name and choose **Public** to display it on your profile.
   If that repository already exists, follow [the existing-profile guide](docs/usage.md#existing-profile).
2. Open **Actions → Build README gallery → Run workflow** in your new repository.
   Leave the fields unchanged for a profile card, or enter your public website URL.
3. Run it and wait for the green check. Your own gallery replaces the sample, and
   this unedited setup guide disappears from your profile README automatically.

No local installation, personal access token, hosted backend, or paid API is needed.
The workflow uses GitHub's automatic repository token. GitHub Actions must be
enabled; repository or organization policies may restrict workflow writes.

## Seven designs, one layout system

| Design | Simple | Advanced |
|---|---|---|
| A · Gallery | Framed wall exhibition | Glass frames and subtle lighting |
| B · Island | Objects arranged on platforms | Reflective bases and accent rings |
| C · Wall | Quiet architectural display · default | Layered glass and metal details |
| D · Pavilion | — | Sculptural metal cube with a glass core |

Every design has light/dark and desktop/mobile images. GitHub displays PNGs; the
3D renderer runs in Actions. Visitors choose one of five shapes and four colors,
and the latest nine participating accounts fill the exhibition.

Updates run daily, after gallery issue changes, and on demand. Normal runs generate
the selected design's four images. Turn on **render_all** to generate all 28 images.
Scheduled workflows can be delayed or disabled by GitHub after repository inactivity.

## Use and customize

- [Settings, existing profiles and local development](docs/usage.md)
- [Design comparison](docs/designs.md)
- [Troubleshooting, updates and removal](docs/usage.md#troubleshooting)
- [Origin, attribution and reuse](NOTICE.md)

MIT licensed: use, modify and share, including commercially. Preserve the copyright
and license notice in redistributed source. Generated READMEs include a small
“Created with README Gallery by okorion” link; retaining that visible credit is
appreciated. [License details](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)
