uniform vec3 uColor;
uniform float uIsFront;
uniform float uHit;

varying vec2 vUv;

float checkIsInner() {
  float isInner = (1.0 - step(0.98, vUv.x)) * step(0.02, vUv.x);

  #ifdef FRONT
    isInner *= (1.0 - step(0.8, vUv.y)) * step(0.2, vUv.y);
  #endif
  #ifdef ABOVE
    isInner *= (1.0 - step(0.8, vUv.y)); 
  #endif
  #ifdef BELOW
    isInner *= (step(0.2, vUv.y)); 
  #endif

  return isInner;
}

void main() {
  vec3 color = vec3(0.0);
  float isInner = checkIsInner();
  float dist = abs(0.5 - vUv.x) + 0.5;
  color += (1.0 - isInner) * uColor;
  color += uHit * uColor * pow(dist, 2.0);
  gl_FragColor = vec4(color, 1.0);
}
