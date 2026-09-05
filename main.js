import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { projects } from './projects.js';

/* Exported model, relative to index.html. Must match the filename exactly,
 * including capitals - web servers are case sensitive even when Windows and
 * macOS aren't. */
const MODEL_FILE = "./first5jsprojectBeforeExport.glb";

/* Set to false once every model is wired up. Prints a table of every
 * mesh in the .glb and which registry entry claimed it. */
const DEBUG_NAMES = true;

/* ------------------------------------------------------------------ *
 * SCENERY
 *
 * The props in the park. Project sign content lives in projects.js.
 * Each key is the OBJECT name from Blender's outliner, dots optional
 * ("miso.001" and "miso001" both match the same node).
 *
 *   jump:  true      -> clicking makes the whole model hop
 *   player: true     -> the character the player drives
 *   prefix: "tree"   -> optional: treat EVERY object whose name starts
 *                       with this as ONE interactive object. Only use it
 *                       when separate objects should act together.
 *
 * Every entry gets one pivot group at the model's bottom centre, so all
 * of its meshes scale and hop together.
 * ------------------------------------------------------------------ */
const scenery = {
    "character.001": { player: true },

    "fountain.001":     { jump: true },
    "miso.001":         { jump: true },
    "MainParkSign.001": { jump: true },
    "ProjectSign.002":  { jump: true },

    "bench":     { jump: true },
    "bench.001": { jump: true },
    "bench.002": { jump: true },
};

/* Everything clickable, scenery plus the project signs. */
const interactive = { ...scenery, ...projects };

if (Object.keys(interactive).length !==
    Object.keys(scenery).length + Object.keys(projects).length) {
    console.warn("A key appears in both scenery and projects.js - the projects.js one wins.");
}

/* Collision geometry - never part of a model. */
const COLLIDER_NAME = "GroundCollider";

/* The material on the signs' picture boards. If a model has no material by
 * this name, the board is guessed instead: whichever mesh already carries an
 * image texture from Blender. */
const BOARD_MATERIAL = "ProjectSign";

/* three.js strips dots from glTF node names: "sign.001" -> "sign001" */
const norm = (name) => name.replace(/\./g, "");

const exactKeys = new Map();  // normalised object name -> registry key
const prefixKeys = [];        // { key, prefix }, longest prefix first

for (const [key, item] of Object.entries(interactive)) {
    if (item.prefix) prefixKeys.push({ key, prefix: norm(item.prefix) });
    else exactKeys.set(norm(key), key);
}
prefixKeys.sort((a, b) => b.prefix.length - a.prefix.length);

const playerKey = Object.keys(interactive).find((key) => interactive[key].player);

/* Filled in once the model loads */
const groupOf = new Map();      // registry key -> pivot group
const keyOfObject = new Map();  // pivot group   -> registry key

function getInteractive(name) {
    return Object.hasOwn(interactive, name) ? interactive[name] : null;
}

/* ------------------------------------------------------------------ *
 * DOM
 * ------------------------------------------------------------------ */
const loadingScreen = document.getElementById("loading-screen");
const canvas = document.getElementById("experience-canvas");
const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalBody = document.querySelector(".modal-body");
const modalExitButton = document.querySelector(".modal-exit-button");
const dayNightButton = document.querySelector(".day-night-button");
const uiOverlay = document.querySelector(".ui-overlay");

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => { loadingScreen.style.display = "none"; },
    });
};

const sizes = { width: window.innerWidth, height: window.innerHeight };

/* ------------------------------------------------------------------ *
 * PHYSICS / STATE
 * ------------------------------------------------------------------ */
const GRAVITY = 40;
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HEIGHT = 1;
const HOP_HEIGHT = 9;
const MOVE_SPEED = 6;
const HOP_COOLDOWN = 300;

const character = {
    instance: null,
    spawnPosition: new THREE.Vector3(),
};

const keyStates = {};
const playerVelocity = new THREE.Vector3();
let targetRotation = 0;
let playerOnFloor = false;
let isJumping = false;
let isModalOpen = false;
let isNight = false;
let isUiVisible = true;
let lastMoveTime = performance.now();
let lastHopTime = 0;
let intersectObject = "";

const colliderOctree = new Octree();
const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
);

/* ------------------------------------------------------------------ *
 * SCENE
 * ------------------------------------------------------------------ */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const intersectObjects = [];

const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

camera.position.set(18.95, 27.6, -36.29);
camera.zoom = 3.5;
camera.updateProjectionMatrix();

const cameraOffset = new THREE.Vector3(18.95, 27.6, -36.29);

const sun = new THREE.DirectionalLight(0xffe484, 6);
sun.castShadow = true;
sun.position.set(35, 75, 15);
sun.target.position.set(20, 0, 0);
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -75;
sun.shadow.camera.right = 75;
sun.shadow.camera.top = 75;
sun.shadow.camera.bottom = -75;
sun.shadow.normalBias = 0.05;
sun.shadow.radius = 30;
scene.add(sun);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x0099ff, 3);
scene.add(hemisphereLight);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.2;

/* ------------------------------------------------------------------ *
 * LOAD MODEL
 * ------------------------------------------------------------------ */
function groupMeshesPivoted(meshes, groupName) {
    scene.updateWorldMatrix(true, true);

    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // pivot at bottom-centre, so scaling squashes toward the ground
    center.y -= size.y / 2;

    const pivot = new THREE.Group();
    pivot.name = groupName;
    pivot.position.copy(center);
    scene.add(pivot);

    meshes.forEach((m) => pivot.attach(m));
    return pivot;
}

const loader = new GLTFLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

/* Paint `url` onto a model's picture board.
 *
 * The board is the mesh that already has an image texture from Blender, so
 * the UV unwrap comes from the model and the image lands exactly where the
 * old one did. Nothing here can create UVs - pointing this at a surface
 * that was never textured in Blender will look stretched. */
function setBoardImage(pivot, url, key) {
    const meshes = [];
    pivot.traverse((o) => { if (o.isMesh && o.material) meshes.push(o); });

    const board =
        meshes.find((m) => m.material.name === BOARD_MATERIAL) ??
        meshes.find((m) => m.material.map);

    if (!board) {
        console.warn(
            `"${key}": couldn't find a picture board for ${url}. ` +
            `Materials in this model: ${meshes.map((m) => m.material.name || "(unnamed)").join(", ")}. ` +
            `Set BOARD_MATERIAL to the right one.`
        );
        return;
    }

    textureLoader.load(url, (texture) => {
        // glTF UVs put the origin top-left; TextureLoader assumes bottom-left.
        // If an image comes out upside down, flip this.
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        // crisp pixels up close, mipmaps so it doesn't shimmer at distance
        texture.magFilter = THREE.NearestFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        // clone first: Blender often shares one material across all the signs,
        // and assigning to a shared material would repaint every board
        board.material = board.material.clone();
        board.material.map = texture;
        board.material.color.set(0xffffff);  // don't tint the image
        board.material.needsUpdate = true;
    }, undefined, () => {
        console.warn(`"${key}": couldn't load ${url}. Check the path and that you're serving over http, not file://.`);
    });
}

/* Which registry entry owns this mesh? Checks the mesh's own name then
 * walks up its ancestors, so it works whether a model arrives as one
 * node, a node split into primitives (sign001 > sign001_0, _1), or a
 * parent with arbitrarily named children. */
function ownerKey(mesh, root) {
    for (let o = mesh; o && o !== root; o = o.parent) {
        const name = norm(o.name);
        if (exactKeys.has(name)) return exactKeys.get(name);
        const match = prefixKeys.find((p) => name.startsWith(p.prefix));
        if (match) return match.key;
    }
    return null;
}

function isCollider(mesh, root) {
    for (let o = mesh; o && o !== root; o = o.parent) {
        if (norm(o.name) === norm(COLLIDER_NAME)) return true;
    }
    return false;
}

loader.load(MODEL_FILE, (glb) => {
    scene.add(glb.scene);

    const meshesByKey = new Map(Object.keys(interactive).map((key) => [key, []]));
    const debugRows = [];
    let colliderFound = false;

    glb.scene.traverse((child) => {
        if (!child.isMesh) return;

        child.castShadow = true;
        child.receiveShadow = true;

        const materialName = child.material?.name;
        if (materialName === "Material.028" || materialName === "Material.025") {
            child.material.color.setHex(0xec5800);
        }
        if (materialName === "Material.022") {
            child.material.color.setHex(0xd68e52);
        }

        if (isCollider(child, glb.scene)) {
            child.visible = false;
            colliderOctree.fromGraphNode(child);
            colliderFound = true;
            return;
        }

        const key = ownerKey(child, glb.scene);
        if (key) meshesByKey.get(key).push(child);

        if (DEBUG_NAMES) {
            debugRows.push({ mesh: child.name, parent: child.parent?.name ?? "", entry: key ?? "-" });
        }
    });

    if (!colliderFound) {
        console.warn(
            `No "${COLLIDER_NAME}" found - the character will fall through the floor. ` +
            `It's hidden in Blender, so check the glTF export isn't limited to visible objects.`
        );
    }

    for (const [key, meshes] of meshesByKey) {
        if (!meshes.length) {
            console.warn(`Nothing in the .glb matched "${key}" - that entry is inactive.`);
            continue;
        }

        // one pivot per entry, so the whole model scales and hops together
        const pivot = groupMeshesPivoted(meshes, `${norm(key)}Group`);
        groupOf.set(key, pivot);

        // only clickable things go in the raycast list and the lookup used to
        // resolve hovers - the player's own group is grouped but not clickable
        const item = interactive[key];
        if (item.jump || item.modal) {
            intersectObjects.push(pivot);
            keyOfObject.set(pivot, key);
        }
        if (item.image) setBoardImage(pivot, item.image, key);
    }

    if (DEBUG_NAMES) {
        console.info("Every mesh in the .glb and the entry that claimed it:");
        console.table(debugRows);
    }

    character.instance = groupOf.get(playerKey) ?? null;
    if (character.instance) {
        character.spawnPosition.copy(character.instance.position);
        resetCollider();
    }
}, undefined, (error) => {
    // without this the loading screen sits there forever and the reason is
    // buried in the network tab
    console.error(`Couldn't load ${MODEL_FILE}`, error);
    const text = loadingScreen.querySelector(".loading-text");
    if (text) text.textContent = `Couldn't load ${MODEL_FILE} - check the filename and that you're serving over http.`;
});

/* ------------------------------------------------------------------ *
 * MODAL
 * ------------------------------------------------------------------ */
function showModal(id) {
    const entry = getInteractive(id);
    const project = entry?.modal;
    if (!project) return;

    // the sign's own image doubles as the modal image unless overridden
    const image = project.image ?? entry.image;

    isModalOpen = true;
    modal.classList.remove("hidden");
    modalTitle.textContent = project.title;

    const paragraphs = project.body
        .split(/\n\s*\n/)
        .map((text) => `<p>${text.trim()}</p>`)
        .join("");

    // extra images, under the description
    const shots = (project.gallery ?? []).map((item) => {
        const [url, caption] = Array.isArray(item) ? item : [item, ""];
        return `<figure class="modal-shot">` +
               `<img src="${url}" alt="${caption || project.title}" loading="lazy" decoding="async">` +
               (caption ? `<figcaption>${caption}</figcaption>` : "") +
               `</figure>`;
    }).join("");

    modalBody.innerHTML = [
        project.subtitle ? `<p class="modal-subtitle">${project.subtitle}</p>` : "",
        image ? `<img class="modal-image" src="${image}" alt="">` : "",
        project.tags?.length
            ? `<div class="modal-tags">${project.tags
                  .map((tag) => `<span class="modal-tag">${tag}</span>`)
                  .join("")}</div>`
            : "",
        `<div class="modal-project-description">${paragraphs}</div>`,
        shots ? `<div class="modal-gallery">${shots}</div>` : "",
        project.links?.length
            ? `<div class="modal-links">${project.links
                  .map(([label, url]) =>
                      `<a class="modal-project-visit-button" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`)
                  .join("")}</div>`
            : "",
    ].join("");
}

function hideModal() {
    isModalOpen = false;
    modal.classList.add("hidden");
    modalBody.innerHTML = "";
}

/* ------------------------------------------------------------------ *
 * SQUASH & STRETCH
 * ------------------------------------------------------------------ */
// multipliers of the object's own scale, so any model can use them
const CLICK_SQUASH  = { x: 1.15, y: 0.80, z: 1.15 };
const CLICK_STRETCH = { x: 0.90, y: 1.15, z: 0.90 };
const CLICK_LAND    = { x: 1.12, y: 0.85, z: 1.12 };
const LANDING_SQUASH = { x: 1.1, y: 0.98, z: 1.1 };
const TAKEOFF_SQUASH = { x: 1.1, y: 0.9, z: 1.1 };
const TAKEOFF_STRETCH = { x: 0.9, y: 1.1, z: 0.9 };

function scaleTo(base, multiplier) {
    return {
        x: base.x * multiplier.x,
        y: base.y * multiplier.y,
        z: base.z * multiplier.z,
    };
}

function jumpCharacter(key) {
    if (isJumping) return;

    // the pivot group, so every mesh in the model moves together
    const mesh = groupOf.get(key);
    if (!mesh) return;

    isJumping = true;

    const base = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
    const jumpHeight = 2;
    const duration = 0.6;

    gsap.killTweensOf(mesh.scale);
    gsap.killTweensOf(mesh.position);

    const tl = gsap.timeline({ onComplete: () => { isJumping = false; } });

    tl.to(mesh.scale, {
        ...scaleTo(base, CLICK_SQUASH),
        duration: duration * 0.1,
        ease: "power2.out",
    });
    tl.to(mesh.scale, {
        ...scaleTo(base, CLICK_STRETCH),
        duration: duration * 0.15,
        ease: "power2.out",
    });
    tl.to(mesh.position, {
        y: `+=${jumpHeight}`,
        duration: duration * 0.4,
        ease: "power2.out",
    }, "<");
    tl.to(mesh.scale, {
        ...scaleTo(base, CLICK_LAND),
        duration: duration * 0.3,
        ease: "power2.in",
    });
    tl.to(mesh.scale, {
        ...base,
        duration: duration * 0.25,
        ease: "elastic.out(1, 0.3)",
    });
    tl.to(mesh.position, {
        y: `-=${jumpHeight}`,
        duration: duration * 0.4,
        ease: "bounce.out",
    }, "<");
}

/* ------------------------------------------------------------------ *
 * PLAYER
 * ------------------------------------------------------------------ */
function resetCollider() {
    playerCollider.start
        .copy(character.spawnPosition)
        .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
    playerCollider.end
        .copy(character.spawnPosition)
        .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
}

function respawnCharacter() {
    if (!character.instance) return;
    playerVelocity.set(0, 0, 0);
    character.instance.position.copy(character.spawnPosition);
    resetCollider();
}

function playerCollisions() {
    const result = colliderOctree.capsuleIntersect(playerCollider);
    const wasOnFloor = playerOnFloor;
    playerOnFloor = false;
    if (!result) return;

    playerOnFloor = result.normal.y > 0;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));

    if (playerOnFloor && !wasOnFloor) {
        gsap.killTweensOf(character.instance.scale);
        character.instance.scale.set(1, 1, 1);
        gsap.timeline()
            .to(character.instance.scale, { ...LANDING_SQUASH, duration: 0.1, ease: "power2.in" })
            .to(character.instance.scale, { x: 1, y: 1, z: 1, duration: 0.2, ease: "bounce.out" });
    }
}

function updatePlayer(delta) {
    if (!character.instance || isModalOpen) return;

    if (character.instance.position.y < -20) {
        respawnCharacter();
        return;
    }

    const now = performance.now();
    const damping = 0.9;
    playerVelocity.x *= damping;
    playerVelocity.z *= damping;

    const direction = new THREE.Vector3();
    if (keyStates["w"] || keyStates["arrowup"]) direction.z += 1;
    if (keyStates["s"] || keyStates["arrowdown"]) direction.z -= 1;
    if (keyStates["a"] || keyStates["arrowleft"]) direction.x += 1;
    if (keyStates["d"] || keyStates["arrowright"]) direction.x -= 1;

    const isMoving = direction.length() > 0;

    if (isMoving) {
        lastMoveTime = now;
        if (isUiVisible) {
            isUiVisible = false;
            gsap.to(uiOverlay, { opacity: 0, duration: 0.5 });
        }
    } else if (!isUiVisible && now - lastMoveTime > 1300) {
        isUiVisible = true;
        gsap.to(uiOverlay, { opacity: 1, duration: 0.5 });
    }

    if (isMoving) {
        direction.normalize();
        playerVelocity.x = direction.x * MOVE_SPEED;
        playerVelocity.z = direction.z * MOVE_SPEED;
        targetRotation = Math.atan2(direction.x, direction.z);

        if (playerOnFloor && now - lastHopTime > HOP_COOLDOWN) {
            playerVelocity.y = HOP_HEIGHT;
            lastHopTime = now;

            gsap.killTweensOf(character.instance.scale);
            gsap.timeline()
                .to(character.instance.scale, { ...TAKEOFF_SQUASH, duration: 0.05, ease: "power2.out" })
                .to(character.instance.scale, { ...TAKEOFF_STRETCH, duration: 0.1, ease: "power2.out" })
                .to(character.instance.scale, { x: 1, y: 1, z: 1, duration: 0.15, ease: "bounce.out" });
        }
    }

    if (!playerOnFloor) playerVelocity.y -= GRAVITY * delta;

    playerCollider.translate(playerVelocity.clone().multiplyScalar(delta));
    playerCollisions();

    character.instance.position.copy(playerCollider.start);
    character.instance.position.y -= CAPSULE_RADIUS;

    let rotationDiff = targetRotation - character.instance.rotation.y;
    while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;
    character.instance.rotation.y += rotationDiff * 0.2;
}

/* ------------------------------------------------------------------ *
 * DAY / NIGHT
 * ------------------------------------------------------------------ */
const dayPreset = {
    sunIntensity: 6,
    sunColor: new THREE.Color(0xffe484),
    hemiIntensity: 3,
    hemiColor: new THREE.Color(0xffffbb),
    background: new THREE.Color(0x87ceeb),
    icon: "fa-sun",
};
const nightPreset = {
    sunIntensity: 3,
    sunColor: new THREE.Color(0xaaccff),
    hemiIntensity: 2,
    hemiColor: new THREE.Color(0x2e4482),
    background: new THREE.Color(0x8080cc),
    icon: "fa-moon",
};

function toggleDayNight() {
    isNight = !isNight;
    const preset = isNight ? nightPreset : dayPreset;
    const previous = isNight ? dayPreset : nightPreset;
    const duration = 1.5;
    const ease = "power2.out";

    dayNightButton.classList.toggle("night-mode", isNight);
    const icon = dayNightButton.querySelector("i");
    icon.classList.remove(previous.icon);
    icon.classList.add(preset.icon);

    gsap.to(sun, { intensity: preset.sunIntensity, duration, ease });
    gsap.to(sun.color, { ...preset.sunColor, duration, ease });
    gsap.to(hemisphereLight, { intensity: preset.hemiIntensity, duration, ease });
    gsap.to(hemisphereLight.color, { ...preset.hemiColor, duration, ease });
    gsap.to(scene.background, { ...preset.background, duration, ease });
}

/* ------------------------------------------------------------------ *
 * EVENTS
 * ------------------------------------------------------------------ */
function onResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    const aspect = sizes.width / sizes.height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    if (isModalOpen) {
        if (!modal.contains(event.target)) hideModal();
        return;
    }

    const item = getInteractive(intersectObject);
    if (!item) return;

    // both, so a project sign hops as it opens. Change the second `if` to
    // `else if` if you'd rather they be exclusive.
    if (item.jump) jumpCharacter(intersectObject);
    if (item.modal) showModal(intersectObject);
}

function onKeyDown(event) {
    if (isModalOpen) {
        if (event.key === "Escape") hideModal();
        return;
    }
    keyStates[event.key.toLowerCase()] = true;
    if (event.key.toLowerCase() === "r") respawnCharacter();
}

function onKeyUp(event) {
    keyStates[event.key.toLowerCase()] = false;
}

window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

dayNightButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDayNight();
});

modalExitButton.addEventListener("click", (event) => {
    event.stopPropagation();
    hideModal();
});

/* ------------------------------------------------------------------ *
 * HOVER + LOOP
 * ------------------------------------------------------------------ */
/* Walk up from the hit mesh until we reach a pivot group we built. Matching
 * on object identity means mesh naming in the .glb can't break this. */
function resolveInteractive(object) {
    for (let o = object; o; o = o.parent) {
        const key = keyOfObject.get(o);
        if (key) return key;
    }
    return "";
}

function updateHover() {
    if (isModalOpen) {
        intersectObject = "";
        document.body.style.cursor = "default";
        return;
    }

    raycaster.setFromCamera(pointer, camera);
    // `true` = search children too, so registering a parent covers its meshes
    const intersects = raycaster.intersectObjects(intersectObjects, true);

    intersectObject = intersects.length ? resolveInteractive(intersects[0].object) : "";
    document.body.style.cursor = intersectObject ? "pointer" : "default";
}

function animate() {
    const delta = Math.min(clock.getDelta(), 0.1);

    updatePlayer(delta);

    if (character.instance) {
        camera.position.set(
            character.instance.position.x + cameraOffset.x,
            cameraOffset.y,
            character.instance.position.z + cameraOffset.z
        );
        camera.lookAt(
            character.instance.position.x,
            camera.position.y - 24,
            character.instance.position.z
        );
        camera.updateMatrixWorld(true);
    }

    updateHover();
    renderer.render(scene, camera);
}

/* Swap a sign's picture from the browser console, without reloading:
 *   setSignImage("sign.003", "./images/whatever.png")
 * Handy for working out which board is which. Put the winning path into the
 * registry's `image` field once you're happy. */
window.setSignImage = (key, url) => {
    const pivot = groupOf.get(key);
    if (!pivot) {
        console.warn(`No model loaded for "${key}". Known: ${[...groupOf.keys()].join(", ")}`);
        return;
    }
    setBoardImage(pivot, url, key);
};

renderer.setAnimationLoop(animate);