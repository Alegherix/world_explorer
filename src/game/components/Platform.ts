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
import type {
  ICylinderDimension,
  IDimension,
  IPosition,
} from './../../shared/interfaces';
import type ScoreKeeper from './ScoreKeeper';

class Platform {
  static createCylinderPlatform(
    dimensions: ICylinderDimension,
    phyicsMaterial: CANNON.Material,
    position?: IPosition,
    configObj?: MeshStandardMaterialParameters,
    rotation?: number
  ): IGamePiece {
    const randomColor = () => {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return '#' + n.slice(0, 6);
    };

    const { radiusTop, radiusBottom, height, radialSegments } = dimensions;
    const geometry = new CylinderBufferGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments
    );
    const material = new MeshStandardMaterial(
      configObj ? configObj : { color: randomColor(), emissive: 0x0 }
    );
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.geometry.setAttribute(
      'uv2',
      new Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2)
    );

    if (position) {
      const { x, y, z } = position;
      mesh.position.set(x, y, z);
    }

    const shape = new CANNON.Cylinder(
      radiusTop,
      radiusBottom,
      height,
      radialSegments
    );
    const body = createBoundry(
      -1,
      0,
      0,
      0,
      0,
      0,
      rotation ? rotation : Math.PI,
      shape,
      phyicsMaterial
    );
    body.position.copy(mesh.position as unknown as CANNON.Vec3);

    return { mesh, body };
  }

  static createPlanePlatform(
    dimensions: IDimension,
    phyicsMaterial: CANNON.Material,
    position?: IPosition,
    configObj?: MeshStandardMaterialParameters,
    rotation?: number,
    scoreKeeper?: ScoreKeeper
  ): IGamePiece {
    const randomColor = () => {
      let n = (Math.random() * 0xfffff * 1000000).toString(16);
      return '#' + n.slice(0, 6);
    };

    const { width, height, depth } = dimensions;
    const geometry = new BoxBufferGeometry(width, height, depth, 64, 64);
    const material = new MeshStandardMaterial(
      configObj ? configObj : { color: randomColor() }
    );
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.geometry.setAttribute(
      'uv2',
      new Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2)
    );

    if (position) {
      const { x, y, z } = position;
      mesh.position.set(x, y, z);
    }

    if (scoreKeeper) {
      this.addPointsToPlane(dimensions, position, scoreKeeper);
    }

    const shape = new CANNON.Box(
      new CANNON.Vec3(width / 2, height / 2, depth / 2)
    );
    const body = createBoundry(
      -1,
      0,
      0,
      0,
      0,
      0,
      rotation ? rotation : Math.PI,
      shape,
      phyicsMaterial
    );
    body.position.copy(mesh.position as unknown as CANNON.Vec3);

    return { mesh, body };
  }

  private static addPointsToPlane(
    dimension: IDimension,
    position: IPosition,
    scoreKeeper: ScoreKeeper
  ) {
    const { width, height } = dimension;
    const { x, y, z } = position;
    const spaceBetweenPoints = 15;
    const offset = 5;
    // Since position is based on middle of plane, we need to add half plane at start of iteration
    let appendage = height > width ? height / 2 : width / 2;

    // Create coins at earliest 5px near the closest edge of plane
    if (height > width) {
      appendage = height / 2;
      for (
        let index = offset;
        index < height - offset;
        index += spaceBetweenPoints
      ) {
        scoreKeeper.createCoin(x, y + offset, z - appendage + index);
      }
    } else {
      for (
        let index = offset;
        index < width - offset;
        index += spaceBetweenPoints
      ) {
        scoreKeeper.createCoin(x - appendage + index, y + offset, z);
      }
    }
  }
}

export default Platform;
