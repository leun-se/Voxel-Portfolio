/* ------------------------------------------------------------------ *
 * PROJECTS
 *
 * The content for each project sign. Editing this file is all you need
 * to do to change what the park shows - main.js handles the 3D side.
 *
 * Each key is the sign's OBJECT name from Blender's outliner, dots
 * optional ("sign.001" and "sign001" both match the same node).
 *
 * Fields inside `modal`:
 *   title      required. Heading at the top of the panel.
 *   body       required. Blank line between paragraphs.
 *   subtitle   small line under the title - dates, context.
 *   tags       array of short strings, shown as chips.
 *   gallery    extra images in a grid under the description. Each item
 *              is a path, or a [path, caption] pair.
 *   links      array of [label, url] pairs, shown as buttons.
 * Anything you leave out simply isn't rendered.
 *
 * Outside `modal`:
 *   jump       true = the sign hops when clicked.
 *   image      painted onto the sign's board in the 3D scene AND used as
 *              the modal's main image. Needs a board that was already
 *              textured in Blender, since the UVs come from the model.
 *
 * The order of fields within an entry doesn't matter. The order of the
 * entries themselves is just for your own reading - which physical board
 * each key maps to is unknown until you check with:
 *   setSignImage("sign.002", "./images/test.png")
 * in the browser console.
 * ------------------------------------------------------------------ */
export const projects = {
    "sign": {
        jump: true,
        // image: "./images/weather-room.png",
        modal: {
            title: "Weather Room",
            subtitle: "Jul 2026 – present · Unity",
            tags: ["Unity", "C#", "WebSocket", "REST APIs", "Blender"],
            // gallery: [
            //     ["./images/weather-room-rain.png", "Rain and wind at dusk"],
            //     ["./images/weather-room-night.png", "The 24-hour light cycle"],
            //     "./images/weather-room-lightning.png",
            // ],
            body: `A real-time 3D attic room that shows the actual current weather
anywhere in the world. Rain, snow and wind are driven by continuous values from
a weather API rather than fixed modes, so conditions blend instead of switching.

A live WebSocket feed of lightning-strike data flashes real storms as they
happen, and a 24-hour lighting cycle keeps the room on the chosen location's
local time.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.001": {
        jump: true,
        image: "./images/HeritageRoots/image3.png",
        modal: {
            title: "Heritage Roots",
            subtitle: "May 2026 – present · Undergraduate research, Univ. of Pittsburgh",
            tags: ["Unity", "Neo4j", "Shader Graph", "C#", "Research"],
            gallery: [
                ["./images/HeritageRoots/image4.png", "toucan flying over the rainforest"],
                ["./images/HeritageRoots/image2.png", "the first mother transforming her child"],
                ["./images/HeritageRoots/image5.png", "the first mother and her children"],
            ],
            body: `A research initiative preserving Indigenous traditional knowledge,
built with communities in Ecuador. My team's piece was a 3D game adapting the
Kichwa creation myth of the First Mother for urbanizing Amazonian youth.

I built the momentum-based flying toucan controller, the third-person camera and
UI, the whole terrain, and profiled the rainforest scene from 56 to 80 FPS.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.002": {
        jump: true,
        image: "./images/GameEconomyAnalyzer/gameEco1.png",
        modal: {
            title: "Game Economy Pipeline",
            subtitle: "Dec 2025 – Jan 2026 · Data engineering",
            tags: ["Docker", "Python", "Java", "Streamlit", "ETL"],
            gallery: [
                ["./images/GameEconomyAnalyzer/gameEco1.png", "Distribution graph of loot and security alerts"],
                ["./images/GameEconomyAnalyzer/gameEco2.png", "box and whisker plot of item distributions"],
                ["./images/GameEconomyAnalyzer/gameEco3.png", "statistical summary of item distributions"],
            ],
            body: `Three containerized services simulating a live MMO economy: a Java
generator producing statistically realistic loot drops, a Python ETL pipeline
validating them, and a Streamlit dashboard surfacing economic health live.

The interesting problem was separating a rare legitimate drop from an actual
exploit automatically. Dense-data lag was solved with a precomputed "ghost
layer" that cut rendered elements by about 99%.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.003": {
        jump: true,
        // image: "./images/lego-store.png",
        modal: {
            title: "Lego Store",
            subtitle: "Sep 2025 – Dec 2025 · Full-stack",
            tags: ["Flask", "MySQL", "SQL", "Database Design", "JavaScript"],
            body: `A full-stack e-commerce app for an online Lego retailer, covering
customer shopping through to backend inventory and order management.

A normalized schema across 8+ tables with atomic transactions keeps stock
consistent under concurrent purchases, plus an admin dashboard with real-time
analytics over 500+ records.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.004": {
        jump: true,
        image: "./images/VoxelPort/voxImg1.png",
        modal: {
            title: "Voxel Portfolio",
            subtitle: "Aug 2025 – Oct 2025 · Three.js",
            tags: ["Three.js", "JavaScript", "WebGL", "Blender", "GLTF"],
            gallery: [
                ["./images/VoxelPort/voxImg1.png"],
                ["./images/VoxelPort/voxImg2.png"],
                ["./images/VoxelPort/voxImg3.png"],
                ["./images/VoxelPort/voxImg4.png"],
                ["./images/VoxelPort/voxImg5.png"],
                ["./images/VoxelPort/voxImg6.png"],
            ],
            body: `This park. A web-based 3D portfolio you walk around to find
projects, with a physics-driven character controller synced to a Blender mesh.

Combines 3D modelling, physics programming and web tech into a game-like way of
presenting work — you're standing in it.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.005": {
        jump: true,
        // image: "./images/market-miner.png",
        modal: {
            title: "Market Miner",
            subtitle: "Aug 2025 – Sep 2025 · Data pipeline",
            tags: ["Python", "Scrapy", "Playwright", "MongoDB"],
            body: `A scraping pipeline for JavaScript-heavy marketplaces including
Facebook Marketplace, Amazon and Airbnb, automating infinite scroll and dynamic
rendering to capture complete listings.

Extraction and cleaning workflows structure the product data into MongoDB, with
reusable item models and configurable settings so new marketplaces drop in.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.006": {
        jump: true,
        // image: "./images/escape-facility.png",
        modal: {
            title: "Escape the Facility",
            subtitle: "Kenney Jam · 48-hour game jam",
            tags: ["Godot", "GDScript", "Level Design"],
            body: `A first-person escape game built in 48 hours, using only assets
from the Kenney library.

You wake up in a research facility after hours and have to find the exit before
security finishes its round.`,
            links: [
                ["Play on itch.io", "https://leun-se.itch.io/escape-from-the-facility"],
            ],
        },
    },
};