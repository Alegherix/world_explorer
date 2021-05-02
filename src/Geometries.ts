// All reusable Geometries go here as to not create new Geometries if not needed
import * as THREE from 'three';

export const getBlockGeometry = (): THREE.BoxBufferGeometry => {
  return new THREE.BoxBufferGeometry(10, 10, 10);
};

export const getIGeometry = (): THREE.BoxBufferGeometry => {
  return new THREE.BoxBufferGeometry(5, 20, 5);
};
