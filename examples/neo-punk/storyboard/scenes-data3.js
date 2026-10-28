// "Vefþróun með gervigreind": v3 storyboard data. 132 BPM, 64 bars (~1:56), music only.
// says/en: what the scene communicates. onscreen: every word that appears on screen.
// flashes: one/two-frame graphic interruptions, in beats from scene start (kind: invert | cream | red | swap).
window.BPM = 132;
window.BAR = (60 / window.BPM) * 4;
window.SCENES = [
  {
    id: 1, title: "Krókurinn", bars: 6,
    onscreen: ["GERVIGREIND SKRIFAR KÓÐANN", "TIL HVERS AÐ LÆRA?", "EINHVER ÞARF AÐ STÝRA HENNI"],
    says: "Gervigreindin skrifar kóða. Til hvers þá að læra vefþróun? Af því að einhver þarf að stýra henni.",
    en: "AI writes code. So why learn web development? Because someone has to be in charge of it.",
    beats: [
      "Black screen, then an extreme close-up of the AI's giant eye. Pull back: a spiky acid-green creature typing with smeared arms while cream code pours out. \"GERVIGREIND SKRIFAR KÓÐANN\".",
      "Snap to blue: an extreme close-up of the hero, huge mismatched eyes and a screaming shock mouth. \"TIL HVERS AÐ LÆRA?\"",
      "Snap to orange: the AI's tower of code blocks wobbles; one block turns red and the tower collapses (blue-silhouette flash frame). The hero, full figure, grins with sharp teeth and points at the camera: \"EINHVER ÞARF AÐ STÝRA HENNI\"."
    ],
    palette: ["black", "green", "cream", "blue", "orange", "red"], expr: ["shock", "smug"],
    flashes: [{ beat: 18, kind: "invert", frames: 2 }],
    music: "Acid synth line alone (the AI), drums crash in on the snap to blue, full band on the collapse.",
    facts: ["Deck: \"Why learn web development when AI writes the code? … The value of a developer was never in the typing. It is in specification, judgment and verification.\""]
  },
  {
    id: 2, title: "Titill", bars: 4,
    onscreen: ["VEFÞRÓUN", "MEÐ", "GERVIGREIND", "VEFSKÓLINN · TÆKNISKÓLINN"],
    says: "Vefþróun með gervigreind, í Vefskólanum í Tækniskólanum.",
    en: "AI-assisted web development, at Vefskólinn, Tækniskólinn.",
    beats: [
      "Black field. The three title words slam in one per bar, each its own colour (cream, orange, acid green), jittering on impact.",
      "The hero and the AI strike an album-cover pose back to back under the title. Red impact frame on the last slam."
    ],
    palette: ["black", "cream", "orange", "green"], expr: ["smug"],
    flashes: [{ beat: 8, kind: "red", frames: 1 }],
    music: "Three hits, one per word, then the groove.",
    facts: ["Proposed new programme name: \"AI assisted web development\""],
    flag: "Icelandic name: I used \"Vefþróun með gervigreind\". Alternatives: \"Gervigreindarstudd vefþróun\" (closer to \"AI-assisted\", but heavier) or \"Vefþróun og gervigreind\". Which one?"
  },
  {
    id: 3, title: "Eitt ár eða þrjú", bars: 4,
    onscreen: ["3 ÁR", "1 ÁR"],
    says: "Háskólinn er frábær leið, en ekki hafa allir tök á þremur árum. Hér er önnur leið: eitt ár.",
    en: "University is a great path, but not everyone can do three years. Here's another way: one year.",
    beats: [
      "Split poster. Left: a black silhouette of a grand university, \"3 ÁR\" in cream. Right: an orange field, \"1 ÁR\" in black.",
      "The hero, in a stúdentshúfa, stands on the seam with star eyes toward the university, then a shrug, then a grin toward 1 ÁR. Hard snaps between poses on the beat."
    ],
    palette: ["cream", "black", "orange", "red"], expr: ["stars", "panic", "grin"],
    flashes: [],
    music: "Groove A.",
    facts: ["University stays respected; Vefskólinn is offered as an alternative."]
  },
  {
    id: 4, title: "Hönnun + kóði + gervigreind", bars: 4,
    onscreen: ["HÖNNUN + KÓÐI + GERVIGREIND"],
    says: "Þú lærir að hanna, að forrita og að vinna með gervigreind.",
    en: "You learn design, code and working with AI.",
    beats: [
      "Acid-green field. Three overlapping hero silhouettes, offset like a misprinted poster: an orange one with a pencil, a blue one with </> and a black one with the AI on its shoulder.",
      "On the downbeat they snap into one hero (cream-silhouette flash frame): a unicorn horn pops out, star eyes, and the AI rides on the shoulder."
    ],
    palette: ["green", "orange", "blue", "black", "cream"], expr: ["focus", "stars"],
    flashes: [{ beat: 8, kind: "cream", frames: 2 }],
    music: "Build into the first drop.",
    facts: ["\"We are producing unicorns.\" Every student does both design and code (curriculum2026 notes)."]
  },
  {
    id: 5, title: "Svona vinnur þú með gervigreind", bars: 8,
    onscreen: ["1. LÝSTU", "2. GERVIGREINDIN SMÍÐAR", "3. PRÓFAÐU · LESTU KÓÐANN", "4. ÚTSKÝRÐU", "ÞÚ ÁTT HVERJA LÍNU"],
    says: "Svona vinna forritarar í dag: þú lýsir hvað á að smíða, gervigreindin smíðar, þú prófar og lest kóðann, finnur villurnar, og útskýrir hverja línu. Þú átt kóðann.",
    en: "This is how developers work now: you specify, the AI builds, you test and read the code, catch the mistakes, and explain every line. You own the code.",
    beats: [
      "ORANGE (2 bars): the hero screams a plan into a megaphone. A wireframe sketch flies out and lands in front of the eager AI. \"1. LÝSTU\".",
      "BLACK (2 bars): the AI types with smeared arms, and a website builds itself block by block, one block per 8th note. \"2. GERVIGREINDIN SMÍÐAR\".",
      "BLUE (2 bars): an extreme close-up through a giant magnifying glass, the hero's squinting eye reading code. One line turns red (red impact frame); the AI's eye spirals and it turns red. \"3. PRÓFAÐU · LESTU KÓÐANN\".",
      "CREAM (2 bars): the hero points at the fixed site and explains it to a bearded teacher, who grins. A red stamp slams: \"ÞÚ ÁTT HVERJA LÍNU\". \"4. ÚTSKÝRÐU\"."
    ],
    palette: ["orange", "black", "green", "blue", "cream", "red"], expr: ["scream", "focus", "smug"],
    flashes: [{ beat: 20, kind: "red", frames: 1 }, { beat: 28, kind: "invert", frames: 2 }],
    music: "Each step gets its own colour and its own instrument on top: shout vocal-synth, acid line, record-scratch on the bug, a big snare hit on the stamp.",
    facts: [
      "Deck: \"You use AI the way working developers do. We grade what you checked: tests, code review, security, and whether you can explain every line you shipped.\" \"Nobody leaves here unable to explain their own code.\"",
      "Sustainable Island 2027: \"Use AI. Own every line. Show your work.\"",
      "Module 3 (Hópur 11) coding guides: Tooling/Tailwind, Reading code, TypeScript, GitHub branches & pull requests"
    ],
    flag: "This is the AI-heavy core. It describes the deck's \"phase two\" way of working (specify, build, verify, explain) as how the programme works. If that's still a proposal for next year, tell me and I'll soften the wording."
  },
  {
    id: 6, title: "Grunnurinn", bars: 4,
    onscreen: ["LÆRÐU GRUNNINN", "HTML", "CSS", "TS", "REACT"],
    says: "Til að vita hvenær gervigreindin hefur rangt fyrir sér lærirðu grunninn: HTML, CSS, TypeScript, React, gagnagrunna og öpp.",
    en: "To know when the AI is wrong, you learn the foundations: HTML, CSS, TypeScript, React, databases and apps.",
    beats: [
      "Blood-red field. The top of the hero's head flips open like a lid (surreal). Tech tiles leap in one per beat: HTML, CSS, TS, React, a database, a phone. The face shifts from panic to a smug grin."
    ],
    palette: ["red", "cream", "black"], expr: ["panic", "smug"],
    flashes: [],
    music: "Each tile lands on a beat with a tom hit.",
    facts: ["Stack 2026–27: HTML, CSS, Tailwind, Figma, TypeScript, React, Next.js, Node, PostgreSQL, MongoDB, Supabase, Git/GitHub, React Native"]
  },
  {
    id: 7, title: "Jafningjamat og dómnefnd", bars: 4,
    onscreen: ["JAFNINGJAMAT", "MÆLI MEÐ!", "5 HÓPVERKEFNI", "DÓMNEFND ÚR ATVINNULÍFINU", "9", "10", "10"],
    says: "Samnemendur meta verkefnin þín og þú þeirra. Fimm sinnum á ári kynnir hópurinn verkefni fyrir dómnefnd úr atvinnulífinu.",
    en: "Classmates review your work and you review theirs. Five times a year your team presents to an industry jury.",
    beats: [
      "CREAM (2 bars): two classmates glare at the hero's project card… then thumbs up, and a red \"MÆLI MEÐ!\" stamp. \"JAFNINGJAMAT\".",
      "BLACK (2 bars): three cream jury silhouettes flip orange score cards on the beat, 9, 10, 10 (blue-silhouette flash frame). The team leaps. \"5 HÓPVERKEFNI · DÓMNEFND ÚR ATVINNULÍFINU\"."
    ],
    palette: ["cream", "black", "red", "orange"], expr: ["panic", "joy"],
    flashes: [{ beat: 11, kind: "invert", frames: 2 }],
    music: "Stamp and score cards on snare hits.",
    facts: ["2 peer reviews per return; recommended projects go to the Hall of Fame. 5 group projects a year judged by industry guests (80%) and the audience (20%) (io.vefskoliv2)"]
  },
  {
    id: 8, title: "Kennararnir", bars: 4,
    onscreen: ["Á STAÐNUM Í HAFNARFIRÐI", "KENNT Á ENSKU", "HELLO WORLD!"],
    says: "Þú mætir eins og í vinnu, í litlum hópi í Hafnarfirði, með tvo kennara. Kennt er á ensku.",
    en: "You show up like it's a job, a small group in Hafnarfjörður, two teachers. Taught in English.",
    beats: [
      "Electric-blue field. Both teachers (full hair, full beards, one with glasses) in a big medium close-up, grinning and waving. \"Á STAÐNUM Í HAFNARFIRÐI\".",
      "Snap: one shouts \"HELLO WORLD!\" in a jagged speech balloon. \"KENNT Á ENSKU\"."
    ],
    palette: ["blue", "cream", "black", "orange"], expr: ["grin", "joy"],
    flashes: [],
    music: "Groove A.",
    facts: ["In person, full time (curriculum2026, 2026); Flatahraun 12, Hafnarfjörður; teaching in English (tskoli.is)"],
    flag: "tskoli.is still says \"Dagnám / dreifnám\". Your 2026 notes say in person, full time. Confirm."
  },
  {
    id: 9, title: "Eitt ár", bars: 4,
    onscreen: ["HAUST", "VOR", "SUMAR", "30", "60", "90", "1 ÁR · 3 ANNIR · 90 EIN."],
    says: "Eitt ár: haustönn, vorönn og sumarönn. Níutíu einingar.",
    en: "One year: autumn, spring and summer terms. 90 credits.",
    beats: [
      "Three hard poster swaps, one per bar: an orange \"HAUST 30\", a green \"VOR 60\", a red \"SUMAR 90\". The hero jumps a step higher in each.",
      "The last bar holds on the summary: \"1 ÁR · 3 ANNIR · 90 EIN.\""
    ],
    palette: ["orange", "green", "red", "black", "cream"], expr: ["focus", "joy"],
    flashes: [],
    music: "A crash on each poster swap.",
    facts: ["3 terms × 30 fein = 90 fein, hæfniþrep 4 (námskrá)"]
  },
  {
    id: 10, title: "Las Palmas", bars: 4,
    onscreen: ["ERASMUS+ · LAS PALMAS"],
    says: "Í janúar fer hópurinn til Las Palmas og vinnur með spænskum nemendum.",
    en: "In January the group goes to Las Palmas to work with Spanish students.",
    beats: [
      "Blue field with cream sleet. The hero shivers and cries.",
      "Red impact frame, then an orange field with a huge red sun and a black palm silhouette. The hero in sunglasses, laptop on knees, and the AI in a tiny sun hat."
    ],
    palette: ["blue", "cream", "orange", "red", "black"], expr: ["cry", "cool"],
    flashes: [{ beat: 8, kind: "red", frames: 1 }],
    music: "Filter closed on the sleet, wide open on the sun.",
    facts: ["Erasmus+ with I.E.S. El Rincón; current cohort 17–30 Jan 2027 (curriculum2026)"],
    flag: "Confirmed for the current cohort only. Keep, soften or drop for next year's students?"
  },
  {
    id: 11, title: "Lokaverkefni", bars: 4,
    onscreen: ["LOKAVERKEFNI Í FYRIRTÆKI", "NEMI", "STARFSMAÐUR", "VINNA", "NÁM"],
    says: "Á sumarönn vinnur þú lokaverkefni með alvöru fyrirtæki. Svo ferðu að vinna, eða í frekara nám.",
    en: "In summer you do your final project with a real company. Then work, or further study.",
    beats: [
      "CREAM: the hero's ID badge, extreme close-up, reads NEMI and flips to STARFSMAÐUR (blue flash frame); the jaw drops to the floor. \"LOKAVERKEFNI Í FYRIRTÆKI\".",
      "BLACK: two doors bang open, VINNA (orange) and NÁM (blue). The hero winks."
    ],
    palette: ["cream", "black", "orange", "blue", "red"], expr: ["jaw", "wink"],
    flashes: [{ beat: 4, kind: "invert", frames: 2 }],
    music: "Riser into the badge flip.",
    facts: ["Final project VLOK4WD30EA, 30 fein, with a company (námskrá); \"enter the job market or pursue further studies\" (io.vefskoli.is)"]
  },
  {
    id: 12, title: "Verðið", bars: 4,
    onscreen: ["30.000 KR. Á ÖNN", "250.000", "LÁNSHÆFT"],
    says: "Þrjátíu þúsund krónur á önn, og námið er lánshæft.",
    en: "30,000 ISK per term, and eligible for student loans.",
    beats: [
      "Acid-green field. A giant cream price tag swings in; the hero braces (scream face).",
      "Stop. 30.000 KR. on the tag (250.000 crossed out). The jaw drops through the floor (red flash frame). The \"LÁNSHÆFT\" label slaps on."
    ],
    palette: ["green", "cream", "black", "red"], expr: ["scream", "jaw"],
    flashes: [{ beat: 8, kind: "red", frames: 1 }],
    music: "Silence for a beat, then a bass drop.",
    facts: ["\"Gjald er 30 þús á önn\" (tskoli.is/vefthroun), down from 250.000 since autumn 2026; Menntasjóður loans"]
  },
  {
    id: 13, title: "Umsókn", bars: 4,
    onscreen: ["STÚDENTSPRÓF", "GÓÐ ENSKA", "FORRITUN? EKKI SKILYRÐI", "UMSÓKNIR Í FEBRÚAR", "BYRJAR Í ÁGÚST"],
    says: "Þú þarft stúdentspróf og góða ensku, en forritunarreynsla er ekki skilyrði. Umsóknir opna í febrúar og námið hefst í ágúst.",
    en: "You need the matriculation exam and good English; coding experience isn't required. Applications open in February, you start in August.",
    beats: [
      "CREAM: three lines slam in with big hand-drawn checks: STÚDENTSPRÓF ✓, GÓÐ ENSKA ✓, FORRITUN? EKKI SKILYRÐI. The hero exhales (joy).",
      "ORANGE snap: \"UMSÓKNIR Í FEBRÚAR\", then \"BYRJAR Í ÁGÚST\"."
    ],
    palette: ["cream", "black", "red", "orange"], expr: ["panic", "joy"],
    flashes: [],
    music: "Rebuild to the final chorus.",
    facts: ["Stúdentspróf or equivalent, good English; small admission project; intake each autumn, applications opened 2 Feb in 2026"],
    flag: "The website calls a coding or graphic background \"mikill kostur\". Is \"Forritun? Ekki skilyrði\" OK?"
  },
  {
    id: 14, title: "Lokaspjald", bars: 6,
    onscreen: ["VEFÞRÓUN MEÐ GERVIGREIND", "VEFSKÓLINN · TÆKNISKÓLINN", "tskoli.is/vefthroun"],
    says: "Vefþróun með gervigreind. Vefskólinn. tskoli.is/vefthroun",
    en: "AI-assisted web development. Vefskólinn. tskoli.is/vefthroun",
    beats: [
      "Album cover: an orange field, the hero and the AI back to back in black silhouette with cream eyes, the title stacked huge.",
      "Snap to black: the URL in acid green, \"VEFSKÓLINN · TÆKNISKÓLINN\" in cream. The hero gives a last grin with sharp teeth. A final red impact frame, then black."
    ],
    palette: ["orange", "black", "cream", "green", "red"], expr: ["grin"],
    flashes: [{ beat: 23, kind: "red", frames: 1 }],
    music: "Final chorus, last chord rings out.",
    facts: ["tskoli.is/vefthroun · Flatahraun 12, Hafnarfirði"]
  }
];
