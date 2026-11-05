// Photographs supplied by the client: watches from other houses, each credited
// to its maker. Shown in the shop cards and the gallery ring.
export const WATCHES = [
  { src: '01-jacob-co-casino', w: 745, h: 1100, brand: 'Jacob & Co', note: 'Casino, with a working roulette wheel around the dial' },
  { src: '02-ak', w: 546, h: 886, brand: 'AK', note: 'Hours on turning cylinders above a minutes arc' },
  { src: '03-the-electricianz', w: 765, h: 977, brand: 'The Electricianz', note: 'A grid dial lit in green' },
  { src: '04-jacob-co-cr7', w: 706, h: 1100, brand: 'Jacob & Co', note: 'CR7 skeleton with a football-shaped cage' },
  { src: '05-jacob-co-football', w: 767, h: 1100, brand: 'Jacob & Co', note: 'Tourbillon at twelve over a green sapphire dial' },
  { src: '06-jacob-co-world', w: 717, h: 1100, brand: 'Jacob & Co', note: 'A world map dial with two time zones' },
  { src: '07-jacob-co-astronomia', w: 722, h: 1100, brand: 'Jacob & Co', note: 'Astronomia Solar, with gemstone planets in orbit' },
  { src: '08-ulysse-nardin-freak', w: 645, h: 1100, brand: 'Ulysse Nardin', note: 'Freak, the movement on show over a blue dial' },
  { src: '09-richard-mille-rm72', w: 742, h: 1070, brand: 'Richard Mille', note: 'RM 72-01 chronograph in a baguette-set case' },
  { src: '10-bonest-gatti', w: 434, h: 683, brand: 'Bonest Gatti', note: 'A clear case with a green serpent across the movement' },
  { src: '11-lucky-harvey', w: 525, h: 753, brand: 'Lucky Harvey', note: 'A green serpent across an automatic skeleton dial' },
  { src: '12-zbicland', w: 250, h: 402, brand: 'Zbicland', note: 'Harry Potter edition, a gold serpent over twelve wheels' },
  { src: '13-louis-moinet', w: 720, h: 1100, brand: 'Louis Moinet', note: 'Skeleton chronograph in rose gold and red' },
]

export const photoUrl = (w) => `./gallery/${w.src}.webp`
