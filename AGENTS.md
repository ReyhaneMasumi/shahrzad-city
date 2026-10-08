# Shahrzad — UI/UX & Accessibility (A11y) Rules

This file is the entry point for opencode and is loaded in every session.
Keep it short and actionable. Details and backlog are in the second file.

---

## ۰. Lazy loading (lazy) — Before any UI work

**CRITICAL:** Before any UI work that needs current site state, read this file first:

```
@SHAHZAD-UI-AUDIT.md
```

- فقط وقتی لازم است بخوان — یعنی وظیفه‌ی در دسترس‌پذیری، رفع باگ UI، یا مرور backlog.
- Treat its contents as mandatory and higher priority than defaults.
- Update each item status (Open/Done/Wontfix) after any change.

---

## ۱. Must not break (preserve positives) (حفظ Strengths)

این‌ها در audit فعلی اثبات شده‌اند. با هر تغییر باید سالم بمانند:

| # | قاعده | مقدار مرجع |
|---|---|---|
| K1 | **صفر خطای کنسول و صفر درخواست شکست‌خورده** در هر حالت صفحه. اگر خطای جدید دیدی، اول آن را حل کن. | `0 console error / 0 failed request` |
| K2 | **هر لینک و دکمه باید accessible name داشته باشد.** اسم از متن داخلی، یا `aria-label`، یا `alt` تصویر داخلش. | `linkNoName ≤ 1/45`, `btnNoName = 0` |
| K3 | **RTL با utilityهای منطقی.** فقط `rounded-s-*`، `ms-*`، `me-*`، `inline-flex`. استفاده از `-left` / `-right` / `text-left` / `pl-*` / `pr-*` ممنوع. | `rounded-s-16` |
| K4 | **هر تصویر تزئینی باید `alt=""` داشته باشد** (نه بدون `alt`)، و تصویر محتوایی `alt` واقعی. | هدف: `noAttr = 0` |
| K5 | **تصاویر باید `loading="lazy"` باشند** مگر above-the-fold بودن اثبات شود. | `notLazy ≤ 2` |
| K6 | **دکمه‌ی submit فقط بعد از معتبر بودن ورودی فعال شود** (`disabled` تا valid). جلوی خطای سمت سرور را می‌گیرد. | `disabled until valid` |
| K7 | **همیشه fallback داشته باش** برای هر جریانی که به شبکه/پیامک وابسته است (نمونه: کد جایگزین USSD `*137*11#`). | UX-gold |
| K8 | **لینک خارجی اگر `target="_blank"` دارد باید `rel="noopener"` هم داشته باشد.** | `targetBlankWithoutNoopener = 0` |
| K9 | **بدون overflow افقی** در ۳۷۵px و ۱۴۴۰px. | `scrollWidth ≤ clientWidth` |
| K10 | **touch targetها ≥ 44×44px.** صفحه‌ی home الان ۲ خطا از ۴۷ دارد — بدتر از این نشود. | `fail ≤ 2` |
| K11 | **هیچ هدر امنیتی را حذف نکن** (CSP, HSTS, nosniff, permissions-policy). | — |

---

## ۲. Absolute prohibitions

**Matching finding:** المان‌های با `cursor:pointer` ولی `tag: P` و `tabIndex=-1` بدون `role="button"` (مثال «دریافت مجدد کد» و تب‌های bottom nav) نباید از Tab خارج باشند. حتماً `role="button"` + `tabIndex=0`. (مسیرهای رایجِ خطا)

این‌ها قبلاً رخ داده‌اند یا لبه‌ی پرتگاه‌اند. بدون استثنا:

1. **ممنوع:** استفاده از `user-scalable=no` یا `maximum-scale=1.0` در viewport. → WCAG 1.4.4
2. **ممنوع:** حذف focus ring با `outline: none` بدون جایگزین. هر فوکوس‌پذیر باید `:focus-visible` داشته باشد. → WCAG 2.4.7
3. **ممنوع:** `tabIndex = -1` روی المان‌های ناوبری اصلی. اگر با div ساخته می‌شود، `role="button"` + `tabIndex=0` الزامی است. → (پیدا شده در bottom nav)
4. **ممنوع:** رندر `<html lang="en">` یا بدون `dir` برای محتوای فارسی. هر route باید `lang="fa"` و `dir="rtl"` داشته باشد. → (پیدا شده در `/home` و `/login-register`)
5. **ممنوع:** صفحه بدون `H1`. سلسله‌مراتب heading نباید بپرد (H3 بعد از H1 بدون H2 ممنوع).
6. **ممنوع:** صفحه بدون `<main>`. landmarks الزامی‌اند: `header` / `nav` / `main` / `footer`.
7. **ممنوع:** لینکی که بدون بازخورد به همان صفحه برمی‌گردد (شکست خاموش). یا مقصد واقعی بده، یا `disabled` کن، یا toast «به‌زودی» نشان بده.
8. **ممنوع:** فونت زیر 12px برای متن اصلی. فونت پایه‌ی public pages عمداً 16px باشد.
9. **ممنوع:** رنگ primary با کنتراست کمتر از 4.5:1 روی سفید. `#307fe2` = 3.99 FAIL. `#1C66C1` = 5.65 PASS.
10. **ممنوع:** فیلتر/accordion بدون state اعلام‌شده: `aria-pressed` برای toggle، `aria-expanded` **و** `aria-controls` برای accordion.

---

## ۳. Verification method (اجباری — قبل از گفتن «انجام شد»)

هر تغییر UI باید اندازه‌گیری شود، نه «به‌نظر درست». از skill مرورگر استفاده کن:

```bash
# صفحه را باز کن و ساختار را بخوان
node ~/.claude/skills/browser-automation/browser.mjs <url> --snapshot --full

# اندازه‌گیری‌های عینی — با --script اجرا کن
node ~/.claude/skills/browser-automation/browser.mjs <url> --script ./audit.mjs
```

**پارامترهایی که باید قبل/بعد از هر تغییر ثبت کنی:**

```
lang, dir, h1Count, mainCount, landmarks, skipLink,
imgNoAlt, linkNoName, btnNoName, touchFailCount/totalInteractive,
focus outlineStyle, primary color + contrast ratio,
scrollWidth vs clientWidth, console errors, failed requests
```

**Criterion پذیرش:** هیچ‌کدام از پارامترهای `K1`–`K11` نباید نسبت به مقدار مرجع بدتر شود، و آیتم‌های backlog باید واقعاً اندازه‌گیری‌شده Improved باشند.

### نکات عملی
- **اوّل `--snapshot` بگیر، بعد act.** refها بعد از هر navigation/re-render می‌میرند → دوباره snapshot بگیر.
- **منتظر محتوا باش، نه تأخیر ثابت.** SPA است؛ `--wait [selector]` بهتر از sleep است.
- **روی متنی که خودت وارد کردی assert نکن.** فقط روی رشته‌هایی که از سیستم تحت تست می‌آیند.
- **اگر dev/proxy داری، لاگین OTP فلو می‌شکند** چون refهای باکس‌های OTP بعد از هر `fill` تغییر می‌کنند → هر بار snapshot تازه بگیر.
- **Sentry در پروژه فعال است** → خطاهای سمت سرور در runtime گزارش می‌شوند؛ قبل از deploy چک کن.

---

## ۴. Workflow order

1. `@SHAHZAD-UI-AUDIT.md` را بخوان (اگر کار UI است).
2. قبل از تغییر، baseline بگیر و ثبت کن.
3. تغییر را در کوچک‌ترین واحد ممکن اعمال کن.
4. اندازه‌گیری بعدی → مقایسه با baseline.
5. Update item status in audit after changes.
6. Commit with item ID in message.
