import {
  Box3,
  CylinderBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  OctahedronBufferGeometry,
} from 'three';
import GameStore from '../../shared/GameStore';

class ScoreKeeper {
  private geometry: CylinderBufferGeometry;
  private material: MeshPhongMaterial;
  private coins: Mesh[] = [];
  private prize: Mesh;
  constructor(private scene: THREE.Scene) {
    this.geometry = new CylinderBufferGeometry(2.5, 2.5, 1, 20);
    this.material = new MeshPhongMaterial({
      color: 0xf4cd04,
    });
  }

  createCoin(x: number, y: number, z: number) {
    const mesh = new Mesh(this.geometry, this.material);
    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    mesh.name = 'coin';
    this.coins.push(mesh);
    this.scene.add(mesh);
  }

  // and if they do update score && remove from scene & array.
  private haveScored(player: Mesh) {
    for (let index = 0; index < this.coins.length; index++) {
      let coin = this.coins[index];
      if (coin.position.distanceTo(player.position) <= 10) {
        this.scene.remove(coin);
        this.coins.splice(index, 1);
        GameStore.update((store) => {
          return { ...store, score: store.score + 1 };
        });
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
    this.haveWon(player);
  }

  private haveWon(player: Mesh) {
    if (this.prize.position.distanceTo(player.position) < 10) {
      this.scene.remove(this.prize);
      GameStore.update((store) => {
        return { ...store, winnerName: player.name };
      });
    }
  }

  createPrize(x: number, y: number, z: number) {
    const lootGeometry = new OctahedronBufferGeometry(12, 0);
    const lootMaterial = new MeshPhongMaterial({
      color: 0x98b1c4,
      emissive: 0x0,
      emissiveIntensity: 0.2,
      shininess: 52,
    });
    const lootMesh = new Mesh(lootGeometry, lootMaterial);
    lootMesh.receiveShadow = true;
    lootMesh.castShadow = true;
    lootMesh.position.set(x, y, z);
    this.prize = lootMesh;
    this.scene.add(lootMesh);
  }
}

export default ScoreKeeper;
