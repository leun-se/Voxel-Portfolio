import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// init
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


let character = {
    instance: null,
    moveDistance: 1.75,
    jumpHeight: 1,
    isMoving: false,
    moveDuration: 0.2,
};

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
    "projectSign",
    "taskTideProject",
];
const canvas = document.getElementById("experience-canvas");
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -50, 1, 1500);
const scene = new THREE.Scene();

const loader = new GLTFLoader();

//loading model
loader.load( "./first4jsproject.glb", function ( glb ) {
    scene.add(glb.scene);

    const characterMeshes = [];
    const fountainMeshes = [];

    glb.scene.traverse((child)=>{
        if(child.isMesh){
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
    })
     // 3) Build pivoted groups (no extra scene.add needed inside your code now)
    const characterGroup = groupMeshesPivoted(scene, characterMeshes, "CharacterGroup");
    const fountainGroup  = groupMeshesPivoted(scene, fountainMeshes, "FountainGroup");

    // 4) Raycasting: add meshes inside the groups
    if (intersectObjectsNames.includes("CharacterGroup")) {
        characterGroup.traverse(c => c.isMesh && intersectObjects.push(c));
    }
    if (intersectObjectsNames.includes("FountainGroup")) {
        fountainGroup.traverse(c => c.isMesh && intersectObjects.push(c));
    }

    // 5) Use the pivot as the character instance
    character.instance = characterGroup;
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


// --- Pivoted grouping that preserves size, rotation, position ---
function groupMeshesPivoted(scene, meshes, groupName = "Group") {
    // Make sure world matrices include any transforms from parents (like glb.scene)
    scene.updateWorldMatrix(true, true);

    // World-space bounding box across all meshes
    const box = new THREE.Box3();
    meshes.forEach(m => box.expandByObject(m));
    const center = box.getCenter(new THREE.Vector3());

    // Create a pivot at the world center and add to the scene
    const pivot = new THREE.Group();
    pivot.name = groupName;
    pivot.position.copy(center);
    scene.add(pivot);

    // Reparent while preserving world transforms
    meshes.forEach(m => pivot.attach(m));

    return pivot;
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
        showModal(intersectObject);
    }
    console.log(intersectObject);
}

function moveCharacter(targetPosition, targetRotation){
    character.isMoving = true;

    const t1 = gsap.timeline({
        onComplete: ()=>{
            character.isMoving = false;
        }
    })

    t1.to(character.instance.position, {
        x: targetPosition.x,
        z: targetPosition.z,
        duration: character.moveDuration,
    });
    t1.to(character.instance.rotation, {
        y: targetRotation,
        duration: character.moveDuration,
    });
}
function onKeyDown(event) {
    if (character.isMoving) return;

    const targetPosition = new THREE.Vector3().copy(character.instance.position);
    const moveDist = character.moveDistance;

    switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
            targetPosition.z += moveDist;
            break;

        case "s":
        case "arrowdown":
            targetPosition.z -= moveDist;
            break;

        case "a":
        case "arrowleft":
            targetPosition.x += moveDist;
            break;

        case "d":
        case "arrowright":
            targetPosition.x -= moveDist;
            break;

        default:
            return;
    }

    // 👉 Compute direction vector from current pos → target pos
    const dir = new THREE.Vector3().subVectors(targetPosition, character.instance.position);
    // 👉 Convert direction to rotation angle (Y-axis, since it's top-down)
    const targetRotation = Math.atan2(dir.x, dir.z);

    moveCharacter(targetPosition, targetRotation);
}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown);
// animation
function animate() {

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
	renderer.render( scene, camera );
}

renderer.setAnimationLoop(animate);