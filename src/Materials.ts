import CANNON from 'cannon';
// Material for ejector
import * as THREE from 'three';

class Material {
  private iceMaterial: CANNON.Material;
  private rockMaterial: CANNON.Material;
  private spungeMaterial: CANNON.Material;
  private iceRockContactMaterial: CANNON.ContactMaterial;

  getIceMaterial(): CANNON.Material {
    if (!this.iceMaterial) this.iceMaterial = new CANNON.Material('ice');
    return this.iceMaterial;
  }

  getRockMaterial(): CANNON.Material {
    if (!this.rockMaterial) this.rockMaterial = new CANNON.Material('rock');
    return this.rockMaterial;
  }

  getSpungeMaterial(): CANNON.Material {
    if (!this.spungeMaterial)
      this.spungeMaterial = new CANNON.Material('spunge');
    return this.spungeMaterial;
  }

  getIceRockContactMaterial = (): CANNON.ContactMaterial => {
    return new CANNON.ContactMaterial(
      this.getRockMaterial(),
      this.getIceMaterial(),
      {
        friction: 10,
        restitution: 0,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      }
    );
  };

  getIceIceContactMatrial = (): CANNON.ContactMaterial => {
    return new CANNON.ContactMaterial(
      this.getIceMaterial(),
      this.getIceMaterial(),
      {
        friction: 15,
        restitution: 1,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      }
    );
  };

  getIceSpungeContactMatrial = (): CANNON.ContactMaterial => {
    return new CANNON.ContactMaterial(
      this.getIceMaterial(),
      this.getSpungeMaterial(),
      {
        friction: 2,
        restitution: 1.5,
      }
    );
  };
}

const ejectorMaterial = (): THREE.MeshPhongMaterial =>
  new THREE.MeshPhongMaterial({
    color: 0x49ef4,
    emissive: 0x0,
    shininess: 40,
  });

export default Material;
