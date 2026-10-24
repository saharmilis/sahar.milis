# 2026A-26027 — Encrypted certificate demonstration

- **Course:** Computational Thinking and Programming in Python
- **Course code:** 26027
- **Term:** 2026A
- **Lecturer:** Sahar Millis
- **University:** Reichman University
- **School:** Adelson School of Entrepreneurship
- **Status:** TEST DATA ONLY — not official university certificates

## Files

- `index.html` — the **only viewer** (not a landing page); required by GitHub Pages for a clean folder URL.
- `certificate-template.html` — the **one common certificate template**, used for every student.
- `certificate.css` and `viewer.js` — styling and browser-side decryption.
- `share-card.png` — public, non-personal social thumbnail.
- `001.enc.json`, `002.enc.json`, `003.enc.json` — three independent AES-128-GCM ciphertexts.

## Access and privacy

The student gets a private URL with format:

`https://saharmillis.com/certificates/2026A-26027/#001.SECRET_KEY`

The browser loads the same `index.html` for all students, extracts the 3-digit file number and the 22-character Base64URL key from the **fragment**, fetches the matching ciphertext, and decrypts locally through Web Crypto. The `#` fragment is not sent to GitHub in HTTP requests.

All three encrypted JSON files are public. They cannot be read without their respective secret key, but **anyone who gets a full private URL can decrypt its certificate**. A secret link should not be posted publicly. Keys must never be committed to GitHub.

## Open Graph metadata

Static `og:*` and `twitter:*` metadata lives in `index.html`; the **same generic card** is used for all three students. Student-specific metadata requires separate HTML pages or a server capable of rendering it. Social networks may drop URL fragments, so a shared post may link to the viewer without a decryption key.

## Upload

Upload the entire `certificates/` directory from the ZIP to the published root of `sharmilis.github.io`; do not upload the separate private-links file. No build process is needed. GitHub Pages HTTPS is required for Web Crypto.
