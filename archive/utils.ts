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
//   this.createBoundry(0, 1, 0, 0, 0, 30, Math.PI, floorShape); // Up
// }

// // Removes idle cubes not from event fired, due to event causing nullPointerExceptions
// removeIdleCubes() {
//   let index = [];
//   for (const cube of this.activeCubes) {
//     console.log(cube.mesh.name);
//     if (cube.mesh.name === 'idle') {
//       this.world.removeBody(cube.boxBody);
//       this.scene.remove(cube.mesh);
//       index.push(this.activeCubes.indexOf(cube));
//     }
//   }
//   if (index.length > 0) {
//     this.activeCubes.splice(index[0], 1);
//   }
// }

// if (start === 'sin') {
//   return Math.sin(estimatedtime * speed) * distance + positionOffset;
// } else {
//   return (
//     Math.cos(Math.PI / 2 + estimatedtime * speed) * distance + positionOffset
//   );
// }
