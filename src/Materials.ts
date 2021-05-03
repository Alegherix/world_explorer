import CANNON from 'cannon';

class Material {
  private iceMaterial: CANNON.Material;
  private rockMaterial: CANNON.Material;
  private spungeMaterial: CANNON.Material;
  private iceRockContactMaterial: CANNON.ContactMaterial;
  private iceIceContactMaterial: CANNON.ContactMaterial;
  private iceSpungeContactMaterial: CANNON.ContactMaterial;

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
    if (!this.iceRockContactMaterial) {
      this.iceRockContactMaterial = new CANNON.ContactMaterial(
        this.getRockMaterial(),
        this.getIceMaterial(),
        {
          friction: 10,
          restitution: 0,
          contactEquationRelaxation: 4,
          frictionEquationRelaxation: 10,
        }
      );
    }
    return this.iceRockContactMaterial;
  };

  getIceIceContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceIceContactMaterial) {
      this.iceIceContactMaterial = new CANNON.ContactMaterial(
        this.getIceMaterial(),
        this.getIceMaterial(),
        {
          friction: 15,
          restitution: 1,
          contactEquationRelaxation: 4,
          frictionEquationRelaxation: 10,
        }
      );
    }
    return this.iceIceContactMaterial;
  };

  getIceSpungeContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceSpungeContactMaterial) {
      this.iceSpungeContactMaterial = new CANNON.ContactMaterial(
        this.getIceMaterial(),
        this.getSpungeMaterial(),
        {
          friction: 2,
          restitution: 1.5,
        }
      );
    }
    return this.iceSpungeContactMaterial;
  };
}

export default Material;
