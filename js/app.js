// ניהול לוגיקת האפליקציה - סידור עדות המזרח

// משתני מצב ברירת מחדל
let state = {
    theme: 'light',
    fontSize: 22,
    season: 'summer',
    repentance: 'off'
};

// מיפוי קטעי הניווט עבור התפילות השונות
const PrayerNavSections = {
    shacharit: [
        { id: 'shacharit-brachot', title: 'ברכות השחר' },
        { id: 'shacharit-tzitzit', title: 'ציצית ותפילין' },
        { id: 'shacharit-psukim', title: 'פסוקי דזמרה' },
        { id: 'shacharit-shema', title: 'קריאת שמע' },
        { id: 'amida-section', title: 'תפילת העמידה' },
        { id: 'shacharit-viduy', title: 'וידוי ותחנון' },
        { id: 'shacharit-ashrei', title: 'אשרי ובא לציון' },
        { id: 'shacharit-beit-yaakov', title: 'בית יעקב' },
        { id: 'shacharit-shir-shel-yom', title: 'שיר של יום' },
        { id: 'shacharit-kaveh', title: "קווה אל ה'" },
        { id: 'shacharit-aleinu', title: 'עלינו לשבח' }
    ],
    mincha: [
        { id: 'mincha-ashrei', title: 'אשרי יושבי ביתך' },
        { id: 'mincha-kaddish', title: 'חצי קדיש' },
        { id: 'amida-section', title: 'תפילת העמידה' },
        { id: 'mincha-viduy', title: 'וידוי ותחנון' },
        { id: 'mincha-aleinu', title: 'עלינו לשבח' }
    ],
    arvit: [
        { id: 'arvit-opening', title: 'והוא רחום וברכו' },
        { id: 'arvit-shma', title: 'קריאת שמע' },
        { id: 'arvit-hashkivenu', title: 'השכיבנו' },
        { id: 'amida-section', title: 'תפילת העמידה' },
        { id: 'arvit-aleinu', title: 'עלינו לשבח' }
    ],
    hamazon: [
        { id: 'hamazon-zan', title: 'ברכת הזן' },
        { id: 'hamazon-aretz', title: 'ברכת הארץ' },
        { id: 'hamazon-yerushalayim', title: 'בונה ירושלים' },
        { id: 'hamazon-hatov-vehametiv', title: 'הטוב והמטיב' },
        { id: 'hamazon-harachaman', title: 'הרחמן' }
    ]
};

// --- ניהול תפריט ניווט נפתח (Dropdown TOC) ---

function toggleNavDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    const navMenu = document.getElementById('nav-dropdown-menu');
    if (!navMenu) return;

    if (navMenu.style.display === 'none' || navMenu.style.display === '') {
        navMenu.style.display = 'flex';
    } else {
        navMenu.style.display = 'none';
    }
}

function closeNavDropdown() {
    const navMenu = document.getElementById('nav-dropdown-menu');
    if (navMenu) {
        navMenu.style.display = 'none';
    }
}

function handleSectionClick(sectionId) {
    scrollToSection(sectionId);
    closeNavDropdown();
}

function renderPrayerNav(id) {
    const navBtn = document.getElementById('nav-dropdown-btn');
    const navMenu = document.getElementById('nav-dropdown-menu');
    
    if (!navBtn || !navMenu) return;

    const sections = PrayerNavSections[id];
    if (sections && sections.length > 0) {
        navBtn.style.display = 'flex';
        navMenu.innerHTML = sections.map(sec => 
            `<a href="javascript:void(0)" onclick="handleSectionClick('${sec.id}')">${sec.title}</a>`
        ).join('');
    } else {
        navBtn.style.display = 'none';
        navMenu.innerHTML = '';
    }
}

// מאזין לחיצה גלובלי לסגירת התפריט בלחיצה בחוץ
window.addEventListener('click', (event) => {
    const navMenu = document.getElementById('nav-dropdown-menu');
    const navBtn = document.getElementById('nav-dropdown-btn');
    if (navMenu && navMenu.style.display === 'flex') {
        if (!navBtn.contains(event.target) && !navMenu.contains(event.target)) {
            closeNavDropdown();
        }
    }
});

// טעינה ראשונית של הגדרות
document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    initRouter();
});

// אתחול הגדרות מ-localStorage וזיהוי אוטומטי
function initSettings() {
    // 1. מצב תצוגה (כהה / בהיר)
    const savedTheme = localStorage.getItem('siddur-theme');
    if (savedTheme) {
        state.theme = savedTheme;
    } else {
        // בדיקת העדפת מערכת
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = prefersDark ? 'dark' : 'light';
    }
    applyTheme();

    // 2. גודל גופן
    const savedFontSize = localStorage.getItem('siddur-font-size');
    if (savedFontSize) {
        state.fontSize = parseInt(savedFontSize, 10);
    }
    applyFontSize();

    // 3. בורר עונות (קיץ / חורף)
    const savedSeason = localStorage.getItem('siddur-season');
    if (savedSeason) {
        state.season = savedSeason;
    } else {
        // זיהוי אוטומטי הלכתי: מפסח (בערך אפריל) עד סוכות (בערך אוקטובר) - קיץ
        // שאר השנה - חורף
        const currentMonth = new Date().getMonth() + 1; // 1-12
        state.season = (currentMonth >= 4 && currentMonth <= 9) ? 'summer' : 'winter';
    }
    applySeason();

    // 4. עשרת ימי תשובה
    const savedRepentance = localStorage.getItem('siddur-repentance');
    if (savedRepentance) {
        state.repentance = savedRepentance;
    } else {
        state.repentance = 'off'; // ברירת מחדל כבוי
    }
    applyRepentance();
}

// החלת ערכת נושא
function applyTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle-btn');
    
    if (state.theme === 'dark') {
        body.classList.add('dark-mode');
        if (themeBtn) themeBtn.innerHTML = '☀️';
    } else {
        body.classList.remove('dark-mode');
        if (themeBtn) themeBtn.innerHTML = '🌙';
    }
    localStorage.setItem('siddur-theme', state.theme);
}

// שינוי ערכת נושא בלחיצה
function toggleDarkMode() {
    state.theme = (state.theme === 'light') ? 'dark' : 'light';
    applyTheme();
}

// החלת גודל גופן
function applyFontSize() {
    const display = document.getElementById('prayer-display');
    if (display) {
        display.style.fontSize = state.fontSize + 'px';
    }
    localStorage.setItem('siddur-font-size', state.fontSize);
}

// שינוי גודל גופן
function changeFontSize(delta) {
    state.fontSize += delta;
    if (state.fontSize < 14) state.fontSize = 14;
    if (state.fontSize > 40) state.fontSize = 40;
    applyFontSize();
}

// החלת עונה
function applySeason() {
    const body = document.body;
    const btnSummer = document.getElementById('btn-season-summer');
    const btnWinter = document.getElementById('btn-season-winter');

    if (state.season === 'summer') {
        body.classList.add('season-summer');
        body.classList.remove('season-winter');
        if (btnSummer) btnSummer.classList.add('active');
        if (btnWinter) btnWinter.classList.remove('active');
    } else {
        body.classList.add('season-winter');
        body.classList.remove('season-summer');
        if (btnWinter) btnWinter.classList.add('active');
        if (btnSummer) btnSummer.classList.remove('active');
    }
    localStorage.setItem('siddur-season', state.season);
}

// קביעת עונה
function setSeason(seasonName) {
    state.season = seasonName;
    applySeason();
}

// החלת עשרת ימי תשובה
function applyRepentance() {
    const body = document.body;
    const btnOn = document.getElementById('btn-repentance-on');
    const btnOff = document.getElementById('btn-repentance-off');

    if (state.repentance === 'on') {
        body.classList.add('repentance-on');
        body.classList.remove('repentance-off');
        if (btnOn) btnOn.classList.add('active');
        if (btnOff) btnOff.classList.remove('active');
    } else {
        body.classList.add('repentance-off');
        body.classList.remove('repentance-on');
        if (btnOff) btnOff.classList.add('active');
        if (btnOn) btnOn.classList.remove('active');
    }
    localStorage.setItem('siddur-repentance', state.repentance);
}

// קביעת עשרת ימי תשובה
function setRepentance(isOn) {
    state.repentance = isOn ? 'on' : 'off';
    applyRepentance();
}

// --- ניהול הניווט והראוטינג (Router) ---

function initRouter() {
    // מאזין לשינויים בכתובת ה-URL (האש)
    window.addEventListener('hashchange', handleRoute);
    
    // ניווט בטעינה ראשונית של הדף
    handleRoute();
}

function handleRoute() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#prayer-')) {
        const id = hash.replace('#prayer-', '');
        renderPrayer(id);
    } else {
        renderMenu();
    }
}

// מעבר לתפילה (מעדכן את ההאש ב-URL)
function showPrayer(id) {
    window.location.hash = 'prayer-' + id;
}

// חזרה לתפריט הראשי
function showMenu() {
    window.location.hash = '';
}

// רינדור דף תפילה
function renderPrayer(id) {
    // בדיקה האם המאגר נטען
    if (typeof SiddurPrayers === 'undefined') {
        console.error('SiddurPrayers database is not loaded!');
        return;
    }

    const prayer = SiddurPrayers[id];
    if (!prayer) {
        console.error('Prayer not found: ' + id);
        renderMenu();
        return;
    }

    // הסתרת תפריט והצגת קריאה
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('prayer-content').style.display = 'block';
    
    // הזרקת התוכן והחלפת הכותרת
    document.getElementById('prayer-display').innerHTML = prayer.text;
    document.getElementById('header-title').innerText = prayer.title;
    
    // עדכון כתובית תחתונה
    const subTitle = document.querySelector('.sub-title');
    if (subTitle) {
        subTitle.innerText = 'נוסח עדות המזרח • קריאה';
    }

    // הצגת כפתור חזרה בכותרת
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        backBtn.style.display = 'flex';
    }

    // רינדור תפריט הניווט הפנימי בכותרת
    renderPrayerNav(id);

    // החלת גודל גופן נוכחי
    applyFontSize();

    // הפעלת בורר הימים האוטומטי עבור תפילת שחרית
    if (id === 'shacharit') {
        let currentDay = new Date().getDay() + 1; // 1-7 (ראשון-שבת)
        if (currentDay > 6) {
            currentDay = 1; // בשבת נציג כברירת מחדל את יום ראשון
        }
        selectDay(currentDay);
    }

    // גלילה חלקה לראש הדף
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// רינדור תפריט ראשי
function renderMenu() {
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('prayer-content').style.display = 'none';
    document.getElementById('header-title').innerText = 'סידור עדות המזרח';
    
    const subTitle = document.querySelector('.sub-title');
    if (subTitle) {
        subTitle.innerText = 'נוסח עדות המזרח ומצבי הלכה דינמיים';
    }

    // הסתרת כפתור חזרה בכותרת
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        backBtn.style.display = 'none';
    }

    // הסתרת כפתור הניווט וסגירת התפריט
    const navBtn = document.getElementById('nav-dropdown-btn');
    if (navBtn) navBtn.style.display = 'none';
    closeNavDropdown();
}

// גלילה חלקה לקטע ספציפי בתפילה
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// פונקציה לבחירת יום בבורר שיר של יום
function selectDay(dayNum) {
    const buttons = document.querySelectorAll('.day-tab-btn');
    const contents = document.querySelectorAll('.day-content-item');
    
    buttons.forEach(btn => {
        if (parseInt(btn.getAttribute('data-day'), 10) === dayNum) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    contents.forEach(item => {
        if (item.id === `day-content-${dayNum}`) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

