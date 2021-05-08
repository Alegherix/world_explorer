import type { Vec3 } from 'cannon-es';
import type {
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterialParameters,
} from 'three';
import type {
  IDimension,
  IGamePiece,
  IPosition,
} from '../../shared/interfaces';
import type Material from '../utils/Materials';
import PlaneFactory from './Plane';

class PushBlock {
  private gamePiece: IGamePiece;
  private movementType: boolean;

  constructor(
    dimension: IDimension,
    material: Material,
    private position: IPosition,
    materialConfig: MeshStandardMaterialParameters,
    sinMovement: boolean
  ) {
    this.gamePiece = PlaneFactory.createPlane(
      dimension,
      material.getGlassMaterial(),
      position,
      materialConfig
    );
    this.movementType = sinMovement;
  }

  private getBlockMovement(timeDelta: number): number {
    return this.movementType
      ? Math.sin(timeDelta * 0.5) * 200 + this.position.x
      : Math.cos(Math.PI / 2 + timeDelta * 0.5) * 200 + this.position.x;
  }

  getBlock() {
    return this.gamePiece;
  }

  moveBlock(timeDelta: number) {
    this.gamePiece.mesh.position.x = this.getBlockMovement(timeDelta);
    this.gamePiece.body.position.x = this.getBlockMovement(timeDelta);
  }
}

export default PushBlock;
