import * as CANNON from 'cannon-es';
import {
  CylinderBufferGeometry,
  BoxBufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshPhongMaterial,
  MeshPhongMaterialParameters,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
} from 'three';
import { createBoundry } from '../utils/utils';
import type { IGamePiece } from '../../shared/frontendInterfaces';
import type { ICylinderDimension, IDimension, IPosition } from './../../shared/interfaces';

class Platform {
  static createCylinderPlatform(
    dimensions: ICylinderDimension,
    phyicsMaterial: CANNON.Material,
    position?: IPosition,
    configObj?: MeshPhongMaterialParameters,
    rotation?: number
  ): IGamePiece {
    const randomColor = () => {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return '#' + n.slice(0, 6);
    };

    const { radiusTop, radiusBottom, height, radialSegments } = dimensions;
    const geometry = new CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
    const material = new MeshPhongMaterial(
      configObj ? configObj : { color: randomColor(), emissive: 0x0, shininess: 40 }
    );
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.geometry.setAttribute('uv2', new Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2));

    if (position) {
      const { x, y, z } = position;
      mesh.position.set(x, y, z);
    }

    const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, radialSegments);
    const body = createBoundry(-1, 0, 0, 0, 0, 0, rotation ? rotation : Math.PI, shape, phyicsMaterial);
    body.position.copy(mesh.position as unknown as CANNON.Vec3);

    return { mesh, body };
  }

  static createPlanePlatform(
    dimensions: IDimension,
    phyicsMaterial: CANNON.Material,
    position?: IPosition,
    configObj?: MeshStandardMaterialParameters,
    rotation?: number
  ): IGamePiece {
    const randomColor = () => {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return '#' + n.slice(0, 6);
    };

    const { width, height, depth } = dimensions;
    const geometry = new BoxBufferGeometry(width, height, depth, 64, 64);
    const material = new MeshStandardMaterial(configObj ? configObj : { color: randomColor() });
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.geometry.setAttribute('uv2', new Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2));

    if (position) {
      const { x, y, z } = position;
      mesh.position.set(x, y, z);
    }

    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = createBoundry(-1, 0, 0, 0, 0, 0, rotation ? rotation : Math.PI, shape, phyicsMaterial);
    body.position.copy(mesh.position as unknown as CANNON.Vec3);

    return { mesh, body };
  }
}

export default Platform;
