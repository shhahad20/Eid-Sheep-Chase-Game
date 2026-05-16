export let LANG = localStorage.getItem('eidSheepLang') || 'ar';

export const STRINGS = {
  en: {
    title:'EID SHEEP CHASE', subtitle:'Chase the sheep before time runs out!',
    startGame:'START GAME', instructions:'INSTRUCTIONS', highScores:'HIGH SCORES',
    back:'BACK', resume:'RESUME', quitMenu:'QUIT TO MENU', mainMenu:'MAIN MENU',
    paused:'PAUSED', escaped:'THE SHEEP ESCAPED!', caughtAll:'SHEEP CAUGHT!',
    eidMubarak:'EID MUBARAK! ^_^', nextLevel:'NEXT LEVEL', tryAgain:'TRY AGAIN',
    score:'SCORE', level:'LVL', levelFull:'Level', sheep:'SHEEP', stamina:'STAMINA',
    rope:'ROPE', sprint:'SPRINT', magnet:'MAGNET',
    callHelp:'[H] CALL HELP', helpCost:'COSTS 5 COINS',
    best:'BEST', noScores:'No scores yet — go catch that sheep!',
    scoreLabel:'Score', coinsLabel:'Coins', levelLabel:'Level', lvl:'Lvl',
    langBtn:'عربي', credits:'CREDITS', creditsTitle:'CREDITS',
    devBy:'Developed by', devName:'Shahad Altharwa',
    copyright:'© 2026',
    enterName:'ENTER YOUR NAME', nameHint:'Leave blank for default',
    nameDefault:'Player', startBtn:'▶  START',
    nameCol:'NAME', scoreCol:'SCORE', instrTitle:'HOW TO PLAY',
    instrRows:[
      ['MOVE',          'Arrow Keys / WASD'],
      ['SPRINT',        'Space / Shift (drains stamina)'],
      ['PAUSE',         'P  or  Escape'],
      ['GOAL',          'Catch all the sheep before the timer!'],
      ['',''],
      ['COLLECTIBLES:', ''],
      ['  Gold Coin',   '+10 points'],
      ['  Dates',       'Restore stamina'],
      ['  Star',        '+50 bonus points'],
      ['',''],
      ['POWER-UPS:',    ''],
      ['  Rope',        'Slows all sheep for 5 seconds'],
      ['  Sprint Shoes','Speed boost for 8 seconds'],
      ['  Magnet',      'Pulls nearby coins towards you'],
      ['',''],
      ['HELPER:',       ''],
      ['  H key (Lv2+)','Call a helper — costs 5 coins'],
    ],
  },
  ar: {
    title:'مطاردة خروف العيد', subtitle:'!أمسك الخروف قبل نفاد الوقت',
    startGame:'العب', instructions:'كيف تلعب', highScores:'أعلى النتائج',
    back:'رجوع', resume:'استمر', quitMenu:'القائمة الرئيسية', mainMenu:'القائمة الرئيسية',
    paused:'متوقف', escaped:'!هرب الخروف', caughtAll:'!أمسكت الخروف',
    eidMubarak:'عيد مبارك ^_^', nextLevel:'المستوى التالي', tryAgain:'العب مجددًا',
    score:'النتيجة', level:'مستوى', levelFull:'المستوى', sheep:'خراف', stamina:'الطاقة',
    rope:'حبل', sprint:'سرعة', magnet:'مغناطيس',
    callHelp:'[H] استدعِ مساعدًا', helpCost:'تكلفة: 5 عملات',
    best:'أفضل', noScores:'!لا توجد نتائج بعد',
    scoreLabel:'النتيجة', coinsLabel:'العملات', levelLabel:'المستوى', lvl:'مستوى',
    langBtn:'English', credits:'الفريق', creditsTitle:'الفريق',
    devBy:'تطوير', devName:'شهد الثروه',
    copyright:'© 2026',
    enterName:'أدخل اسمك', nameHint:'اتركه فارغًا للاسم الافتراضي',
    nameDefault:'لاعب', startBtn:'ابدأ  ◀',
    nameCol:'الاسم', scoreCol:'النتيجة', instrTitle:'كيف تلعب',
    instrRows:[
      ['التحرك',         'مفاتيح الأسهم / WASD'],
      ['الجري السريع',   'Space / Shift (يستنزف الطاقة)'],
      ['الإيقاف المؤقت', 'P  أو  Escape'],
      ['الهدف',          '!أمسك جميع الخراف قبل انتهاء الوقت'],
      ['',''],
      [':المجمّعات',''],
      ['  عملة ذهبية',   'نقاط 10+'],
      ['  تمر',          'يعيد الطاقة'],
      ['  نجمة',         'نقاط مكافأة 50+'],
      ['',''],
      [':مقويات',''],
      ['  حبل',          'يبطئ الخراف لمدة 5 ثوانٍ'],
      ['  أحذية السرعة', 'تسريع لمدة 8 ثوانٍ'],
      ['  مغناطيس',      'يجذب العملات القريبة'],
      ['',''],
      [':مساعد',''],
      ['  مفتاح H (مستوى 2+)','استدعِ مساعدًا - تكلفة 5 عملات'],
    ],
  },
};

export function T(key) {
  const s = STRINGS[LANG];
  return (s && s[key] !== undefined) ? s[key] : (STRINGS.en[key] ?? key);
}

export function setLang(lang) {
  LANG = lang;
  localStorage.setItem('eidSheepLang', LANG);
}
