/**
 * @desc Used for creating the Game world of Morghol, an abandoned mineral planet
 */
import type Material from '../utils/Materials';
import Game from '../Game';
import type Loader from '../utils/Loader';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import type { Vector3 } from 'three';

class MultiplayerWorld extends Game {
  private server: WebSocket;

  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    loader: Loader,
    material: Material,
    camera: THREE.PerspectiveCamera
  ) {
    super(
      scene,
      world,
      loader,
      material,
      camera,
      'mineral.jpg',
      'space',
      '.jpg'
    );

    this.createStartingZone();
    this.addPhysicalStartingZone();
    this.createPlayer();
  }

  createGameMap() {
    throw new Error('Method not implemented.');
  }

  createFinishZone() {
    throw new Error('Method not implemented.');
  }

  // Mesh of starting zone
  createStartingZone() {
    const textureLoader = this.loader.getTextureLoader();
    const groundTexture = textureLoader.load('textures/test/iceTexture.jpg');

    const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 128, 128);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.material.side = THREE.DoubleSide;

    // Move just slightly to prevent Z-Fighting
    plane.position.y = -0.2;
    this.scene.add(plane);
  }

  // Physical plane of starting zone
  addPhysicalStartingZone() {
    const floorShape = new CANNON.Box(new Vec3(100, 100, 0.1));
    this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
  }

  handleServerMsg() {
    // Spawna en ny boll om vi får ett inkommande meddelande ifrån servern
    this.spawnOtherPlayers();
  }

  spawnOtherPlayers() {
    const startPosition = { x: 0, y: 180, z: 0 };
    const mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 64, 64),
      new THREE.MeshStandardMaterial({ map: this.gamePieceTexture })
    );
    mesh.castShadow = true;
    mesh.position.copy(startPosition as Vector3);

    // Create the physics object to match the mesh object
    const boxShape = new CANNON.Sphere(5);
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(5, 160, 0),
      shape: boxShape,
      material: this.material.getIceMaterial(),
    });
    body.position.copy(startPosition as CANNON.Vec3);

    // Add entities to the world
    this.scene.add(mesh);
    this.world.addBody(body);
    this.currentGamePiece = { mesh, body };
    this.activeGamePieces.push(this.currentGamePiece);
  }

  createServerConnection() {
    this.server = new WebSocket('ws://localhost:8000');

    this.server.addEventListener('message', this.handleServerMsg.bind(this));
  }
}

export default MultiplayerWorld;
