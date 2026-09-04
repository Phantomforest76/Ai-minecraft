import * as THREE from 'three';
import { BlockType, ItemType, ItemDef } from '../types';
import { getItemDef } from './items';
import { ChunkManager } from './chunkManager';
import { sound } from './audio';

interface DroppedItem {
  id: number; // BlockType or ItemType
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  bobTime: number;
  pickupDelay: number;
}

export class ItemDropManager {
  private scene: THREE.Scene;
  private chunkManager: ChunkManager;
  public drops: DroppedItem[] = [];
  
  // A shared geometry for all mini-block drops
  private cubeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
  // Cache materials by color
  private materialCache: Record<string, THREE.MeshBasicMaterial> = {};

  constructor(scene: THREE.Scene, chunkManager: ChunkManager) {
    this.scene = scene;
    this.chunkManager = chunkManager;
  }

  private getMaterial(color: string) {
    if (!this.materialCache[color]) {
      // Small border on the material by using color directly
      this.materialCache[color] = new THREE.MeshBasicMaterial({ color });
    }
    return this.materialCache[color];
  }

  public spawnDrop(id: number, x: number, y: number, z: number) {
    const def = getItemDef(id);
    if (!def) return;

    const mesh = new THREE.Mesh(this.cubeGeo, this.getMaterial(def.color));
    
    // Add black wireframe for that "item texture" 3D pixel look
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(this.cubeGeo),
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    mesh.add(wireframe);

    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.drops.push({
      id,
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 2,
        (Math.random() - 0.5) * 4
      ),
      bobTime: Math.random() * Math.PI * 2,
      pickupDelay: 0.5 // Cannot be picked up immediately
    });
  }

  public update(
    delta: number, 
    playerPos: THREE.Vector3, 
    onPickup: (id: number) => void
  ) {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      
      if (drop.pickupDelay > 0) {
        drop.pickupDelay -= delta;
      }

      // Physics
      drop.velocity.y -= 15 * delta; // Gravity
      
      const prevY = drop.mesh.position.y;
      
      drop.mesh.position.addScaledVector(drop.velocity, delta);
      
      // Simple floor collision (checking block below)
      const bx = Math.floor(drop.mesh.position.x);
      const by = Math.floor(drop.mesh.position.y - 0.125);
      const bz = Math.floor(drop.mesh.position.z);
      
      const blockBelow = this.chunkManager.getBlock(bx, by, bz);
      if (blockBelow !== BlockType.AIR) {
        drop.mesh.position.y = by + 1 + 0.125;
        drop.velocity.y = 0;
        drop.velocity.x *= 0.5; // Friction
        drop.velocity.z *= 0.5;
      }

      // Rotation and Bobbing (visual only, offset from physics position)
      drop.bobTime += delta * 3;
      drop.mesh.rotation.y += delta * 1.5;
      
      // We apply bobbing on render by just moving the mesh up/down temporarily?
      // Actually, let's just make the mesh visually bob, but keep physics steady
      // We can use an inner group, but simpler to just bob the physics position slightly when resting
      if (drop.velocity.y === 0 && Math.abs(drop.velocity.x) < 0.1) {
        drop.mesh.position.y += Math.sin(drop.bobTime) * 0.005;
      }

      // Check pickup
      if (drop.pickupDelay <= 0) {
        const dist = drop.mesh.position.distanceTo(playerPos);
        if (dist < 1.5) {
          // Magnetize towards player
          const dir = playerPos.clone().sub(drop.mesh.position).normalize();
          drop.mesh.position.addScaledVector(dir, delta * 10);
          
          if (dist < 0.5) {
            // Pickup!
            sound.playPop();
            onPickup(drop.id);
            this.scene.remove(drop.mesh);
            this.drops.splice(i, 1);
          }
        }
      }
    }
  }

  public clearAll() {
    for (const drop of this.drops) {
      this.scene.remove(drop.mesh);
    }
    this.drops = [];
  }
}
