import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';
import {
  Box3,
  BoxBufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
  Vector3,
} from 'three';
import { createBoundry } from '../utils/utils';
import type { IDimension, IPosition } from './../../shared/interfaces';
import type { IGamePiece } from './../../shared/frontendInterfaces';
import type ScoreKeeper from './ScoreKeeper';

class PlaneFactory {
  static createPlane(
    dimensions: IDimension,
    phyicsMaterial: CANNON.Material,
    position?: IPosition,
    configObj?: MeshStandardMaterialParameters,
    scoreKeeper?: ScoreKeeper
  ): IGamePiece {
    const { width, height, depth } = dimensions;
    const geometry = new BoxBufferGeometry(width, height, depth, 64, 64);
    const material = new MeshStandardMaterial(
      configObj
        ? configObj
        : { color: 'rgb(0,12,64)', transparent: true, opacity: 0.4 }
    );
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI * 0.5;
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

    const shape = new CANNON.Box(new Vec3(width / 2, height / 2, depth / 2));

    const body = createBoundry(
      -1,
      0,
      0,
      0,
      0,
      0,
      Math.PI * 0.5,
      shape,
      phyicsMaterial
    );
    body.position.copy(mesh.position as unknown as Vec3);

    return { mesh, body };
  }

  // Used for adding points to the plane
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

  private static slopePlane(
    plane: IGamePiece,
    rotationX: number,
    rotationY: number,
    rotationZ: number
  ) {
    plane.mesh.rotation.x = -rotationX;
    plane.mesh.rotation.y = rotationY;
    plane.mesh.rotation.z = rotationZ;

    const angleX = rotationX;
    const angleY = rotationY;
    const angleZ = rotationZ;

    const quatX = new CANNON.Quaternion();
    const quatY = new CANNON.Quaternion();
    const quatZ = new CANNON.Quaternion();

    quatX.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), angleX);
    quatY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angleY);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angleZ);

    const quaternion = quatX.mult(quatY).mult(quatZ);

    plane.body.quaternion = quaternion;

    plane.body.position.copy(plane.mesh.position as unknown as Vec3);
  }

  static slopePlaneUpRight(plane: IGamePiece) {
    this.slopePlane(plane, -Math.PI / 2, Math.PI / 6, Math.PI / 2);
  }

  static slopePlaneUpLeft(plane: IGamePiece) {
    this.slopePlane(plane, Math.PI / 2, Math.PI / 6, Math.PI / 2);
  }

  static slopePlaneUpBack(plane: IGamePiece) {
    this.slopePlane(plane, -Math.PI / 3, Math.PI, Math.PI);
  }

  static slopePlaneUp(plane: IGamePiece) {
    this.slopePlane(plane, Math.PI / 3, Math.PI, Math.PI);
  }
}

export default PlaneFactory;
