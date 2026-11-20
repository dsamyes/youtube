# "What If Friction Vanished for 5 Seconds?" — script v1 (2026-11-20)
Format: cartoon-3d-short skill (66.8 s, 235 words, 3.52 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): for five seconds the friction between solid surfaces is zero; gravity, air and the push
of surfaces against each other stay. Gus's lawn has the slope a building code asks for next to a house (6 inches of
fall in 10 feet, a 5 % grade, 2.86 degrees), and we let that slope run on for the 20 feet he slides. Everything
starts at rest. Gus weighs 180 lb. Every number below is computed in `calc_video.py` -> `calc.json`; the script
exits non-zero if a check fails (12 checks: limiting cases, a second integration method, energy, with air drag).

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "Gus slides twenty feet" / "twenty feet in five seconds" (headline) | s = 1/2 g sin(2.862 deg) t^2 = 6.12 m = 20.1 ft (19.9 ft with air drag) | `slide.distance_ft`, `slide.distance_ft_with_air_drag`. Source 1 for the slope: IRC R401.3 (seen in several jurisdictions' copies in search results: "The grade shall fall not fewer than 6 inches (152 mm) within the first 10 feet (3048 mm)"). Source 2 for the law: OpenStax College Physics ch. 5, problem 8 (acceleration down a frictionless incline is g sin(theta), independent of mass; seen through a site that reproduces it) and LibreTexts University Physics 8.3 (a = g(sin(theta) - mu cos(theta)), which gives g sin(theta) at mu = 0) |
| 2 | "nothing on Earth can grip anything" | grip (static friction) is zero | the premise |
| 3 | "his feet can't push, so he runs on the spot" | walking pushes the ground backward through friction; with none the foot slides back and the body's centre does not move | Newton's third law; any textbook chapter on friction and walking |
| 4 | "His wife's cup slips right through her fingers" | a smooth cup held between fingers is held by friction alone; it falls 1 m in 0.45 s | `other.cup_fall_1m_s` |
| 5 | "the neighbor's ladder slides flat down the wall" | a ladder leaning on a wall is in balance only if the floor has friction: the wall pushes sideways, and only floor friction can push back | MIT RELATE wiki, "The Ladder Problem"; UT Austin physics quiz ("equilibrium ... in the horizontal direction implies that the friction force at the floor must match the horizontal push from the wall") (search results) |
| 6 | "no lawn is flat. Builders tilt it half an inch a foot so rain runs away from the house" | 6 in per 10 ft = 0.6 in per foot; "half an inch" is the round figure, a little under | `slope.inch_per_foot`; IRC R401.3 as above. Many lawns are flatter further from the house: the description says the code's slope is assumed for the whole slide |
| 7 | "That slope tugs at Gus with nine pounds all day long" | 180 lb x sin(2.862 deg) = 9.0 lb | `pull.down_slope_lb` (his soles can hold about 90 lb on grass at mu = 0.5: `pull.soles_can_hold_lb`) |
| 8 | "Ever pressed two brushes together? Up close his feet and the grass are bristles too, and they lock" | surfaces that look smooth are rough under the microscope and touch only at the tips of tiny bumps, which catch and stick; that is where friction comes from | Bowden and Tabor, The Friction and Lubrication of Solids (asperities several microns high; real contact area a tiny fraction of the apparent one), as quoted in tribology reviews (search results). The brush picture is the usual classroom model; real friction is also sticking at the contact points, not only interlocking |
| 9 | "Heavy or light, everything speeds up alike" | a = g sin(theta) has no mass in it: pot, man and cup all 20.1 ft | `slide.pot_ft`, `slide.cup_ft` |
| 10 | "the rest of Gus keeps going at a jogging pace" | speed after 5 s: 2.45 m/s = 5.5 mph | `slide.end_speed_mph` (jogging is usually put at 4 to 6 mph) |
| 11 | "It stops twenty feet too far" | the pot slid with everything else: 20.1 ft | `slide.pot_ft` |

Caveats said nowhere in the film: the pot gets a light push in the picture, so strictly it ends a little further than
the rest. Knots, screws, nails and woven cloth also hold by friction (MIT News 2020, Patil et al., Science: knots
hold through friction between crossing strands); they were left out to keep the story in one garden. Cars and roads
are left out on purpose. The lawn is drawn level: a 2.9 degree slope cannot be seen, which is the point of the story;
the sliding shots tilt the horizon by that angle.

Figures not seen at the primary source: the IRC text (the ICC's own site answers 403; seen quoted on InterNACHI's
page, which was opened, and in three municipal and county copies in search results), OpenStax (through a
reproducing site), the MIT ladder page and Bowden and Tabor (search results). Opened: InterNACHI (source 1) and
LibreTexts (source 3).

Sources
1. International Residential Code R401.3, Drainage (copies: https://nachi.org/gallery/general-2/foundation-grade , https://gocodebook.com/us/california/california-residential-code/foundations/general-requirements/site-drainage-and-grading-near-foundations , https://palmer.municipal.codes/PMC/15.16.R401.3) (the first opened, the others search results)
2. OpenStax College Physics, ch. 5 problem 8: https://collegephysicsanswers.com/openstax-solutions/show-acceleration-any-object-down-frictionless-incline-makes-angle-theta (search result)
3. LibreTexts, University Physics I (Gea-Banacloche), 8.3 Inclined Planes: https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_I_-_Classical_Mechanics_(Gea-Banacloche)/08:_Motion_in_Two_Dimensions/8.03:_Inclined_Planes (opened)
4. MIT RELATE wiki, The Ladder Problem: https://wikis.mit.edu/confluence/display/RELATE/The+Ladder+Problem ; UT Austin quiz: https://www.ph.utexas.edu/~itiq/303K/chiu/physiquiz/OMPhQuiz_14_p119-125.pdf (search results)
5. Contact area and asperities (Bowden and Tabor): https://en.wikipedia.org/wiki/Contact_area ; "Statistical Physics of Fracture, Friction and Earthquake", https://arxiv.org/pdf/1112.0148 (search results)
6. MIT News 2020, "How strong is your knot?": https://news.mit.edu/2020/model-how-strong-knot-0102 (search result; background only)
7. Preferred walking speed, about 1.4 m/s (3.1 mph): https://en.wikipedia.org/wiki/Preferred_walking_speed (search result; used only for a number that is not narrated)

## Final lines
1. For five seconds nothing on Earth can grip anything, and Gus slides twenty feet without taking a step.
2. It's nine on a Sunday morning and Gus is shoving a heavy flowerpot across his garden.
3. It scrapes and sticks and he wishes friction would just go away.
4. His wife says he'd miss it. His neighbor says life would be a breeze.
5. Then for five seconds Gus gets his wish.
6. The pot glides off like a puck on ice. But his feet can't push, so he runs on the spot.
7. His wife's cup slips right through her fingers and the neighbor's ladder slides flat down the wall.
8. Then the whole garden starts to drift, all the same way.
9. But the lawn looks flat. So what's pulling them?
10. You see, no lawn is flat. Builders tilt it half an inch a foot so rain runs away from the house.
11. That slope tugs at Gus with nine pounds all day long.
12. Ever pressed two brushes together? Up close his feet and the grass are bristles too, and they lock.
13. Take that away and nine pounds is plenty. Heavy or light, everything speeds up alike: twenty feet in five seconds.
14. Luckily, friction comes back.
15. Unluckily it grabs his feet and the rest of Gus keeps going at a jogging pace.
16. And his pot? It stops twenty feet too far.
17. Gus drags it all the way back and never complains again.
