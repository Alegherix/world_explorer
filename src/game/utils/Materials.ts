// import CANNON from 'cannon';
import * as CANNON from 'cannon-es';

class Material {
  private iceMaterial: CANNON.Material;
  private rockMaterial: CANNON.Material;
  private spungeMaterial: CANNON.Material;
  private glassMaterial: CANNON.Material;
  private iceRockContactMaterial: CANNON.ContactMaterial;
  private iceIceContactMaterial: CANNON.ContactMaterial;
  private iceSpungeContactMaterial: CANNON.ContactMaterial;
  private iceGlassContactMaterial: CANNON.ContactMaterial;

  getIceMaterial(): CANNON.Material {
    if (!this.iceMaterial) this.iceMaterial = new CANNON.Material('ice');
    return this.iceMaterial;
  }

  getRockMaterial(): CANNON.Material {
    if (!this.rockMaterial) this.rockMaterial = new CANNON.Material('rock');
    return this.rockMaterial;
  }

  getGlassMaterial(): CANNON.Material {
    if (!this.glassMaterial) this.glassMaterial = new CANNON.Material('glass');
    return this.glassMaterial;
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
          friction: 5,
          restitution: 0.1,
          contactEquationRelaxation: 4,
          // frictionEquationRelaxation: 10,
        }
      );
    }
    return this.iceRockContactMaterial;
  };

  getIceGlassContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceGlassContactMaterial) {
      this.iceGlassContactMaterial = new CANNON.ContactMaterial(
        this.getGlassMaterial(),
        this.getIceMaterial(),
        {
          friction: 0,
          restitution: 0.1,
          contactEquationRelaxation: 4,
          frictionEquationRelaxation: 10,
        }
      );
    }
    return this.iceGlassContactMaterial;
  };

  getIceIceContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceIceContactMaterial) {
      this.iceIceContactMaterial = new CANNON.ContactMaterial(
        this.getIceMaterial(),
        this.getIceMaterial(),
        {
          friction: 1,
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
          restitution: 1.2,
        }
      );
    }
    return this.iceSpungeContactMaterial;
  };
}

export default Material;
