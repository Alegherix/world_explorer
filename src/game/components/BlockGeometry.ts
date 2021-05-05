// All reusable Geometries go here as to not create new Geometries if not needed
import * as THREE from 'three';

class BlockGeometry {
  squareBlock: THREE.BoxBufferGeometry;
  iBlock: THREE.BoxBufferGeometry;

  getSquare(): THREE.BoxBufferGeometry {
    if (this.squareBlock) return this.squareBlock;
    else {
      this.squareBlock = new THREE.BoxBufferGeometry(10, 10, 10);
      return this.squareBlock;
    }
  }

  getIBlock(): THREE.BoxBufferGeometry {
    if (this.iBlock) return this.iBlock;
    else {
      this.iBlock = new THREE.BoxBufferGeometry(20, 10, 5);
      return this.iBlock;
    }
  }
}

export default BlockGeometry;
