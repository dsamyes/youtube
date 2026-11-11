# Shared visual library: sources and licences

Every file here is public domain (NASA) unless a licence is named. Credit images on screen (the
`photo` scene does this automatically from `PHOTOS` in `src/components/three/core.tsx`) and in the
video description (`metadata.image_credits`). `pipeline/build_asset_lib.py` documents the processing
(resize, crop, EXR tone mapping). Do NOT add images under a NonCommercial (NC) licence: the channel is
monetised.

## tex/ (equirectangular maps and data textures for the 3D scenes)

| File | Source | Credit / licence |
|---|---|---|
| jupiter.jpg | NASA PIA07782, Cassini best maps of Jupiter (cylindrical), images-assets.nasa.gov | NASA/JPL/Space Science Institute, public domain |
| io.jpg | NASA PIA00585, Color Global Mosaic of Io | NASA/JPL/University of Arizona, public domain |
| ganymede.jpg | NASA PIA03781, Global Map of Ganymede | NASA/JPL/USGS, public domain |
| moon.jpg | NASA SVS 4720, CGI Moon Kit, lroc_color_2k.jpg | NASA's Scientific Visualization Studio, LRO/LROC (NASA/GSFC/Arizona State University), public domain |
| earth.jpg | NASA SVS 2915, Blue Marble, bluemarble-2048.png | NASA Goddard Space Flight Center (Blue Marble, Reto Stöckli et al.), public domain |
| milkyway_gal.jpg | NASA SVS 4851, Deep Star Maps 2020, milkyway_2020_4k_gal.exr (tone-mapped, black point lifted) | NASA/Goddard Space Flight Center Scientific Visualization Studio; Gaia DR2: ESA/Gaia/DPAC, CC BY-SA 3.0 IGO (this derivative is shared under the same licence) |
| noise.png | generated in code (spectral noise, baked relief light) | The If Engine, no third-party content |

## data/

| File | Source | Credit / licence |
|---|---|---|
| stars.json | HYG star database v4.0 (astronexus), stars to V = 7.6, converted to galactic unit vectors | David Nash / astronexus, CC BY-SA 4.0 (this derivative is shared under the same licence) |

## photos/ (Ken Burns stills; key in PHOTOS -> file)

| Key | File | Source | Credit / licence |
|---|---|---|---|
| jupiter_globe | jupiter_globe_PIA02873.jpg | NASA PIA02873 | NASA/JPL/University of Arizona, public domain |
| jupiter_grs | jupiter_grs_PIA21773.jpg | NASA PIA21773 | NASA/JPL-Caltech/SwRI/MSSS, enhanced by Gerald Eichstädt |
| jupiter_south | jupiter_south_PIA21381.jpg | NASA PIA21381 | NASA/JPL-Caltech/SwRI/MSSS, public domain |
| jupiter_clouds | jupiter_clouds_PIA21984.jpg | NASA PIA21984 | NASA/JPL-Caltech/SwRI/MSSS, enhanced by Kevin M. Gill, CC BY |
| jupiter_storms | jupiter_storms_PIA22949.jpg | NASA PIA22949 | NASA/JPL-Caltech/SwRI/MSSS, enhanced by Kevin M. Gill, CC BY |
| jupiter_chaos | jupiter_chaos_PIA25729.jpg | NASA PIA25729 | NASA/JPL-Caltech/SwRI/MSSS, processing by Gary Eason, CC BY |
| jupiter_pearl | jupiter_pearl_PIA21377.jpg | NASA PIA21377 | NASA/JPL-Caltech/SwRI/MSSS, enhanced by Eric Jorgensen |
| jupiter_cyclones_ir | jupiter_cyclones_ir_PIA23558.jpg | NASA PIA23558 (cropped) | NASA/JPL-Caltech/SwRI/ASI/INAF/JIRAM, public domain |
| galileo_probe_art | galileo_probe_art_AC89-0146-2.jpg | NASA Ames ARC-1989-AC89-0146-2 (painting of the probe descent, edges trimmed) | NASA Ames Research Center, public domain |
| earth_apollo17 | earth_as17-148-22727.jpg | NASA AS17-148-22727 | NASA, Apollo 17 crew, public domain |
| iss | iss_iss066e081130.jpg | NASA iss066e081130 | NASA/ESA, Thomas Pesquet, public domain |
| milkyway_art | milkyway_PIA10748.jpg | NASA PIA10748 | NASA/JPL-Caltech/R. Hurt (SSC/Caltech), public domain |
| andromeda | andromeda_PIA04921.jpg | NASA PIA04921 | NASA/JPL/California Institute of Technology (GALEX), public domain |

Generated, not downloaded: clouds, nebulae, particles, plasma, the Saturn/Neptune/Venus/Mars looks
(tinted maps) and all music and sound effects (`pipeline/sound.py`).
