import type * as THREE from 'three';

class Controller {
  mesh: THREE.Mesh;

  constructor(mesh) {
    this.mesh = mesh;
  }

  steerDebugBox(event: KeyboardEvent) {
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
export default Controller;
