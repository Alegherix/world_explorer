import * as THREE from 'three';
import config from './utils';
const {
  WINZONE_DEPTH,
  WINZONE_HEIGHT,
  WINZONE_WIDTH,
  BLOCK_DEPTH,
  WIN_PERCENTAGE_LIMIT,
} = config;
// import type * as dat from 'dat.gui';
import Controller from './Controller';

class Debugger {
  // gui : dat.GUI;
  // scene: THREE.Scene

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
    const controller = new Controller(this.mesh);
    // document.addEventListener('keydown', this.steerDebugBox.bind(this));
    // document.addEventListener('keydown', controller.steerDebugBox);

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
}

export default Debugger;
