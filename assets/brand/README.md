# next-ai brand assets

## Approved source

- Hexly study: `next-ai/2026-10-18-01`, finishing pass `01`.
- Archive revision: `6299f3e9274990444a932d1214ed8855082a146e` in `nocoo/hexly.ai`.
- [Source metadata](https://github.com/nocoo/hexly.ai/blob/6299f3e9274990444a932d1214ed8855082a146e/artwork/logo-family/next-ai/2026-10-18-01/material-metadata.json).
- Local archive: `hexly.ai/public/logos/family/next-ai/2026-10-18-01/01/`.
- Approved native source: **1024 x 1024 JPEG**, generated with the built-in
  `image_gen.imagegen` tool; the underlying model is **unknown** (`model: null`).
- Raw JPEG SHA-256: `d17ef6cc060d4c971ae3f91fce8cb8e5620e2c4b52390476f00ba76d4cbd702c`.
- The canonical transparent PNG is the exact native-size finished master, copied
  without re-encoding. The archive's 2048 px exports are declared upscales, not
  native output. This adoption performs no generation, redesign or recoloring.
- Owner approval and controller READY on 2026-10-18 authorize **local adoption
  only**. A source commit does not establish push, publication, npm release or
  deployment.

## Files and roles

| Repository path | Pixels | Role | SHA-256 |
| --- | --- | --- | --- |
| `logo.png` | 1024 x 1024 | Canonical transparent foreground; small UI and browser source | `89b0ca07f84c1fb5caaac154ce24add5e58914e9cf33a1adbeece39fd5b032e3` |
| `assets/brand/icon.png` | 1024 x 1024 | Square presentation; large artwork only | `781403b3b998658f36e6f7aadcb502e9d0c34724ddf6984701cdbafdb9ca19bc` |
| `assets/brand/icon-rounded.png` | 1024 x 1024 | Rounded presentation; both README headers at 128 CSS px | `25cc888a0600ca8683f27289385bf3d3ff2d8d11699325aca50451642f11be5c` |
| `examples/{next-app,vite-app}/public/logo-64.png` | 64 x 64 | Transparent headers rendered at 32 CSS px | `1f7aab7fae3d2c2b3b22383bd0281af1fed54511bdf027034546a53ee8df1380` |
| `examples/next-app/app/favicon.ico; examples/vite-app/public/favicon.ico` | 16 / 32 / 48 | Transparent browser icons; no tile or extra crop | `77d29f21dd1326ddac80514ac5c4b22779556bb7ebd6c94c19e5898d99ea50ea` |

Use the same transparent foreground on light and dark surfaces. Do not add a
background tile, corner mask, filter, recoloring or crop to small UI/browser
marks. Square/rounded presentations keep their designed background for large
README or gallery uses; transparent corners alone do not make a presentation a
foreground mark.

## Consumer audit

Both `README.md` and `docs/README.en.md` use the rounded presentation at 128 px
with centered title, introduction and navigation to the Hexly project archive
and the complete alternate-language README.

- Next.js: `examples/next-app/app/layout.tsx` displays the transparent 64 px PNG
  at 32 CSS px on both home and settings routes. App Router automatically serves
  `app/favicon.ico` and emits the browser icon metadata.
- Vite: `examples/vite-app/src/App.tsx` displays the same transparent header
  mark; `index.html` explicitly links the three-resolution public favicon.
- Reusable `src/react/` settings controls keep the host application's identity;
  eye/status symbols are functional icons, not product branding.
- There are no sidebar/collapsed states, branded login/loading views, touch/PWA
  icons, platform manifests or social-image consumers in either example.

The header PNG is copied exactly from the selected `transparent-64.png` archive
export. There was no existing image-resize toolchain in this source repository;
the multi-resolution ICO is a deterministic packaging derivative created with
the machine's existing Python/Pillow, without adding a project dependency:

```sh
python3 - <<'PYCODE'
from PIL import Image
from shutil import copyfile
master = Image.open("logo.png").convert("RGBA")
master.save("examples/next-app/app/favicon.ico", format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)])
copyfile("examples/next-app/app/favicon.ico",
         "examples/vite-app/public/favicon.ico")
PYCODE
```

ICO entries are decoded independently to verify all three sizes and foreground
alpha. Browser checks in each example's `e2e/branding.spec.ts` cover visible,
unmasked marks and effective favicon responses.

## Small-size limits

At 16 px the ivory knob and petrol disk remain distinct; the amber pointer is fragile and individual detents vanish. Use the transparent mark without an additional corner mask.
