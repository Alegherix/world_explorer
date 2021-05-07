import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import {
  BoxBufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
} from 'three';
import { createBoundry } from '../utils/utils';
import type { IGamePiece, IPosition } from './../../shared/interfaces';

class PlaneFactory {
  static createPlane(
    width: number,
    height: number,
    depth: number,
    configObj: MeshStandardMaterialParameters,
    phyicsMaterial: CANNON.Material,
    position?: IPosition,
    rotation?: number
  ): IGamePiece {
    const geometry = new BoxBufferGeometry(width, height, depth, 64, 64);
    const material = new MeshStandardMaterial(configObj);
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.rotation.x = rotation ? rotation : -Math.PI * 0.5;
    mesh.geometry.setAttribute(
      'uv2',
      new Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2)
    );
    if (position) {
      const { x, y, z } = position;
      mesh.position.set(x, y, z);
    }

    const shape = new CANNON.Box(new Vec3(width / 2, height / 2, depth / 2));

    const body = createBoundry(
      -1,
      0,
      0,
      0,
      0,
      0,
      rotation ? rotation : Math.PI * 0.5,
      shape,
      phyicsMaterial
    );
    body.position.copy((mesh.position as unknown) as Vec3);

    return { mesh, body };
  }

  static slopePlane(plane: IGamePiece) {
    plane.mesh.rotation.x = -Math.PI / 2;
    plane.mesh.rotation.y = Math.PI / 6;
    plane.mesh.rotation.z = Math.PI / 2;

    const angleX = Math.PI / 2;
    const angleY = Math.PI / 6;
    const angleZ = Math.PI / 2;

    const quatX = new CANNON.Quaternion();
    const quatY = new CANNON.Quaternion();
    const quatZ = new CANNON.Quaternion();

    quatX.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), angleX);
    quatY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angleY);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angleZ);

    const quaternion = quatX.mult(quatY).mult(quatZ);

    plane.body.quaternion = quaternion;

    plane.body.position.copy((plane.mesh.position as unknown) as Vec3);
  }
}

export default PlaneFactory;
