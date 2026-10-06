#!/usr/bin/env python3
"""Generate crawlable bilingual static training-program pages from courses.json."""
from __future__ import annotations
import html
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / "courses.json").read_text(encoding="utf-8"))
BASE = "https://akram-sabry.github.io"
PHONE = "201155780461"


def e(value: str) -> str:
    return html.escape(value, quote=True)


def list_items(items: list[str]) -> str:
    return "\n".join(f"<li>{e(item)}</li>" for item in items)


def source_links(sources: list[dict]) -> str:
    return "\n".join(
        f'<li><a href="{e(item["url"])}" target="_blank" rel="noopener noreferrer">{e(item["label"])}</a></li>'
        for item in sources
    )


def wa_url(title: str, lang: str) -> str:
    text = ("مرحبًا، أريد معرفة تفاصيل برنامج: " if lang == "ar" else "Hello, I would like to learn more about the program: ") + title
    return f"https://wa.me/{PHONE}?text={quote(text)}"


def header(lang: str, home: str, hub: str, switch: str, wa: str) -> str:
    if lang == "ar":
        name, open_label, home_label, hub_label, contact, switch_label = "م. أكرم صبري", "فتح قائمة التنقل", "الرئيسية", "كل البرامج", "اسأل عن البرنامج", "English"
        lang_attr, lang_code = "lang=\"en\" hreflang=\"en\"", "ar"
        aria = "التنقل الرئيسي"
    else:
        name, open_label, home_label, hub_label, contact, switch_label = "Akram Sabry", "Open navigation menu", "Home", "All programs", "Ask about this program", "العربية"
        lang_attr, lang_code = "lang=\"ar\" hreflang=\"ar\"", "en"
        aria = "Main navigation"
    return f'''<header class="site-header"><div class="container navbar">
  <a class="brand" href="{e(home)}" aria-label="{e(home_label)}"><span class="brand-mark">AS</span><span>{e(name)}</span></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="{e(open_label)}">{('القائمة' if lang == 'ar' else 'Menu')} <span aria-hidden="true">☰</span></button>
  <nav aria-label="{e(aria)}"><ul class="nav-links" id="site-nav">
    <li><a href="{e(home)}">{e(home_label)}</a></li><li><a href="{e(hub)}">{e(hub_label)}</a></li>
    <li><a href="{e(wa)}" target="_blank" rel="noopener noreferrer">{e(contact)}</a></li>
    <li><a class="language-switch" href="{e(switch)}" {lang_attr}>{e(switch_label)}</a></li>
  </ul></nav>
  <a class="nav-cta" href="{e(wa)}" target="_blank" rel="noopener noreferrer">{e(contact)}</a>
</div></header>'''


def breadcrumbs(lang: str, home: str, hub: str, current: str) -> str:
    if lang == "ar":
        home_label, hub_label, aria = "الرئيسية", "البرامج التدريبية", "مسار التنقل"
    else:
        home_label, hub_label, aria = "Home", "Training programs", "Breadcrumb"
    return f'''<nav class="container breadcrumb-nav" aria-label="{e(aria)}"><ol class="breadcrumbs">
<li><a href="{e(home)}">{e(home_label)}</a></li><li><a href="{e(hub)}">{e(hub_label)}</a></li><li aria-current="page">{e(current)}</li>
</ol></nav>'''


def page_html(program: dict, lang: str) -> str:
    data = program[lang]
    slug = program["slug"]
    if lang == "ar":
        path = f"/courses/{slug}.html"
        alt_path = f"/en/courses/{slug}.html"
        home, hub, switch, stylesheet, script = "../index.html", "index.html", f"../en/courses/{slug}.html", "../styles.css", "../site.js"
        course_label, audience_label, modules_label, takeaways_label, faq_label = "تفاصيل البرنامج", "لمن يناسب البرنامج؟", "المحاور الرئيسية", "ما الذي يغطيه البرنامج؟", "سؤال شائع"
        update_note = "تُكيّف الأمثلة والتطبيقات بحسب نوع المنشأة ومستوى المشاركين واحتياجات الجهة. تواصل لتأكيد المحتوى النهائي والمواعيد والرسوم وطريقة التنفيذ قبل التسجيل."
        cta = "استفسر عن البرنامج عبر واتساب"
        footer = "© أكرم صبري — استشاري جودة وسلامة الغذاء"
        breadcrumb_home, breadcrumb_hub = "../index.html", "index.html"
        title_suffix = " | أكرم صبري"
        direction = "rtl"
        code = "ar"
    else:
        path = f"/en/courses/{slug}.html"
        alt_path = f"/courses/{slug}.html"
        home, hub, switch, stylesheet, script = "../../index-en.html", "index.html", f"../../courses/{slug}.html", "../../styles.css", "../../site-en.js"
        course_label, audience_label, modules_label, takeaways_label, faq_label = "Program overview", "Who is this program for?", "Key topics", "What the program covers", "Common question"
        update_note = "Examples and exercises can be adapted to the establishment, participant level and client needs. Contact us to confirm the final content, dates, fees and delivery format before registration."
        cta = "Ask about this program on WhatsApp"
        footer = "© Akram Sabry — Food Safety & Quality Consultant"
        breadcrumb_home, breadcrumb_hub = "../../index-en.html", "index.html"
        title_suffix = " | Akram Sabry"
        direction = "ltr"
        code = "en"
    canonical = BASE + path
    alternate = BASE + alt_path
    title = data["title"] + title_suffix
    description = data["description"]
    wa = wa_url(data["title"], lang)
    switches = f'<link rel="alternate" hreflang="ar" href="{BASE + (path if lang == "ar" else alt_path)}">\n  <link rel="alternate" hreflang="en" href="{BASE + (alt_path if lang == "ar" else path)}">'
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "الرئيسية" if lang == "ar" else "Home", "item": BASE + ("/" if lang == "ar" else "/index-en.html")},
            {"@type": "ListItem", "position": 2, "name": "البرامج التدريبية" if lang == "ar" else "Training programs", "item": BASE + ("/courses/" if lang == "ar" else "/en/courses/")},
            {"@type": "ListItem", "position": 3, "name": data["title"], "item": canonical}
        ]
    }
    doc = f'''<!doctype html>
<html lang="{code}" dir="{direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{e(description)}">
  <meta name="theme-color" content="#0b5d4f">
  <title>{e(title)}</title>
  <link rel="canonical" href="{canonical}">
  {switches}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Akram Sabry | Food Safety &amp; Quality">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{BASE}/akram-profile.jpeg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(description)}">
  <meta name="twitter:image" content="{BASE}/akram-profile.jpeg">
  <link rel="stylesheet" href="{stylesheet}">
  <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body class="course-page">
  <a class="skip-link" href="#main">{'تخطي إلى المحتوى' if lang == 'ar' else 'Skip to content'}</a>
  {header(lang, home, hub, switch, wa)}
  {breadcrumbs(lang, breadcrumb_home, breadcrumb_hub, data['title'])}
  <main id="main">
    <section class="course-hero"><div class="container">
      <span class="eyebrow">{e(course_label)}</span>
      <h1>{e(data['title'])}</h1>
      <p class="course-subtitle">{e(data['subtitle'])}</p>
      <p class="course-description">{e(data['description'])}</p>
      <a class="button button-primary" href="{e(wa)}" target="_blank" rel="noopener noreferrer">{e(cta)}</a>
      <p class="course-note">{e(update_note)}</p>
    </div></section>
    <section class="section section-white"><div class="container course-content-grid">
      <section class="card course-detail-card"><h2>{e(audience_label)}</h2><ul class="course-list">{list_items(data['audience'])}</ul></section>
      <section class="card course-detail-card"><h2>{e(takeaways_label)}</h2><ul class="course-list">{list_items(data['takeaways'])}</ul></section>
      <section class="card course-detail-card course-modules"><h2>{e(modules_label)}</h2><ol class="course-list course-numbered">{list_items(data['modules'])}</ol></section>
      <section class="card course-detail-card course-faq"><h2>{e(faq_label)}</h2><h3>{e(data['faq_q'])}</h3><p>{e(data['faq_a'])}</p></section>
    </div></section>
    <section class="section"><div class="container course-references"><h2>{'مراجع رسمية عامة' if lang == 'ar' else 'General official references'}</h2><p>{'للتعرف على المراجع الأصلية ذات الصلة؛ وهي ليست بديلًا عن متطلبات الجهة المختصة أو نسخة المعيار المرخصة.' if lang == 'ar' else 'For context on relevant primary references; these do not replace competent-authority requirements or an authorized copy of a standard.'}</p><ul>{source_links(data['sources'])}</ul><a class="button button-primary" href="{e(wa)}" target="_blank" rel="noopener noreferrer">{e(cta)}</a></div></section>
  </main>
  <footer class="site-footer"><div class="container footer-inner"><p>{e(footer)}</p><div class="footer-links"><a href="https://www.linkedin.com/in/akram-sabry-a543a3239" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="{e(home)}">{e('الصفحة الرئيسية' if lang == 'ar' else 'Home')}</a><a href="{e(hub)}">{e('كل البرامج' if lang == 'ar' else 'All programs')}</a></div></div></footer>
  <script src="{script}" defer></script>
</body>
</html>
'''
    out = ROOT / path.lstrip("/")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")
    return path


def hub_html(lang: str) -> str:
    if lang == "ar":
        path, home, stylesheet, script = "/courses/index.html", "../index.html", "../styles.css", "../site.js"
        title, description, direction, code = "البرامج التدريبية في الجودة وسلامة الغذاء | أكرم صبري", "تعرف على البرامج التدريبية في PRPs وHACCP وISO 9001 وISO 22000 وISO 19011 وGDP ومتطلبات NFSA.", "rtl", "ar"
        hero, intro, button, note = "البرامج التدريبية", "برامج في ممارسات سلامة الغذاء وأنظمة الإدارة والتدقيق والتوثيق، مع محاور تُكيّف بحسب طبيعة المنشأة واحتياجات المشاركين.", "عرض تفاصيل البرنامج", "تواصل لمعرفة البرامج المتاحة ومحتواها النهائي ومواعيدها ورسومها وطريقة تنفيذها."
        labels = ("الرئيسية", "كل البرامج", "تواصل", "اسأل عن برنامج", "البرامج")
        lang_url, lang_label = "../en/courses/index.html", "English"
        switchattr = 'lang="en" hreflang="en"'
        list_intro = "اختر البرنامج للتعرف إلى جمهوره ومحاوره ومراجع عامة ذات صلة."
        footer = "© أكرم صبري — استشاري جودة وسلامة الغذاء"
    else:
        path, home, stylesheet, script = "/en/courses/index.html", "../../index-en.html", "../../styles.css", "../../site-en.js"
        title, description, direction, code = "Food Safety & Quality Training Programs | Akram Sabry", "Explore training programs in PRPs, HACCP, ISO 9001, ISO 22000, ISO 19011, GDP and Egyptian NFSA requirements.", "ltr", "en"
        hero, intro, button, note = "Training programs", "Programs covering food-safety practices, management systems, auditing and documentation, with topics adapted to the operation and participant needs.", "View program details", "Contact us to confirm program availability, final content, dates, fees and delivery format."
        labels = ("Home", "All programs", "Contact", "Ask about a program", "Programs")
        lang_url, lang_label = "../../courses/index.html", "العربية"
        switchattr = 'lang="ar" hreflang="ar"'
        list_intro = "Choose a program to review its audience, topics and relevant general references."
        footer = "© Akram Sabry — Food Safety & Quality Consultant"
    canonical = BASE + path
    switch = f'<link rel="alternate" hreflang="ar" href="{BASE}/courses/index.html">\n  <link rel="alternate" hreflang="en" href="{BASE}/en/courses/index.html">'
    cards = []
    for i, program in enumerate(DATA["programs"], start=1):
        item = program[lang]
        href = f"{program['slug']}.html"
        cards.append(f'''<article class="card service-card reveal"><span class="service-index">{i:02}</span><h2>{e(item['title'])}</h2><p>{e(item['description'])}</p><a class="card-link" href="{href}">{e(button)} →</a></article>''')
    wa = f"https://wa.me/{PHONE}?text={quote('مرحبًا، أريد معرفة تفاصيل البرامج التدريبية' if lang == 'ar' else 'Hello, I would like to learn more about the training programs')}"
    schema = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":labels[0],"item":BASE + ("/" if lang == "ar" else "/index-en.html")},{"@type":"ListItem","position":2,"name":hero,"item":canonical}]}
    return f'''<!doctype html>
<html lang="{code}" dir="{direction}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{e(description)}"><meta name="theme-color" content="#0b5d4f"><title>{e(title)}</title>
<link rel="canonical" href="{canonical}">{switch}
<meta property="og:type" content="website"><meta property="og:site_name" content="Akram Sabry | Food Safety &amp; Quality"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{BASE}/akram-profile.jpeg"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="{stylesheet}"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head><body class="course-page"><a class="skip-link" href="#main">{'تخطي إلى المحتوى' if lang == 'ar' else 'Skip to content'}</a>
{header(lang, home, "index.html", lang_url, wa)}
<main id="main"><section class="course-hero"><div class="container"><span class="eyebrow">{e(labels[4])}</span><h1>{e(hero)}</h1><p class="course-description">{e(intro)}</p><p class="course-note">{e(note)}</p></div></section>
<section class="section section-white"><div class="container"><div class="section-heading"><h2>{e(labels[1])}</h2><p>{e(list_intro)}</p></div><div class="grid-3">{''.join(cards)}</div><div class="training-cta"><div><strong>{e(labels[3])}</strong><span>{e(note)}</span></div><a class="button button-primary" href="{e(wa)}" target="_blank" rel="noopener noreferrer">{e(labels[2])}</a></div></div></section></main>
<footer class="site-footer"><div class="container footer-inner"><p>{e(footer)}</p><div class="footer-links"><a href="{e(home)}">{e(labels[0])}</a><a href="https://www.linkedin.com/in/akram-sabry-a543a3239" target="_blank" rel="noopener noreferrer">LinkedIn</a></div></div></footer><script src="{script}" defer></script></body></html>'''


for program in DATA["programs"]:
    page_html(program, "ar")
    page_html(program, "en")
for language in ("ar", "en"):
    path = "/courses/index.html" if language == "ar" else "/en/courses/index.html"
    out = ROOT / path.lstrip("/")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(hub_html(language), encoding="utf-8")
print(f"Generated {len(DATA['programs']) * 2} detail pages and 2 program index pages.")
