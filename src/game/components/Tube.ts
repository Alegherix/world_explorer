import { Vec3, Quaternion, Body, Trimesh, Material } from 'cannon-es';
import { DoubleSide, Mesh, MeshStandardMaterial, MeshStandardMaterialParameters, TorusBufferGeometry } from 'three';
import type { IDimension, IPosition } from '../../shared/interfaces';
import type { IGamePiece } from '../../shared/frontendInterfaces';

class TubeFactory {
  static createTube(
    phyicsMaterial: Material,
    position?: IPosition,
    configObj?: MeshStandardMaterialParameters
  ): IGamePiece {
    const { x, y, z } = position;
    const geometry = new TorusBufferGeometry(400, 20, 18, 10, 2.5);
    const material = new MeshStandardMaterial(configObj);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.material.side = DoubleSide;

    mesh.rotation.y = Math.PI * 2;
    mesh.rotation.z = Math.PI;
    // mesh.position.set(1200, 0, -470);
    // this.scene.add(mesh);

    const shape = Trimesh.createTorus(400, 20, 18, 10, 2.7);
    const body = new Body({
      mass: 0,
      position: new Vec3(5, 160, 0),
      shape,
      material: phyicsMaterial,
    });

    const quatX = new Quaternion();
    const quatY = new Quaternion();
    const quatZ = new Quaternion();

    quatX.setFromAxisAngle(new Vec3(-1, 0, 0), 0);
    quatY.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI * 2);
    quatZ.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI);

    const quaternion = quatX.mult(quatY).mult(quatZ);
    body.quaternion = quaternion;
    body.position.copy(mesh.position as unknown as Vec3);

    return { mesh, body };
  }
}
export default TubeFactory;
