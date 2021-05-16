// import CANNON from 'cannon';
import * as CANNON from 'cannon-es';

class Material {
  private iceMaterial: CANNON.Material;
  private rockMaterial: CANNON.Material;
  private spungeMaterial: CANNON.Material;
  private glassMaterial: CANNON.Material;
  private adamantineMaterial: CANNON.Material;
  private mithrilMaterial: CANNON.Material;

  private iceRockContactMaterial: CANNON.ContactMaterial;
  private iceIceContactMaterial: CANNON.ContactMaterial;
  private iceSpungeContactMaterial: CANNON.ContactMaterial;
  private iceGlassContactMaterial: CANNON.ContactMaterial;
  private iceAdamantineContactMaterial: CANNON.ContactMaterial;
  private iceMithrilContactMaterial: CANNON.ContactMaterial;

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
    if (!this.spungeMaterial) this.spungeMaterial = new CANNON.Material('spunge');
    return this.spungeMaterial;
  }

  getAdamantineMaterial(): CANNON.Material {
    if (!this.adamantineMaterial) this.adamantineMaterial = new CANNON.Material('adamantine');
    return this.adamantineMaterial;
  }

  getMithrilMaterial(): CANNON.Material {
    if (!this.mithrilMaterial) this.mithrilMaterial = new CANNON.Material('mithril');
    return this.mithrilMaterial;
  }

  getIceRockContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceRockContactMaterial) {
      this.iceRockContactMaterial = new CANNON.ContactMaterial(this.getRockMaterial(), this.getIceMaterial(), {
        friction: 1,
        restitution: 0.1,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      });
    }
    return this.iceRockContactMaterial;
  };

  getIceGlassContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceGlassContactMaterial) {
      this.iceGlassContactMaterial = new CANNON.ContactMaterial(this.getGlassMaterial(), this.getIceMaterial(), {
        friction: 0,
        restitution: 0.1,
        contactEquationRelaxation: 10,
        frictionEquationRelaxation: 10,
      });
    }
    return this.iceGlassContactMaterial;
  };

  getIceIceContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceIceContactMaterial) {
      this.iceIceContactMaterial = new CANNON.ContactMaterial(this.getIceMaterial(), this.getIceMaterial(), {
        friction: 1,
        restitution: 1,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      });
    }
    return this.iceIceContactMaterial;
  };

  getIceSpungeContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceSpungeContactMaterial) {
      this.iceSpungeContactMaterial = new CANNON.ContactMaterial(this.getIceMaterial(), this.getSpungeMaterial(), {
        friction: 2,
        restitution: 2.4,
      });
    }
    return this.iceSpungeContactMaterial;
  };

  getIceAdamantineContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceAdamantineContactMaterial) {
      this.iceAdamantineContactMaterial = new CANNON.ContactMaterial(
        this.getIceMaterial(),
        this.getAdamantineMaterial(),
        {
          friction: 0,
          restitution: 1.6,
          contactEquationRelaxation: 4,
          frictionEquationRelaxation: 10,
        }
      );
    }
    return this.iceAdamantineContactMaterial;
  };

  getIceMithrilContactMaterial = (): CANNON.ContactMaterial => {
    if (!this.iceMithrilContactMaterial) {
      this.iceMithrilContactMaterial = new CANNON.ContactMaterial(this.getIceMaterial(), this.getMithrilMaterial(), {
        friction: 0,
        restitution: 4.2,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 10,
      });
    }
    return this.iceMithrilContactMaterial;
  };
}

export default Material;
