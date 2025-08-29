import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Octree} from 'three/addons/math/Octree.js';
import {Capsule} from "three/addons/math/Capsule.js";



const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// init
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//Physics stuff
const GRAVITY = 30;
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HEIGHT = 1;
const JUMP_HEIGHT = 11;
const MOVE_SPEED = 3;

let character = {
    instance: null,
    isMoving: false,
};

let targetRotation = 0;
let playerVelocity = new THREE.Vector3();
let playerOnFloor = false;

const colliderOctree = new Octree();

const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
);
const modalContent = {
    "KennyJamSign002":{
        title: "Project One",
        content: "This is project one, hello world",
        link: "https://www.example.com/",
    },
    "task_tide_sign001":{
        title: "Project Two",
        content: "This is project two, hello world",
        link: "https://www.example.com/",
    },
    "art_sign001":{
        title: "Project Three",
        content: "This is project three, hello world",
        link: "https://www.example.com/",
    },
}
const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(".modal-project-description");

const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitProjectButton = document.querySelector(".modal-project-visit-button");

function showModal(id){
    const content = modalContent[id];
    if(content){
        modalTitle.textContent = content.title;
        modalProjectDescription.textContent = content.content;
        
        if(content.link){
            modalVisitProjectButton.href = content.link;
            modalVisitProjectButton.classList.remove("hidden");
        } else{
            modalVisitProjectButton.classList.add("hidden");
        }
        modal.classList.toggle("hidden");
    }
}

function hideModal(){
    modal.classList.toggle("hidden");
}

let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = [
    "artProject",
    "CharacterGroup",
    "FountainGroup",
    "kennyJamProject",
    "mainParkSign",
    "miso",
    "projectsSign",
    "taskTideProject",
];
const canvas = document.getElementById("experience-canvas");
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -50, 1, 1500);
const scene = new THREE.Scene();

const loader = new GLTFLoader();

//loading model
loader.load( "./first3jsproject.glb", function ( glb ) {
    scene.add(glb.scene);
    const characterMeshes = [];
    const fountainMeshes = [];

    glb.scene.traverse((child)=>{
        if(child.isMesh){
            console.log(child);
            if (child.isMesh && child.name.startsWith("character")) characterMeshes.push(child);
            if (child.isMesh && child.name.startsWith("fountain")) fountainMeshes.push(child);
            child.castShadow = true;
            child.receiveShadow = true;
            
            //change pot material
            if (child.material.name === "Material.028" || child.material.name === "Material.025"){
                child.material.color.setHex(0xEC5800);
            }
            //change path material
            if (child.material && child.material.name === "Material.022") {
                child.material.color.setHex(0xD68E52);
            }
        }
        if(intersectObjectsNames.includes(child.name)){
            intersectObjects.push(child);
        }
        if(child.name === "GroundCollider"){
            colliderOctree.fromGraphNode(child);
        }
    })
     // 3) Build pivoted groups (no extra scene.add needed inside your code now)
    const characterGroup = groupMeshesPivoted(scene, characterMeshes, "CharacterGroup");
    const fountainGroup  = groupMeshesPivoted(scene, fountainMeshes, "FountainGroup");

    // 4) Raycasting: add meshes inside the groups
    if (intersectObjectsNames.includes("CharacterGroup")) {
        characterGroup.traverse(c => c.isMesh && intersectObjects.push(c));
        playerCollider.start
            .copy(characterGroup.position.y)
            .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
        playerCollider.end
            .copy(characterGroup.position)
            .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
    }
    if (intersectObjectsNames.includes("FountainGroup")) {
        fountainGroup.traverse(c => c.isMesh && intersectObjects.push(c));
    }

    // 5) Use the pivot as the character instance
    character.instance = characterGroup;
    playerCollider.start
        .copy(character.instance.position)
        .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
    playerCollider.end
        .copy(character.instance.position)
        .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
});


//sun
const sun = new THREE.DirectionalLight( 0xFFE484, 6);
sun.castShadow = true;
sun.position.set(35,75,15);
sun.target.position.set(20,0,0);
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -75;
sun.shadow.camera.right = 75;
sun.shadow.camera.top = 75;
sun.shadow.camera.bottom = -75;
sun.shadow.normalBias = 0.05;
sun.shadow.radius = 30;
scene.add( sun );


//hemisphere light/helper
const HemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x0099FF, 3 );
scene.add( HemisphereLight );
// const HemisphereLightHelper = new THREE.HemisphereLightHelper( HemisphereLight, 5 );
// scene.add( HemisphereLightHelper );

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );
//const helper = new THREE.DirectionalLightHelper( sun, 5 );
//scene.add( helper );

// const light = new THREE.AmbientLight( 0x87CEEB, 0 ); // soft white light
// scene.add( light );

const renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setAnimationLoop( animate );


camera.position.x = 10;
camera.position.y = 19;
camera.position.z = -51;

const controls = new OrbitControls(camera, canvas);
controls.update();


function groupMeshesPivoted(scene, meshes, groupName = "Group") {
scene.updateWorldMatrix(true, true);


const box = new THREE.Box3();
meshes.forEach(m => box.expandByObject(m));
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());


// Move pivot to bottom-center instead of middle (feet placement)
center.y -= size.y / 2;


const pivot = new THREE.Group();
pivot.name = groupName;
pivot.position.copy(center);
scene.add(pivot);


meshes.forEach(m => pivot.attach(m));


return pivot;
}

// --- Debug: draw capsule wireframe ---
function debugCapsule(capsule, scene) {
const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
const geometry = new THREE.BufferGeometry();
const points = [];


const start = capsule.start.clone();
const end = capsule.end.clone();
const radius = capsule.radius;
const segments = 16;


// Cylinder side lines
for (let i = 0; i < segments; i++) {
const theta = (i / segments) * Math.PI * 2;
const x = Math.cos(theta) * radius;
const z = Math.sin(theta) * radius;
points.push(new THREE.Vector3(start.x + x, start.y, start.z + z));
points.push(new THREE.Vector3(end.x + x, end.y, end.z + z));
}


// Top hemisphere
for (let i = 0; i <= segments; i++) {
const theta = (i / segments) * Math.PI;
const x = Math.cos(theta) * radius;
const y = Math.sin(theta) * radius;
points.push(new THREE.Vector3(end.x + x, end.y + y, end.z));
}


// Bottom hemisphere
for (let i = 0; i <= segments; i++) {
const theta = (i / segments) * Math.PI;
const x = Math.cos(theta) * radius;
const y = Math.sin(theta) * radius;
points.push(new THREE.Vector3(start.x + x, start.y - y, start.z));
}


geometry.setFromPoints(points);
const line = new THREE.LineSegments(geometry, material);
scene.add(line);


setTimeout(() => scene.remove(line), 50); // remove after a short time
}


function onResize(){
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width/sizes.height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onClick(){
    if(intersectObject !== ""){
        if (["Miso","ProjectsSign","MainParkSign"].includes(intersectObject)){
            jumpCharacter(intersectObject);
        }else{
            showModal(intersectObject);
        }
    }
    console.log(intersectObject);
}

// --- Squash & Stretch Settings for click-based jumps ---
const CLICK_SQUASH  = { x: 1.2, y: 0.8, z: 1.2 };  // on crouch
const CLICK_STRETCH = { x: 0.8, y: 1.3, z: 0.8 };  // on launch
const CLICK_LAND    = { x: 1.1, y: 0.9, z: 1.1 };  // on landing

function jumpCharacter(meshID) {
    const mesh = scene.getObjectByName(meshID);
    const jumpHeight = 2;
    const jumpDuration = 0.6;

    const originalScale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z}
    // --- Kill old tweens and reset scale/position ---
    gsap.killTweensOf(mesh.scale);
    gsap.killTweensOf(mesh.position);

    const tl = gsap.timeline();

    // Takeoff squash
    tl.to(mesh.scale, {
        
        ...CLICK_SQUASH,
        duration: jumpDuration * 0.2,
        ease: "power2.out",
    });
    // Stretch upward
    tl.to(mesh.scale, {
        ...CLICK_STRETCH,
        duration: jumpDuration * 0.2,
        ease: "power2.out",
    });

    // Jump up
    tl.to(mesh.position, {
        y: `+=${Math.abs(jumpHeight)}`,
        duration: jumpDuration * 0.4,
        ease: "power2.out",
    }, "<");
    // Landing squash
    tl.to(mesh.scale, {
        ...CLICK_LAND,
        duration: jumpDuration * 0.15,
        ease: "power2.in",
    });

    // Bounce back to normal
    tl.to(mesh.scale, {
        x: originalScale.x, y: originalScale.y, z: originalScale.z,
        duration: jumpDuration * 0.25,
        ease: "elastic.out(1, 0.3)",
    });

    // Return to ground
    tl.to(mesh.position, {
        y: `-=${Math.abs(jumpHeight)}`,
        duration: jumpDuration * 0.4,
        ease: "bounce.out",
    }, "<");

}





// --- Squash & Stretch Settings ---
const TAKEOFF_SQUASH = {x: 1.1, y: 0.9, z: 1.1};
const TAKEOFF_STRETCH = {x: .9, y: 1.2, z: .9};
const LANDING_SQUASH = {x: 1.1, y: .98, z: 1.1};

function playerCollisions() {
    const result = colliderOctree.capsuleIntersect(playerCollider);
    let wasOnFloor = playerOnFloor; // track previous state
    playerOnFloor = false;

    if (result) {
        playerOnFloor = result.normal.y > 0;
        playerCollider.translate(result.normal.multiplyScalar(result.depth));

        if (playerOnFloor) {
            character.isMoving = false;
            playerVelocity.x = 0;
            playerVelocity.z = 0;

            // --- NEW: landing squash ---
            if (!wasOnFloor) {
                // --- Landing squash ---
                gsap.killTweensOf(character.instance.scale);
                character.instance.scale.set(1, 1, 1);

                const tl = gsap.timeline();
                tl.to(character.instance.scale, {
                    ...LANDING_SQUASH,
                    duration: 0.1,
                    ease: "power2.in",
                })
                .to(character.instance.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.2,
                    ease: "bounce.out",
                });
            }
        }
    }
}


// Track pressed keys
const keyStates = {};
let activeKey = null;          // the single movement key being honored
let lastHopTime = 0;           // cooldown
const HOP_COOLDOWN = 300;      // ms between hops

// --- Input events ---
function onKeyDown(event) {
    const key = event.key.toLowerCase();

    // If we already have an active key, ignore others (no diagonals)
    if (!activeKey) {
        activeKey = key;
        keyStates[key] = true;
    }
}

function onKeyUp(event) {
    const key = event.key.toLowerCase();
    keyStates[key] = false;

    // Release active key if lifted
    if (key === activeKey) {
        activeKey = null;
    }
}

function updatePlayer() {
    if (!character.instance) return;

    // Gravity
    if (!playerOnFloor) {
        playerVelocity.y -= GRAVITY * 0.01;
    }

    const now = performance.now();

    // If on floor and cooldown passed → set new hop direction
    if (activeKey && playerOnFloor && now - lastHopTime > HOP_COOLDOWN) {
        const moveDist = MOVE_SPEED;

        // Reset old horizontal velocity only when starting a new hop
        playerVelocity.x = 0;
        playerVelocity.z = 0;

        switch (activeKey) {
            case "w":
            case "arrowup":
                playerVelocity.z += moveDist;
                targetRotation = 0;
                break;
            case "s":
            case "arrowdown":
                playerVelocity.z -= moveDist;
                targetRotation = Math.PI;
                break;
            case "a":
            case "arrowleft":
                playerVelocity.x += moveDist;
                targetRotation = Math.PI / 2;
                break;
            case "d":
            case "arrowright":
                playerVelocity.x -= moveDist;
                targetRotation = -Math.PI / 2;
                break;
        }

        // hop upward
        playerVelocity.y = JUMP_HEIGHT;
        lastHopTime = now;

        // --- Takeoff squash & stretch ---
        gsap.killTweensOf(character.instance.scale);
        character.instance.scale.set(1, 1, 1);

        const tl = gsap.timeline();
        tl.to(character.instance.scale, {
            ...TAKEOFF_SQUASH,
            duration: 0.1,
            ease: "power2.out",
        })
        .to(character.instance.scale, {
            ...TAKEOFF_STRETCH,
            duration: 0.2,
            ease: "power2.out",
        })
        .to(character.instance.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.3,
            ease: "bounce.out",
        });

    }

    // Apply velocity
    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.01));
    playerCollisions();

    // Update instance position
    character.instance.position.copy(playerCollider.start);
    character.instance.position.y -= CAPSULE_RADIUS;

    // Smooth rotation
    character.instance.rotation.y = THREE.MathUtils.lerp(
        character.instance.rotation.y,
        targetRotation,
        0.1
    );
}



// --- Listeners ---
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);



modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown);
// animation
function animate() {
    updatePlayer();
    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( intersectObjects);

    //hover behaviour
    if (intersects.length > 0){
        document.body.style.cursor = "pointer";
    } else{
        document.body.style.cursor = "default";
        intersectObject = "";
    }

	for ( let i = 0; i < intersects.length; i ++ ) {
        intersectObject = intersects[0].object.parent.name;
	}
    debugCapsule(playerCollider, scene);
	renderer.render( scene, camera );
}

renderer.setAnimationLoop(animate);