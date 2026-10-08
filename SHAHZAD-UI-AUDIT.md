# Shahrzadcity.ir — گزارش UI/UX Audit + Backlog

> **دامنه:** `https://web.shahrzadcity.ir`
> **تاریخ:** ۲۰۲۶/۱۰/۰۸
> **روش:** بررسی DOM، computed styles، accessibility tree و محاسبه‌ی کنتراست
> با مرورگر headless (بدون دسترسی تصویری).
>
> **پوشش:** صفحات عمومی (`/faq`)، جریان ورود (`/login-register` → `/login-otp` → `/home`)
>
> **پوشش داده‌نشده:** پشت login عمیق‌تر از `/home` (نقشه، تاکسی، پرداخت) و ارزیابی بصری
> (چیدمان، فاصله‌گذاری، توازن، animation).

**وضعیت هر آیتم:** `Open` | `In progress` | `Done` | `Wontfix`

---

## بخش A — حفظ نقاط مثبت (تخریب ممنوع)

این‌ها در baseline اثبات شده‌اند. هر تغییر باید حففشان کند.

| ID | نکته | مدرک baseline | وضعیت |
|---|---|---|---|
| **P1** | صفر خطای کنسول و صفر درخواست شکست‌خورده در تمام صفحات و کل جریان لاگین | `0 / 0` در ۴ تست | Done |
| **P2** | `loading="lazy"` روی تصاویر | `notLazy = 2 / 54` | Done |
| **P3** | لینک‌ها accessible name دارند | `linkNoName = 1 / 45` | Done |
| **P4** | دکمه‌ها accessible name دارند | `btnNoName = 0 / 2` | Done |
| **P5** | touch targetهای home نسبتاً خوب | `fail = 2 / 47` | Done |
| **P6** | بدون overflow افقی در ۳۷۵ و ۱۴۴۰ | `scrollWidth == clientWidth` | Done |
| **P7** | لینک اسمش را از `<p>` داخلی می‌گیرد (الگوی درست آیکون+متن) | snapshot a11y tree | Done |
| **P8** | دکمه‌ی ارسال تا معتبر بودن ورودی `disabled` است | `disabled until valid` | Done |
| **P9** | **fallback جایگزین کد پیامک (USSD `*137*11#`)** | OTP page | Done |
| **P10** | RTL با utilityهای منطقی (`rounded-s-16`, `inline-flex`) | `direction: rtl` | Done |
| **P11** | JS navigation بخش کیف پول واقعاً کار می‌کند | کلیک → `/wallet` | Done |
| **P12** | لینک‌های خارجی بدون `target=_blank` → بدون ریسک tabnabbing | `extTargetBlankMissing = 0` | Done |
| **P13** | کنتراست متن روی زمینه‌ی سفید | `#000` روی سفید = ۲۱:۱ | Done |
| **P14** | هدرهای امنیتی قوی (CSP + reporting, HSTS, nosniff, permissions-policy) | response headers | Done |

---

## بخش B — نقاط منفی (Backlog رفع)

### 🔴 بحرانی

#### `C1` — ناوبری پایین صفحه برای کیبورد غیرقابل‌دسترس
**وضعیت:** `Open`
**موقعیت:** bottom fixed nav روی `/home`
**معیار:**
```
کیف پول  → tag: DIV, tabIndex: -1, role: null
خدمات    → tag: DIV, tabIndex: -1, role: null
QR       → tag: A,   tabIndex:  0   ← تنها تب قابل‌دسترس
container → role: null, aria-label: null
```
`tabIndex: -1` **عمداً** تب‌ها را از ترتیب Tab خارج کرده. با موس کار می‌کند
(تأیید شد → `/wallet`) ولی کاربر کیبورد/صفحه‌خوان به دو تب اصلی اپ نمی‌رسد.

**اصلاح:**
```html
<nav aria-label="ناوبری اصلی">
  <button role="button" tabindex="0" aria-current="page">کیف پول</button>
  ...
</nav>
```
یا اگر تب است: `role="tab"` + `role="tablist"` + `aria-selected`.

**تأیید:** `tabIndex` برابر `0` برای هر سه تب، و `nav[aria-label]` در landmarks.
**WCAG:** 2.1.1 (Keyboard), 4.1.2 (Name/Role/Value), 1.3.1 (Info & Relationships)

---

#### `C2` — `lang="en"` و `dir=""` روی پوسته‌ی اپ و auth
**وضعیت:** `Open`
**معیار:**
| مسیر | lang | dir |
|---|---|---|
| `/faq` (عمومی) | `fa` ✅ | `rtl` ✅ |
| **`/home` (بعد از لاگین)** | **`en`** ❌ | **`""`** ❌ |
| `/login-register` | **`en`** ❌ | **`""`** ❌ |

الگو مشخص: صفحات عمومی درست، **پوسته‌ی اپ و auth غلط**.
RTL فقط با `direction: rtl` روی `body` اعمال شده، نه `dir` روی `<html>` →
روی `::before/::after`، ترتیب خواندن صفحه‌خوان و logical properties اثر می‌گذارد.

**اصلاح:** `lang="fa"` و `dir="rtl"` روی `<html>` در لایه‌ی ریشه‌ی هر دو route.
**تأیید:** `document.documentElement.lang === 'fa' && .dir === 'rtl'`
**WCAG:** 3.1.1 (Language of Page)

---

#### `C3` — کل `/home` فقط یک heading دارد — آن هم `H3`
**وضعیت:** `Open`
**معیار:**
```
headingTags: ["H3"]     h1Count: 0     h2: 0
تنها heading: H3 «خدمات شهرزاد»
```
صفحه‌ی اصلی اپ هیچ سلسله‌مراتبی ندارد. صفحه‌ی ورود هم فقط `H2` دارد (بدون `H1`).

**اصلاح:** `H1` برای عنوان اصلی هر route (نام صفحه)، بعد `H2` برای بخش‌ها، `H3` زیرمجموعه.
ترتیب نباید بپرد.
**تأیید:** `h1Count == 1` و ترتیب heading صعودی.
**WCAG:** 1.3.1, 2.4.6

---

#### `C4` — صفر landmark در `/home`
**وضعیت:** `Open`
**معیار:** `landmarks: []` · `mainCount: 0` · `NAVS: []` · `skipLink: false`
درخت دسترسی کاملاً تخت است — نه `header`، نه `nav`، نه `main`، نه `footer`.

**اصلاح:** `<header>`، `<nav aria-label="...">`، `<main>`، `<footer>` + skip link
اولین فوکوس‌پذیر باید `href="#main"` باشد.
**تأیید:** `landmarks.length ≥ 3`، `mainCount == 1`، `skipLink == true`
**WCAG:** 1.3.1, 2.4.1 (Bypass Blocks)

---

#### `C5` — ۵۲ از ۵۴ تصویر `alt` ندارند
**وضعیت:** `Open`
**معیار:** `imgTotal: 54`, `imgNoAlt: 52`, `imgEmptyAlt: 0`, `withAlt: 2`
تنها altهای موجود: `طرح ترافیک روزانه و ماهانه`، `footer background`.

لینک‌ها اسمشان را از `<p>` می‌گیرند پس شنیده می‌شوند، ولی خود `<img>` به‌عنوان
image بدون نام اعلام می‌شود. تصاویر تزئینی باید `alt=""` داشته باشند.

**اصلاح:** `alt=""` روی تصاویر تزئینی (آیکون‌های سرویس، لوگو، پس‌زمینه)؛
`alt` واقعی فقط وقتی تصویر اطلاعاتی مستقل دارد.
**تأیید:** `imgNoAlt == 0`
**WCAG:** 1.1.1 (Non-text Content)

---

#### `C6` — ۱۰ سرویس لینک مرده به `/home` دارند (شکست خاموش)
**وضعیت:** `Open`
**معیار:** `allLinks: 45`, `uniqueHrefs: 14`, `deadLinks = 20` (۱۰ یکتا × کپی موبایل/دسکتاپ)

```
تورم صفر · طرح ترافیک · عوارض خودرو · 137+ · اسکوتر کن
خانه‌ریز · پارک حاشیه‌ای · جستجوی متوفی · ورزش · تهران مجازی
```
ظاهراً فعال‌اند (cursor:pointer) ولی کلیک → همان `/home`. **بدون toast، بدون
«به‌زودی»، بدون بازخورد.** کاربر فکر می‌کند اپ خراب است.

**اصلاح (یکی را انتخاب کن):** ۱. مقصد واقعی ۲. `aria-disabled` + استایل غیرفعال
۳. toast/info «این سرویس به‌زودی» ۴. حذف از grid
**تأیید:** `deadCount == 0` یا هر کدام بازخورد دیده‌شدنی دارند.
**WCAG:** 3.2.1 (On Focus), 2.4.4 (Link Purpose) — و UX عام

---

### 🟠 متوسط

| ID | مشکل | معیار | اصلاح | WCAG | وضعیت |
|---|---|---|---|---|---|
| `M1` | فونت برچسب سرویس‌ها | `font-size: 10px`, `lh: 15.7px` | ≥ 12px (ترجیحاً 14) | 1.4.4 | `Open` |
| `M2` | کنتراست «مشاهده همه» | `#307fe2` متن 12px = **3.99:1** | تغییر به `#1C66C1` (5.65) | 1.4.3 | `Open` |
| `M3` | «مشاهده همه» touch target | `62 × 16` px | ارتفاع ≥ 44 | 2.5.8 | `Open` |
| `M4` | primary شکسته در هر دو صفحه | `--color-primary: #307fe2` | → `#1C66C1` | 1.4.3 | `Open` |
| `M5` | DOM تکراری mobile/desktop | `45 link / 14 href` | یک source of truth؛ تفکیک با breakpoint | — | `Open` |
| `M6` | لینک خارجی همان‌تب | `target:""` روی 6 لینک (telewebion, hamkara) | `target="_blank" rel="noopener"` یا تأیید خروج | — | `Open` |
| `M7` | focus ring حذف‌شده | `outline-style: none` روی button/input | `:focus-visible` با اندازه/رنگ کافی | 2.4.7 | `Open` |
| `M8` | ۱ لینک بدون اسم | `linkNoName 1/45` (لینک QR) | `aria-label="پرداخت QR"` | 4.1.2 | `Open` |
| `M9` | `aria-expanded` بدون `aria-controls` | `18 aria-expanded`، `18 ariaControlsMissing` | id پنل + `aria-controls` | 1.3.1 | `Open` |
| `M10` | فیلترهای FAQ بدون state | `aria-pressed: null` روی همه‌ی chipها | `aria-pressed` | 4.1.2 | `Open` |

### ⚪ مشترک با جریان ورود (هم‌دسته‌ی C1–C4)

| ID | مشکل | معیار | اصلاح | WCAG | وضعیت |
|---|---|---|---|---|---|
| `W1` | زوم غیرفعال | `user-scalable=no`, `maximum-scale=1.0` | حذف هر دو | 1.4.4 | `Open` |
| `W2` | فیلد شماره‌ی موبایل بدون label | `label:false`, `ac:""`, `inputmode:""`, `ariaLabel:null` | `<label for>` + `autocomplete="tel"` + `inputmode="numeric"` + `aria-describedby` | 1.3.1, 3.3.2 | `Open` |
| `W3` | placeholder تنها راهنما و کنتراست FAIL | `rgba(0,0,0,.45)` = **3.36:1** | رنگ متن ورودی ≥ 4.5:1 | 1.4.3 | `Open` |
| `W4` | touch targetهای صفحه‌ی ورود | tab `22px`، CTA `40px`، «ورود با نام کاربری» `32px`، INPUT `22px` | همه ≥ 44px | 2.5.8 | `Open` |
| `W5` | صفحه‌ی ورود بدون `H1` | فقط `H2` | افزودن `H1` | 1.3.1 | `Open` |
| `W6` | فونت پایه‌ی 14px | `body font-size: 14px` | 16px | 1.4.4 | `Open` |
| `W7` | GTM همزمان در `<head>` | script بدون defer در head | `afterInteractive` / defer | — | `Open` |
| `W8` | magic number header | `pt-[81.5px]` | متغیر/CSS `env(safe-area-inset-top)` | — | `Open` |
| `W9` | heading FAQ برعکس | ۱۰ تا `H3` قبل از `H1` | بازچینش ترتیب | 1.3.1 | `Open` |
| `W10` | `/home` بدون `main` و بدون skip link | `mainCount:0`, `skipLink:false` | همانند `C4` | 1.3.1, 2.4.1 | `Open` |

---

## بخش C — خلاصه‌ی اولویت‌بندی

### پیروزی‌های سریع (کمتر از ۲۰ دقیقه، ۵ مشکل بحرانی را می‌بندد)

| # | اقدام | آیتم | هزینه |
|---|---|---|---|
| 1 | `#307fe2` → `#1C66C1` | `M2`, `M4` | یک خط |
| 2 | حذف `user-scalable=no` | `W1` | یک خط |
| 3 | `lang="fa"` `dir="rtl"` روی پوسته‌ی اپ + auth | `C2` | خیلی کم |
| 4 | `:focus-visible` به‌جای `outline:none` | `M7` | کم |
| 5 | `alt=""` روی ۵۲ تصویر تزئینی | `C5` | اسکریپت |

### بعد از آن
`C1` (bottom nav) → `C3`+`C4` (heading + landmark) → `C6` (لینک‌های مرده)
→ `W2`+`W4` (فرم ورود) → `M1` (فونت 10px) → `W7` (GTM)

---

## بخش D — روش‌شناسی و محدودیت‌ها

**انجام‌شده:**
- خواندن accessibility tree با `--snapshot --full`
- استخراج computed styles، توکن‌های طراحی، touch targetها، focus outline
- محاسبه‌ی کنتراست WCAG با فرمول WCAG 2.x
- تست responsive در ۳۷۵px و ۱۴۴۰px
- ردیابی کل جریان لاگین با OTP واقعی
- بررسی هدرهای امنیتی و CSP

**انجام‌نشده (محدودیت):**
1. **ارزیابی بصری** — مدل تحلیل‌گر تصویر نمی‌خواند؛ پس چیدمان، فضای خالی،
   توازن، ریتم بصری و animation بررسی نشد.
2. **بخش‌های احراز هویت‌شده‌ی عمیق** — نقشه، تاکسی، کیف پول، پرداخت، جستجو.
3. **حالت‌های خطا و خالی** — فقط حالت عادی دیده شد.
4. **تست کیبورد و صفحه‌خوان واقعی** — فقط ساختار DOM استخراج شد، نه تجربه‌ی واقعی.
5. **لایت‌باکس/کاروسل** — چون تصویر خوانده نشد، رفتار آن‌ها بررسی نشد.

برای بند ۱ و ۵ از مدل دارای قابلیت بصری استفاده کن.

## بخش E — تکمیلی بر پایه اسکرین‌شات‌ها (قابل‌بررسی با مدل بصری)

| ID | مشاهده احتمالی | شدت | پیشنهاد فوری | وضعیت |
|---|---|---|---|---|
| `V1` | تراز شدن شبکه سرویس‌ها (icons grid) در mobile — شلوغ به‌نظر می‌رسد | Minor | کاهش gap یا افزایش ستون در breakpointهای کوچک‌تر | `Open` |
| `V2` | «مشاهده همه» بیش از حد نزدیک به عنوان بخش است | Minor | فاصله عمودی بیشتر بین «خدمات شهرزاد» و CTA | `Open` |
| `V3` | برچسب‌های 10px زیر حد خوانایی توصیه‌شده برای فارسی عمومی | Major | افزایش به ۱۲–۱۴px حداقل | `Open` |
| `V4` | رنگ‌های آبی متفاوت بین primary (#307fe2) و theme (#1C66C1) | Major | یکسان‌سازی → #1C66C1 | `Open` |
| `V5` | «دریافت مجدد کد» به‌صورت پاراگراف کلیک‌پذیر | Critical | تبدیل به `<button>` یا حداقل `role=button`+`tabIndex=0` | `Open` |
