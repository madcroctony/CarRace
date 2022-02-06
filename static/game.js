
const socket = io();
const canvas2d = $('#canvas-2d')[0];
const context = canvas2d.getContext('2d');
const canvas3d = $('#canvas-3d')[0];
const playerImage = $("#player-image")[0];
const tekiImage = $("#teki-image")[0];

const renderer = new THREE.WebGLRenderer({canvas: canvas3d});
renderer.setClearColor('black');
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, 1, 0.1, 2000 );

// Floor
const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
const floorMaterial = new THREE.MeshLambertMaterial({color : 'orange'});
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial); //sector1
const floorMesh2 = new THREE.Mesh(floorGeometry, floorMaterial); //sector2
const floorMesh3 = new THREE.Mesh(floorGeometry, floorMaterial); //sector3
const floorMesh4 = new THREE.Mesh(floorGeometry, floorMaterial); //sector4

floorMesh.position.set(500, 0, 500);
floorMesh.receiveShadow = true;
floorMesh.rotation.x = - Math.PI / 2; 
scene.add(floorMesh);

floorMesh2.position.set(500, 500, 500);
floorMesh2.receiveShadow = true;
floorMesh2.rotation.x = - Math.PI / 2; 
scene.add(floorMesh2);

floorMesh3.position.set(500, 1000, 500);
floorMesh3.receiveShadow = true;
floorMesh3.rotation.x = - Math.PI / 2; 
scene.add(floorMesh3);

floorMesh4.position.set(500, 1500, 500);
floorMesh4.receiveShadow = true;
floorMesh4.rotation.x = - Math.PI / 2; 
scene.add(floorMesh4);

camera.position.set(1000, 300, 1000);
camera.lookAt(floorMesh.position);

// Materials
const bulletMaterial = new THREE.MeshLambertMaterial( { color: 0x808080 } );
const teki_bulletMaterial = new THREE.MeshLambertMaterial( { color: "yellow" } );
const wallMaterial = new THREE.MeshLambertMaterial( { color: 'red' } );
const wallMaterial2 = new THREE.MeshLambertMaterial( { color: 'yellow' } );
const wallMaterial3 = new THREE.MeshLambertMaterial( { color: 'blue' } );
const wallMaterial4 = new THREE.MeshLambertMaterial( { color: 'green' } );
const wallMaterial5 = new THREE.MeshLambertMaterial( { color: 'orange' } );

const playerTexture = new THREE.Texture(playerImage);
const tekiTexture = new THREE.Texture(tekiImage);
playerTexture.needsUpdate = true;
tekiTexture.needsUpdate = true;
const playerMaterial = new THREE.MeshLambertMaterial({map: playerTexture});
const tekiMaterial = new THREE.MeshLambertMaterial({map: tekiTexture});
const textMaterial = new THREE.MeshBasicMaterial({ color: 0xf39800, side: THREE.DoubleSide });
const nicknameMaterial = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-100, 300, -100);
light.castShadow = true;
light.shadow.camera.left = -2000;
light.shadow.camera.right = 2000;
light.shadow.camera.top = 2000;
light.shadow.camera.bottom = -2000;
light.shadow.camera.far = 2000;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
scene.add(light);
const ambient = new THREE.AmbientLight(0x808080);
scene.add(ambient);

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();

function gameStart(){
    const nickname = $("#nickname").val();
    socket.emit('game-start', {nickname: nickname});
    $("#start-screen").hide();
    console.log("id gameStart = "+ socket.id);
}
$("#start-button").on('click', gameStart);

let movement = {};
$(document).on('keydown keyup', (event) => {
    const KeyToCommand = {
        'ArrowUp': 'forward',
        'ArrowDown': 'back',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
    };
    let command = KeyToCommand[event.key];
    if (event.keyCode == 71)
    {
        //G
        command = 'z_up';
    }

    else if (event.keyCode == 72)
    {
        //H
        command = 'z_down';
    }
    if(command){
        if(event.type === 'keydown'){
            console.log("socket.id = "+socket.id);
            movement[command] = true;
        }else{ /* keyup */
            console.log("socket.id = "+socket.id);
            movement[command] = false;
        }
        socket.emit('movement', movement);
    }
    if(event.key === ' ' && event.type === 'keydown'){
        socket.emit('shoot');
    }
    else if (event.keyCode == 67 && event.type === 'keydown')
    {
        //C
        socket.emit('shoot_left');
    }
    else if (event.keyCode == 78 && event.type === 'keydown')
    {
        //N
        socket.emit('shoot_right');
    }

    if (event.key === 'Enter' && event.type === 'keydown'){
        socket.emit("block");
    }
});

const touches = {};
$('#canvas-2d').on('touchstart', (event)=>{
    
    movement.forward = true;
    socket.emit('movement', movement);
    Array.from(event.changedTouches).forEach((touch) => {
        touches[touch.identifier] = {pageX: touch.pageX, pageY: touch.pageY};
    });
    event.preventDefault();
});
$('#canvas-2d').on('touchmove', (event)=>{
    movement.right = false;
    movement.left = false;
    Array.from(event.touches).forEach((touch) => {
        const startTouch = touches[touch.identifier];
        if (-50 <= touch.pageY - startTouch.pageY && touch.pageY - startTouch.pageY <= 50)
        {
            movement.right |= touch.pageX - startTouch.pageX > 30;
            movement.left |= touch.pageX - startTouch.pageX < -30;
        }
        else
        {
            if (touch.pageX - startTouch.pageX > 50 && touch.pageY - startTouch.pageY < -50)
            {
                socket.emit('shoot_right');
            }
            else if (touch.pageX - startTouch.pageX < -50 && touch.pageY - startTouch.pageY < -50)
            {
                socket.emit('shoot_left');
            }
            else
            {
                socket.emit('shoot');
            }
        }
    });
    socket.emit('movement', movement);
    event.preventDefault();
});
$('#canvas-2d').on('touchend', (event)=>{
    Array.from(event.changedTouches).forEach((touch) => {
        delete touches[touch.identifier];
    });
    if(Object.keys(touches).length === 0){
        movement = {};
        socket.emit('movement', movement);
    }
    event.preventDefault();
});

const Meshes = [];
socket.on('state', (players, bullets, walls, bots, teki_bullets) => {
    Object.values(Meshes).forEach((mesh) => {mesh.used = false;});
    
    // Players
    Object.values(players).forEach((player) => {
        console.log("id players = "+ socket.id);
        let playerMesh = Meshes[player.id];
        if(!playerMesh){
            playerMesh = new THREE.Group();
            playerMesh.castShadow = true;
            Meshes[player.id] = playerMesh;
            scene.add(playerMesh);
        }
        playerMesh.used = true;
        playerMesh.position.set(player.x + player.width/2, player.z + player.depth/2, player.y + player.height/2);
        playerMesh.rotation.y = - player.angle;
        
        if(!playerMesh.getObjectByName('body')){
            //glbファイルの読み込み
            const loader = new GLTFLoader();
    
            loader.load('static/1.glb', function(gltf) {
                model = gltf.scene;
                model.traverse((object) => { //モデルの構成要素
                    if(object.isMesh) { //その構成要素がメッシュだったら
                    object.material.trasparent = true;//透明許可
                    object.material.opacity = 0.8;//透過
                    object.material.depthTest = true;//陰影で消える部分
                    }})
                scene.add(model);
            }, undefined, function(e) {
                console.error(e);
            });
        }
        
        if(player.socketId === socket.id){
            // Your player
            camera.position.set(
                player.x + player.width/2 - 150 * Math.cos(player.angle),
                200 + player.z,
                player.y + player.height/2 - 150 * Math.sin(player.angle)
            );
            camera.rotation.set(0, - player.angle - Math.PI/2, 0);
            
            // Write to 2D canvas
            context.clearRect(0, 0, canvas2d.width, canvas2d.height);
            context.fillStyle = "orange";
            context.font = '30px Bold Arial';
            context.fillText(player.point + ' point', 20, 40);
            context.fillText(player.kill + ' kill', 20, 80);
            context.fillText(player.health + ' health', 20, 120);
        }
    });

    
    
    // Clear unused Meshes
    Object.keys(Meshes).forEach((key) => {
        const mesh = Meshes[key];
        if(!mesh.used){
            scene.remove(mesh);
            mesh.traverse((mesh2) => {
                if(mesh2.geometry){
                    mesh2.geometry.dispose();
                }
            });
            delete Meshes[key];
        }
    });
});

socket.on('dead', () => {
    $("#start-screen").show();
});