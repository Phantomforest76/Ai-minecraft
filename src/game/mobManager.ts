import * as THREE from 'three';
import { BlockType, ItemType, MobType, MobEntity } from '../types';
import { ChunkManager } from './chunkManager';
import { sound } from './audio';

interface MobMeshGroup extends THREE.Group {
  head?: THREE.Mesh;
  body?: THREE.Mesh;
  leftArm?: THREE.Mesh;
  rightArm?: THREE.Mesh;
  leftLeg?: THREE.Mesh;
  rightLeg?: THREE.Mesh;
  legFL?: THREE.Mesh;
  legFR?: THREE.Mesh;
  legBL?: THREE.Mesh;
  legBR?: THREE.Mesh;
  materials?: THREE.MeshLambertMaterial[];
  originalColors?: number[];
}

export interface MobDrop {
  item: ItemType | BlockType;
  count: number;
}

export class MobManager {
  public scene: THREE.Scene;
  public chunkManager: ChunkManager;
  public mobs: MobEntity[] = [];
  public mobMeshes: Map<string, MobMeshGroup> = new Map();

  private spawnTimer: number = 0;
  private soundTimer: number = 0;
  private maxMobs: number = 14;

  constructor(scene: THREE.Scene, chunkManager: ChunkManager) {
    this.scene = scene;
    this.chunkManager = chunkManager;
  }

  /**
   * Helper to create canvas pixel texture for mob faces/skins
   */
  private createPixelTexture(
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      draw(ctx);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }

  /**
   * Creates a 3D box mesh with individual face or solid coloring
   */
  private createVoxelBox(
    w: number,
    h: number,
    d: number,
    color: number,
    texture?: THREE.Texture
  ): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshLambertMaterial({
      color: texture ? 0xffffff : color,
      map: texture || null,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Builds the 3D model for each mob archetype
   */
  private buildMobMesh(type: MobType): MobMeshGroup {
    const group: MobMeshGroup = new THREE.Group() as MobMeshGroup;
    group.materials = [];
    group.originalColors = [];

    const recordMat = (mesh: THREE.Mesh) => {
      const mat = mesh.material as THREE.MeshLambertMaterial;
      group.materials?.push(mat);
      group.originalColors?.push(mat.color.getHex());
    };

    switch (type) {
      case MobType.ZOMBIE: {
        // Head (Green rotting skin)
        const headTex = this.createPixelTexture(16, 16, (ctx) => {
          ctx.fillStyle = '#497331';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#2d471d'; // dark hair/patches
          ctx.fillRect(0, 0, 16, 5);
          ctx.fillStyle = '#1c1b18'; // eyes
          ctx.fillRect(3, 7, 3, 2);
          ctx.fillRect(10, 7, 3, 2);
          ctx.fillStyle = '#263b1a'; // nose/mouth
          ctx.fillRect(6, 11, 4, 2);
        });
        const head = this.createVoxelBox(0.5, 0.5, 0.5, 0x497331, headTex);
        head.position.set(0, 1.65, 0);
        group.add(head);
        group.head = head;
        recordMat(head);

        // Body (Cyan/Teal shirt)
        const body = this.createVoxelBox(0.5, 0.75, 0.28, 0x228b8d);
        body.position.set(0, 1.05, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        // Arms (Held straight out horizontally in classic Minecraft zombie pose!)
        const leftArm = this.createVoxelBox(0.22, 0.22, 0.72, 0x497331);
        leftArm.position.set(-0.36, 1.25, 0.3);
        group.add(leftArm);
        group.leftArm = leftArm;
        recordMat(leftArm);

        const rightArm = this.createVoxelBox(0.22, 0.22, 0.72, 0x497331);
        rightArm.position.set(0.36, 1.25, 0.3);
        group.add(rightArm);
        group.rightArm = rightArm;
        recordMat(rightArm);

        // Legs (Dark blue jeans)
        const leftLeg = this.createVoxelBox(0.23, 0.72, 0.24, 0x2b347b);
        leftLeg.position.set(-0.13, 0.36, 0);
        group.add(leftLeg);
        group.leftLeg = leftLeg;
        recordMat(leftLeg);

        const rightLeg = this.createVoxelBox(0.23, 0.72, 0.24, 0x2b347b);
        rightLeg.position.set(0.13, 0.36, 0);
        group.add(rightLeg);
        group.rightLeg = rightLeg;
        recordMat(rightLeg);
        break;
      }

      case MobType.CREEPER: {
        // Head (Iconic creeper green with dark frowning face)
        const creeperTex = this.createPixelTexture(16, 16, (ctx) => {
          ctx.fillStyle = '#4eb345';
          ctx.fillRect(0, 0, 16, 16);
          // Darker mottled pixels
          ctx.fillStyle = '#37912e';
          for (let i = 0; i < 20; i++) {
            ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 2, 2);
          }
          // Iconic face
          ctx.fillStyle = '#0f1c0d';
          ctx.fillRect(3, 4, 3, 3); // eyes
          ctx.fillRect(10, 4, 3, 3);
          ctx.fillRect(6, 7, 4, 4); // nose
          ctx.fillRect(4, 9, 2, 5); // frown sides
          ctx.fillRect(10, 9, 2, 5);
        });
        const head = this.createVoxelBox(0.52, 0.52, 0.52, 0x4eb345, creeperTex);
        head.position.set(0, 1.45, 0);
        group.add(head);
        group.head = head;
        recordMat(head);

        // Body
        const body = this.createVoxelBox(0.48, 0.7, 0.26, 0x4eb345);
        body.position.set(0, 0.85, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        // 4 Legs
        const legMatColor = 0x3e9436;
        const fl = this.createVoxelBox(0.2, 0.45, 0.2, legMatColor);
        fl.position.set(-0.13, 0.23, 0.16);
        group.add(fl);
        group.legFL = fl;
        recordMat(fl);

        const fr = this.createVoxelBox(0.2, 0.45, 0.2, legMatColor);
        fr.position.set(0.13, 0.23, 0.16);
        group.add(fr);
        group.legFR = fr;
        recordMat(fr);

        const bl = this.createVoxelBox(0.2, 0.45, 0.2, legMatColor);
        bl.position.set(-0.13, 0.23, -0.16);
        group.add(bl);
        group.legBL = bl;
        recordMat(bl);

        const br = this.createVoxelBox(0.2, 0.45, 0.2, legMatColor);
        br.position.set(0.13, 0.23, -0.16);
        group.add(br);
        group.legBR = br;
        recordMat(br);
        break;
      }

      case MobType.SKELETON: {
        // Head (White bone skull)
        const skelTex = this.createPixelTexture(16, 16, (ctx) => {
          ctx.fillStyle = '#c8c8c8';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#222222';
          ctx.fillRect(3, 5, 3, 3); // eye sockets
          ctx.fillRect(10, 5, 3, 3);
          ctx.fillRect(7, 9, 2, 2); // nose
          ctx.fillRect(4, 12, 8, 2); // teeth
        });
        const head = this.createVoxelBox(0.48, 0.48, 0.48, 0xd0d0d0, skelTex);
        head.position.set(0, 1.65, 0);
        group.add(head);
        group.head = head;
        recordMat(head);

        // Ribcage Body
        const body = this.createVoxelBox(0.44, 0.72, 0.22, 0xb8b8b8);
        body.position.set(0, 1.05, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        // Thin bone arms (holding bow forward)
        const leftArm = this.createVoxelBox(0.15, 0.15, 0.65, 0xd0d0d0);
        leftArm.position.set(-0.3, 1.25, 0.25);
        group.add(leftArm);
        group.leftArm = leftArm;
        recordMat(leftArm);

        const rightArm = this.createVoxelBox(0.15, 0.15, 0.65, 0xd0d0d0);
        rightArm.position.set(0.3, 1.25, 0.25);
        group.add(rightArm);
        group.rightArm = rightArm;
        recordMat(rightArm);

        // Bow mesh
        const bow = this.createVoxelBox(0.08, 0.55, 0.08, 0x6e451e);
        bow.position.set(0.28, 1.25, 0.55);
        group.add(bow);
        recordMat(bow);

        // Thin legs
        const leftLeg = this.createVoxelBox(0.15, 0.72, 0.15, 0xd0d0d0);
        leftLeg.position.set(-0.12, 0.36, 0);
        group.add(leftLeg);
        group.leftLeg = leftLeg;
        recordMat(leftLeg);

        const rightLeg = this.createVoxelBox(0.15, 0.72, 0.15, 0xd0d0d0);
        rightLeg.position.set(0.12, 0.36, 0);
        group.add(rightLeg);
        group.rightLeg = rightLeg;
        recordMat(rightLeg);
        break;
      }

      case MobType.PIG: {
        // Pig Head (Pink with snout)
        const pigTex = this.createPixelTexture(16, 16, (ctx) => {
          ctx.fillStyle = '#f09696';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#1c1b18';
          ctx.fillRect(2, 6, 2, 2); // eyes
          ctx.fillRect(12, 6, 2, 2);
          ctx.fillStyle = '#e27b7b'; // snout
          ctx.fillRect(5, 9, 6, 4);
          ctx.fillStyle = '#7a3131'; // nostrils
          ctx.fillRect(6, 10, 1, 2);
          ctx.fillRect(9, 10, 1, 2);
        });
        const head = this.createVoxelBox(0.46, 0.46, 0.46, 0xf09696, pigTex);
        head.position.set(0, 0.75, 0.48);
        group.add(head);
        group.head = head;
        recordMat(head);

        // Snout box extension
        const snout = this.createVoxelBox(0.25, 0.16, 0.12, 0xe27b7b);
        snout.position.set(0, 0.68, 0.72);
        group.add(snout);
        recordMat(snout);

        // Body (horizontal)
        const body = this.createVoxelBox(0.58, 0.52, 0.88, 0xf09696);
        body.position.set(0, 0.65, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        // 4 Legs
        const fl = this.createVoxelBox(0.18, 0.4, 0.18, 0xe88a8a);
        fl.position.set(-0.2, 0.2, 0.3);
        group.add(fl);
        group.legFL = fl;
        recordMat(fl);

        const fr = this.createVoxelBox(0.18, 0.4, 0.18, 0xe88a8a);
        fr.position.set(0.2, 0.2, 0.3);
        group.add(fr);
        group.legFR = fr;
        recordMat(fr);

        const bl = this.createVoxelBox(0.18, 0.4, 0.18, 0xe88a8a);
        bl.position.set(-0.2, 0.2, -0.3);
        group.add(bl);
        group.legBL = bl;
        recordMat(bl);

        const br = this.createVoxelBox(0.18, 0.4, 0.18, 0xe88a8a);
        br.position.set(0.2, 0.2, -0.3);
        group.add(br);
        group.legBR = br;
        recordMat(br);
        break;
      }

      case MobType.ENDER_DRAGON: {
        const tex = this.createPixelTexture(32, 16, (ctx) => {
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, 32, 16);
          ctx.fillStyle = '#ff00ff'; // Purple eyes
          ctx.fillRect(4, 4, 4, 4);
          ctx.fillRect(24, 4, 4, 4);
        });
        const head = this.createVoxelBox(1.5, 1.5, 2.0, 0x111111, tex);
        head.position.set(0, 4.0, 3.0);
        group.add(head);
        group.head = head;
        recordMat(head);
        
        const body = this.createVoxelBox(2.0, 2.0, 5.0, 0x1a1a1a);
        body.position.set(0, 3.0, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        const leftWing = this.createVoxelBox(4.0, 0.2, 3.0, 0x222222);
        leftWing.position.set(-3.0, 3.5, 0);
        group.add(leftWing);
        group.leftArm = leftWing;
        recordMat(leftWing);

        const rightWing = this.createVoxelBox(4.0, 0.2, 3.0, 0x222222);
        rightWing.position.set(3.0, 3.5, 0);
        group.add(rightWing);
        group.rightArm = rightWing;
        recordMat(rightWing);
        break;
      }
      case MobType.ZOMBIE_PIGMAN: {
        // Head (half pink pig, half green decomposing skull)
        const pigmanTex = this.createPixelTexture(16, 16, (ctx) => {
          ctx.fillStyle = '#e89486';
          ctx.fillRect(0, 0, 8, 16);
          ctx.fillStyle = '#4c6e3b';
          ctx.fillRect(8, 0, 8, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(2, 6, 2, 2);
          ctx.fillStyle = '#ff1111';
          ctx.fillRect(11, 6, 2, 2);
          ctx.fillStyle = '#3a2318';
          ctx.fillRect(4, 10, 4, 3);
        });
        const head = this.createVoxelBox(0.5, 0.5, 0.5, 0x9b5d5d, pigmanTex);
        head.position.set(0, 1.65, 0);
        group.add(head);
        group.head = head;
        recordMat(head);

        // Body
        const body = this.createVoxelBox(0.5, 0.75, 0.28, 0x5a3e36);
        body.position.set(0, 1.05, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        // Arms
        const leftArm = this.createVoxelBox(0.22, 0.72, 0.22, 0x9b5d5d);
        leftArm.position.set(-0.36, 1.05, 0);
        group.add(leftArm);
        group.leftArm = leftArm;
        recordMat(leftArm);

        const rightArm = this.createVoxelBox(0.22, 0.22, 0.72, 0x9b5d5d);
        rightArm.position.set(0.36, 1.25, 0.3);
        group.add(rightArm);
        group.rightArm = rightArm;
        recordMat(rightArm);

        // Golden Sword
        const sword = this.createVoxelBox(0.08, 0.08, 0.75, 0xf6d132);
        sword.position.set(0.36, 1.25, 0.75);
        group.add(sword);
        recordMat(sword);

        // Legs
        const leftLeg = this.createVoxelBox(0.23, 0.72, 0.24, 0x4a3229);
        leftLeg.position.set(-0.13, 0.36, 0);
        group.add(leftLeg);
        group.leftLeg = leftLeg;
        recordMat(leftLeg);

        const rightLeg = this.createVoxelBox(0.23, 0.72, 0.24, 0x4a3229);
        rightLeg.position.set(0.13, 0.36, 0);
        group.add(rightLeg);
        group.rightLeg = rightLeg;
        recordMat(rightLeg);
        break;
      }
    }

    return group;
  }

  /**
   * Spawns a mob entity in the world at (x, y, z)
   */
  public spawnMob(type: MobType, x: number, y: number, z: number, dimension: 'overworld' | 'nether' | 'end'): MobEntity {
    const id = `mob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const maxHealth = type === MobType.ENDER_DRAGON ? 200 : (type === MobType.CREEPER ? 20 : type === MobType.PIG ? 10 : 20);

    const mob: MobEntity = {
      id,
      type,
      position: { x, y, z },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: Math.random() * Math.PI * 2,
      health: maxHealth,
      maxHealth,
      hurtTimer: 0,
      attackCooldown: 0,
      walkTimer: Math.random() * 10,
      state: 'idle',
      dimension,
      fuseTimer: type === MobType.CREEPER ? 0 : undefined,
    };

    const mesh = this.buildMobMesh(type);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    this.mobMeshes.set(id, mesh);
    this.mobs.push(mob);

    return mob;
  }

  /**
   * Removes a mob from the scene and internal list
   */
  public removeMob(id: string) {
    const mesh = this.mobMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.mobMeshes.delete(id);
    }
    this.mobs = this.mobs.filter((m) => m.id !== id);
  }

  /**
   * Cleans up all mobs (e.g. on new world seed)
   */
  public clearAll() {
    for (const mesh of this.mobMeshes.values()) {
      this.scene.remove(mesh);
    }
    this.mobMeshes.clear();
    this.mobs = [];
  }

  /**
   * Tries to naturally spawn mobs around the player
   */
  private checkNaturalSpawning(playerX: number, playerY: number, playerZ: number, currentDim: 'overworld' | 'nether' | 'end') {
    // Filter mobs to current dimension count
    const dimMobs = this.mobs.filter((m) => m.dimension === currentDim);
    if (dimMobs.length >= this.maxMobs) return;

    // Pick random position 14 to 28 blocks away from player
    const angle = Math.random() * Math.PI * 2;
    const dist = 14 + Math.random() * 14;
    const sx = Math.floor(playerX + Math.cos(angle) * dist);
    const sz = Math.floor(playerZ + Math.sin(angle) * dist);

    // Find surface solid block
    const startY = currentDim === 'nether' ? 24 : Math.min(50, Math.floor(playerY + 8));
    let groundY = -1;

    for (let y = startY; y >= 6; y--) {
      const b = this.chunkManager.getBlock(sx, y, sz);
      const above = this.chunkManager.getBlock(sx, y + 1, sz);
      const above2 = this.chunkManager.getBlock(sx, y + 2, sz);

      if (b !== BlockType.AIR && b !== BlockType.WATER && b !== BlockType.LAVA && b !== BlockType.FIRE) {
        if (above === BlockType.AIR && above2 === BlockType.AIR) {
          groundY = y + 1;
          break;
        }
      }
    }

    if (groundY <= 0) return;

    // Select mob type depending on dimension
    if (currentDim === 'end') {
      // Don't naturally spawn in end, dragon is spawned manually
      return;
    }
    if (currentDim === 'nether') {
      this.spawnMob(MobType.ZOMBIE_PIGMAN, sx + 0.5, groundY, sz + 0.5, 'nether');
    } else {
      const roll = Math.random();
      let type = MobType.PIG;
      if (roll < 0.38) type = MobType.ZOMBIE;
      else if (roll < 0.65) type = MobType.CREEPER;
      else if (roll < 0.85) type = MobType.SKELETON;
      else type = MobType.PIG;

      this.spawnMob(type, sx + 0.5, groundY, sz + 0.5, 'overworld');
    }
  }

  /**
   * Main update tick for all mobs: AI, physics, walk animation, sounds, and interactions
   */
  public update(
    delta: number,
    playerPos: THREE.Vector3,
    currentDimension: 'overworld' | 'nether' | 'end',
    isSurvival: boolean,
    onPlayerDamage: (damage: number) => void,
    onMobKilled: (drops: MobDrop[], xp: number, mx: number, my: number, mz: number) => void
  ) {
    const dt = Math.min(delta, 0.05);
    const timeStep = dt * 60;

    // 1. Natural Mob Spawner check every ~3 seconds
    this.spawnTimer += delta;
    if (this.spawnTimer >= 3.2) {
      this.spawnTimer = 0;
      this.checkNaturalSpawning(playerPos.x, playerPos.y, playerPos.z, currentDimension);
    }

    // 2. Ambient Mob sounds
    this.soundTimer += delta;
    if (this.soundTimer >= 5.0) {
      this.soundTimer = 0;
      const nearMob = this.mobs.find((m) => {
        if (m.dimension !== currentDimension) return false;
        const dx = m.position.x - playerPos.x;
        const dz = m.position.z - playerPos.z;
        return dx * dx + dz * dz < 144; // within 12 blocks
      });
      if (nearMob) {
        if (nearMob.type === MobType.ZOMBIE || nearMob.type === MobType.ZOMBIE_PIGMAN) {
          sound.playZombieGroan();
        } else if (nearMob.type === MobType.PIG) {
          sound.playPigOink();
        }
      }
    }

    // 3. Process each mob
    const deadMobIds: string[] = [];

    for (const mob of this.mobs) {
      const mesh = this.mobMeshes.get(mob.id);
      if (!mesh) continue;

      // Dimension visibility
      if (mob.dimension !== currentDimension) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;

      // Distance to player
      const dx = playerPos.x - mob.position.x;
      const dy = playerPos.y - mob.position.y;
      const dz = playerPos.z - mob.position.z;
      const distSq = dx * dx + dz * dz;
      const dist = Math.sqrt(distSq);

      // Flash red when hurt
      if (mob.hurtTimer > 0) {
        mob.hurtTimer -= delta;
        if (mesh.materials) {
          for (const mat of mesh.materials) {
            mat.color.setHex(0xff3333);
          }
        }
      } else if (mesh.materials && mesh.originalColors) {
        for (let i = 0; i < mesh.materials.length; i++) {
          mesh.materials[i].color.setHex(mesh.originalColors[i]);
        }
      }

      // Decrement attack cooldown
      if (mob.attackCooldown > 0) mob.attackCooldown -= delta;

      // Ender Dragon custom flying Boss AI
      if (mob.type === MobType.ENDER_DRAGON) {
        const flap = Math.sin(Date.now() * 0.012) * 0.6;
        if (mesh.leftArm) mesh.leftArm.rotation.z = flap;
        if (mesh.rightArm) mesh.rightArm.rotation.z = -flap;
        if (mesh.head) mesh.head.rotation.x = Math.sin(Date.now() * 0.006) * 0.2;

        mob.fuseTimer = (mob.fuseTimer || 0) + delta;
        const flightTime = mob.fuseTimer;
        
        const isSwooping = Math.sin(flightTime * 0.35) > 0.4;
        const targetRadius = isSwooping ? 6 : 28;
        const targetY = isSwooping ? Math.max(54, playerPos.y + 1.2) : 68 + Math.sin(flightTime * 0.8) * 5;
        const orbitAngle = flightTime * 0.7;

        const targetX = Math.cos(orbitAngle) * targetRadius + (isSwooping ? playerPos.x * 0.85 : 0);
        const targetZ = Math.sin(orbitAngle) * targetRadius + (isSwooping ? playerPos.z * 0.85 : 0);

        const diffX = targetX - mob.position.x;
        const diffY = targetY - mob.position.y;
        const diffZ = targetZ - mob.position.z;

        const flySpeed = isSwooping ? 7.5 : 5.0;
        mob.position.x += diffX * Math.min(1.0, delta * flySpeed);
        mob.position.y += diffY * Math.min(1.0, delta * 3.2);
        mob.position.z += diffZ * Math.min(1.0, delta * flySpeed);

        mesh.position.copy(mob.position);
        const targetRot = Math.atan2(diffX, diffZ);
        mob.rotation = targetRot;
        mesh.rotation.y = targetRot;

        if (dist < 4.0 && mob.attackCooldown <= 0) {
          sound.playMobHurt();
          onPlayerDamage(5);
          mob.attackCooldown = 2.5;
        }

        continue;
      }

      // --- AI Behavior ---
      let moveSpeed = 0;
      let targetRot = mob.rotation;

      const isHostile =
        mob.type === MobType.ZOMBIE ||
        mob.type === MobType.CREEPER ||
        mob.type === MobType.SKELETON ||
        (mob.type === MobType.ZOMBIE_PIGMAN && mob.health < mob.maxHealth);

      if (isHostile && isSurvival && dist < 16.0) {
        // Chase player!
        targetRot = Math.atan2(dx, dz);
        mob.state = 'chase';

        if (mob.type === MobType.CREEPER) {
          if (dist < 3.2) {
            // Creeper Priming Fuse
            moveSpeed = 0;
            mob.fuseTimer = (mob.fuseTimer || 0) + delta;
            if (mob.fuseTimer < 0.1) {
              sound.playCreeperHiss();
            }

            // Creeper swelling animation & flashing
            const swellScale = 1.0 + (mob.fuseTimer / 1.5) * 0.35;
            mesh.scale.set(swellScale, swellScale, swellScale);

            // Flash white
            if (Math.floor(mob.fuseTimer * 10) % 2 === 0 && mesh.materials) {
              for (const mat of mesh.materials) mat.color.setHex(0xffffff);
            }

            // Explode!
            if (mob.fuseTimer >= 1.5) {
              sound.playExplosion();
              deadMobIds.push(mob.id);

              // Explosion damage & knockback to player if within blast radius
              if (dist < 6.0) {
                const blastDmg = Math.max(2, Math.floor(16 * (1 - dist / 6.0)));
                onPlayerDamage(blastDmg);
              }
              continue;
            }
          } else {
            // Deflate if player backs away
            if (mob.fuseTimer && mob.fuseTimer > 0) {
              mob.fuseTimer = Math.max(0, mob.fuseTimer - delta * 2.0);
              mesh.scale.set(1, 1, 1);
            }
            moveSpeed = 0.055;
          }
        } else if (mob.type === MobType.ZOMBIE || mob.type === MobType.ZOMBIE_PIGMAN) {
          moveSpeed = 0.06;
          // Attack player if within melee range
          if (dist < 1.4 && mob.attackCooldown <= 0) {
            sound.playMobHurt();
            onPlayerDamage(mob.type === MobType.ZOMBIE_PIGMAN ? 4 : 3);
            mob.attackCooldown = 1.2;
          }
        } else if (mob.type === MobType.SKELETON) {
          // Skeleton keeps distance and shoots arrows
          if (dist < 6.0) {
            // Back up slightly
            moveSpeed = -0.04;
          } else if (dist > 11.0) {
            moveSpeed = 0.05;
          } else {
            moveSpeed = 0;
          }

          if (mob.attackCooldown <= 0 && dist < 14.0) {
            sound.playArrowShoot();
            mob.attackCooldown = 2.4;
            // Arrow damage
            if (dist < 12.0) {
              setTimeout(() => {
                sound.playMobHurt();
                onPlayerDamage(2);
              }, 250);
            }
          }
        }
      } else {
        // Idle wander
        if (mob.fuseTimer && mob.fuseTimer > 0) {
          mob.fuseTimer = 0;
          mesh.scale.set(1, 1, 1);
        }

        mob.walkTimer += delta;
        if (mob.walkTimer > 4.5) {
          mob.walkTimer = 0;
          mob.rotation = Math.random() * Math.PI * 2;
          mob.state = Math.random() < 0.6 ? 'wander' : 'idle';
        }

        if (mob.state === 'wander') {
          moveSpeed = 0.025;
        }
      }

      // Smoothly interpolate rotation
      mob.rotation = targetRot;
      mesh.rotation.y = mob.rotation;

      // Apply forward velocity
      if (moveSpeed !== 0) {
        mob.velocity.x = Math.sin(mob.rotation) * moveSpeed * timeStep;
        mob.velocity.z = Math.cos(mob.rotation) * moveSpeed * timeStep;
      } else {
        mob.velocity.x *= 0.7;
        mob.velocity.z *= 0.7;
      }

      // Gravity
      mob.velocity.y = Math.max(-0.6, mob.velocity.y - 0.016 * timeStep);

      // Position update with block collision
      const newX = mob.position.x + mob.velocity.x;
      const newZ = mob.position.z + mob.velocity.z;

      // Check wall collision & auto-jump up 1 block
      const footBlockX = this.chunkManager.getBlock(Math.floor(newX), Math.floor(mob.position.y), Math.floor(mob.position.z));
      const footBlockZ = this.chunkManager.getBlock(Math.floor(mob.position.x), Math.floor(mob.position.y), Math.floor(newZ));

      if (footBlockX !== BlockType.AIR && footBlockX !== BlockType.WATER) {
        const headBlock = this.chunkManager.getBlock(Math.floor(newX), Math.floor(mob.position.y + 1), Math.floor(mob.position.z));
        if (headBlock === BlockType.AIR) {
          // Jump over 1-block ledge!
          mob.velocity.y = 0.22;
          mob.position.x = newX;
        } else {
          mob.velocity.x = 0;
        }
      } else {
        mob.position.x = newX;
      }

      if (footBlockZ !== BlockType.AIR && footBlockZ !== BlockType.WATER) {
        const headBlock = this.chunkManager.getBlock(Math.floor(mob.position.x), Math.floor(mob.position.y + 1), Math.floor(newZ));
        if (headBlock === BlockType.AIR) {
          mob.velocity.y = 0.22;
          mob.position.z = newZ;
        } else {
          mob.velocity.z = 0;
        }
      } else {
        mob.position.z = newZ;
      }

      // Y Axis ground collision
      mob.position.y += mob.velocity.y * timeStep;
      const blockBelow = this.chunkManager.getBlock(
        Math.floor(mob.position.x),
        Math.floor(mob.position.y),
        Math.floor(mob.position.z)
      );

      if (blockBelow !== BlockType.AIR && blockBelow !== BlockType.WATER) {
        mob.position.y = Math.floor(mob.position.y) + 1.0;
        mob.velocity.y = 0;
      }

      // Update mesh position
      mesh.position.set(mob.position.x, mob.position.y, mob.position.z);

      // Walking leg swing animation
      if (Math.abs(mob.velocity.x) > 0.005 || Math.abs(mob.velocity.z) > 0.005) {
        const swing = Math.sin(Date.now() * 0.008) * 0.6;
        if (mesh.leftLeg) mesh.leftLeg.rotation.x = swing;
        if (mesh.rightLeg) mesh.rightLeg.rotation.x = -swing;
        if (mesh.legFL) mesh.legFL.rotation.x = swing;
        if (mesh.legBR) mesh.legBR.rotation.x = swing;
        if (mesh.legFR) mesh.legFR.rotation.x = -swing;
        if (mesh.legBL) mesh.legBL.rotation.x = -swing;
      } else {
        if (mesh.leftLeg) mesh.leftLeg.rotation.x = 0;
        if (mesh.rightLeg) mesh.rightLeg.rotation.x = 0;
        if (mesh.legFL) mesh.legFL.rotation.x = 0;
        if (mesh.legBR) mesh.legBR.rotation.x = 0;
        if (mesh.legFR) mesh.legFR.rotation.x = 0;
        if (mesh.legBL) mesh.legBL.rotation.x = 0;
      }
    }

    // Remove dead mobs
    for (const id of deadMobIds) {
      this.removeMob(id);
    }
  }

  /**
   * Raycasts against all mobs to see if player's hit struck a mob
   * Returns true if a mob was hit, along with damage applied
   */
  public hitMobWithWeapon(
    eyePos: THREE.Vector3,
    viewDir: THREE.Vector3,
    damage: number,
    currentDimension: 'overworld' | 'nether' | 'end',
    onMobKilled: (drops: MobDrop[], xp: number, mx: number, my: number, mz: number) => void
  ): boolean {
    let closestMob: MobEntity | null = null;
    let closestDist = 999;

    const ray = new THREE.Ray(eyePos, viewDir.clone().normalize());

    for (const mob of this.mobs) {
      if (mob.dimension !== currentDimension) continue;

      const isDragon = mob.type === MobType.ENDER_DRAGON;
      const sphereRadius = isDragon ? 5.5 : 0.85;
      const maxReach = isDragon ? 14.0 : 3.8;

      // Approximate AABB sphere around mob center
      const mobCenter = new THREE.Vector3(mob.position.x, mob.position.y + (isDragon ? 1.5 : 0.9), mob.position.z);
      const mobSphere = new THREE.Sphere(mobCenter, sphereRadius);

      if (ray.intersectsSphere(mobSphere)) {
        const dist = eyePos.distanceTo(mobCenter);
        if (dist < maxReach && dist < closestDist) {
          closestDist = dist;
          closestMob = mob;
        }
      }
    }

    if (!closestMob) return false;

    // Apply Damage
    closestMob.health -= damage;
    closestMob.hurtTimer = 0.22;
    sound.playMobHurt();

    // Knockback
    closestMob.velocity.x += viewDir.x * 0.16;
    closestMob.velocity.z += viewDir.z * 0.16;
    closestMob.velocity.y = 0.18;

    // Check death
    if (closestMob.health <= 0) {
      sound.playMobDeath();

      // Determine loot drops
      const drops: MobDrop[] = [];
      if (closestMob.type === MobType.ZOMBIE) {
        drops.push({ item: ItemType.ROTTEN_FLESH, count: Math.floor(Math.random() * 2) + 1 });
      } else if (closestMob.type === MobType.CREEPER) {
        drops.push({ item: ItemType.GUNPOWDER, count: Math.floor(Math.random() * 2) + 1 });
      } else if (closestMob.type === MobType.SKELETON) {
        drops.push({ item: ItemType.BONE, count: Math.floor(Math.random() * 2) + 1 });
        drops.push({ item: ItemType.ARROW, count: Math.floor(Math.random() * 3) + 1 });
      } else if (closestMob.type === MobType.PIG) {
        drops.push({ item: ItemType.PORKCHOP, count: Math.floor(Math.random() * 2) + 1 });
      } else if (closestMob.type === MobType.ZOMBIE_PIGMAN) {
        drops.push({ item: ItemType.GOLD_NUGGET, count: Math.floor(Math.random() * 3) + 1 });
        drops.push({ item: ItemType.ROTTEN_FLESH, count: 1 });
      } else if (closestMob.type === MobType.ENDER_DRAGON) {
        drops.push({ item: ItemType.DIAMOND, count: 12 });
        drops.push({ item: BlockType.OBSIDIAN, count: 8 });
      }

      onMobKilled(drops, closestMob.type === MobType.ENDER_DRAGON ? 50 : 5, closestMob.position.x, closestMob.position.y, closestMob.position.z);
      this.removeMob(closestMob.id);
    }

    return true;
  }

  public getEnderDragon(): { health: number; maxHealth: number } | null {
    for (const mob of this.mobs) {
      if (mob.type === MobType.ENDER_DRAGON) {
        return { health: mob.health, maxHealth: mob.maxHealth };
      }
    }
    return null;
  }
}
