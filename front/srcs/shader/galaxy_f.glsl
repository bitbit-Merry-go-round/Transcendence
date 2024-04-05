varying vec3 vColor;

void main() {

  vec2 uv = vec2(
      gl_PointCoord.x + sin(gl_PointCoord.y * 50.) * 0.1,
      gl_PointCoord.y + sin(gl_PointCoord.x * 50.) * 0.1
      );

  float dist =  distance(uv, vec2(0.5));

  float strength = pow(0.5 - dist, 5.0);

  vec3 color = mix(vec3(0.0), vColor, strength);

  gl_FragColor = vec4(color, pow(1.0 - dist, 2.0));

#include <colorspace_fragment>
}
