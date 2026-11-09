/* Player archetypes: how the user's player plays, per position.
   att: attribute shape. refs: real players at each talent level (gen/wk/pr/gr).
   Engine effects: gm/am goal & assist share, ex per-90 action multipliers, ro rating offset (calibrated from real 2023-26 league data),
   rb rating penalty in games without a goal, gv extra rating per goal, rp rating from passing quality, vol rating volatility,
   inj injury rate, age yearly ability factor after 29 (negative = falls off), pd extra pace lost per year from 30. */
const ARX={
"ST": {
"Poacher": {
"rb": -0.35,
"gv": 0.1,
"age": 0.004,
"blurb": "Lives in the box and is almost always on the scoresheet. Ratings drop when he does not score, unless his dribbling or passing is elite.",
"traits": [
"Goals above all",
"Low ratings in blank games",
"Ages well"
],
"att": {
"sho": 9,
"pac": 2,
"pas": -6,
"dri": -3,
"phy": -2
},
"refs": {
"gen": [
"Erling Haaland",
"Cristiano Ronaldo",
"Gerd Müller"
],
"wk": [
"Harry Kane",
"Robert Lewandowski",
"Victor Osimhen"
],
"pr": [
"Jamie Vardy",
"Ciro Immobile",
"Jonathan David",
"Serhou Guirassy"
],
"gr": [
"Billy Sharp",
"Jordan Rhodes"
]
},
"gm": 1.06,
"am": 1.37,
"ro": -0.04,
"ex": {
"sh": 0.84,
"kp": 0.97,
"dr": 0.64,
"tk": 0.75
}
},
"Playmaking Forward": {
"rp": 0.35,
"age": 0.002,
"blurb": "Drops deep to link play. Can have a great game without scoring because his passing keeps his rating high.",
"traits": [
"High ratings without goals",
"Creates as much as he scores"
],
"att": {
"pas": 9,
"dri": 5,
"sho": -1,
"phy": -5,
"pac": -3
},
"refs": {
"gen": [
"Lionel Messi"
],
"wk": [
"Luis Suárez",
"Karim Benzema",
"Antoine Griezmann"
],
"pr": [
"Roberto Firmino",
"Paulo Dybala",
"Ollie Watkins"
],
"gr": [
"Chris Martin"
]
},
"gm": 0.71,
"am": 1.94,
"ro": -0.17,
"ex": {
"sh": 0.85,
"kp": 1.29,
"dr": 0.7,
"tk": 1.22
}
},
"Target Man": {
"age": 0.006,
"inj": 0.9,
"blurb": "Big, strong, wins headers and holds the ball up. Scores plenty, rarely quick, ages slowly.",
"traits": [
"Aerial threat",
"Ages slowly",
"Durable"
],
"att": {
"phy": 10,
"sho": 3,
"pac": -8,
"dri": -6
},
"refs": {
"gen": [
"Didier Drogba"
],
"wk": [
"Zlatan Ibrahimović",
"Edin Džeko"
],
"pr": [
"Olivier Giroud",
"Niclas Füllkrug",
"Alexander Sørloth",
"Mateo Retegui"
],
"gr": [
"Kieffer Moore",
"Jordan Hugill"
]
},
"gm": 0.98,
"am": 1.56,
"ro": 0.01,
"ex": {
"sh": 0.85,
"kp": 0.86,
"dr": 0.52,
"tk": 0.75
}
},
"Complete Forward": {
"blurb": "Does everything well: scores, links, presses and runs in behind.",
"traits": [
"Balanced output"
],
"att": {
"sho": 3,
"pas": 2,
"dri": 3,
"pac": 2,
"phy": 1
},
"refs": {
"gen": [
"Ronaldo (Brazilian)",
"Thierry Henry"
],
"wk": [
"Sergio Agüero",
"Lautaro Martínez",
"Alexander Isak"
],
"pr": [
"Dušan Vlahović",
"Dominic Solanke",
"Ivan Toney"
],
"gr": [
"Dwight Gayle"
]
},
"gm": 0.91,
"am": 1.06,
"ro": -0.1,
"ex": {
"sh": 0.94,
"kp": 0.84,
"dr": 0.74,
"tk": 0.94
}
}
},
"W": {
"Inside Forward": {
"blurb": "Starts wide and cuts inside on his stronger foot to shoot. Scores like a striker from the wing.",
"traits": [
"Goals from wide",
"Shoots a lot"
],
"att": {
"sho": 7,
"dri": 3,
"pas": -2,
"phy": -3
},
"refs": {
"gen": [
"Mohamed Salah",
"Arjen Robben"
],
"wk": [
"Raphinha",
"Son Heung-min",
"Michael Olise"
],
"pr": [
"Jarrod Bowen",
"Bryan Mbeumo",
"Antoine Semenyo"
],
"gr": []
},
"gm": 0.9,
"am": 1.35,
"ro": -0.02,
"ex": {
"sh": 0.99,
"kp": 1.05,
"dr": 0.74,
"tk": 0.77
}
},
"Traditional Winger": {
"blurb": "Hugs the touchline, beats his man and delivers. More assists than goals.",
"traits": [
"Assists and crosses",
"Dribbles past defenders"
],
"att": {
"pac": 4,
"pas": 6,
"dri": 3,
"sho": -6
},
"refs": {
"gen": [
"Luís Figo",
"Ryan Giggs"
],
"wk": [
"Khvicha Kvaratskhelia",
"Ángel Di María",
"Nico Williams"
],
"pr": [
"Jérémy Doku",
"Kingsley Coman",
"Leroy Sané"
],
"gr": []
},
"gm": 1.83,
"am": 1.1,
"ro": -0.12,
"ex": {
"sh": 1.12,
"kp": 1.1,
"dr": 1.71,
"tk": 1.0
}
},
"Flashy Winger": {
"vol": 1.35,
"inj": 1.9,
"age": -0.012,
"blurb": "Tricks, flair and moments of genius. Big games and quiet games, and he gets kicked a lot, so injuries come more often.",
"traits": [
"Up-and-down ratings",
"Injury prone",
"Dribbles constantly"
],
"att": {
"dri": 10,
"pas": 2,
"phy": -7,
"def": -3
},
"refs": {
"gen": [
"Neymar",
"Ronaldinho",
"Lamine Yamal"
],
"wk": [
"Ousmane Dembélé",
"Rafael Leão",
"Riyad Mahrez"
],
"pr": [
"Allan Saint-Maximin",
"Jack Grealish",
"Savinho"
],
"gr": []
},
"gm": 0.83,
"am": 1.25,
"ro": 0.06,
"ex": {
"sh": 1.03,
"kp": 1.11,
"dr": 1.08,
"tk": 0.67
}
},
"Pace Abuser": {
"inj": 1.35,
"age": -0.03,
"pd": 3.5,
"blurb": "Explosive speed in behind. Unplayable at his peak, but when the pace goes after 30 his game falls off a cliff.",
"traits": [
"Scores on the break",
"Falls off after 30",
"Hamstring risk"
],
"att": {
"pac": 12,
"sho": 2,
"pas": -4,
"phy": -2,
"dri": -1
},
"refs": {
"gen": [
"Kylian Mbappé",
"Vinícius Júnior"
],
"wk": [
"Gareth Bale",
"Leroy Sané"
],
"pr": [
"Adama Traoré",
"Theo Walcott",
"Daniel James"
],
"gr": []
},
"gm": 1.3,
"am": 0.93,
"ro": 0.03,
"ex": {
"sh": 1.17,
"kp": 0.97,
"dr": 1.08,
"tk": 0.48
}
}
},
"AM": {
"Classic No.10": {
"rp": 0.25,
"age": 0.003,
"blurb": "The creator between the lines. Sees passes nobody else sees and racks up assists.",
"traits": [
"Assists",
"High ratings from passing"
],
"att": {
"pas": 9,
"dri": 3,
"sho": -3,
"phy": -5
},
"refs": {
"gen": [
"Zinedine Zidane",
"Juan Román Riquelme"
],
"wk": [
"Martin Ødegaard",
"Mesut Özil",
"Florian Wirtz"
],
"pr": [
"James Maddison",
"Dani Olmo"
],
"gr": []
},
"gm": 0.67,
"am": 1.18,
"ro": -0.0,
"ex": {
"sh": 0.91,
"kp": 1.1,
"dr": 0.85,
"tk": 0.91
}
},
"Shadow Striker": {
"gv": 0.05,
"blurb": "Arrives late in the box. A midfielder who scores like a forward.",
"traits": [
"Goals from midfield",
"Late runs"
],
"att": {
"sho": 8,
"pac": 2,
"pas": -2,
"dri": -2
},
"refs": {
"gen": [
"Kaká"
],
"wk": [
"Thomas Müller",
"Bruno Fernandes",
"Cole Palmer"
],
"pr": [
"Christopher Nkunku",
"Morgan Gibbs-White"
],
"gr": []
},
"gm": 0.79,
"am": 1.63,
"ro": -0.03,
"ex": {
"sh": 0.79,
"kp": 1.16,
"dr": 0.55,
"tk": 0.88
}
},
"Dribbling Ten": {
"vol": 1.25,
"inj": 1.5,
"age": -0.01,
"blurb": "Carries the ball through the lines with close control. Electric, but gets fouled a lot.",
"traits": [
"Dribbles",
"Up-and-down ratings",
"Injury prone"
],
"att": {
"dri": 10,
"pac": 2,
"pas": -1,
"phy": -6
},
"refs": {
"gen": [
"Diego Maradona"
],
"wk": [
"Jamal Musiala",
"Eden Hazard"
],
"pr": [
"Eberechi Eze",
"Rayan Cherki"
],
"gr": []
},
"gm": 0.65,
"am": 1.21,
"ro": -0.02,
"ex": {
"sh": 0.98,
"kp": 1.13,
"dr": 1.21,
"tk": 1.03
}
}
},
"CM": {
"Deep-Lying Playmaker": {
"rp": 0.3,
"age": 0.01,
"blurb": "Dictates the tempo from deep. Rarely scores, rarely has a bad rating, and keeps playing into his late thirties.",
"traits": [
"Passing range",
"Ages best of all",
"Few goals"
],
"att": {
"pas": 9,
"def": 2,
"pac": -6,
"phy": -3
},
"refs": {
"gen": [
"Xavi",
"Andrea Pirlo",
"Toni Kroos"
],
"wk": [
"Luka Modrić",
"Joshua Kimmich",
"Frenkie de Jong"
],
"pr": [
"Jorginho",
"Granit Xhaka"
],
"gr": []
},
"gm": 0.35,
"am": 0.94,
"ro": 0.08,
"ex": {
"sh": 0.47,
"kp": 1.32,
"dr": 0.48,
"tk": 0.92
}
},
"Box-to-Box": {
"inj": 1.1,
"age": -0.008,
"blurb": "Covers every blade of grass: tackles, carries and arrives in the box. The engine fades in the thirties.",
"traits": [
"All-round",
"Engine fades after 30"
],
"att": {
"phy": 7,
"def": 3,
"pac": 3,
"pas": -3
},
"refs": {
"gen": [
"Steven Gerrard",
"Jude Bellingham"
],
"wk": [
"Federico Valverde",
"Nicolò Barella",
"Declan Rice"
],
"pr": [
"Leon Goretzka",
"Conor Gallagher"
],
"gr": []
},
"gm": 0.67,
"am": 1.12,
"ro": 0.16,
"ex": {
"sh": 0.86,
"kp": 0.95,
"dr": 0.65,
"tk": 0.97
}
},
"Advanced Creator": {
"rp": 0.2,
"blurb": "A midfielder who plays in the final third: key passes, dribbles and the odd goal.",
"traits": [
"Chance creation",
"Dribbling in midfield"
],
"att": {
"pas": 5,
"dri": 6,
"sho": 3,
"def": -7
},
"refs": {
"gen": [
"Andrés Iniesta",
"Kevin De Bruyne"
],
"wk": [
"Pedri",
"Bernardo Silva"
],
"pr": [
"Mikel Merino",
"Teun Koopmeiners"
],
"gr": []
},
"gm": 0.7,
"am": 0.94,
"ro": -0.18,
"ex": {
"sh": 0.64,
"kp": 1.09,
"dr": 0.62,
"tk": 1.03
}
}
},
"DM": {
"Anchor": {
"age": 0.006,
"inj": 0.9,
"blurb": "Sits in front of the defence, reads the game and keeps it simple.",
"traits": [
"Positioning",
"Ages well"
],
"att": {
"def": 7,
"phy": 4,
"pas": -2,
"dri": -5,
"pac": -3
},
"refs": {
"gen": [
"Claude Makélélé"
],
"wk": [
"Casemiro",
"Aurélien Tchouaméni"
],
"pr": [
"João Palhinha",
"Manuel Ugarte"
],
"gr": []
},
"gm": 1.13,
"am": 0.49,
"ro": -0.17,
"ex": {
"sh": 1.62,
"kp": 0.75,
"dr": 0.68,
"tk": 1.25
}
},
"Ball Winner": {
"inj": 1.15,
"age": -0.01,
"blurb": "Hunts the ball all game. Tackles and interceptions, little creativity.",
"traits": [
"Tackles",
"Physical toll"
],
"att": {
"def": 6,
"phy": 6,
"pac": 4,
"pas": -6
},
"refs": {
"gen": [
"N'Golo Kanté"
],
"wk": [
"Moisés Caicedo",
"Edson Álvarez"
],
"pr": [
"Amadou Onana",
"Youssouf Fofana"
],
"gr": []
},
"gm": 0.47,
"am": 0.83,
"ro": 0.16,
"ex": {
"sh": 0.91,
"kp": 0.67,
"dr": 1.04,
"tk": 0.74
}
},
"Regista": {
"rp": 0.3,
"age": 0.008,
"blurb": "The deep playmaker in a holding role. Controls the game and builds every attack.",
"traits": [
"Passing",
"Ages well"
],
"att": {
"pas": 10,
"dri": 2,
"def": -2,
"phy": -4,
"pac": -4
},
"refs": {
"gen": [
"Rodri",
"Sergio Busquets"
],
"wk": [
"Martín Zubimendi",
"Hakan Çalhanoğlu"
],
"pr": [
"Joshua Kimmich",
"Exequiel Palacios"
],
"gr": []
},
"gm": 2.07,
"am": 1.03,
"ro": -0.36,
"ex": {
"sh": 1.43,
"kp": 1.18,
"dr": 0.79,
"tk": 0.85
}
}
},
"FB": {
"Attacking Wing-Back": {
"age": -0.012,
"pd": 2,
"inj": 1.1,
"blurb": "Bombs forward all game, overlaps and crosses. Needs the legs, so decline comes earlier.",
"traits": [
"Assists from full-back",
"Declines earlier"
],
"att": {
"pac": 6,
"dri": 5,
"pas": 3,
"def": -7,
"phy": -3
},
"refs": {
"gen": [
"Dani Alves",
"Roberto Carlos",
"Marcelo"
],
"wk": [
"Achraf Hakimi",
"Alphonso Davies",
"Theo Hernández"
],
"pr": [
"Jeremie Frimpong",
"Pedro Porro",
"Alejandro Grimaldo"
],
"gr": []
},
"gm": 1.72,
"am": 1.27,
"ro": -0.02,
"ex": {
"sh": 1.78,
"kp": 1.38,
"dr": 0.9,
"tk": 0.81
}
},
"Inverted Full-Back": {
"rp": 0.2,
"age": 0.004,
"blurb": "Steps into midfield and plays like a playmaker from full-back.",
"traits": [
"Passing",
"Key passes"
],
"att": {
"pas": 8,
"dri": 3,
"def": -2,
"pac": -3
},
"refs": {
"gen": [
"Philipp Lahm"
],
"wk": [
"Trent Alexander-Arnold",
"João Cancelo"
],
"pr": [
"Rico Lewis",
"Oleksandr Zinchenko"
],
"gr": []
},
"gm": 0.93,
"am": 0.87,
"ro": -0.04,
"ex": {
"sh": 1.04,
"kp": 0.98,
"dr": 0.81,
"tk": 1.01
}
},
"Defensive Full-Back": {
"age": 0.004,
"blurb": "Defends first. Solid, reliable and rarely beaten.",
"traits": [
"Tackles",
"Consistent"
],
"att": {
"def": 7,
"phy": 4,
"dri": -5,
"pas": -3
},
"refs": {
"gen": [
"Paolo Maldini"
],
"wk": [
"Dani Carvajal",
"Kyle Walker"
],
"pr": [
"Ben White",
"Benjamin Pavard"
],
"gr": []
},
"gm": 0.5,
"am": 0.65,
"ro": 0.31,
"ex": {
"sh": 0.71,
"kp": 0.6,
"dr": 0.3,
"tk": 0.71
}
}
},
"CB": {
"Stopper": {
"age": 0.002,
"blurb": "Aggressive, wins the duel, clears the danger. Old-school centre-back.",
"traits": [
"Duels",
"Aerial"
],
"att": {
"def": 6,
"phy": 8,
"pas": -6,
"pac": -3
},
"refs": {
"gen": [
"Fabio Cannavaro",
"Carles Puyol"
],
"wk": [
"Antonio Rüdiger",
"Rúben Dias",
"Nemanja Vidić"
],
"pr": [
"James Tarkowski",
"Marc Guéhi"
],
"gr": []
},
"gm": 0.61,
"am": 2.01,
"ro": 0.22,
"ex": {
"sh": 0.89,
"kp": 0.85,
"dr": 0.48,
"tk": 0.75
}
},
"Ball-Playing Defender": {
"rp": 0.15,
"age": 0.008,
"blurb": "Builds from the back with long passes and carries. Composed and ages well.",
"traits": [
"Passing",
"Ages well"
],
"att": {
"pas": 9,
"dri": 4,
"def": -2,
"phy": -3
},
"refs": {
"gen": [
"Franz Beckenbauer",
"Virgil van Dijk"
],
"wk": [
"Rio Ferdinand",
"Gerard Piqué",
"Alessandro Bastoni"
],
"pr": [
"John Stones",
"Nathan Aké"
],
"gr": []
},
"gm": 0.84,
"am": 1.08,
"ro": -0.08,
"ex": {
"sh": 0.92,
"kp": 1.01,
"dr": 0.58,
"tk": 0.91
}
},
"Recovery Defender": {
"age": -0.015,
"pd": 2.5,
"blurb": "Fast enough to recover any mistake. Relies on pace, so the thirties are harder.",
"traits": [
"Pace",
"Declines earlier"
],
"att": {
"pac": 9,
"def": 3,
"phy": 1,
"pas": -4
},
"refs": {
"gen": [
"Raphaël Varane"
],
"wk": [
"William Saliba",
"Ibrahima Konaté",
"Kim Min-jae"
],
"pr": [
"Micky van de Ven",
"Joško Gvardiol"
],
"gr": []
},
"gm": 0.97,
"am": 0.66,
"ro": 0.01,
"ex": {
"sh": 0.7,
"kp": 0.84,
"dr": 0.89,
"tk": 1.04
}
}
},
"GK": {
"Shot-Stopper": {
"age": 0.006,
"blurb": "Reflexes and big saves. Wins points on his own.",
"traits": [
"Saves",
"Ages well"
],
"att": {
"ref": 7,
"div": 5,
"kic": -6,
"pos": -2
},
"refs": {
"gen": [
"Gianluigi Buffon",
"Iker Casillas"
],
"wk": [
"Thibaut Courtois",
"Jan Oblak",
"Gianluigi Donnarumma"
],
"pr": [
"Jordan Pickford",
"Emiliano Martínez"
],
"gr": []
},
"gm": 1,
"am": 1,
"ro": 0.15,
"ex": {}
},
"Sweeper Keeper": {
"age": 0.004,
"blurb": "Commands his area, sweeps behind the defence and starts attacks with his feet.",
"traits": [
"Distribution",
"Sweeping"
],
"att": {
"kic": 8,
"pos": 5,
"ref": -3,
"han": -3
},
"refs": {
"gen": [
"Manuel Neuer"
],
"wk": [
"Alisson",
"Ederson",
"Marc-André ter Stegen"
],
"pr": [
"David Raya",
"André Onana"
],
"gr": []
},
"gm": 1,
"am": 1,
"ro": 0.19,
"ex": {}
}
}
};
const ARCH={};for(const p in ARX){ARCH[p]={};for(const n in ARX[p])ARCH[p][n]=ARX[p][n].att}
const ARALIAS={'Playmaker':'Classic No.10','Mezzala':'Advanced Creator','Attacking Full-back':'Attacking Wing-Back','Defensive Full-back':'Defensive Full-Back','Ball-Playing CB':'Ball-Playing Defender'};
function archOf(me){const L=ARX[me.pos];return L[me.arch]||L[ARALIAS[me.arch]]||L[Object.keys(L)[0]]}
// ability multiplier from the archetype's ageing curve
const archAge=(me,age)=>clamp(1+(archOf(me).age||0)*Math.max(0,age-29)*(age>=33&&(archOf(me).age||0)<0?1.3:1),.6,1.08);
