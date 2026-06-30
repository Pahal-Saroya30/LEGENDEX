/**
 * Football GOAT Ranking Dashboard - Players Dataset
 * Detailed statistics and historical records for 9 legendary players.
 * Updates: Added standard country codes for dynamic SVG flag generation.
 */

const playersData = [
  {
    id: "messi",
    name: "Lionel Messi",
    nationality: "Argentina",
    countryCode: "AR",
    flag: "🇦🇷",
    position: "Forward / Playmaker",
    years: "2004 - Present",
    eraStart: 2004,
    photo: "assets/images/messi.webp",
    bio: "Widely regarded as the most complete player in history, Messi combined record-breaking goalscoring with peerless playmaking. He defined an era at Barcelona before leading Argentina to Copa América and World Cup triumphs.",
    stats: {
      goals: 838,
      assists: 373,
      clubTitles: 38,
      internationalTitles: 6,
      ballondOr: 8,
      individualAwards: 56,
      longevityScore: 98,
      peakScore: 100
    },
    achievements: [
      "FIFA World Cup Champion (2022) & Golden Ball Winner (2014, 2022)",
      "8-time Ballon d'Or Winner (Record)",
      "6-time European Golden Shoe Winner",
      "Most goals in a single calendar year (91 goals in 2012)",
      "All-time top scorer & assist provider in La Liga history"
    ],
    themeColor: "from-sky-400 via-sky-200 to-white"
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    nationality: "Portugal",
    countryCode: "PT",
    flag: "🇵🇹",
    position: "Forward",
    years: "2002 - Present",
    eraStart: 2002,
    photo: "assets/images/ronaldo.webp",
    bio: "An athletic marvel and the ultimate big-game goalscorer. Ronaldo dominated three major leagues (Premier League, La Liga, Serie A), broke the UEFA Champions League records, and spearheaded Portugal to their first major international trophies.",
    stats: {
      goals: 895,
      assists: 251,
      clubTitles: 33,
      internationalTitles: 2,
      ballondOr: 5,
      individualAwards: 48,
      longevityScore: 99,
      peakScore: 96
    },
    achievements: [
      "All-time top goalscorer in official football history (890+ goals)",
      "5-time UEFA Champions League Winner & all-time top scorer (140 goals)",
      "5-time Ballon d'Or Winner",
      "UEFA European Championship Winner (2016)",
      "All-time top international goalscorer (130 goals)"
    ],
    themeColor: "from-red-600 via-green-600 to-yellow-500"
  },
  {
    id: "pele",
    name: "Pelé",
    nationality: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    position: "Forward",
    years: "1956 - 1977",
    eraStart: 1956,
    photo: "assets/images/pele.webp",
    bio: "Football's first global superstar. Pelé burst onto the world stage at age 17 and became the game's ultimate ambassador. His incredible scoring rate, aerial ability, and three World Cup medals remain legendary.",
    stats: {
      goals: 762,
      assists: 350,
      clubTitles: 25,
      internationalTitles: 3,
      ballondOr: 0,
      individualAwards: 32,
      longevityScore: 92,
      peakScore: 98
    },
    achievements: [
      "Only player to win 3 FIFA World Cups (1958, 1962, 1970)",
      "FIFA Player of the Century (co-winner with Maradona)",
      "Youngest goalscorer & winner in World Cup Final history (1958)",
      "Scored 1281 goals in 1363 matches (Guinness World Record overall)",
      "Santos FC all-time top goalscorer (643 goals in official games)"
    ],
    themeColor: "from-green-500 via-yellow-400 to-blue-600"
  },
  {
    id: "maradona",
    name: "Diego Maradona",
    nationality: "Argentina",
    countryCode: "AR",
    flag: "🇦🇷",
    position: "Attacking Midfielder",
    years: "1976 - 1997",
    eraStart: 1976,
    photo: "assets/images/maradona.webp",
    bio: "A genius rebel whose close control, agility, and vision mesmerized the world. Maradona single-handedly carried Argentina to the 1986 World Cup title and transformed Napoli from underdogs into Serie A champions.",
    stats: {
      goals: 345,
      assists: 240,
      clubTitles: 9,
      internationalTitles: 2,
      ballondOr: 0,
      individualAwards: 25,
      longevityScore: 78,
      peakScore: 99
    },
    achievements: [
      "FIFA World Cup Champion & Golden Ball Winner (1986)",
      "Scored the 'Goal of the Century' vs England in 1986 World Cup",
      "Led Napoli to their first two historic Serie A titles (1987, 1990)",
      "FIFA Player of the Century (co-winner with Pelé)",
      "First player to win the World Cup Golden Ball at both U-20 and Senior level"
    ],
    themeColor: "from-blue-400 via-white to-blue-500"
  },
  {
    id: "cruyff",
    name: "Johan Cruyff",
    nationality: "Netherlands",
    countryCode: "NL",
    flag: "🇳🇱",
    position: "Forward / Midfielder",
    years: "1964 - 1984",
    eraStart: 1964,
    photo: "assets/images/cruyff.webp",
    bio: "The chief architect of 'Total Football'. Cruyff was a visionary player who revolutionized the sport's tactics. He won three consecutive European Cups with Ajax and reshaped the identity of FC Barcelona.",
    stats: {
      goals: 424,
      assists: 350,
      clubTitles: 22,
      internationalTitles: 0,
      ballondOr: 3,
      individualAwards: 28,
      longevityScore: 84,
      peakScore: 94
    },
    achievements: [
      "3-time Ballon d'Or Winner (1971, 1973, 1974)",
      "Led Ajax to 3 consecutive European Cups (1971, 1972, 1973)",
      "FIFA World Cup Golden Ball Winner (1974)",
      "Pioneered the 'Cruyff Turn' and the modern 'Total Football' tactical system",
      "Voted European Player of the Century (IFFHS)"
    ],
    themeColor: "from-orange-500 via-white to-blue-800"
  },
  {
    id: "zidane",
    name: "Zinedine Zidane",
    nationality: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    position: "Attacking Midfielder",
    years: "1989 - 2006",
    eraStart: 1989,
    photo: "assets/images/zidane.webp",
    bio: "An elegant maestro celebrated for his sublime touch, balance, and clutch performances. Zidane scored twice in the 1998 World Cup Final and scored arguably the greatest goal in Champions League history in 2002.",
    stats: {
      goals: 156,
      assists: 132,
      clubTitles: 13,
      internationalTitles: 2,
      ballondOr: 1,
      individualAwards: 22,
      longevityScore: 83,
      peakScore: 92
    },
    achievements: [
      "FIFA World Cup Champion & Final MVP (1998) scoring 2 goals",
      "Ballon d'Or Winner (1998) & 3-time FIFA World Player of the Year",
      "UEFA European Championship Winner & Player of the Tournament (2000)",
      "Scored legendary volley in the 2002 Champions League Final for Real Madrid",
      "FIFA World Cup Golden Ball Winner (2006)"
    ],
    themeColor: "from-blue-800 via-white to-red-600"
  },
  {
    id: "ronaldinho",
    name: "Ronaldinho",
    nationality: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    position: "Winger / Playmaker",
    years: "1998 - 2015",
    eraStart: 1998,
    photo: "assets/images/ronaldinho.webp",
    bio: "A joyful wizard who played football with an infectious smile and breathtaking flair. At his peak at Barcelona, Ronaldinho's tricks, dribbles, and spectacular goals earned him a standing ovation from rival Real Madrid fans.",
    stats: {
      goals: 297,
      assists: 193,
      clubTitles: 10,
      internationalTitles: 3,
      ballondOr: 1,
      individualAwards: 18,
      longevityScore: 72,
      peakScore: 97
    },
    achievements: [
      "FIFA World Cup Champion (2002) with the famous 'R-R-R' trio",
      "Ballon d'Or Winner (2005) & 2-time FIFA World Player of the Year",
      "UEFA Champions League Winner (2006) with Barcelona",
      "One of the few players to win both the Champions League and Copa Libertadores",
      "Famously applauded at Santiago Bernabeu after a masterclass performance (2005)"
    ],
    themeColor: "from-yellow-400 via-green-600 to-blue-500"
  },
  {
    id: "ronaldo_nazario",
    name: "Ronaldo Nazário",
    nationality: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    position: "Forward",
    years: "1993 - 2011",
    eraStart: 1993,
    photo: "assets/images/ronaldo_nazario.webp",
    bio: "The 'Phenomenon' (O Fenômeno). An unstoppable force combining blistering speed, power, and legendary finishing. Despite devastating knee injuries, he returned to fire Brazil to the 2002 World Cup title.",
    stats: {
      goals: 414,
      assists: 108,
      clubTitles: 14,
      internationalTitles: 4,
      ballondOr: 2,
      individualAwards: 30,
      longevityScore: 70,
      peakScore: 98
    },
    achievements: [
      "2-time FIFA World Cup Champion (1994, 2002) & Golden Shoe Winner (2002)",
      "2-time Ballon d'Or Winner (1997, 2002) & 3-time FIFA World Player of the Year",
      "Youngest ever recipient of the Ballon d'Or at age 21 (1997)",
      "2-time Copa América Champion and Tournament MVP",
      "Scored 15 World Cup goals (former all-time record holder)"
    ],
    themeColor: "from-green-600 via-yellow-400 to-blue-500"
  },
  {
    id: "beckenbauer",
    name: "Franz Beckenbauer",
    nationality: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    position: "Sweeper / Defender",
    years: "1964 - 1983",
    eraStart: 1964,
    photo: "assets/images/beckenbauer.webp",
    bio: "The 'Kaiser' (Emperor). Beckenbauer invented the modern Sweeper (libero) role, dominating games from defense with supreme poise, passing, and leadership. He captained Bayern Munich and West Germany to peak dominance.",
    stats: {
      goals: 109,
      assists: 90,
      clubTitles: 19,
      internationalTitles: 2,
      ballondOr: 2,
      individualAwards: 24,
      longevityScore: 90,
      peakScore: 93
    },
    achievements: [
      "FIFA World Cup Champion as Captain (1974) and Manager (1990)",
      "2-time Ballon d'Or Winner (1972, 1976 - rare for a defender)",
      "Led Bayern Munich to 3 consecutive European Cups (1974, 1975, 1976)",
      "UEFA European Championship Winner (1972)",
      "Named in the World Team of the 20th Century"
    ],
    themeColor: "from-black via-white to-red-600"
  }
];

// Export for ES modules or attach to window for simple scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = playersData;
} else {
  window.playersData = playersData;
}
