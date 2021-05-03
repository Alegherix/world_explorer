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
}

// export const getIGeometry = (): THREE.BoxBufferGeometry => {
//   return new THREE.BoxBufferGeometry(5, 20, 5);
// };

export default BlockGeometry;
