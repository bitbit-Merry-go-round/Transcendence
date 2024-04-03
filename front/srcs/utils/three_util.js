import * as THREE from "three";

export function resizeTexture({texture, x, y}) {
  texture.repeat.x = x;
  texture.repeat.y = y;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter; 
  texture.minFilter = THREE.NearestMipMapLinearFilter;
}
