import * as THREE from 'three';
import { Box3, Box3Helper, BoxHelper } from 'three';
import { OBB } from 'three/examples/jsm/math/OBB';
import config from './utils';
const {
  WINZONE_DEPTH,
  WINZONE_HEIGHT,
  WINZONE_WIDTH,
  BLOCK_DEPTH,
  WIN_PERCENTAGE_LIMIT,
} = config;

class Debugger {
  constructor(gui, scene) {
    this.gui = gui;
    this.scene = scene;
    this.standardMaterial = new THREE.MeshStandardMaterial({
      color: '#cc66ff',
      transparent: true,
      opacity: 0.4,
    });
    this.geometry = new THREE.BoxBufferGeometry(10, 10, BLOCK_DEPTH);
    this.mesh = new THREE.Mesh(this.geometry, this.standardMaterial);
    this.debugBox();
  }

  debugBox() {
    this.mesh.name = 'debugBox';
    this.mesh.position.set(10, 10, 10);
    document.addEventListener('keydown', this.steerDebugBox.bind(this));

    const debugConfig = {};
    debugConfig.debugABox = () => {
      if (this.scene.getObjectByName('debugBox')) {
        this.scene.remove(this.mesh);
      } else {
        this.scene.add(this.mesh);
      }
    };
    this.gui.add(debugConfig, 'debugABox');
  }

  steerDebugBox(event) {
    switch (event.key) {
      case 'a':
        this.mesh.position.x -= 0.5;
        break;

      case 'd':
        this.mesh.position.x += 0.5;
        break;

      case 'w':
        this.mesh.position.z -= 0.5;
        break;

      case 's':
        this.mesh.position.z += 0.5;
        break;

      case 'q':
        this.mesh.position.y += 0.2;
        break;

      case 'e':
        this.mesh.position.y -= 0.2;
        break;

      case 'r':
        this.mesh.rotation.x += 0.4;
        break;

      case 't':
        this.mesh.rotation.y += 0.5;
        break;

      case 'x':
        console.log(this.mesh);
        break;

      case ' ':
    }
  }
}

export default Debugger;
