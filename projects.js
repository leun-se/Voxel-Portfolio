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
        image: "./images/WeatherRoom/WR1.png",
        modal: {
            title: "Weather Room",
            subtitle: "Jul 2026 – present · Unity",
            tags: ["Unity", "C#", "WebSocket", "REST APIs", "Blender"],
            // gallery: [
            //     ["./images/weather-room-rain.png", "Rain and wind at dusk"],
            //     ["./images/weather-room-night.png", "The 24-hour light cycle"],
            //     "./images/weather-room-lightning.png",
            // ],
            body: `A real-time 3D attic room that shows the actual current weather,
            anywhere in the world. Rain, snow, and wind are driven by continuous 
            values from a weather API rather than fixed modes, so conditions blend 
            into each other instead of switching abruptly.

            A live WebSocket feed of real-time lightning-strike data flashes actual 
            storms as they happen, and a 24-hour lighting cycle keeps the room synced 
            to the chosen location's local time.

            This project started as a way to bring together the creative and technical 
            sides of what I do — building something genuinely nice to look at, while getting 
            hands-on with REST APIs and WebSockets in a real system instead of a tutorial. 
            It's still early: what's shown here is a first block-out of the scene, but 
            the systems described above are already built and running underneath it.`,
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
            body: `I got into this project because I'd been wanting to work on something in 3D, so I
            reached out to the professor running it, then applied to a summer research
            position and got in.

            Heritage Roots is a research initiative preserving Indigenous traditional
            knowledge that's at risk of being lost as oral cultures urbanize. It's built
            with Indigenous communities in Ecuador and university researchers, and pairs
            a web-based knowledge graph connecting stories across cultures with a Unity
            pipeline that turns those stories into explorable worlds. Our piece was a 3D
            game adapting the Kichwa creation myth of the First Mother, aimed at
            urbanizing Amazonian youth — the bet being that heritage reaches them better
            through a world they can fly around in than through a static archive.

            You play as a toucan, and I spent most of my time on how flight feels.
            It's momentum-based rather than positional: you hold to flap, spend stamina
            doing it, and get it back by gliding or diving, so altitude is something you
            earn instead of a number you set. There's also a carry-and-plant mechanic, so
            the player is enacting the growth the myth is about rather than being told
            about it. The other half of my time went into the rainforest — sculpting the
            terrain and placing vegetation to get a forest that reads as somewhere
            specific rather than as scattered assets.

            Dense foliage is close to the worst case for a renderer, and the scene got
            expensive fast. Profiling pointed at draw calls and shadows, so between GPU
            instancing, shadow distance, and LOD tuning I took it from 56 to 80 FPS. It
            runs on desktop for now; the plan from here is the Quest build and hooking
            the world up to the knowledge graph so scenes can generate from recorded
            testimony. Having the frame budget under control is part of what makes either
            of those possible. The work was presented at a research symposium in August.`,
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
            body: `This one was mostly a learning project. I wanted to get hands-on with Docker
            and actually apply what I was picking up in my data engineering class instead
            of letting it stop at the assignments, so I needed a problem that would need
            a real pipeline end to end. Game economies seemed fun — loot drops are
            naturally messy, high-volume, and there's a built-in reason to care whether
            the data is trustworthy.

            It ended up as three containerized services: a Java generator producing loot
            drops with realistic rarity distributions, a Python ETL pipeline validating
            them on the way in, and a Streamlit dashboard watching the economy live. The
            part I didn't expect to be hard was telling a legitimate rare drop apart from
            an exploit — a legendary rolling high looks a lot like injected currency, and
            wherever you put the threshold you're either flagging lucky players or
            missing the actual cheating.

            Displaying it was its own mess. Drop rates and gold values vary so widely
            that a 12-gold common and a one-in-ten-thousand legendary won't share an
            axis; the cheap stuff flattens into a line at the bottom. I ended up adding a
            symlog toggle plus a second view that buckets drops into frequency bubbles
            sized by how often they occurred. Then rendering fell over, because thousands
            of individual points make panning unusable, so I moved the stats computation
            into Python and only render an invisible layer of outlier points for
            tooltips. Cut rendered elements by roughly 99%.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.003": {
        jump: true,
        image: "./images/LegoStore/LS1.png",
        modal: {
            title: "Lego Store",
            subtitle: "Sep 2025 – Dec 2025 · Full-stack",
            tags: ["Flask", "MySQL", "SQL", "Database Design", "JavaScript"],
            body: `This was the final project for my databases class, so the shape of it was
            fixed — build something with a real schema behind it. My groupmate is a big
            Lego fan, so a Lego store it was. Turned out to be a better pick than a
            generic storefront, because Lego has replacement pieces, and that's what made
            the data model interesting.

            A line item in an order can be either a whole set or a single replacement
            piece. The easy version is one table with a nullable set_id, a nullable
            piece_id, and a type flag, but then half your columns are always empty and
            nothing stops a row from being both. So we made ORDER_ITEM a supertype with
            ORDER_SET and ORDER_PIECE as disjoint subtypes — which kind of item it is
            becomes a question of which table the row lives in.

            A few other decisions I'd defend: line items store the price they were bought
            at rather than pointing at the product's current price, so past orders stay
            accurate after a catalog change. Ratings are aggregated on read from the
            review table instead of cached as a running average on the set, so the number
            can't drift from the reviews behind it. And checkout runs in one transaction
            covering the stock deduction, the balance debit, and the order insert, so a
            failure anywhere rolls the whole thing back. Eight tables total, with an
            admin dashboard reading over them for revenue, low-stock alerts, and per-set
            sales.`,
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
            body: `I wanted a way to show my projects that wasn't another grid of cards, and
            somewhere in that search I stumbled on one of Andrew Woan's Three.js
            tutorials. That was the push — I'd been curious about doing 3D on the web and
            hadn't had a reason to try it. Every model in here is hand-made in Blender:
            the park, the benches, the fountain, the character, the signs.

            So it's a park you walk around, and the projects are on signs you find by
            wandering. Click one and it opens a modal with the write-up, images and tags
            — which means this description is sitting inside the thing it's describing,
            on one of the signs. The character doesn't walk so much as hop: while you're
            holding a direction it launches every 300ms, and there's squash-and-stretch
            on takeoff and landing so it feels springy rather than floaty. The whole
            scene is an orthographic camera trailing at a fixed offset, so it reads as a
            little diorama you're moving a toy through.

            Movement is hand-written rather than a physics library. The character is a
            capsule, the ground is a hidden mesh from Blender baked into an octree at
            load, and each frame I sweep the capsule against it and push it back out
            along the collision normal — plus my own gravity, damping and a fall-through
            respawn, because sooner or later you find a gap in your own collider.

            The part I'm happiest with is how the scene is wired up. Rather than
            hardcoding object references, there's a registry that maps names from
            Blender's outliner to behaviour — this one is clickable, this one hops, this
            one is the player, this one opens a project modal. Everything a mesh needs
            to know is declared in one object at the top of the file, and adding a new
            prop is a line of config instead of a code change. Getting there meant
            handling a pile of small realities: glTF strips the dots out of Blender's
            names, one object can arrive split across several meshes, materials get
            shared between all the signs so painting one board would repaint every one
            of them. Each entry ends up with a pivot group at its bottom centre, which
            is what lets any object squash toward the ground when you click it without
            me positioning anything by hand.`,
            // links: [["View project", "https://"]],
        },
    },

    "sign.005": {
        jump: true,
        image: "./images/images.png",
        modal: {
            title: "Market Miner",
            subtitle: "Aug 2025 – Sep 2025 · Data pipeline",
            tags: ["Python", "Scrapy", "Playwright", "MongoDB"],
            body: `There's no UI for this one; it all runs in the terminal. A scraping pipeline for JavaScript-heavy marketplaces. I built it to
            help my brother pull fish auction listings, then expanded it to handle other 
            platforms like Nike. The tutorial I started from used only Scrapy, which works 
            fine on static pages but returns nothing when content loads via JavaScript — 
            so I added Playwright to render pages before parsing them. Bot detection was 
            the harder problem. Mimicking user scrolling got me past some sites; others I 
            couldn't crack, including with hosted crawlers. `,
            // links: [["View project", "https://"]],
        },
    },

    "sign.006": {
        jump: true,
        image: "./images/KennyJam/E1.png",
        modal: {
            title: "Escape the Facility",
            subtitle: "Kenney Jam · 48-hour game jam",
            tags: ["Unity", "C#", "Level Design"],
            gallery: [
                ["./images/KennyJam/E1.png"],
                ["./images/KennyJam/E1.png"],
                ["./images/KennyJam/E1.png"],
            ],
            body: `My girlfriend and I made this at our first game jam — 48 hours, theme 
            was "Power." It was fun coming up with ideas and seeing how many ways you could 
            read the theme. We eventually landed on superpowers, with a protagonist who can 
            mind control, and that turned into Escape the Facility, a first-person escape 
            game where you take over the other superhuman inmates and use their abilities to
            get out. All the art is from the Kenney library. I was in Taiwan for the summer 
            and she was in the States, so we built the whole thing over a 12-hour time difference, 
            which was an interesting way to work.`,
            links: [
                ["Play on itch.io", "https://leun-se.itch.io/escape-from-the-facility"],
            ],
        },
    },
};