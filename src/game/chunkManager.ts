import * as THREE from 'three';
import { BlockType } from '../types';
import { BLOCK_DEFS, textureManager } from './textures';
import { CHUNK_SIZE, CHUNK_HEIGHT, WorldGenerator } from './worldGen';

export interface Chunk {
  cx: number;
  cz: number;
  blocks: Uint8Array;
  mesh: THREE.Mesh | null;
  waterMesh: THREE.Mesh | null;
  portalMesh: THREE.Mesh | null;
  needsRebuild: boolean;
}

// 6 Cardinal directions: [dx, dy, dz]
const DIRECTIONS = [
  { dir: [0, 1, 0], face: 'top', normal: [0, 1, 0], light: 1.0 },       // Top (+Y)
  { dir: [0, -1, 0], face: 'bottom', normal: [0, -1, 0], light: 0.5 },  // Bottom (-Y)
  { dir: [0, 0, 1], face: 'north', normal: [0, 0, 1], light: 0.8 },     // North (+Z)
  { dir: [0, 0, -1], face: 'south', normal: [0, 0, -1], light: 0.8 },   // South (-Z)
  { dir: [1, 0, 0], face: 'east', normal: [1, 0, 0], light: 0.65 },     // East (+X)
  { dir: [-1, 0, 0], face: 'west', normal: [-1, 0, 0], light: 0.65 },   // West (-X)
];

export class ChunkManager {
  public overworldChunks = new Map<string, Chunk>();
  public netherChunks = new Map<string, Chunk>();
  public endChunks = new Map<string, Chunk>();
  public chunks = this.overworldChunks;
  public currentDimension: 'overworld' | 'nether' | 'end' = 'overworld';
  public worldGen: WorldGenerator;
  public scene: THREE.Scene;
  public opaqueMaterial: THREE.MeshStandardMaterial;
  public waterMaterial: THREE.MeshStandardMaterial;
  public portalMaterial: THREE.MeshStandardMaterial;
  private pendingMeshes: string[] = [];

  constructor(scene: THREE.Scene, seed: number = 1337) {
    this.scene = scene;
    this.worldGen = new WorldGenerator(seed);

    // Opaque and alpha-tested voxel material (leaves, flowers, solid blocks, fire)
    this.opaqueMaterial = new THREE.MeshStandardMaterial({
      map: textureManager.atlasTexture,
      alphaTest: 0.4,
      transparent: false,
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Translucent water material
    this.waterMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.1,
      metalness: 0.1,
      map: textureManager.atlasTexture,
      transparent: true,
      opacity: 0.72,
      vertexColors: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Translucent shimmering Nether Portal material
    this.portalMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.0,
      emissive: new THREE.Color(0x330033),
      emissiveIntensity: 0.5,
      map: textureManager.atlasTexture,
      transparent: true,
      opacity: 0.82,
      vertexColors: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }

  public switchDimension(targetDim: 'overworld' | 'nether' | 'end') {
    if (this.currentDimension === targetDim) return;

    // Remove all current dimension meshes from the scene
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) this.scene.remove(chunk.mesh);
      if (chunk.waterMesh) this.scene.remove(chunk.waterMesh);
      if (chunk.portalMesh) this.scene.remove(chunk.portalMesh);
    }

    this.currentDimension = targetDim;
    this.chunks = targetDim === 'overworld' ? this.overworldChunks : (targetDim === 'nether' ? this.netherChunks : this.endChunks);

    // Add target dimension meshes back to the scene
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) this.scene.add(chunk.mesh);
      if (chunk.waterMesh) this.scene.add(chunk.waterMesh);
      if (chunk.portalMesh) this.scene.add(chunk.portalMesh);
    }

    this.pendingMeshes = [];
  }

  public getChunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  public getChunk(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(this.getChunkKey(cx, cz));
  }

  public getOrCreateChunk(cx: number, cz: number): Chunk {
    const key = this.getChunkKey(cx, cz);
    let chunk = this.chunks.get(key);
    if (!chunk) {
      const blocks = this.worldGen.generateChunk(cx, cz, this.currentDimension);
      chunk = {
        cx,
        cz,
        blocks,
        mesh: null,
        waterMesh: null,
        portalMesh: null,
        needsRebuild: true,
      };
      this.chunks.set(key, chunk);
      this.pendingMeshes.push(key);
    }
    return chunk;
  }

  /**
   * Fast block lookup at global coordinates (worldX, worldY, worldZ)
   */
  public getBlock(wx: number, wy: number, wz: number): BlockType {
    if (wy < 0 || wy >= CHUNK_HEIGHT) return BlockType.AIR;

    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.chunks.get(this.getChunkKey(cx, cz));
    if (!chunk) return BlockType.AIR;

    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const idx = lx + lz * CHUNK_SIZE + wy * (CHUNK_SIZE * CHUNK_SIZE);
    return chunk.blocks[idx] || BlockType.AIR;
  }

  /**
   * Set block at global coordinates, flags chunk and neighbor chunks for remeshing
   */
  public setBlock(wx: number, wy: number, wz: number, type: BlockType): boolean {
    if (wy < 0 || wy >= CHUNK_HEIGHT) return false;

    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getOrCreateChunk(cx, cz);

    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const idx = lx + lz * CHUNK_SIZE + wy * (CHUNK_SIZE * CHUNK_SIZE);

    chunk.blocks[idx] = type;
    this.rebuildChunk(chunk);

    // If on chunk border, rebuild neighboring chunk
    if (lx === 0) this.flagNeighborForRebuild(cx - 1, cz);
    if (lx === CHUNK_SIZE - 1) this.flagNeighborForRebuild(cx + 1, cz);
    if (lz === 0) this.flagNeighborForRebuild(cx, cz - 1);
    if (lz === CHUNK_SIZE - 1) this.flagNeighborForRebuild(cx, cz + 1);

    return true;
  }

  private flagNeighborForRebuild(cx: number, cz: number) {
    const chunk = this.getChunk(cx, cz);
    if (chunk) {
      this.rebuildChunk(chunk);
    }
  }

  /**
   * Builds the optimized face-culled BufferGeometry for a chunk
   */
  public rebuildChunk(chunk: Chunk) {
    // Collect buffers for opaque and water meshes
    const opaquePos: number[] = [];
    const opaqueNorm: number[] = [];
    const opaqueUv: number[] = [];
    const opaqueCol: number[] = [];
    const opaqueIdx: number[] = [];
    let opaqueVertCount = 0;

    const waterPos: number[] = [];
    const waterNorm: number[] = [];
    const waterUv: number[] = [];
    const waterCol: number[] = [];
    const waterIdx: number[] = [];
    let waterVertCount = 0;

    const portalPos: number[] = [];
    const portalNorm: number[] = [];
    const portalUv: number[] = [];
    const portalCol: number[] = [];
    const portalIdx: number[] = [];
    let portalVertCount = 0;

    const startX = chunk.cx * CHUNK_SIZE;
    const startZ = chunk.cz * CHUNK_SIZE;

    const getLocalBlock = (lx: number, ly: number, lz: number): BlockType => {
      if (ly < 0 || ly >= CHUNK_HEIGHT) return BlockType.AIR;
      if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
        return chunk.blocks[lx + lz * CHUNK_SIZE + ly * (CHUNK_SIZE * CHUNK_SIZE)];
      }
      // World boundary lookup
      return this.getBlock(startX + lx, ly, startZ + lz);
    };

    for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          const blockType = chunk.blocks[lx + lz * CHUNK_SIZE + ly * (CHUNK_SIZE * CHUNK_SIZE)];
          if (blockType === BlockType.AIR) continue;

          const blockDef = BLOCK_DEFS[blockType];
          if (!blockDef) continue;
          const isWater = blockType === BlockType.WATER;
          const isPortal = blockType === BlockType.NETHER_PORTAL || blockType === BlockType.END_PORTAL;

          const x = startX + lx;
          const y = ly;
          const z = startZ + lz;

          // Check 6 cardinal faces
          for (let f = 0; f < 6; f++) {
            const { dir, face, normal, light } = DIRECTIONS[f];
            const nx = lx + dir[0];
            const ny = ly + dir[1];
            const nz = lz + dir[2];

            const neighborType = getLocalBlock(nx, ny, nz);
            const neighborDef = BLOCK_DEFS[neighborType];

            let shouldRenderFace = false;

            if (isWater) {
              // Water face renders against air or non-water transparent blocks
              shouldRenderFace = neighborType === BlockType.AIR || (neighborDef && neighborDef.transparent && neighborType !== BlockType.WATER);
            } else if (isPortal) {
              shouldRenderFace = neighborType !== blockType;
            } else {
              // Opaque block face renders if neighbor is air, water, portal, or transparent
              shouldRenderFace = !neighborDef || neighborDef.transparent;
            }

            if (!shouldRenderFace) continue;

            // Determine texture index for this face
            let texIdx = blockDef.textures.side;
            if (face === 'top') texIdx = blockDef.textures.top;
            else if (face === 'bottom') texIdx = blockDef.textures.bottom;
            else if (face === 'north' && blockDef.textures.north !== undefined) texIdx = blockDef.textures.north;
            else if (face === 'south' && blockDef.textures.south !== undefined) texIdx = blockDef.textures.south;

            const [uMin, vMin, uMax, vMax] = textureManager.getTileUV(texIdx);

            // Compute face quad vertices
            let v0: [number, number, number];
            let v1: [number, number, number];
            let v2: [number, number, number];
            let v3: [number, number, number];

            // Water has slightly lowered top face (14/16 height)
            const topY = isWater ? y + 0.88 : y + 1;

            if (face === 'top') {
              v0 = [x, topY, z];
              v1 = [x, topY, z + 1];
              v2 = [x + 1, topY, z + 1];
              v3 = [x + 1, topY, z];
            } else if (face === 'bottom') {
              v0 = [x, y, z + 1];
              v1 = [x, y, z];
              v2 = [x + 1, y, z];
              v3 = [x + 1, y, z + 1];
            } else if (face === 'north') { // +Z
              v0 = [x + 1, y, z + 1];
              v1 = [x + 1, topY, z + 1];
              v2 = [x, topY, z + 1];
              v3 = [x, y, z + 1];
            } else if (face === 'south') { // -Z
              v0 = [x, y, z];
              v1 = [x, topY, z];
              v2 = [x + 1, topY, z];
              v3 = [x + 1, y, z];
            } else if (face === 'east') { // +X
              v0 = [x + 1, y, z];
              v1 = [x + 1, topY, z];
              v2 = [x + 1, topY, z + 1];
              v3 = [x + 1, y, z + 1];
            } else { // west (-X)
              v0 = [x, y, z + 1];
              v1 = [x, topY, z + 1];
              v2 = [x, topY, z];
              v3 = [x, y, z];
            }

            const targetPos = isPortal ? portalPos : (isWater ? waterPos : opaquePos);
            const targetNorm = isPortal ? portalNorm : (isWater ? waterNorm : opaqueNorm);
            const targetUv = isPortal ? portalUv : (isWater ? waterUv : opaqueUv);
            const targetCol = isPortal ? portalCol : (isWater ? waterCol : opaqueCol);
            const targetIdx = isPortal ? portalIdx : (isWater ? waterIdx : opaqueIdx);
            const baseIndex = isPortal ? portalVertCount : (isWater ? waterVertCount : opaqueVertCount);

            // Push 4 vertices
            targetPos.push(...v0, ...v1, ...v2, ...v3);
            for (let i = 0; i < 4; i++) {
              targetNorm.push(...normal);
              targetCol.push(light, light, light);
            }
            targetUv.push(
              uMin, vMax,
              uMin, vMin,
              uMax, vMin,
              uMax, vMax
            );

            // Two triangles: 0, 1, 2 and 0, 2, 3
            targetIdx.push(
              baseIndex, baseIndex + 1, baseIndex + 2,
              baseIndex, baseIndex + 2, baseIndex + 3
            );

            if (isPortal) {
              portalVertCount += 4;
            } else if (isWater) {
              waterVertCount += 4;
            } else {
              opaqueVertCount += 4;
            }
          }
        }
      }
    }

    // Update or create opaque mesh
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      chunk.mesh = null;
    }
    if (opaquePos.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(opaquePos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(opaqueNorm, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(opaqueUv, 2));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(opaqueCol, 3));
      geo.setIndex(opaqueIdx);
      geo.computeBoundingSphere();

      const mesh = new THREE.Mesh(geo, this.opaqueMaterial);
      mesh.name = `chunk_${chunk.cx}_${chunk.cz}`;
      this.scene.add(mesh);
      chunk.mesh = mesh;
    }

    // Update or create water mesh
    if (chunk.waterMesh) {
      this.scene.remove(chunk.waterMesh);
      chunk.waterMesh.geometry.dispose();
      chunk.waterMesh = null;
    }
    if (waterPos.length > 0) {
      const waterGeo = new THREE.BufferGeometry();
      waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waterPos, 3));
      waterGeo.setAttribute('normal', new THREE.Float32BufferAttribute(waterNorm, 3));
      waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(waterUv, 2));
      waterGeo.setAttribute('color', new THREE.Float32BufferAttribute(waterCol, 3));
      waterGeo.setIndex(waterIdx);
      waterGeo.computeBoundingSphere();

      const wMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
      wMesh.name = `water_${chunk.cx}_${chunk.cz}`;
      this.scene.add(wMesh);
      chunk.waterMesh = wMesh;
    }

    // Update or create portal mesh
    if (chunk.portalMesh) {
      this.scene.remove(chunk.portalMesh);
      chunk.portalMesh.geometry.dispose();
      chunk.portalMesh = null;
    }
    if (portalPos.length > 0) {
      const portalGeo = new THREE.BufferGeometry();
      portalGeo.setAttribute('position', new THREE.Float32BufferAttribute(portalPos, 3));
      portalGeo.setAttribute('normal', new THREE.Float32BufferAttribute(portalNorm, 3));
      portalGeo.setAttribute('uv', new THREE.Float32BufferAttribute(portalUv, 2));
      portalGeo.setAttribute('color', new THREE.Float32BufferAttribute(portalCol, 3));
      portalGeo.setIndex(portalIdx);
      portalGeo.computeBoundingSphere();

      const pMesh = new THREE.Mesh(portalGeo, this.portalMaterial);
      pMesh.name = `portal_${chunk.cx}_${chunk.cz}`;
      this.scene.add(pMesh);
      chunk.portalMesh = pMesh;
    }

    chunk.needsRebuild = false;
  }

  /**
   * Update chunks dynamically around player position
   */
  public update(playerX: number, playerZ: number, renderDistance: number = 4) {
    const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

    const neededKeys = new Set<string>();

    // Spiral / distance sorted chunk queue
    const queue: Array<{ cx: number; cz: number; distSq: number }> = [];

    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dz = -renderDistance; dz <= renderDistance; dz++) {
        const distSq = dx * dx + dz * dz;
        if (distSq <= renderDistance * renderDistance + 1) {
          const cx = playerChunkX + dx;
          const cz = playerChunkZ + dz;
          const key = this.getChunkKey(cx, cz);
          neededKeys.add(key);
          if (!this.chunks.has(key)) {
            queue.push({ cx, cz, distSq });
          }
        }
      }
    }

    // Sort queue so closer chunks generate first
    queue.sort((a, b) => a.distSq - b.distSq);

    // Generate up to 2 chunks per frame to keep solid 60 FPS
    let generatedCount = 0;
    for (const item of queue) {
      this.getOrCreateChunk(item.cx, item.cz);
      generatedCount++;
      if (generatedCount >= 2) break;
    }

    // Process pending mesh rebuilds (max 2 per frame)
    let rebuiltCount = 0;
    while (this.pendingMeshes.length > 0 && rebuiltCount < 2) {
      const key = this.pendingMeshes.shift()!;
      const chunk = this.chunks.get(key);
      if (chunk && chunk.needsRebuild) {
        this.rebuildChunk(chunk);
        rebuiltCount++;
      }
    }

    // Unload chunks far beyond renderDistance (renderDistance + 2)
    const unloadDistSq = (renderDistance + 2) * (renderDistance + 2);
    for (const [key, chunk] of this.chunks.entries()) {
      const dx = chunk.cx - playerChunkX;
      const dz = chunk.cz - playerChunkZ;
      if (dx * dx + dz * dz > unloadDistSq) {
        if (chunk.mesh) {
          this.scene.remove(chunk.mesh);
          chunk.mesh.geometry.dispose();
        }
        if (chunk.waterMesh) {
          this.scene.remove(chunk.waterMesh);
          chunk.waterMesh.geometry.dispose();
        }
        if (chunk.portalMesh) {
          this.scene.remove(chunk.portalMesh);
          chunk.portalMesh.geometry.dispose();
        }
        this.chunks.delete(key);
      }
    }
  }

  public getLoadedChunksCount(): number {
    return this.chunks.size;
  }

  public getTotalTriangles(): number {
    let count = 0;
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) count += chunk.mesh.geometry.index ? chunk.mesh.geometry.index.count / 3 : 0;
      if (chunk.waterMesh) count += chunk.waterMesh.geometry.index ? chunk.waterMesh.geometry.index.count / 3 : 0;
      if (chunk.portalMesh) count += chunk.portalMesh.geometry.index ? chunk.portalMesh.geometry.index.count / 3 : 0;
    }
    return count;
  }

  public dispose() {
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
      }
      if (chunk.waterMesh) {
        this.scene.remove(chunk.waterMesh);
        chunk.waterMesh.geometry.dispose();
      }
      if (chunk.portalMesh) {
        this.scene.remove(chunk.portalMesh);
        chunk.portalMesh.geometry.dispose();
      }
    }
    this.chunks.clear();
    this.opaqueMaterial.dispose();
    this.waterMaterial.dispose();
    this.portalMaterial.dispose();
  }
}
