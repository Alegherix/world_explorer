import { Box3, CylinderBufferGeometry, Mesh, MeshPhongMaterial } from 'three';
import GameStore from '../../shared/GameStore';

class ScoreKeeper {
  private geometry: CylinderBufferGeometry;
  private material: MeshPhongMaterial;
  private coins: Mesh[] = [];
  private coinBox: Box3;
  private playerBox: Box3;
  constructor(private scene: THREE.Scene) {
    this.geometry = new CylinderBufferGeometry(2.5, 2.5, 1, 20);
    this.material = new MeshPhongMaterial({
      color: 0xf4cd04,
    });
    this.coinBox = new Box3();
    this.playerBox = new Box3();
  }

  createCoin(x: number, y: number, z: number) {
    const mesh = new Mesh(this.geometry, this.material);
    mesh.position.set(x, y, z);
    mesh.geometry.computeBoundingBox();
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    mesh.name = 'coin';
    this.coins.push(mesh);
    this.scene.add(mesh);
  }

  // If coin in within 3Vector units, compute if they actually intersect
  // and if they do update score && remove from scene & array.
  private haveScored(player: Mesh) {
    this.playerBox.setFromObject(player);
    for (let index = 0; index < this.coins.length; index++) {
      let coin = this.coins[index];
      if (coin.position.distanceTo(player.position) <= 3) {
        this.coinBox.setFromObject(coin);
        if (this.playerBox.intersectsBox(this.coinBox)) {
          this.scene.remove(coin);
          this.coins.splice(index, 1);
          GameStore.update((store) => {
            return { ...store, score: store.score + 1 };
          });
        }
      }
    }
  }

  private spinCoins() {
    for (const coin of this.coins) {
      coin.rotation.z += 0.01;
    }
  }

  watchScore(player: Mesh) {
    this.haveScored(player);
    this.spinCoins();
  }
}

export default ScoreKeeper;
