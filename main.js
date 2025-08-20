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
const intersectObjects = [];
const intersectObjectsNames = [
    "Cube072",
    "Cube073",
    "Plane138",
    "Cube074",
    "Cube077",
    "Plane139",
    "Plane140",
    "Cube076",
];
const canvas = document.getElementById("experience-canvas");
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -50, 1, 1500);
const scene = new THREE.Scene();

const loader = new GLTFLoader();

//loading model
loader.load( "./first4jsproject.glb", function ( glb ) {
    glb.scene.traverse((child)=>{
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            console.log(child.name);
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
    scene.add( glb.scene );
}, 
    undefined, 
    function ( error ) {
    console.error( error );
} 
);

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
window.addEventListener("resize", onResize);
window.addEventListener("pointermove", onPointerMove);

// animation
function animate() {

    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( intersectObjects);

	for ( let i = 0; i < intersects.length; i ++ ) {
		intersects[ i ].object.material.color.set( 0xff0000 );
        console.log(intersects);
	}
	renderer.render( scene, camera );
}

renderer.setAnimationLoop(animate);