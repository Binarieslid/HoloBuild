let canvas = document.createElement(window.getViewMatrix ? 'canvas3D' : 'canvas');
if (!window.getViewMatrix) {
    document.body.appendChild(canvas);
    document.body.style.margin = document.body.style.padding = 0;
    canvas.style.width = canvas.style.height = "100%";
}



class HolographicCamera extends THREE.Camera {

    constructor () {
        super();
        this._holographicViewMatrix = new THREE.Matrix4();
        this._holographicTransformMatrix = new THREE.Matrix4();
        this._flipMatrix = new THREE.Matrix4().makeScale(-1, 1, 1);
    }

    update () {
        this._holographicViewMatrix.elements.set(window.getViewMatrix());
        this._holographicViewMatrix.multiply(this._flipMatrix);
        this._holographicTransformMatrix.getInverse(this._holographicViewMatrix);
        this._holographicTransformMatrix.decompose(this.position, this.quaternion, this.scale);
    }
}

let renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
let scene = new THREE.Scene();
let camera = window.getViewMatrix ? new HolographicCamera() : new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
let raycaster = new THREE.Raycaster();
let clock = new THREE.Clock();
let loader = new THREE.TextureLoader();
let material = new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, map: new THREE.DataTexture(new Uint8Array(3).fill(255), 1, 1, THREE.RGBFormat) });

let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
let pointLight = new THREE.PointLight(0xFFFFFF, 0.5);

let cube = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), material.clone());

renderer.setSize(window.innerWidth, window.innerHeight);
loader.setCrossOrigin('anonymous');
material.map.needsUpdate = true;

directionalLight.position.set(0, 1, 1);

cube.position.set(0, 0, -0.25);
cube.geometry.addAttribute('color', new THREE.BufferAttribute(Float32Array.from([
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // right - red
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // left - blue
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // top - green
    1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, // bottom - yellow
    0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, // back - cyan
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // front - purple
]), 3));
//loader.load('texture.png', tex => { cube.material.map = tex; start(); }, x => x, err => start());
loader.load('crate.gif', tex => { cube.material.map = tex; start(); }, x => x, err => start());
//loader.load('lava.jpg', tex => { cube.material.map = tex; start(); }, x => x, err => start());

cursor.position.set(0, 0, -1.5);
cursor.material.transparent = true;
cursor.material.opacity = 0.5;

scene.add(ambientLight);
scene.add(directionalLight);
scene.add(pointLight);
var light = new THREE.PointLight(0xffffff);
	light.position.set(0,150,100);
	scene.add(light);
var light2 = new THREE.AmbientLight(0x444444);
	scene.add(light2);
	
scene.add(cube);
camera.add(cursor);

cube.frustumCulled = false;

document.addEventListener( 'mousedown', onDocumentMouseDown, false );

var SPEED = 0.01;

function rotateCube() {
    cube2.rotation.x -= SPEED * 2;
    cube2.rotation.y -= SPEED;
    cube2.rotation.z -= SPEED * 3;
}
scene.add(camera);

var mouse = false;
mouse = new THREE.Vector2();
			function onDocumentMouseDown( event ) {
				//event.preventDefault();
        cube2.material.color.set(0xFFFF00);
			}

function initColors (geometry) {
    return geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.array.length).fill(1.0), 3));
}

var bl = true;

function update (delta, elapsed) {
    window.requestAnimationFrame(() => update(clock.getDelta(), clock.getElapsedTime()));
	pointLight.position.set(0 + 2.0 * Math.cos(elapsed * 0.5), 0, -1.5 + 2.0 * Math.sin(elapsed * 0.5));
    cube.rotation.y += 0.01;
    rotateCube();
    
    raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
    let intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
        cursor.material.color.set(0xFFFF00);
        cursor.material.opacity = 0.8;
        cursor.scale.set(2, 2, 2);
        intersects[0].face.color=new THREE.Color(0x222288); 
     //   intersects[0].object.geometry.colorsNeedUpdate = true;
     if (bl) {
     bl = false;
     loader.load('lava.jpg', tex => { cube.material.map = tex; }, x => x, x => x);
     }
    }
    else {
        cursor.material.color.set(0xFFFFFF);
        cursor.material.opacity = 0.5;
        cursor.scale.set(1, 1, 1);
        
        if (!bl) {
     bl = true;
     loader.load('crate.gif', tex => { cube.material.map = tex; }, x => x, x => x);
     }
    }

	if (camera.update) camera.update();
    
    renderer.render(scene, camera);
}

function start () {
    update(clock.getDelta(), clock.getElapsedTime());
}