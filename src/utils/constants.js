/*
 * constants.js Shared constant data: type colours, type backgrounds,
 * type accents, and the complete Gen 1–5 Pokémon name lists used across the app.
 */

/* Bright foreground colour for each type badge */
export const TYPE_COLORS = {
  fire:     '#F08030',
  water:    '#6890F0',
  grass:    '#78C850',
  electric: '#F8D030',
  psychic:  '#F85888',
  ice:      '#98D8D8',
  dragon:   '#7038F8',
  dark:     '#705848',
  fairy:    '#EE99AC',
  normal:   '#A8A878',
  fighting: '#C03028',
  flying:   '#A890F0',
  poison:   '#A040A0',
  ground:   '#E0C068',
  rock:     '#B8A038',
  bug:      '#A8B820',
  ghost:    '#705898',
  steel:    '#B8B8D0',
};

/* Dark background tint for each type badge */
export const TYPE_BG = {
  fire:'#7a2a10', water:'#1a3a6a', grass:'#1a3a12', electric:'#4a3a00',
  psychic:'#4a1028', ice:'#0a3a48', dragon:'#280e58', dark:'#1a1008',
  fairy:'#4a1830', normal:'#303030', fighting:'#3a0e08', flying:'#283048',
  poison:'#300a48', ground:'#3a2a08', rock:'#302808', bug:'#1e3008',
  ghost:'#180a30', steel:'#283038',
};

/* Saturated accent colour used for move type labels and slot borders */
export const TYPE_ACCENT = {
  fire:'#e06030', water:'#4090d0', grass:'#50a030', electric:'#c0a820',
  psychic:'#d03060', ice:'#30a0b0', dragon:'#6030c0', dark:'#706040',
  fairy:'#c05070', normal:'#888', fighting:'#b03020', flying:'#6080a0',
  poison:'#8030a0', ground:'#a07820', rock:'#908020', bug:'#60902a',
  ghost:'#503088', steel:'#507088',
};

// Pokémon name lists per generation used for random teams and the bulk loader.
export const GEN1_POKEMON = [
  'bulbasaur','ivysaur','venusaur','charmander','charmeleon','charizard',
  'squirtle','wartortle','blastoise','caterpie','metapod','butterfree',
  'weedle','kakuna','beedrill','pidgey','pidgeotto','pidgeot','rattata',
  'raticate','spearow','fearow','ekans','arbok','pikachu','raichu',
  'sandshrew','sandslash','nidoran-f','nidorina','nidoqueen','nidoran-m',
  'nidorino','nidoking','clefairy','clefable','vulpix','ninetales',
  'jigglypuff','wigglytuff','zubat','golbat','oddish','gloom','vileplume',
  'paras','parasect','venonat','venomoth','diglett','dugtrio','meowth',
  'persian','psyduck','golduck','mankey','primeape','growlithe','arcanine',
  'poliwag','poliwhirl','poliwrath','abra','kadabra','alakazam','machop',
  'machoke','machamp','bellsprout','weepinbell','victreebel','tentacool',
  'tentacruel','geodude','graveler','golem','ponyta','rapidash','slowpoke',
  'slowbro','magnemite','magneton','farfetchd','doduo','dodrio','seel',
  'dewgong','grimer','muk','shellder','cloyster','gastly','haunter','gengar',
  'onix','drowzee','hypno','krabby','kingler','voltorb','electrode',
  'exeggcute','exeggutor','cubone','marowak','hitmonlee','hitmonchan',
  'lickitung','koffing','weezing','rhyhorn','rhydon','chansey','tangela',
  'kangaskhan','horsea','seadra','goldeen','seaking','staryu','starmie',
  'mr-mime','scyther','jynx','electabuzz','magmar','pinsir','tauros',
  'magikarp','gyarados','lapras','ditto','eevee','vaporeon','jolteon',
  'flareon','porygon','omanyte','omastar','kabuto','kabutops','aerodactyl',
  'snorlax','articuno','zapdos','moltres','dratini','dragonair','dragonite',
  'mewtwo','mew',
];

export const GEN2_POKEMON = [
  'chikorita','bayleef','meganium','cyndaquil','quilava','typhlosion',
  'totodile','croconaw','feraligatr','sentret','furret','hoothoot','noctowl',
  'ledyba','ledian','spinarak','ariados','crobat','chinchou','lanturn',
  'pichu','cleffa','igglybuff','togepi','togetic','natu','xatu','mareep',
  'flaaffy','ampharos','bellossom','marill','azumarill','sudowoodo',
  'politoed','hoppip','skiploom','jumpluff','aipom','sunkern','sunflora',
  'yanma','wooper','quagsire','espeon','umbreon','murkrow','slowking',
  'misdreavus','unown','wobbuffet','girafarig','pineco','forretress',
  'dunsparce','gligar','steelix','snubbull','granbull','qwilfish','scizor',
  'shuckle','heracross','sneasel','teddiursa','ursaring','slugma','magcargo',
  'swinub','piloswine','corsola','remoraid','octillery','delibird','mantine',
  'skarmory','houndour','houndoom','kingdra','phanpy','donphan','porygon2',
  'stantler','smeargle','tyrogue','hitmontop','smoochum','elekid','magby',
  'miltank','blissey','raikou','entei','suicune','larvitar','pupitar',
  'tyranitar','lugia','ho-oh','celebi',
];

export const GEN3_POKEMON = [
  'treecko','grovyle','sceptile','torchic','combusken','blaziken','mudkip',
  'marshtomp','swampert','poochyena','mightyena','zigzagoon','linoone',
  'wurmple','silcoon','beautifly','cascoon','dustox','lotad','lombre',
  'ludicolo','seedot','nuzleaf','shiftry','taillow','swellow','wingull',
  'pelipper','ralts','kirlia','gardevoir','surskit','masquerain','shroomish',
  'breloom','slakoth','vigoroth','slaking','nincada','ninjask','shedinja',
  'whismur','loudred','exploud','makuhita','hariyama','azurill','nosepass',
  'skitty','delcatty','sableye','mawile','aron','lairon','aggron','meditite',
  'medicham','electrike','manectric','plusle','minun','volbeat','illumise',
  'roselia','gulpin','swalot','carvanha','sharpedo','wailmer','wailord',
  'numel','camerupt','torkoal','spoink','grumpig','spinda','trapinch',
  'vibrava','flygon','cacnea','cacturne','swablu','altaria','zangoose',
  'seviper','lunatone','solrock','barboach','whiscash','corphish','crawdaunt',
  'baltoy','claydol','lileep','cradily','anorith','armaldo','feebas',
  'milotic','castform','kecleon','shuppet','banette','duskull','dusclops',
  'tropius','chimecho','absol','wynaut','snorunt','glalie','spheal','sealeo',
  'walrein','clamperl','huntail','gorebyss','relicanth','luvdisc','bagon',
  'shelgon','salamence','beldum','metang','metagross','regirock','regice',
  'registeel','latias','latios','kyogre','groudon','rayquaza','jirachi',
  'deoxys-normal',
];

export const GEN4_POKEMON = [
  'turtwig','grotle','torterra','chimchar','monferno','infernape','piplup',
  'prinplup','empoleon','starly','staravia','staraptor','bidoof','bibarel',
  'kricketot','kricketune','shinx','luxio','luxray','budew','roserade',
  'cranidos','rampardos','shieldon','bastiodon','burmy','wormadam-plant','mothim',
  'combee','vespiquen','pachirisu','buizel','floatzel','cherubi','cherrim',
  'shellos','gastrodon','ambipom','drifloon','drifblim','buneary','lopunny',
  'mismagius','honchkrow','glameow','purugly','chingling','stunky','skuntank',
  'bronzor','bronzong','bonsly','mime-jr','happiny','chatot','spiritomb',
  'gible','gabite','garchomp','munchlax','riolu','lucario','hippopotas',
  'hippowdon','skorupi','drapion','croagunk','toxicroak','carnivine','finneon',
  'lumineon','mantyke','snover','abomasnow','weavile','magnezone','lickilicky',
  'rhyperior','tangrowth','electivire','magmortar','togekiss','yanmega',
  'leafeon','glaceon','gliscor','mamoswine','porygon-z','gallade',
  'probopass','dusknoir','froslass','rotom','uxie','mesprit','azelf',
  'dialga','palkia','heatran','regigigas','giratina-altered','cresselia','phione',
  'manaphy','darkrai','shaymin-land','arceus',
];

export const GEN5_POKEMON = [
  'victini','snivy','servine','serperior','tepig','pignite','emboar','oshawott',
  'dewott','samurott','patrat','watchog','lillipup','herdier','stoutland',
  'purrloin','liepard','pansage','simisage','pansear','simisear','panpour',
  'simipour','munna','musharna','pidove','tranquill','unfezant','blitzle',
  'zebstrika','roggenrola','boldore','gigalith','woobat','swoobat','drilbur',
  'excadrill','audino','timburr','gurdurr','conkeldurr','tympole','palpitoad',
  'seismitoad','throh','sawk','sewaddle','swadloon','leavanny','venipede',
  'whirlipede','scolipede','cottonee','whimsicott','petilil','lilligant',
  'basculin-red-striped','sandile','krokorok','krookodile','darumaka','darmanitan-standard',
  'maractus','dwebble','crustle','scraggy','scrafty','sigilyph','yamask',
  'cofagrigus','tirtouga','carracosta','archen','archeops','trubbish',
  'garbodor','zorua','zoroark','minccino','cinccino','gothita','gothorita',
  'gothitelle','solosis','duosion','reuniclus','ducklett','swanna','vanillite',
  'vanillish','vanilluxe','deerling','sawsbuck','emolga','karrablast',
  'escavalier','foongus','amoonguss','frillish-male','jellicent-male','alomomola',
  'joltik','galvantula','ferroseed','ferrothorn','klink','klang','klinklang',
  'tynamo','eelektrik','eelektross','elgyem','beheeyem','litwick','lampent',
  'chandelure','axew','fraxure','haxorus','cubchoo','beartic','cryogonal',
  'shelmet','accelgor','stunfisk','mienfoo','mienshao','druddigon','golett',
  'golurk','pawniard','bisharp','bouffalant','rufflet','braviary','vullaby',
  'mandibuzz','heatmor','durant','deino','zweilous','hydreigon','larvesta',
  'volcarona','cobalion','terrakion','virizion','tornadus-incarnate','thundurus-incarnate',
  'reshiram','zekrom','landorus-incarnate','kyurem','keldeo-ordinary','meloetta-aria','genesect',
];

export const TYPE_SPRITE_IDS = {
    normal: 1,
    fighting: 2,
    flying: 3,
    poison: 4,
    ground: 5,
    rock: 6,
    bug: 7,
    ghost: 8,
    steel: 9,
    fire: 10,
    water: 11,
    grass: 12,
    electric: 13,
    psychic: 14,
    ice: 15,
    dragon: 16,
    dark: 17,
    fairy: 18
};
