import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// init
const canvas = document.getElementById("experience-canvas");
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -50, 1, 1500);
const scene = new THREE.Scene();

const loader = new GLTFLoader();

loader.load( "./first4jsproject.glb", function ( glb ) {
    glb.scene.traverse(child=>{
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    scene.add( glb.scene );
}, 
    undefined, 
    function ( error ) {
    console.error( error );
} 
);
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
//increase softness of light
sun.shadow.radius = 30;
scene.add( sun );

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );
const helper = new THREE.DirectionalLightHelper( sun, 5 );
scene.add( helper );

const light = new THREE.AmbientLight( 0x87CEEB, 2 ); // soft white light
scene.add( light );

const renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;

renderer.setAnimationLoop( animate );


camera.position.x = 10;
camera.position.y = 19;
camera.position.z = -51;

const controls = new OrbitControls(camera, canvas);
controls.update();



function handleResize(){
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

window.addEventListener("resize", handleResize);

// animation
function animate( time ) {
    controls.update();
    //console.log(camera.position);
	renderer.render( scene, camera );

}

