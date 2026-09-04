import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BlockType, DebugInfo, GameSettings, ItemType, MobType, PlayerStats, RaycastHit } from '../types';
import { ChunkManager } from '../game/chunkManager';
import { PhysicsEngine } from '../game/physics';
import { OverlayManager } from '../game/overlays';
import { SkyManager } from '../game/sky';
import { BLOCK_DEFS } from '../game/textures';
import { sound } from '../game/audio';
import { getItemDef } from '../game/items';
import { MobManager } from '../game/mobManager';
import { ItemDropManager } from '../game/itemDrops';
import { HUD } from './HUD';
import { BlockPickerModal } from './BlockPickerModal';
import { CraftingTableModal } from './CraftingTableModal';
import { FurnaceModal } from './FurnaceModal';
import { ChestModal } from './ChestModal';
import { PauseMenu } from './PauseMenu';
import { GraphicsAnalyzer } from './GraphicsAnalyzer';

/**
 * Builds an authentic 5x5 End Portal Altar with 12 End Portal Frame blocks,
 * 9 Cosmic End Portal blocks, stone brick foundation, and torches.
 */
export const buildEndPortalAt = (chunkManager: ChunkManager, px: number, py: number, pz: number) => {
  // Clear headspace above the portal
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      for (let ay = py; ay <= py + 5; ay++) {
        chunkManager.setBlock(px + dx, ay, pz + dz, BlockType.AIR);
      }
      // Base floor underneath
      chunkManager.setBlock(px + dx, py - 1, pz + dz, BlockType.STONE_BRICK);
    }
  }

  // 4 Corner torches on stone brick pedestals
  const corners = [[-3, -3], [3, -3], [-3, 3], [3, 3]];
  for (const [cx, cz] of corners) {
    chunkManager.setBlock(px + cx, py, pz + cz, BlockType.STONE_BRICK);
    chunkManager.setBlock(px + cx, py + 1, pz + cz, BlockType.TORCH);
  }

  // 12 Portal Frames
  chunkManager.setBlock(px + 2, py, pz, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px + 2, py, pz + 1, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px + 2, py, pz - 1, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px - 2, py, pz, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px - 2, py, pz + 1, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px - 2, py, pz - 1, BlockType.END_PORTAL_FRAME);

  chunkManager.setBlock(px, py, pz + 2, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px + 1, py, pz + 2, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px - 1, py, pz + 2, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px, py, pz - 2, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px + 1, py, pz - 2, BlockType.END_PORTAL_FRAME);
  chunkManager.setBlock(px - 1, py, pz - 2, BlockType.END_PORTAL_FRAME);

  // 9 Cosmic portal blocks
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      chunkManager.setBlock(px + x, py, pz + z, BlockType.END_PORTAL);
    }
  }
};

export const MinecraftGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // UI States
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [showF3, setShowF3] = useState<boolean>(true); // Visible initially to match user screenshot!
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isCraftingTableOpen, setIsCraftingTableOpen] = useState<boolean>(false);
  const [isFurnaceOpen, setIsFurnaceOpen] = useState<boolean>(false);
  const [isChestOpen, setIsChestOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [tooltipText, setTooltipText] = useState<string>('Diamond Sword');

  // Hotbar (9 items): Sword (combat), Pickaxe, 14x Obsidian & Flint/Steel (to build nether portal!), Planks, Torches, Food, Cobble, TNT
  const [hotbar, setHotbar] = useState<number[]>([
    ItemType.DIAMOND_SWORD,
    ItemType.DIAMOND_PICKAXE,
    BlockType.OBSIDIAN,
    ItemType.FLINT_AND_STEEL,
    BlockType.OAK_PLANKS,
    BlockType.TORCH,
    ItemType.PORKCHOP,
    ItemType.PORTAL_BUILDER,
    ItemType.END_PORTAL_BUILDER,
  ]);

  // Player 27-slot Inventory for crafting/storing
  const [inventory, setInventory] = useState<(number | null)[]>(() => {
    const inv = Array(27).fill(null);
    inv[0] = BlockType.FURNACE;
    inv[1] = BlockType.CHEST;
    inv[2] = ItemType.FLINT;
    inv[3] = BlockType.GRAVEL;
    inv[4] = BlockType.SOUL_SAND;
    inv[5] = BlockType.NETHER_BRICK;
    inv[6] = BlockType.NETHER_QUARTZ_ORE;
    inv[7] = ItemType.IRON_INGOT;
    inv[8] = BlockType.TORCH;
    inv[9] = BlockType.QUARTZ_BLOCK;
    return inv;
  });

  const hotbarRef = useRef(hotbar);
  hotbarRef.current = hotbar;

  const selectedSlotRef = useRef(selectedSlot);
  selectedSlotRef.current = selectedSlot;

  // Portal transition effect state
  const [portalWarpProgress, setPortalWarpProgress] = useState(0);
  const portalTimerRef = useRef(0);
  const portalCooldownRef = useRef(0);

  // Player Stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 20,
    maxHealth: 20,
    hunger: 20,
    xpLevel: 7,
    xpProgress: 0.65,
    gameMode: 'survival',
    isFlying: false,
    isSprinting: false,
    isSneaking: false,
    onGround: true,
  });

  const [isDead, setIsDead] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dragonBoss, setDragonBoss] = useState<{ health: number; maxHealth: number } | null>(null);

  // Game Settings - High fidelity graphics enabled by default
  const [settings, setSettings] = useState<GameSettings>({
    renderDistance: 5,
    fov: 70,
    soundEnabled: true,
    masterVolume: 0.5,
    mouseSensitivity: 0.0014, // Smoother, calibrated mouse look
    showF3: true,
    timeOfDay: 0.1, // Day time
    timeSpeed: 0.0004, // Authentic full Minecraft day-night cycle length
    shadows: true,
    highQuality: true,
  });

  // Live Debug Info for F3 screen
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    fps: 60,
    chunksLoaded: 0,
    triangles: 0,
    x: 0,
    y: 35,
    z: 0,
    blockX: 0,
    blockY: 35,
    blockZ: 0,
    chunkX: 0,
    chunkZ: 0,
    facing: 'North',
    biome: 'Plains',
    dimension: 'Overworld (minecraft:overworld)',
    entities: '0/14',
    light: 15,
  });

  // Engine references kept in refs to avoid re-instantiation
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    chunkManager: ChunkManager;
    physics: PhysicsEngine;
    overlays: OverlayManager;
    sky: SkyManager;
    mobManager: MobManager;
    itemDropManager: ItemDropManager;
    playerPos: THREE.Vector3;
    playerVel: THREE.Vector3;
    cameraPitch: number;
    cameraYaw: number;
    keys: Record<string, boolean>;
    miningTarget: { x: number; y: number; z: number } | null;
    miningTime: number;
    isPointerLocked: boolean;
    worldSeed: number;
  } | null>(null);

  // Tooltip timer
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSlotTooltip = useCallback((itemId: number) => {
    const def = getItemDef(itemId);
    setTooltipText(def ? def.name : '');
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setTooltipText(''), 1800);
  }, []);

  // Hotbar slot selection
  const selectSlot = useCallback(
    (slotIdx: number) => {
      setSelectedSlot(slotIdx);
      selectedSlotRef.current = slotIdx;
      const itemId = hotbarRef.current[slotIdx];
      showSlotTooltip(itemId);
      sound.playPop();
      if (engineRef.current) {
        const def = getItemDef(itemId);
        engineRef.current.overlays.setHeldBlock(def.isBlock && def.blockType ? def.blockType : BlockType.AIR);
      }
    },
    [showSlotTooltip]
  );

  // Assign item/block to active slot from creative inventory
  const handleAssignBlock = useCallback(
    (newItemId: number) => {
      setHotbar((prev) => {
        const next = [...prev];
        next[selectedSlotRef.current] = newItemId;
        return next;
      });
      showSlotTooltip(newItemId);
      sound.playPop();
      if (engineRef.current) {
        const def = getItemDef(newItemId);
        engineRef.current.overlays.setHeldBlock(def.isBlock && def.blockType ? def.blockType : BlockType.AIR);
      }
    },
    [showSlotTooltip]
  );

  const [hasStartedPlaying, setHasStartedPlaying] = useState<boolean>(false);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isInventoryOpenRef = useRef(isInventoryOpen);
  isInventoryOpenRef.current = isInventoryOpen;

  const isCraftingTableOpenRef = useRef(isCraftingTableOpen);
  isCraftingTableOpenRef.current = isCraftingTableOpen;

  const isFurnaceOpenRef = useRef(isFurnaceOpen);
  isFurnaceOpenRef.current = isFurnaceOpen;

  const isChestOpenRef = useRef(isChestOpen);
  isChestOpenRef.current = isChestOpen;

  const isDeadRef = useRef(isDead);
  isDeadRef.current = isDead;

  const lastUnlockTimeRef = useRef<number>(0);
  const lockCooldownTimerRef = useRef<any>(null);

  const safeExitPointerLock = useCallback(() => {
    lastUnlockTimeRef.current = performance.now();
    if (lockCooldownTimerRef.current) {
      clearTimeout(lockCooldownTimerRef.current);
      lockCooldownTimerRef.current = null;
    }
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {
        // Ignore exit errors
      }
    }
  }, []);

  const safeRequestPointerLock = useCallback((element?: Element | null) => {
    const target = element || engineRef.current?.renderer?.domElement;
    if (!target) return;
    if (document.pointerLockElement === target) return;

    // Do not request pointer lock if dead or modal is actively open
    if (
      isDeadRef.current ||
      isInventoryOpenRef.current ||
      isCraftingTableOpenRef.current ||
      isFurnaceOpenRef.current ||
      isChestOpenRef.current
    ) {
      return;
    }

    const now = performance.now();
    const timeSinceUnlock = now - lastUnlockTimeRef.current;
    // Chromium enforces an unlock cooldown (~1250ms) where requestPointerLock is rejected
    if (timeSinceUnlock < 1250) {
      if (lockCooldownTimerRef.current) {
        clearTimeout(lockCooldownTimerRef.current);
      }
      lockCooldownTimerRef.current = setTimeout(() => {
        if (
          !isPausedRef.current &&
          !isDeadRef.current &&
          !isInventoryOpenRef.current &&
          !isCraftingTableOpenRef.current &&
          !isFurnaceOpenRef.current &&
          !isChestOpenRef.current &&
          document.pointerLockElement !== target
        ) {
          try {
            const p = target.requestPointerLock() as unknown;
            if (p && typeof (p as Promise<void>).catch === 'function') {
              (p as Promise<void>).catch(() => {});
            }
          } catch {
            // Ignore
          }
        }
      }, 1300 - timeSinceUnlock);
      return;
    }

    try {
      const p = target.requestPointerLock() as unknown;
      if (p && typeof (p as Promise<void>).catch === 'function') {
        (p as Promise<void>).catch(() => {
          // Handled gracefully: catches DOMException: Pointer lock cannot be acquired immediately after the user has exited the lock
        });
      }
    } catch {
      // Synchronous catch
    }
  }, []);

  const safeExitPointerLockRef = useRef(safeExitPointerLock);
  safeExitPointerLockRef.current = safeExitPointerLock;

  const safeRequestPointerLockRef = useRef(safeRequestPointerLock);
  safeRequestPointerLockRef.current = safeRequestPointerLock;

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    setIsInventoryOpen(false);
    setIsCraftingTableOpen(false);
    setIsFurnaceOpen(false);
    setIsChestOpen(false);
    safeRequestPointerLock();
  }, [safeRequestPointerLock]);

  // Initialize Game on Mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      settings.fov,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    scene.add(camera);

    // 2. Renderer with High-Fidelity Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: settings.highQuality ? true : false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    if (settings.shadows !== false) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. Subsystems
    const worldSeed = 1337;
    const chunkManager = new ChunkManager(scene, worldSeed);
    const physics = new PhysicsEngine(chunkManager);
    const overlays = new OverlayManager(scene, camera);
    const sky = new SkyManager(scene);
    const itemDropManager = new ItemDropManager(scene, chunkManager);

    // Initial player position: find top block at (0, 0)
    const { height: spawnY } = chunkManager.worldGen.getHeightAt(0, 0);
    const playerPos = new THREE.Vector3(0.5, spawnY + 2.5, 0.5);
    const playerVel = new THREE.Vector3(0, 0, 0);

    camera.position.copy(playerPos).add(new THREE.Vector3(0, physics.eyeHeight, 0));

    // Initialize held block
    overlays.setHeldBlock(hotbar[selectedSlot]);

    // Initial pre-generation around player
    chunkManager.update(playerPos.x, playerPos.z, settings.renderDistance);

    // Build authentic End Portal Altar right near player spawn point at (8, 6)
    const portalBaseX = 8;
    const portalBaseZ = 6;
    const { height: portalBaseY } = chunkManager.worldGen.getHeightAt(portalBaseX, portalBaseZ);
    buildEndPortalAt(chunkManager, portalBaseX, Math.max(portalBaseY, 15), portalBaseZ);
    chunkManager.update(playerPos.x, playerPos.z, settings.renderDistance);

    // Initialize mob manager and spawn initial authentic Minecraft mobs
    const mobManager = new MobManager(scene, chunkManager);
    mobManager.spawnMob(MobType.PIG, playerPos.x + 5, playerPos.y, playerPos.z + 4, 'overworld');
    mobManager.spawnMob(MobType.PIG, playerPos.x - 6, playerPos.y, playerPos.z + 5, 'overworld');
    mobManager.spawnMob(MobType.ZOMBIE, playerPos.x + 14, playerPos.y, playerPos.z - 7, 'overworld');
    mobManager.spawnMob(MobType.CREEPER, playerPos.x - 11, playerPos.y, playerPos.z - 9, 'overworld');
    mobManager.spawnMob(MobType.SKELETON, playerPos.x + 7, playerPos.y, playerPos.z + 15, 'overworld');

    engineRef.current = {
      scene,
      camera,
      renderer,
      chunkManager,
      physics,
      overlays,
      sky,
      mobManager,
      itemDropManager,
      playerPos,
      playerVel,
      cameraPitch: 0,
      cameraYaw: 0,
      keys: {},
      miningTarget: null,
      miningTime: 0,
      isPointerLocked: false,
      worldSeed,
    };

    // 4. Pointer Lock Handler
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === renderer.domElement;
      if (engineRef.current) {
        engineRef.current.isPointerLocked = isLocked;
      }
      if (!isLocked) {
        lastUnlockTimeRef.current = performance.now();
        setIsPaused(true);
      }
    };
    const handlePointerLockError = () => {
      lastUnlockTimeRef.current = performance.now();
    };
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (
        e.reason &&
        (e.reason.name === 'DOMException' || typeof e.reason.message === 'string') &&
        String(e.reason.message || e.reason).includes('Pointer lock')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 5. Mouse Movement Look
    const handleMouseMove = (e: MouseEvent) => {
      const eng = engineRef.current;
      if (!eng || !eng.isPointerLocked) return;

      const sens = settings.mouseSensitivity;
      eng.cameraYaw -= e.movementX * sens;
      eng.cameraPitch -= e.movementY * sens;

      // Clamp pitch (-89 to +89 degrees)
      eng.cameraPitch = Math.max(-Math.PI / 2 + 0.02, Math.min(Math.PI / 2 - 0.02, eng.cameraPitch));
    };
    document.addEventListener('mousemove', handleMouseMove);

    // 6. Keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (!eng) return;

      if (e.code === 'KeyC') {
        if (isCraftingTableOpenRef.current) {
          setIsCraftingTableOpen(false);
          resumeGame();
        } else {
          safeExitPointerLockRef.current();
          setIsCraftingTableOpen(true);
          setIsPaused(true);
        }
        return;
      }

      if (e.code === 'KeyE') {
        if (isInventoryOpenRef.current) {
          setIsInventoryOpen(false);
          resumeGame();
        } else {
          safeExitPointerLockRef.current();
          setIsInventoryOpen(true);
          setIsPaused(true);
        }
        return;
      }

      if (e.code === 'F3') {
        e.preventDefault();
        setShowF3((prev) => !prev);
        return;
      }

      if (e.code === 'Escape') {
        if (
          isCraftingTableOpenRef.current ||
          isFurnaceOpenRef.current ||
          isChestOpenRef.current ||
          isInventoryOpenRef.current
        ) {
          setIsCraftingTableOpen(false);
          setIsFurnaceOpen(false);
          setIsChestOpen(false);
          setIsInventoryOpen(false);
          resumeGame();
          return;
        }
        if (isPausedRef.current) {
          resumeGame();
        } else {
          safeExitPointerLockRef.current();
          setIsPaused(true);
        }
        return;
      }

      // Hotbar numbers 1-9
      if (e.key >= '1' && e.key <= '9') {
        const slotIdx = parseInt(e.key, 10) - 1;
        selectSlot(slotIdx);
        return;
      }

      eng.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 7. Mouse Wheel to scroll hotbar
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        setSelectedSlot((prev) => {
          const next = (prev + 1) % 9;
          selectSlot(next);
          return next;
        });
      } else if (e.deltaY < 0) {
        setSelectedSlot((prev) => {
          const next = (prev + 8) % 9;
          selectSlot(next);
          return next;
        });
      }
    };
    window.addEventListener('wheel', handleWheel);

    // 8. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Main Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;
    let currentFps = 60;
    let footstepTimer = 0;

    const gameLoop = (now: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // FPS tracking
      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 0.5) {
        currentFps = Math.round((frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
      }

      const eng = engineRef.current;
      if (!eng) return;

      const {
        camera,
        playerPos,
        playerVel,
        chunkManager,
        physics,
        overlays,
        sky,
        keys,
      } = eng;

      // Only update physics and mining if pointer is locked
      const isLocked = eng.isPointerLocked;

      if (isLocked) {
        // Compute input movement vector from camera yaw
        const forward = new THREE.Vector3(-Math.sin(eng.cameraYaw), 0, -Math.cos(eng.cameraYaw));
        const right = new THREE.Vector3(Math.cos(eng.cameraYaw), 0, -Math.sin(eng.cameraYaw));

        const moveDir = new THREE.Vector3(0, 0, 0);
        if (keys['KeyW']) moveDir.add(forward);
        if (keys['KeyS']) moveDir.sub(forward);
        if (keys['KeyD']) moveDir.add(right);
        if (keys['KeyA']) moveDir.sub(right);

        if (moveDir.lengthSq() > 0) moveDir.normalize();

        const isSprinting = !!keys['ControlLeft'] || !!keys['ControlRight'];
        const isSneaking = !!keys['ShiftLeft'] || !!keys['ShiftRight'];
        const jumpRequested = !!keys['Space'];

        // Physics step with frame-rate delta scaling
        const prevVelY = playerVel.y;
        const wasOnGround = playerStats.onGround;
        const { onGround, footstep } = physics.updatePlayerMovement(
          playerPos,
          playerVel,
          moveDir,
          playerStats.isFlying,
          isSprinting,
          isSneaking,
          jumpRequested,
          delta
        );

        // Check Fall Damage
        if (!wasOnGround && onGround && prevVelY < -12) {
          const fallDistance = -prevVelY - 12;
          const damage = Math.floor(fallDistance * 0.5);
          if (damage > 0 && playerStats.gameMode === 'survival') {
            sound.playHurt();
            setPlayerStats((prev) => {
              const nextHealth = Math.max(0, prev.health - damage);
              if (nextHealth === 0 && !isDead) {
                setIsDead(true);
                safeExitPointerLockRef.current();
                setIsPaused(true);
              }
              return { ...prev, health: nextHealth, onGround };
            });
          } else {
             setPlayerStats(prev => ({...prev, onGround}));
          }
        } else {
             setPlayerStats(prev => ({...prev, onGround}));
        }

        // Footstep sound cadence
        if (footstep) {
          footstepTimer += delta * (isSprinting ? 1.6 : 1.0);
          if (footstepTimer >= 0.38) {
            const blockBelow = chunkManager.getBlock(
              Math.floor(playerPos.x),
              Math.floor(playerPos.y - 0.2),
              Math.floor(playerPos.z)
            );
            const def = BLOCK_DEFS[blockBelow];
            sound.playFootstep(def ? def.sound : 'grass');
            footstepTimer = 0;
          }
        }

        // Raycast for targeted block
        const eyePos = playerPos.clone().add(new THREE.Vector3(0, physics.eyeHeight, 0));
        const viewDir = new THREE.Vector3(
          -Math.sin(eng.cameraYaw) * Math.cos(eng.cameraPitch),
          Math.sin(eng.cameraPitch),
          -Math.cos(eng.cameraYaw) * Math.cos(eng.cameraPitch)
        );

        const hit: RaycastHit = physics.raycast(eyePos, viewDir, 5.0);

        if (hit.hit) {
          overlays.setTargetOutline(hit.blockCoord.x, hit.blockCoord.y, hit.blockCoord.z, true);

          // If mining block
          if (eng.miningTarget) {
            const isSameBlock =
              eng.miningTarget.x === hit.blockCoord.x &&
              eng.miningTarget.y === hit.blockCoord.y &&
              eng.miningTarget.z === hit.blockCoord.z;

            if (isSameBlock) {
              const def = BLOCK_DEFS[hit.blockType];
              let hardness = playerStats.gameMode === 'creative' ? 0.05 : (def?.hardness || 1.0);

              // Apply tool mining speed
              const heldId = hotbarRef.current[selectedSlotRef.current];
              const itemDef = heldId ? getItemDef(heldId) : null;
              if (itemDef?.miningMultiplier && def) {
                if (def.sound === 'stone' && itemDef.miningMultiplier.stone) {
                  hardness /= itemDef.miningMultiplier.stone;
                } else if (def.sound === 'wood' && itemDef.miningMultiplier.wood) {
                  hardness /= itemDef.miningMultiplier.wood;
                } else if (def.sound === 'dirt' && itemDef.miningMultiplier.dirt) {
                  hardness /= itemDef.miningMultiplier.dirt;
                }
              }

              eng.miningTime += delta;
              const stage = Math.min(9, Math.floor((eng.miningTime / hardness) * 10));
              overlays.setBreakProgress(hit.blockCoord.x, hit.blockCoord.y, hit.blockCoord.z, stage);

              // Block broken!
              if (eng.miningTime >= hardness) {
                sound.playBlockBreak(def ? def.sound : 'grass');
                chunkManager.setBlock(hit.blockCoord.x, hit.blockCoord.y, hit.blockCoord.z, BlockType.AIR);
                
                // Spawn dropped item
                if (hit.blockType && playerStats.gameMode === 'survival') {
                  let dropType: number = hit.blockType;
                  // If stone, drop cobblestone like real Minecraft
                  if (hit.blockType === BlockType.STONE) dropType = BlockType.COBBLESTONE;
                  else if (hit.blockType === BlockType.COAL_ORE) dropType = ItemType.COAL;
                  else if (hit.blockType === BlockType.IRON_ORE) dropType = BlockType.IRON_ORE; // Keep as ore until smelted
                  else if (hit.blockType === BlockType.DIAMOND_ORE) dropType = ItemType.DIAMOND;
                  else if (hit.blockType === BlockType.GOLD_ORE) dropType = BlockType.GOLD_ORE;
                  else if (hit.blockType === BlockType.GRASS) dropType = BlockType.DIRT;

                  eng.itemDropManager.spawnDrop(
                    dropType, 
                    hit.blockCoord.x + 0.5, 
                    hit.blockCoord.y + 0.5, 
                    hit.blockCoord.z + 0.5
                  );
                }

                overlays.setBreakProgress(0, 0, 0, -1);
                eng.miningTarget = null;
                eng.miningTime = 0;

                // Grant XP
                setPlayerStats((prev) => ({
                  ...prev,
                  xpProgress: (prev.xpProgress + 0.08) % 1,
                  xpLevel: prev.xpLevel + (prev.xpProgress + 0.08 >= 1 ? 1 : 0),
                }));
              }
            } else {
              // Target changed
              eng.miningTarget = null;
              eng.miningTime = 0;
              overlays.setBreakProgress(0, 0, 0, -1);
            }
          }
        } else {
          overlays.setTargetOutline(0, 0, 0, false);
          overlays.setBreakProgress(0, 0, 0, -1);
          eng.miningTarget = null;
          eng.miningTime = 0;
        }

        // Camera orientation & position
        camera.rotation.order = 'YXZ';
        camera.rotation.y = eng.cameraYaw;
        camera.rotation.x = eng.cameraPitch;
        camera.position.copy(playerPos).add(new THREE.Vector3(0, physics.eyeHeight, 0));

        // Update hand / held item animations
        const isMoving = moveDir.lengthSq() > 0.01;
        overlays.update(delta, isMoving, isSprinting);

        // Nether Portal standing detection & dimension teleportation
        const pFeetBlock = chunkManager.getBlock(
          Math.floor(playerPos.x),
          Math.floor(playerPos.y + 0.1),
          Math.floor(playerPos.z)
        );
        const pBodyBlock = chunkManager.getBlock(
          Math.floor(playerPos.x),
          Math.floor(playerPos.y + 0.9),
          Math.floor(playerPos.z)
        );
        const inPortal = pFeetBlock === BlockType.NETHER_PORTAL || pBodyBlock === BlockType.NETHER_PORTAL;
        const inEndPortal = pFeetBlock === BlockType.END_PORTAL || pBodyBlock === BlockType.END_PORTAL;

        if (inEndPortal) {
          if (portalCooldownRef.current <= 0) {
            sound.playPortalTravel(); // Use portal travel sound
            portalCooldownRef.current = 4.0; // grace period
            
            const targetDim = chunkManager.currentDimension === 'end' ? 'overworld' : 'end';
            chunkManager.switchDimension(targetDim);
            sky.dimension = targetDim;
            
            if (targetDim === 'end') {
              // Teleport to the End island
              playerPos.set(0.5, 57.5, 0.5);
              playerVel.set(0, 0, 0);
              
              // Spawn the Ender Dragon if none is alive
              if (!eng.mobManager.getEnderDragon()) {
                eng.mobManager.spawnMob(MobType.ENDER_DRAGON, 0, 75, 0, 'end');
              }
            } else {
              // Return to Overworld spawn near the shrine
              const { height: spawnY } = chunkManager.worldGen.getHeightAt(0, 0);
              playerPos.set(0.5, spawnY + 2.5, 0.5);
              playerVel.set(0, 0, 0);
            }
            
            chunkManager.update(playerPos.x, playerPos.z, settings.renderDistance);
          }
        } else if (inPortal) {
          if (portalCooldownRef.current <= 0) {
            portalTimerRef.current += delta;
            if (portalTimerRef.current > 0.05 && portalTimerRef.current - delta <= 0.05) {
              sound.playPortal();
            }
            setPortalWarpProgress(Math.min(1.0, portalTimerRef.current / 1.5));

            const threshold = playerStats.gameMode === 'creative' ? 0.6 : 1.5;
            if (portalTimerRef.current >= threshold) {
              sound.playPortalTravel();
              portalCooldownRef.current = 3.0; // grace period before teleporting again
              portalTimerRef.current = 0;
              setPortalWarpProgress(0);

              const targetDim = chunkManager.currentDimension === 'overworld' ? 'nether' : 'overworld';
              chunkManager.switchDimension(targetDim);
              sky.dimension = targetDim;

              if (targetDim === 'nether') {
                // Teleport to Nether spawn platform
                playerPos.set(8.5, 25.5, 8.5);
                playerVel.set(0, 0, 0);
              } else {
                // Teleport back to Overworld portal
                playerPos.set(9.5, 26.5, 8.5);
                playerVel.set(0, 0, 0);
              }
              chunkManager.update(playerPos.x, playerPos.z, settings.renderDistance);
            }
          }
        } else {
          if (portalCooldownRef.current > 0) {
            portalCooldownRef.current -= delta;
          }
          if (portalTimerRef.current > 0) {
            portalTimerRef.current = Math.max(0, portalTimerRef.current - delta * 2.5);
            setPortalWarpProgress(portalTimerRef.current / 1.5);
          }
        }

        // Update dynamic chunk loading
        chunkManager.update(playerPos.x, playerPos.z, settings.renderDistance);

        // Update sky & clouds
        sky.update(delta, settings.timeOfDay, settings.renderDistance, playerPos);

        const currentDim = chunkManager.currentDimension;

        // Update Dropped Items
        eng.itemDropManager.update(delta, playerPos, (itemId) => {
          setHotbar((prev) => {
            const emptyIdx = prev.findIndex((s) => s === BlockType.AIR || s === null);
            if (emptyIdx !== -1) {
              const copy = [...prev];
              copy[emptyIdx] = itemId;
              return copy;
            }
            return prev;
          });
          setInventory((prev) => {
            const emptyIdx = prev.findIndex((s) => s === null || s === BlockType.AIR);
            if (emptyIdx !== -1) {
              const copy = [...prev];
              copy[emptyIdx] = itemId;
              return copy;
            }
            return prev;
          });
        });

        // Update Mobs (AI, walking animations, attacking, damage, loot drops)
        eng.mobManager.update(
          delta,
          playerPos,
          currentDim,
          playerStats.gameMode === 'survival',
          (damage) => {
            sound.playHurt();
            setPlayerStats((prev) => {
              const nextHealth = Math.max(0, prev.health - damage);
              if (nextHealth === 0 && !isDead) {
                setIsDead(true);
                safeExitPointerLockRef.current();
                setIsPaused(true);
              }
              return { ...prev, health: nextHealth };
            });
          },
          (drops, xp, mx, my, mz) => {
            for (const drop of drops) {
              eng.itemDropManager.spawnDrop(drop.item, mx, my, mz);
            }
            setPlayerStats((prev) => {
              const nextXp = prev.xpProgress + 0.25;
              if (nextXp >= 1.0) {
                return {
                  ...prev,
                  xpLevel: prev.xpLevel + 1,
                  xpProgress: nextXp - 1.0,
                };
              }
              return { ...prev, xpProgress: nextXp };
            });
          }
        );

        // Update live debug info for F3 overlay
        const facingAngle = ((eng.cameraYaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let facingStr = 'North (towards -Z)';
        if (facingAngle > Math.PI * 0.25 && facingAngle <= Math.PI * 0.75) facingStr = 'West (towards -X)';
        else if (facingAngle > Math.PI * 0.75 && facingAngle <= Math.PI * 1.25) facingStr = 'South (towards +Z)';
        else if (facingAngle > Math.PI * 1.25 && facingAngle <= Math.PI * 1.75) facingStr = 'East (towards +X)';

        const currentBiome = currentDim === 'nether'
          ? { name: 'Nether Wastes' }
          : currentDim === 'end'
          ? { name: 'The End' }
          : chunkManager.worldGen.getBiomeAt(Math.floor(playerPos.x), Math.floor(playerPos.z));

        const activeDimMobs = eng.mobManager.mobs.filter((m) => m.dimension === currentDim).length;

        if (currentDim === 'end') {
          const dragon = eng.mobManager.getEnderDragon();
          setDragonBoss(dragon ? { health: dragon.health, maxHealth: dragon.maxHealth } : null);
        } else {
          setDragonBoss(null);
        }

        setDebugInfo({
          fps: currentFps,
          chunksLoaded: chunkManager.getLoadedChunksCount(),
          triangles: chunkManager.getTotalTriangles(),
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
          blockX: Math.floor(playerPos.x),
          blockY: Math.floor(playerPos.y),
          blockZ: Math.floor(playerPos.z),
          chunkX: Math.floor(playerPos.x / 16),
          chunkZ: Math.floor(playerPos.z / 16),
          facing: facingStr,
          biome: currentBiome.name,
          dimension: currentDim === 'nether'
            ? 'The Nether (minecraft:the_nether)'
            : currentDim === 'end'
            ? 'The End (minecraft:the_end)'
            : 'Overworld (minecraft:overworld)',
          entities: `${activeDimMobs}/${eng.mobManager.mobs.length}`,
          light: currentDim === 'nether' ? 11 : currentDim === 'end' ? 12 : 15,
        });
      }

      // Render Three.js Scene
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      chunkManager.dispose();
      overlays.dispose();
      sky.dispose();
      mobManager.clearAll();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Run on mount

  const tryLightNetherPortal = (
    cm: ChunkManager,
    startX: number,
    startY: number,
    startZ: number
  ): boolean => {
    // Check both orientations: X-aligned (Z constant) and Z-aligned (X constant)
    for (const isX of [true, false]) {
      for (let w = 2; w <= 3; w++) {
        const h = 3;
        for (let ox = 0; ox < w; ox++) {
          for (let oy = 0; oy < h; oy++) {
            const baseCoordX = isX ? startX - ox : startX;
            const baseCoordZ = isX ? startZ : startZ - ox;
            const baseCoordY = startY - oy;

            // Check interior (must be AIR, FIRE, or NETHER_PORTAL)
            let validInterior = true;
            for (let iw = 0; iw < w; iw++) {
              for (let ih = 0; ih < h; ih++) {
                const bx = isX ? baseCoordX + iw : baseCoordX;
                const bz = isX ? baseCoordZ : baseCoordZ + iw;
                const by = baseCoordY + ih;
                const blk = cm.getBlock(bx, by, bz);
                if (blk !== BlockType.AIR && blk !== BlockType.FIRE && blk !== BlockType.NETHER_PORTAL) {
                  validInterior = false;
                  break;
                }
              }
              if (!validInterior) break;
            }
            if (!validInterior) continue;

            // Check bottom obsidian row
            let validFrame = true;
            for (let iw = 0; iw < w; iw++) {
              const bx = isX ? baseCoordX + iw : baseCoordX;
              const bz = isX ? baseCoordZ : baseCoordZ + iw;
              if (cm.getBlock(bx, baseCoordY - 1, bz) !== BlockType.OBSIDIAN) {
                validFrame = false;
                break;
              }
            }
            if (!validFrame) continue;

            // Check top obsidian row
            for (let iw = 0; iw < w; iw++) {
              const bx = isX ? baseCoordX + iw : baseCoordX;
              const bz = isX ? baseCoordZ : baseCoordZ + iw;
              if (cm.getBlock(bx, baseCoordY + h, bz) !== BlockType.OBSIDIAN) {
                validFrame = false;
                break;
              }
            }
            if (!validFrame) continue;

            // Check left and right obsidian columns
            for (let ih = 0; ih < h; ih++) {
              const lx = isX ? baseCoordX - 1 : baseCoordX;
              const lz = isX ? baseCoordZ : baseCoordZ - 1;
              const rx = isX ? baseCoordX + w : baseCoordX;
              const rz = isX ? baseCoordZ : baseCoordZ + w;
              const by = baseCoordY + ih;
              if (
                cm.getBlock(lx, by, lz) !== BlockType.OBSIDIAN ||
                cm.getBlock(rx, by, rz) !== BlockType.OBSIDIAN
              ) {
                validFrame = false;
                break;
              }
            }
            if (!validFrame) continue;

            // Valid obsidian frame found! Light it up with portal blocks
            for (let iw = 0; iw < w; iw++) {
              for (let ih = 0; ih < h; ih++) {
                const bx = isX ? baseCoordX + iw : baseCoordX;
                const bz = isX ? baseCoordZ : baseCoordZ + iw;
                const by = baseCoordY + ih;
                cm.setBlock(bx, by, bz, BlockType.NETHER_PORTAL);
              }
            }
            return true;
          }
        }
      }
    }
    return false;
  };

  // Mouse Click Interactions (Mine, Place, Pick)
  const handleMouseDown = (e: React.MouseEvent) => {
    const eng = engineRef.current;
    if (!eng) return;

    // If modal is open, game is paused, or player is dead, don't trigger game clicks
    if (
      isPaused ||
      isInventoryOpen ||
      isCraftingTableOpen ||
      isFurnaceOpen ||
      isChestOpen ||
      isDead
    ) {
      return;
    }

    // If pointer is not locked, lock it safely on click
    if (!eng.isPointerLocked) {
      safeRequestPointerLock(eng.renderer.domElement);
      setIsPaused(false);
      return;
    }

    const { camera, playerPos, physics, chunkManager, overlays } = eng;
    const eyePos = playerPos.clone().add(new THREE.Vector3(0, physics.eyeHeight, 0));
    const viewDir = new THREE.Vector3(
      -Math.sin(eng.cameraYaw) * Math.cos(eng.cameraPitch),
      Math.sin(eng.cameraPitch),
      -Math.cos(eng.cameraYaw) * Math.cos(eng.cameraPitch)
    );
    const hit = physics.raycast(eyePos, viewDir, 5.0);

    overlays.triggerSwing();

    // 0: Left click (Attack mob OR Mine block)
    if (e.button === 0) {
      // First: check if raycast attacks a mob in range
      const heldId = hotbarRef.current[selectedSlotRef.current];
      let damage = 1;
      if (heldId === ItemType.DIAMOND_SWORD) damage = 7;
      else if (heldId === ItemType.IRON_SWORD) damage = 6;
      else if (heldId === ItemType.STONE_SWORD) damage = 5;
      else if (heldId === ItemType.WOODEN_SWORD) damage = 4;
      else if (heldId === ItemType.DIAMOND_PICKAXE) damage = 4;
      else if (heldId === ItemType.IRON_PICKAXE) damage = 3;

      const hitMob = eng.mobManager.hitMobWithWeapon(
        eyePos,
        viewDir,
        damage,
        chunkManager.currentDimension,
        (drops, xp, mx, my, mz) => {
          for (const drop of drops) {
            eng.itemDropManager.spawnDrop(drop.item, mx, my, mz);
          }
          setPlayerStats((prev) => {
            const nextXp = prev.xpProgress + 0.25;
            if (nextXp >= 1.0) {
              return {
                ...prev,
                xpLevel: prev.xpLevel + 1,
                xpProgress: nextXp - 1.0,
              };
            }
            return { ...prev, xpProgress: nextXp };
          });
        }
      );

      if (hitMob) {
        // Struck mob, do not mine block behind it!
        return;
      }

      if (hit.hit) {
        eng.miningTarget = { x: hit.blockCoord.x, y: hit.blockCoord.y, z: hit.blockCoord.z };
        eng.miningTime = 0;

        // In creative mode, instant break!
        if (playerStats.gameMode === 'creative') {
          const def = BLOCK_DEFS[hit.blockType];
          sound.playBlockBreak(def ? def.sound : 'grass');
          chunkManager.setBlock(hit.blockCoord.x, hit.blockCoord.y, hit.blockCoord.z, BlockType.AIR);
          overlays.setBreakProgress(0, 0, 0, -1);
          eng.miningTarget = null;
        }
      }
    }

    // 2: Right click (Place block or interact with functional blocks!)
    if (e.button === 2) {
      e.preventDefault();
      if (hit.hit) {
        const heldItem = hotbarRef.current[selectedSlotRef.current];
        const itemDef = getItemDef(heldItem);

        // 0. Portal Builder Item
        if (heldItem === ItemType.PORTAL_BUILDER) {
          const px = hit.blockCoord.x;
          const py = hit.blockCoord.y + hit.faceNormal.y;
          const pz = hit.blockCoord.z;
          
          sound.playFlintAndSteel(); // Good enough building sound

          // Build a basic 4x5 obsidian frame facing Z axis
          for (let y = 0; y < 5; y++) {
            for (let x = -1; x <= 2; x++) {
              if (y === 0 || y === 4 || x === -1 || x === 2) {
                chunkManager.setBlock(px + x, py + y, pz, BlockType.OBSIDIAN);
              } else {
                chunkManager.setBlock(px + x, py + y, pz, BlockType.NETHER_PORTAL);
              }
            }
          }
          sound.playPortal();
          return;
        }

        // 0.5. End Portal Builder Item
        if (heldItem === ItemType.END_PORTAL_BUILDER) {
          const px = hit.blockCoord.x;
          const py = hit.blockCoord.y + hit.faceNormal.y;
          const pz = hit.blockCoord.z;
          
          sound.playFlintAndSteel();
          buildEndPortalAt(chunkManager, px, py, pz);
          sound.playPortal();
          return;
        }

        // 1. Flint and Steel interactions (igniting TNT, opening Nether Portal, or lighting Fire)
        if (heldItem === ItemType.FLINT_AND_STEEL) {
          sound.playFlintAndSteel();

          // Ignite TNT
          if (hit.blockType === BlockType.TNT) {
            primeTNT(hit.blockCoord.x, hit.blockCoord.y, hit.blockCoord.z);
            return;
          }

          const placeX = hit.blockCoord.x + hit.faceNormal.x;
          const placeY = hit.blockCoord.y + hit.faceNormal.y;
          const placeZ = hit.blockCoord.z + hit.faceNormal.z;

          // Try activating Nether Portal frame
          let lit = tryLightNetherPortal(chunkManager, placeX, placeY, placeZ);
          if (!lit && hit.blockType === BlockType.OBSIDIAN) {
            lit = tryLightNetherPortal(chunkManager, hit.blockCoord.x, hit.blockCoord.y + 1, hit.blockCoord.z);
          }

          if (lit) {
            sound.playPortal();
            return;
          }

          // Otherwise place Fire on surface
          if (chunkManager.getBlock(placeX, placeY, placeZ) === BlockType.AIR) {
            chunkManager.setBlock(placeX, placeY, placeZ, BlockType.FIRE);
          }
          return;
        }

        // 2. Functional block interactions
        if (hit.blockType === BlockType.CRAFTING_TABLE) {
          safeExitPointerLock();
          setIsCraftingTableOpen(true);
          setIsPaused(true);
          sound.playClick();
          return;
        }

        if (hit.blockType === BlockType.FURNACE) {
          safeExitPointerLock();
          setIsFurnaceOpen(true);
          setIsPaused(true);
          sound.playClick();
          return;
        }

        if (hit.blockType === BlockType.CHEST) {
          safeExitPointerLock();
          setIsChestOpen(true);
          setIsPaused(true);
          return;
        }

        if (hit.blockType === BlockType.TNT) {
          primeTNT(hit.blockCoord.x, hit.blockCoord.y, hit.blockCoord.z);
          return;
        }

        // 3. Otherwise place block
        const placeX = hit.blockCoord.x + hit.faceNormal.x;
        const placeY = hit.blockCoord.y + hit.faceNormal.y;
        const placeZ = hit.blockCoord.z + hit.faceNormal.z;

        // Check if held item can be placed as a block
        if (
          itemDef.isBlock &&
          itemDef.blockType !== undefined &&
          !physics.wouldBlockIntersectPlayer(placeX, placeY, placeZ, playerPos)
        ) {
          const blockToPlace = itemDef.blockType;
          const def = BLOCK_DEFS[blockToPlace];
          sound.playBlockPlace(def ? def.sound : 'stone');
          chunkManager.setBlock(placeX, placeY, placeZ, blockToPlace);
        }
      }
    }

    // 1: Middle click (Pick block)
    if (e.button === 1) {
      e.preventDefault();
      if (hit.hit && hit.blockType !== BlockType.AIR) {
        handleAssignBlock(hit.blockType);
      }
    }
  };

  const primeTNT = (bx: number, by: number, bz: number) => {
    const eng = engineRef.current;
    if (!eng) return;

    sound.playFuse();
    eng.chunkManager.setBlock(bx, by, bz, BlockType.AIR);

    setTimeout(() => {
      sound.playExplosion();

      const radius = 3;
      for (let ox = -radius; ox <= radius; ox++) {
        for (let oy = -radius; oy <= radius; oy++) {
          for (let oz = -radius; oz <= radius; oz++) {
            const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
            if (dist <= radius) {
              const tx = bx + ox;
              const ty = by + oy;
              const tz = bz + oz;
              const blk = eng.chunkManager.getBlock(tx, ty, tz);
              if (blk !== BlockType.AIR && blk !== BlockType.BEDROCK && blk !== BlockType.OBSIDIAN) {
                eng.chunkManager.setBlock(tx, ty, tz, BlockType.AIR);
              }
            }
          }
        }
      }

      // Knockback / player impulse if player is near
      const pDist = eng.playerPos.distanceTo(new THREE.Vector3(bx, by, bz));
      if (pDist < 7) {
        const knockDir = eng.playerPos.clone().sub(new THREE.Vector3(bx, by, bz)).normalize();
        const force = Math.max(0, 14 * (1 - pDist / 7));
        eng.playerVel.add(knockDir.multiplyScalar(force));
        eng.playerVel.y += 4.5;
        setPlayerStats((prev) => ({
          ...prev,
          health: Math.max(1, prev.health - Math.floor(force)),
        }));
      }
    }, 2400);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const eng = engineRef.current;
    if (!eng) return;
    if (e.button === 0) {
      eng.miningTarget = null;
      eng.miningTime = 0;
      eng.overlays.setBreakProgress(0, 0, 0, -1);
    }
  };

  const handleNewWorld = (newSeed: number) => {
    const eng = engineRef.current;
    if (!eng) return;

    eng.worldSeed = newSeed;
    eng.chunkManager.worldGen = new (eng.chunkManager.worldGen.constructor as any)(newSeed);
    eng.chunkManager.dispose();

    const { height: spawnY } = eng.chunkManager.worldGen.getHeightAt(0, 0);
    eng.playerPos.set(0.5, spawnY + 2.5, 0.5);
    eng.playerVel.set(0, 0, 0);

    eng.chunkManager.update(eng.playerPos.x, eng.playerPos.z, settings.renderDistance);

    // Build authentic End Portal Altar at (8, 6) in the new world
    buildEndPortalAt(eng.chunkManager, 8, Math.max(spawnY, 15), 6);
    eng.chunkManager.update(eng.playerPos.x, eng.playerPos.z, settings.renderDistance);

    eng.mobManager.clearAll();
    eng.mobManager.spawnMob(MobType.PIG, eng.playerPos.x + 5, eng.playerPos.y, eng.playerPos.z + 4, 'overworld');
    eng.mobManager.spawnMob(MobType.PIG, eng.playerPos.x - 6, eng.playerPos.y, eng.playerPos.z + 5, 'overworld');
    eng.mobManager.spawnMob(MobType.ZOMBIE, eng.playerPos.x + 14, eng.playerPos.y, eng.playerPos.z - 7, 'overworld');
    eng.mobManager.spawnMob(MobType.CREEPER, eng.playerPos.x - 11, eng.playerPos.y, eng.playerPos.z - 9, 'overworld');
    eng.mobManager.spawnMob(MobType.SKELETON, eng.playerPos.x + 7, eng.playerPos.y, eng.playerPos.z + 15, 'overworld');

    resumeGame();
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-[#73a3ff]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />

      {/* Ender Dragon Boss Bar */}
      {dragonBoss && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 w-96 max-w-[85vw] select-none pointer-events-none">
          <div className="text-sm font-bold text-fuchsia-300 drop-shadow-[2px_2px_0px_black] tracking-wider mb-1 font-minecraft flex items-center gap-2">
            <span>🐉</span> Ender Dragon
          </div>
          <div className="w-full h-4 bg-black/85 border-2 border-fuchsia-900 rounded-xs p-0.5 relative overflow-hidden shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-purple-700 via-fuchsia-500 to-pink-500 transition-all duration-150"
              style={{ width: `${Math.max(0, Math.min(100, (dragonBoss.health / dragonBoss.maxHealth) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Real Hardware Graphics Card Analyzer & Auto-Optimizer */}
      {isAnalyzing && (
        <GraphicsAnalyzer
          defaultSettings={settings}
          onComplete={(newSettings) => {
            setSettings((prev) => ({ ...prev, ...newSettings }));
            setIsAnalyzing(false);
            if (engineRef.current) {
              if (newSettings.shadows !== false) {
                engineRef.current.renderer.shadowMap.enabled = true;
                engineRef.current.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
              } else {
                engineRef.current.renderer.shadowMap.enabled = false;
              }
              engineRef.current.chunkManager.update(
                engineRef.current.playerPos.x,
                engineRef.current.playerPos.z,
                newSettings.renderDistance
              );
            }
          }}
          onClose={() => setIsAnalyzing(false)}
        />
      )}

      {/* Nether Portal Swirling Warp Effect Overlay */}
      {portalWarpProgress > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-25 transition-opacity duration-150 flex items-center justify-center"
          style={{
            opacity: Math.min(0.95, portalWarpProgress * 1.1),
            background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.5) 0%, rgba(107, 33, 168, 0.8) 50%, rgba(59, 7, 100, 0.95) 100%)',
          }}
        >
          <div className="text-white font-minecraft text-xl drop-shadow-[2px_2px_0px_black] tracking-widest animate-pulse">
            Entering the Nether...
          </div>
        </div>
      )}

      {/* Minecraft Java HUD */}
      <HUD
        debugInfo={debugInfo}
        showF3={showF3}
        playerStats={playerStats}
        hotbar={hotbar}
        selectedSlot={selectedSlot}
        onSelectSlot={selectSlot}
        tooltipText={tooltipText}
        isPaused={isPaused}
        onTogglePause={() => {
          safeExitPointerLock();
          setIsPaused((prev) => !prev);
        }}
        onOpenInventory={() => {
          safeExitPointerLock();
          setIsInventoryOpen(true);
          setIsPaused(true);
        }}
        onOpenCrafting={() => {
          safeExitPointerLock();
          setIsCraftingTableOpen(true);
          setIsPaused(true);
        }}
        onToggleF3={() => setShowF3((prev) => !prev)}
      />

      {/* Death Screen */}
      {isDead && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/60 backdrop-blur-sm pointer-events-auto">
          <div className="text-white text-5xl font-minecraft font-bold drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)] mb-8">
            You Died!
          </div>
          <button
            onClick={() => {
              // Respawn
              setPlayerStats(prev => ({ ...prev, health: prev.maxHealth, hunger: 20 }));
              setIsDead(false);
              setIsPaused(false);
              
              if (engineRef.current) {
                const eng = engineRef.current;
                eng.chunkManager.switchDimension('overworld');
                eng.sky.dimension = 'overworld';
                eng.playerPos.set(0, 100, 0); // High up so they fall to surface, or we could find ground
                eng.playerVel.set(0, 0, 0);
                eng.chunkManager.update(0, 0, settings.renderDistance);
                safeRequestPointerLock(eng.renderer.domElement);
              }
            }}
            className="px-8 py-3 bg-[#444] hover:bg-[#555] text-white font-bold text-lg border-2 border-t-white border-l-white border-r-[#222] border-b-[#222] cursor-pointer shadow-lg active:scale-95 transition"
          >
            Respawn
          </button>
        </div>
      )}

      {/* Start / Click-to-Play Overlay (when game is launched and before playing) */}
      {!hasStartedPlaying && isPaused && !isInventoryOpen && !isCraftingTableOpen && !isFurnaceOpen && !isChestOpen && !isDead && (
        <div
          onClick={() => {
            setHasStartedPlaying(true);
            resumeGame();
          }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs cursor-pointer text-center p-6"
        >
          <div className="max-w-md bg-[#222]/90 border-4 border-t-white border-l-white border-r-[#444] border-b-[#444] p-6 shadow-2xl rounded-xs">
            <h1 className="text-2xl font-bold text-yellow-300 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] mb-2 font-minecraft tracking-wider">
              MINECRAFT
            </h1>
            <p className="text-xs text-neutral-300 mb-6 font-mono">
              Java Edition Web • Crafting, Smelting, Storage & Procedural World
            </p>

            <button
              onClick={() => {
                setHasStartedPlaying(true);
                resumeGame();
              }}
              className="w-full py-3 bg-[#5ead3b] hover:bg-[#4a8a2e] text-white font-bold text-sm border-2 border-t-white border-l-white border-r-[#244216] border-b-[#244216] cursor-pointer shadow-lg mb-4 active:scale-98 transition"
            >
              Click to Play
            </button>

            <div className="text-[11px] text-neutral-300 text-left space-y-1 bg-black/50 p-3 rounded-xs border border-white/20 font-mono">
              <div><span className="text-yellow-400 font-bold">WASD</span> : Walk / Strafe</div>
              <div><span className="text-yellow-400 font-bold">SPACE</span> : Jump / Fly</div>
              <div><span className="text-yellow-400 font-bold">LEFT CLICK</span> : Break Block / Mine</div>
              <div><span className="text-yellow-400 font-bold">RIGHT CLICK</span> : Place / Interact (Crafting Table, Furnace, Chest, TNT)</div>
              <div><span className="text-purple-400 font-bold">FLINT & STEEL</span> : Light Nether Portal & Ignite TNT / Fire</div>
              <div><span className="text-yellow-400 font-bold">1 - 9 / SCROLL</span> : Select Hotbar Item</div>
              <div><span className="text-yellow-400 font-bold">C</span> : Open Crafting Table</div>
              <div><span className="text-yellow-400 font-bold">E</span> : Creative Block/Item Inventory</div>
              <div><span className="text-yellow-400 font-bold">F3</span> : Toggle Debug Stats & Dimension</div>
              <div><span className="text-yellow-400 font-bold">ESC</span> : Game Settings Menu</div>
            </div>
          </div>
        </div>
      )}

      {/* Crafting Table 3x3 Modal */}
      <CraftingTableModal
        isOpen={isCraftingTableOpen}
        onClose={() => {
          setIsCraftingTableOpen(false);
          resumeGame();
        }}
        hotbar={hotbar}
        onUpdateHotbar={(newHotbar) => setHotbar(newHotbar.map((x) => x ?? BlockType.AIR))}
        inventory={inventory}
        onUpdateInventory={(newInv) => setInventory(newInv)}
      />

      {/* Furnace Smelting Modal */}
      <FurnaceModal
        isOpen={isFurnaceOpen}
        onClose={() => {
          setIsFurnaceOpen(false);
          resumeGame();
        }}
        hotbar={hotbar}
        onUpdateHotbar={(newHotbar) => setHotbar(newHotbar.map((x) => x ?? BlockType.AIR))}
      />

      {/* Chest Storage Modal */}
      <ChestModal
        isOpen={isChestOpen}
        onClose={() => {
          setIsChestOpen(false);
          resumeGame();
        }}
        hotbar={hotbar}
        onUpdateHotbar={(newHotbar) => setHotbar(newHotbar.map((x) => x ?? BlockType.AIR))}
      />

      {/* Creative Block Picker Modal */}
      <BlockPickerModal
        isOpen={isInventoryOpen}
        onClose={() => {
          setIsInventoryOpen(false);
          resumeGame();
        }}
        onSelectBlock={handleAssignBlock}
        selectedSlot={selectedSlot}
      />

      {/* Game Menu / Pause Menu */}
      <PauseMenu
        isOpen={hasStartedPlaying && isPaused && !isInventoryOpen && !isCraftingTableOpen && !isFurnaceOpen && !isChestOpen && !isDead}
        onResume={resumeGame}
        playerStats={playerStats}
        onUpdateStats={(newStats) => setPlayerStats((prev) => ({ ...prev, ...newStats }))}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            if (engineRef.current) {
              if (updated.shadows !== false) {
                engineRef.current.renderer.shadowMap.enabled = true;
                engineRef.current.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
              } else {
                engineRef.current.renderer.shadowMap.enabled = false;
              }
              if (newSettings.renderDistance !== undefined) {
                engineRef.current.chunkManager.update(
                  engineRef.current.playerPos.x,
                  engineRef.current.playerPos.z,
                  updated.renderDistance
                );
              }
            }
            return updated;
          });
        }}
        onNewWorld={handleNewWorld}
        onOpenAnalyzer={() => setIsAnalyzing(true)}
      />
    </div>
  );
};
