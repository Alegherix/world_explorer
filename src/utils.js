const config = {
  WINZONE_WIDTH: 50,
  WINZONE_HEIGHT: 10,
  WINZONE_DEPTH: 10,
  BLOCK_DEPTH: 10,
  WIN_PERCENTAGE_LIMIT: 80,
  PLANET_WIDTH: 200,
  PLANET_DEPTH: 200,
};

export default config;

// TLDR -> Old functions, probably no need for them, but lets keep em safe here
//  so I don't have to rewrite it, or pollute the other code
// // Creates invisible physical boundries
// createBoundry(x1, y1, z1, x2, y2, z2, rotation, floorShape) {
//   const body = new CANNON.Body({
//     mass: 0,
//     shape: floorShape,
//     material: this.rockMaterial,
//   });
//   body.quaternion.setFromAxisAngle(new CANNON.Vec3(x1, y1, z1), rotation);
//   body.position = new Vec3(x2, y2, z2);
//   this.world.addBody(body);
// }

// // Adds each invisible boundry to the scene
// addInvisibleBoundries() {
//   // Keep here as not to reinstantiate plane object
//   const floorShape = new CANNON.Plane();

//   this.createBoundry(-1, 0, 0, 0, 0, 0, Math.PI * 0.5, floorShape); // Bottom
//   this.createBoundry(0, 1, 0, -60, 0, 0, Math.PI * 0.5, floorShape); // Left
//   this.createBoundry(0, -1, 0, 60, 0, 0, Math.PI * 0.5, floorShape); // Right
//   this.createBoundry(0, 0, 1, 0, 0, -30, Math.PI * 0.5, floorShape); // Back
//   this.createBoundry(0, 1, 0, 0, 0, 30, Math.PI, floorShape); // Back
// }
