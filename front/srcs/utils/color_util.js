import * as THREE from "three";

/** @param {THREE.Vector3} hsb
 * */
export function hsb2rgb(hsb) {
  //  Function from Iñigo Quiles
  //  https://www.shadertoy.com/view/MsS3Wc
  const rgb = new THREE.Vector3(0.0, 4.0, 2.0);

  rgb.addScalar(hsb.x * 6.0); 
  rgb.x = rgb.x % 6.0;
  rgb.y = rgb.y % 6.0;
  rgb.z = rgb.z % 6.0;
  rgb.subScalar(3.0);
  rgb.x = Math.abs(rgb.x) - 1.0;
  rgb.y = Math.abs(rgb.y) - 1.0;
  rgb.z = Math.abs(rgb.z) - 1.0;
  rgb.clamp({ x: 0, y: 0, z: 0 },
    { x: 1.0, y: 1.0, z: 1.0 });
  rgb.multiplyVectors
  const last = {
    x: 3.0 - 2.0 * rgb.x,
    y: 3.0 - 2.0 * rgb.y,
    z: 3.0 - 2.0 * rgb.z
  };
  rgb.multiply(rgb);
  rgb.multiply(last);
  return rgb;
}
