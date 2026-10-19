# Nameleas

## Kickbacks.ai landing page

`index.html` is a self-contained landing page for Kickbacks.ai, a cashback/rewards concept. Open it in a browser, or serve the repo root with any static host (GitHub Pages, Netlify, Vercel).

The waitlist forms don't store signups yet. To collect emails, set `WAITLIST_ENDPOINT` near the bottom of `index.html` to a form provider's JSON endpoint (Formspree, Buttondown, etc.).

## Going live on kickbacks.ai (GitHub Pages)

The `CNAME` file tells GitHub Pages to serve this site at `kickbacks.ai`.

1. Merge this branch into `main`.
2. In the repo, open **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, **Branch** to `main`, and the folder to `/ (root)`, then save.
3. At your domain registrar, add these DNS records for `kickbacks.ai`:

   | Type  | Host  | Value                   |
   |-------|-------|-------------------------|
   | A     | `@`   | `185.199.108.153`       |
   | A     | `@`   | `185.199.109.153`       |
   | A     | `@`   | `185.199.110.153`       |
   | A     | `@`   | `185.199.111.153`       |
   | AAAA  | `@`   | `2606:50c0:8000::153`   |
   | AAAA  | `@`   | `2606:50c0:8001::153`   |
   | AAAA  | `@`   | `2606:50c0:8002::153`   |
   | AAAA  | `@`   | `2606:50c0:8003::153`   |
   | CNAME | `www` | `geomxly9-oss.github.io` |

   Remove any other A, AAAA, or CNAME records on `@` and `www` (for example, a registrar parking page).
4. Back in **Settings → Pages**, wait for the DNS check to pass (minutes to a few hours), then tick **Enforce HTTPS**.
5. Recommended: verify the domain under your GitHub account's **Settings → Pages → Add a domain**, so no other GitHub account can claim it.
