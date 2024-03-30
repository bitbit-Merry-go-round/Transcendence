const path = {
  scene: "assets/models/scene/game_scene.glb",
  leaf: "assets/models/leaf/leaf.gltf",
  board: "assets/models/board/board.glb",
  laurel_wreath: "assets/models/laurel_wreath/scene.gltf",
  bgm: "assets/sound/bgm1.mp3",
  hitSound: "assets/sound/hit.mp3",
  winSound: "assets/sound/win.mp3",
  lostSound: "assets/sound/lost.mp3",
  getTexture: {
    color: (name) => `assets/textures/${name}/diff.jpg`,
    normal: (name) => `assets/textures/${name}/nor.jpg`,
    arm: (name) => `assets/textures/${name}/arm.jpg`,
  },
};

export default path;
