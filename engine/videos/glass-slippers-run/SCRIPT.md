# "What If You Ran in Cinderella's Glass Slippers?" — script v1 (2026-11-15)
Format: cartoon-3d-short skill (65.4 s, 229 words, 3.50 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet; here in white socks and glass slippers), his wife, his neighbor.

Model (stated assumptions): ordinary annealed soda-lime glass. Squeezed, it fails at a nominal 1000 MPa; stretched or
bent, at about 40 MPa, because the stress concentrates at the tips of microscopic surface scratches (Griffith flaws).
The slipper's heel is a square glass post 1 cm x 1 cm in section and 4 cm tall; Gus weighs 80 kg. Standing loads the
post straight down (pure squeeze). A running step peaks at 2.5 body weights with its force line tilted 10 degrees
against the post; the sideways part bends it (stress on the outer face = 6 F_side h / a^3 - F_axial / a^2).
Every number below is computed in `calc_video.py` -> `calc.json`; the script exits non-zero if a check fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "glass slippers strong enough to hold up two elephants" / "two elephants on one heel" | a 1 cm x 1 cm glass post carries 10.2 t; a bull (6 t) and a cow (3 t) African elephant weigh 9 t | `squeeze.cube_crush_load_tonnes`, `squeeze.two_elephants_tonnes` |
| 2 | "they're about to break under him" / "Snap. One heel is gone" | a running step stretches the heel with 62 MPa, the limit is 40 | `running.stretch_on_heel_MPa`, `running.times_over_the_limit` (1.56) |
| 3 | "Gus stands up. Nothing. He hops. Nothing. He dances ... Still nothing." | all 80 kg on one heel: 7.8 MPa of squeeze, 127 times below the limit; a straight load cannot stretch the post at all | `standing.stress_on_one_heel_MPa`, `standing.safety_factor`; limiting case "no tilt, no stretch" |
| 4 | "glass loves a squeeze ... it pushes back harder than concrete" | glass 1000 MPa (makers quote 700 to 1000), concrete 20 to 40 MPa: 25 times at the nominal values | `squeeze.times_stronger_than_concrete`; Viridian, Saint-Gobain, Guardian |
| 5 | "A glass cube smaller than a sugar cube can carry ten tons" (headline) | 1 cm cube: 100 kN = 10.2 tonnes (11.2 short tons); a small sugar cube is 1.27 cm, most are about 1.6 cm | `squeeze.cube_crush_load_tonnes`. Source 1: Viridian TechDirect ("to shatter a 1 cm cube of glass a load of 10 t is required"). Source 2: Saint-Gobain Glass UK, "The strength of glass" (the same 1000 N/mm2 and 10 tonnes), also the "Strength of glass" encyclopedia article (1000 MPa) |
| 6 | "every step lands with two and a half times his weight" | 2.5 body weights = 1961 N (the weight of 200 kg); the literature range is 2 to 3 | `running.step_force_N`; running biomechanics reviews |
| 7 | "and it lands crooked" / "the heel bends. One side gets squeezed and the other gets stretched" | force line tilted 10 degrees (assumption); it breaks from 7.3 degrees on | `running.tilt_that_breaks_it_deg`; beam bending |
| 8 | "stretched glass is twenty-five times weaker" | 1000 MPa / 40 MPa = 25 (22 with the 45 MPa of EN 572-1; more at a rough edge) | `stretch.squeezed_over_stretched`; Viridian ("approximately 40 MPa" on deflection), EN 572-1 |
| 9 | "Ever try to rip open a bag of chips? It won't tear until you find the little notch." | a notch concentrates the stress at its tip, which is what the tear notch of a bag is for | fracture mechanics (stress concentration); MIT OCW 3.071 lecture 8 |
| 10 | "Glass is covered in tiny scratches too small to see. Pull on one and it runs right through." | Griffith flaws: practical strength of glass is limited by microscopic surface cracks; flawless glass would be far stronger | MIT OCW 3.071 lecture 8; Saint-Gobain; Structure magazine "Glass fundamentals" |
| 11 | "a squeeze holds every scratch shut" | compression closes surface cracks, which is why glass is so strong squeezed (and why toughened glass has a pre-squeezed skin) | same sources |
| 12 | the heel that would survive a run | 2.9 cm for Gus, 3.8 cm for a light adult in our model; the Leicester student paper found 1.15 cm (same order; not said in the film) | `running.max_heel_height_cm_gus`; "Cinderella's Shattered Dreams", J. Phys. Special Topics 2015 |
| 13 | "eleven at night", the costume party, the clock, the gate, the one slipper left behind | story | - |

Caveats kept honest: "ten tons" is the nominal 1000 MPa; with the 700 MPa some makers quote it is 7 tonnes. "Twenty-five
times" is a round middle value (1000 / 40). The running result depends on the heel: a low, thick or toughened heel would
survive; the description states the heel (1 cm thick, 4 cm tall) and the 10 degree tilt.
Not seen at the primary source in this session (search results only; the pages were not opened or did not open): the
Saint-Gobain document (HTTP 404 today; its wording is quoted by two search results), the Viridian PDF, EN 572-1, the
Leicester paper itself (HuffPost and Scripps News both report 1.15 cm; one outlet prints 1.5 cm), the elephant
weights, and a table of peak running forces (three search results give "two to three times body weight").

Sources
- Viridian Glass, TechDirect "Thermal stress / glass strength". https://www.viridianglass.com/wp-content/uploads/2024/04/Viridian-TechDirect%E2%84%A2-Thermal-Stress-Glass-Strength.pdf
- Saint-Gobain Glass UK, "The strength of glass". https://saint-gobain-glass.co.uk/document/the-strength-of-glass
- Guardian Glass, physical properties of glass (compressive strength 700-900 MPa). https://www.guardianglass.com/us/en/why-glass/understand-glass/properties-of-glass/physical-properties
- EN 572-1, Glass in building: basic soda-lime silicate glass products (characteristic bending strength 45 N/mm2).
- MIT OpenCourseWare 3.071 Amorphous Materials (2015), lecture 8: mechanical properties, Griffith cracks. https://ocw.mit.edu/courses/3-071-amorphous-materials-fall-2015/
- Structure magazine, "Glass fundamentals: the fast and the slow". https://structuremag.org/?p=17866
- "Cinderella's Shattered Dreams", Journal of Physics Special Topics, University of Leicester, 2015; reported by HuffPost https://www.huffpost.com/entry/cinderellas-glass-slipper-wouldve-shattered_n_5681d41de4b06fa68880fcd6 and Scripps News https://www.scrippsnews.com/us-news/weird/scientists-shatter-the-magic-of-cinderella-s-glass-slippers
- Running ground reaction forces: review in Frontiers in Bioengineering and Biotechnology (2024). https://www.frontiersin.org/journals/bioengineering-and-biotechnology/articles/10.3389/fbioe.2024.1377383/full

Script (17 lines)
1. Gus is wearing glass slippers strong enough to hold up two elephants, and they're about to break under him.
2. It's eleven at night at the neighbor's costume party, and Gus came as Cinderella.
3. His wife can't look. Glass shoes? He'll go right through them.
4. Gus stands up. Nothing. He hops. Nothing. He dances with the neighbor. Still nothing.
5. But wait. A dropped cup breaks on the floor. So why not a shoe with Gus on top?
6. You see, glass loves a squeeze. Press on it and it pushes back harder than concrete.
7. A glass cube smaller than a sugar cube can carry ten tons. That's two elephants on one heel.
8. Then the clock strikes twelve, and Gus runs.
9. Now every step lands with two and a half times his weight, and it lands crooked.
10. So the heel bends. One side gets squeezed and the other gets stretched.
11. And stretched glass is twenty-five times weaker.
12. Ever try to rip open a bag of chips? It won't tear until you find the little notch.
13. Glass is covered in tiny scratches too small to see. Pull on one and it runs right through.
14. Luckily, a squeeze holds every scratch shut.
15. Unluckily, Gus is in a hurry.
16. Snap. One heel is gone, three steps from the gate.
17. So Gus hops home in one glass slipper, which is exactly how the story goes.
