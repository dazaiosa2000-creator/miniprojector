# HY320 Galaxy — order funnel

A static site with no build step: `index.html`, `styles.css`, `app.js`, `config.js` and `assets/`. You can host it on any static host (Netlify, Vercel, GitHub Pages, cPanel…) or open `index.html` directly.

## What to edit
Everything you'll need to change is in **`config.js`**:
- `PRODUCT_PRICE`, `HOME_DELIVERY_SURCHARGE` (home delivery = Stop Desk + 350 DA, charged once per order), `MAX_QTY`
- `deliveryRates`: Stop Desk tariffs. A wilaya missing from this table shows "À confirmer", the normal checkout is blocked, and the customer is sent to WhatsApp.
- `WILAYAS`: all 69 wilayas in official order. Each one's number is its position in the list.
- `WHATSAPP`, `FORMSUBMIT_ENDPOINT`
- `HERO_HEADLINE`, `STICKY_CTA`

## Before going live
- **FormSubmit activation:** the first order sends an activation email to dazaiosa2000@gmail.com. Orders are only delivered after you click the link in that email.
- Check wilayas 59–69 (the newest ones) against the official list.
- 12 wilayas have no confirmed tariff yet (Aïn Témouchent and 59–69). Their orders go through WhatsApp until you add a price to `deliveryRates`.
