import * as THREE from 'three';
import { BlockType, RaycastHit } from '../types';
import { ChunkManager } from './chunkManager';
import { BLOCK_DEFS } from './textures';

export interface PlayerBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export class PhysicsEngine {
  public chunkManager: ChunkManager;
  public playerWidth: number = 0.6;
  public playerHeight: number = 1.8;
  public eyeHeight: number = 1.62;

  // Constants
  public gravity: number = 0.018;
  public terminalVelocity: number = 0.65;
  public jumpStrength: number = 0.25;

  constructor(chunkManager: ChunkManager) {
    this.chunkManager = chunkManager;
  }

  /**
   * Checks if an AABB collides with any solid voxel block in the world
   */
  public collides(box: PlayerBoundingBox): boolean {
    const minX = Math.floor(box.minX);
    const maxX = Math.floor(box.maxX);
    const minY = Math.floor(box.minY);
    const maxY = Math.floor(box.maxY);
    const minZ = Math.floor(box.minZ);
    const maxZ = Math.floor(box.maxZ);

    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        for (let x = minX; x <= maxX; x++) {
          const block = this.chunkManager.getBlock(x, y, z);
          const def = BLOCK_DEFS[block];
          if (def && def.solid) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Fast 3D DDA (Digital Differential Analyzer) Voxel Raycaster
   * Casts a ray from eye position along direction up to maxDistance (5 blocks).
   */
  public raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number = 5.5
  ): RaycastHit {
    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);

    const stepX = direction.x > 0 ? 1 : -1;
    const stepY = direction.y > 0 ? 1 : -1;
    const stepZ = direction.z > 0 ? 1 : -1;

    const tDeltaX = Math.abs(1 / (direction.x || 1e-10));
    const tDeltaY = Math.abs(1 / (direction.y || 1e-10));
    const tDeltaZ = Math.abs(1 / (direction.z || 1e-10));

    let tMaxX = stepX > 0 ? (x + 1 - origin.x) * tDeltaX : (origin.x - x) * tDeltaX;
    let tMaxY = stepY > 0 ? (y + 1 - origin.y) * tDeltaY : (origin.y - y) * tDeltaY;
    let tMaxZ = stepZ > 0 ? (z + 1 - origin.z) * tDeltaZ : (origin.z - z) * tDeltaZ;

    let faceNormal = { x: 0, y: 0, z: 0 };
    let distance = 0;

    while (distance <= maxDistance) {
      const block = this.chunkManager.getBlock(x, y, z);
      const def = BLOCK_DEFS[block];

      if (block !== BlockType.AIR && block !== BlockType.WATER && def && def.solid) {
        return {
          hit: true,
          blockCoord: { x, y, z },
          faceNormal,
          blockType: block,
          distance,
        };
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          x += stepX;
          distance = tMaxX;
          tMaxX += tDeltaX;
          faceNormal = { x: -stepX, y: 0, z: 0 };
        } else {
          z += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          faceNormal = { x: 0, y: 0, z: -stepZ };
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          distance = tMaxY;
          tMaxY += tDeltaY;
          faceNormal = { x: 0, y: -stepY, z: 0 };
        } else {
          z += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          faceNormal = { x: 0, y: 0, z: -stepZ };
        }
      }
    }

    return {
      hit: false,
      blockCoord: { x: 0, y: 0, z: 0 },
      faceNormal: { x: 0, y: 0, z: 0 },
      blockType: BlockType.AIR,
      distance: 0,
    };
  }

  /**
   * Check if placing a block at (bx, by, bz) would intersect the player's bounding box
   */
  public wouldBlockIntersectPlayer(
    bx: number,
    by: number,
    bz: number,
    playerPos: THREE.Vector3
  ): boolean {
    const hw = this.playerWidth / 2;
    const playerBox: PlayerBoundingBox = {
      minX: playerPos.x - hw,
      maxX: playerPos.x + hw,
      minY: playerPos.y,
      maxY: playerPos.y + this.playerHeight,
      minZ: playerPos.z - hw,
      maxZ: playerPos.z + hw,
    };

    const blockBox: PlayerBoundingBox = {
      minX: bx,
      maxX: bx + 1,
      minY: by,
      maxY: by + 1,
      minZ: bz,
      maxZ: bz + 1,
    };

    return (
      playerBox.minX < blockBox.maxX &&
      playerBox.maxX > blockBox.minX &&
      playerBox.minY < blockBox.maxY &&
      playerBox.maxY > blockBox.minY &&
      playerBox.minZ < blockBox.maxZ &&
      playerBox.maxZ > blockBox.minZ
    );
  }

  /**
   * Resolve player movement with 3-axis continuous collision detection
   */
  public updatePlayerMovement(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    inputMove: THREE.Vector3,
    isFlying: boolean,
    isSprinting: boolean,
    isSneaking: boolean,
    jumpRequested: boolean,
    delta: number = 1 / 60
  ): { onGround: boolean; footstep: boolean } {
    let onGround = false;
    let madeFootstep = false;

    // Normalize movement to 60 FPS reference frame to prevent high-refresh monitors from running at hypersonic speed
    const dt = Math.max(0.001, Math.min(delta, 0.05));
    const timeStep = dt * 60;

    const hw = this.playerWidth / 2;
    const h = this.playerHeight;

    if (isFlying) {
      // Creative flight
      const flySpeed = (isSprinting ? 0.22 : 0.13) * timeStep;
      position.x += inputMove.x * flySpeed;
      position.z += inputMove.z * flySpeed;
      if (jumpRequested) position.y += flySpeed;
      if (isSneaking) position.y -= flySpeed;
      velocity.set(0, 0, 0);
      return { onGround: false, footstep: false };
    }

    // Authentic Java Minecraft speeds (calibrated for 60fps base):
    // Walk: ~4.3 m/s, Sprint: ~5.6 m/s, Sneak: ~1.3 m/s
    let baseSpeed = 0.072;
    if (isSprinting) baseSpeed = 0.096;
    if (isSneaking) baseSpeed = 0.024;

    velocity.x = inputMove.x * baseSpeed * timeStep;
    velocity.z = inputMove.z * baseSpeed * timeStep;

    // Apply gravity
    velocity.y = Math.max(-this.terminalVelocity, velocity.y - this.gravity * timeStep);

    // X Axis movement & collision
    position.x += velocity.x;
    let box: PlayerBoundingBox = {
      minX: position.x - hw,
      maxX: position.x + hw,
      minY: position.y,
      maxY: position.y + h,
      minZ: position.z - hw,
      maxZ: position.z + hw,
    };
    if (this.collides(box)) {
      position.x -= velocity.x;
      velocity.x = 0;
    }

    // Z Axis movement & collision
    position.z += velocity.z;
    box = {
      minX: position.x - hw,
      maxX: position.x + hw,
      minY: position.y,
      maxY: position.y + h,
      minZ: position.z - hw,
      maxZ: position.z + hw,
    };
    if (this.collides(box)) {
      position.z -= velocity.z;
      velocity.z = 0;
    }

    // Y Axis movement & collision
    position.y += velocity.y * timeStep;
    box = {
      minX: position.x - hw,
      maxX: position.x + hw,
      minY: position.y,
      maxY: position.y + h,
      minZ: position.z - hw,
      maxZ: position.z + hw,
    };
    if (this.collides(box)) {
      if (velocity.y < 0) {
        // Landed on ground
        onGround = true;
        // Snap to top of block
        position.y = Math.ceil(position.y);
      } else if (velocity.y > 0) {
        // Hit head on ceiling
        position.y = Math.floor(position.y);
      }
      velocity.y = 0;
    }

    // Jumping
    if (jumpRequested && onGround) {
      velocity.y = this.jumpStrength;
      onGround = false;
    }

    // Sneaking edge hold check (prevent stepping off cliffs when sneaking)
    if (isSneaking && onGround) {
      const belowCheck: PlayerBoundingBox = {
        minX: position.x - hw,
        maxX: position.x + hw,
        minY: position.y - 0.1,
        maxY: position.y,
        minZ: position.z - hw,
        maxZ: position.z + hw,
      };
      if (!this.collides(belowCheck)) {
        // Step back
        position.x -= velocity.x;
        position.z -= velocity.z;
      }
    }

    // Footstep trigger if moving on ground
    if (onGround && (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.z) > 0.01)) {
      madeFootstep = true;
    }

    return { onGround, footstep: madeFootstep };
  }
}
