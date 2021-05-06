import CANNON, { Vec3 } from 'cannon';
import type { IGamePiece, IPosition } from './../../shared/interfaces';
import {
  BoxBufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
} from 'three';
import { createBoundry } from '../utils/utils';

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
}

export default PlaneFactory;
