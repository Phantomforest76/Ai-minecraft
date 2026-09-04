import * as THREE from 'three';
import { BlockType } from '../types';
import { BLOCK_DEFS, textureManager } from './textures';

export class OverlayManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Target block outline
  public outlineMesh: THREE.LineSegments;

  // Break crack overlay mesh
  public crackMesh: THREE.Mesh;
  public crackMaterial: THREE.MeshBasicMaterial;

  // First-person held item / arm
  public handGroup: THREE.Group;
  public heldBlockMesh: THREE.Mesh | null = null;
  public armMesh: THREE.Mesh | null = null;

  // Animation states
  private swingProgress: number = 0;
  private isSwinging: boolean = false;
  private walkBobTime: number = 0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;

    // 1. Target block wireframe outline (1.002 scale so it sits just above block surface)
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const outlineMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
      depthTest: true,
      transparent: true,
      opacity: 0.65,
    });
    this.outlineMesh = new THREE.LineSegments(edges, outlineMat);
    this.outlineMesh.visible = false;
    this.scene.add(this.outlineMesh);

    // 2. Break crack overlay box (1.003 scale)
    const crackGeo = new THREE.BoxGeometry(1.003, 1.003, 1.003);
    this.crackMaterial = new THREE.MeshBasicMaterial({
      map: textureManager.breakTextures[0],
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.crackMesh = new THREE.Mesh(crackGeo, this.crackMaterial);
    this.crackMesh.visible = false;
    this.scene.add(this.crackMesh);

    // 3. First person Hand Group attached to camera
    this.handGroup = new THREE.Group();
    this.camera.add(this.handGroup);

    // Default position in lower right
    this.handGroup.position.set(0.48, -0.38, -0.65);
    this.handGroup.rotation.set(0, -Math.PI / 10, 0);

    this.createArmMesh();
  }

  private createArmMesh() {
    // Steve's arm (tan skin #d19a76 with cyan sleeve #00a4a4)
    const armGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
    const armMat = new THREE.MeshLambertMaterial({ color: 0x009a9a });
    this.armMesh = new THREE.Mesh(armGeo, armMat);
    this.armMesh.position.set(0, 0, 0);
    this.armMesh.rotation.set(0.5, -0.4, 0.2);
    this.handGroup.add(this.armMesh);
  }

  public setHeldBlock(blockType: BlockType) {
    // Remove old held block if any
    if (this.heldBlockMesh) {
      this.handGroup.remove(this.heldBlockMesh);
      this.heldBlockMesh.geometry.dispose();
      this.heldBlockMesh = null;
    }

    if (blockType === BlockType.AIR) {
      if (this.armMesh) this.armMesh.visible = true;
      return;
    }

    // Hide arm and show 3D miniature block in hand
    if (this.armMesh) this.armMesh.visible = false;

    const def = BLOCK_DEFS[blockType];
    if (!def) return;

    // Create 3D block cube with proper atlas UVs
    const cubeGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);

    // Remap UVs of each face to match atlas textures
    const uvAttr = cubeGeo.attributes.uv;
    const faces = [
      def.textures.east ?? def.textures.side,
      def.textures.west ?? def.textures.side,
      def.textures.top,
      def.textures.bottom,
      def.textures.north ?? def.textures.side,
      def.textures.south ?? def.textures.side,
    ];

    for (let face = 0; face < 6; face++) {
      const texIdx = faces[face];
      const [uMin, vMin, uMax, vMax] = textureManager.getTileUV(texIdx);
      const baseIdx = face * 4;

      uvAttr.setXY(baseIdx, uMin, vMax);
      uvAttr.setXY(baseIdx + 1, uMax, vMax);
      uvAttr.setXY(baseIdx + 2, uMin, vMin);
      uvAttr.setXY(baseIdx + 3, uMax, vMin);
    }
    uvAttr.needsUpdate = true;

    const mat = new THREE.MeshLambertMaterial({
      map: textureManager.atlasTexture,
      transparent: def.transparent,
      alphaTest: 0.2,
    });

    this.heldBlockMesh = new THREE.Mesh(cubeGeo, mat);
    this.heldBlockMesh.rotation.set(0.35, -0.65, 0.15);
    this.handGroup.add(this.heldBlockMesh);
  }

  public setTargetOutline(bx: number, by: number, bz: number, visible: boolean) {
    this.outlineMesh.visible = visible;
    if (visible) {
      this.outlineMesh.position.set(bx + 0.5, by + 0.5, bz + 0.5);
    }
  }

  public setBreakProgress(bx: number, by: number, bz: number, stage: number) {
    if (stage < 0 || stage > 9) {
      this.crackMesh.visible = false;
      return;
    }
    this.crackMesh.visible = true;
    this.crackMesh.position.set(bx + 0.5, by + 0.5, bz + 0.5);
    if (textureManager.breakTextures[stage]) {
      this.crackMaterial.map = textureManager.breakTextures[stage];
      this.crackMaterial.needsUpdate = true;
    }
  }

  public triggerSwing() {
    this.isSwinging = true;
    this.swingProgress = 0;
  }

  public update(delta: number, isMoving: boolean, isSprinting: boolean) {
    // 1. Arm / Held block swing animation
    if (this.isSwinging) {
      this.swingProgress += delta * 7;
      if (this.swingProgress >= 1) {
        this.swingProgress = 0;
        this.isSwinging = false;
      }
    }

    const swingSin = Math.sin(this.swingProgress * Math.PI);
    const swingDip = Math.sin(this.swingProgress * Math.PI * 0.5);

    // 2. Walking bob
    if (isMoving) {
      const bobFreq = isSprinting ? 14 : 9;
      this.walkBobTime += delta * bobFreq;
    }

    const bobX = Math.cos(this.walkBobTime) * 0.025;
    const bobY = Math.abs(Math.sin(this.walkBobTime)) * 0.02;

    const baseX = 0.48 + bobX - swingSin * 0.15;
    const baseY = -0.38 + bobY - swingDip * 0.12;
    const baseZ = -0.65 - swingSin * 0.1;

    this.handGroup.position.set(baseX, baseY, baseZ);
    this.handGroup.rotation.x = -swingSin * 0.6;
    this.handGroup.rotation.y = -Math.PI / 10 + swingSin * 0.3;
    this.handGroup.rotation.z = swingSin * 0.4;
  }

  public dispose() {
    this.scene.remove(this.outlineMesh);
    this.scene.remove(this.crackMesh);
    this.outlineMesh.geometry.dispose();
    this.crackMesh.geometry.dispose();
    this.crackMaterial.dispose();
  }
}
