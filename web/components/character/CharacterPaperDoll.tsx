'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CharacterItem, CharacterSlot } from '@/lib/api/character'

export type WardrobeSlot = Exclude<CharacterSlot, 'outfit'>
export type Direction = 'front' | 'right' | 'back' | 'left'

export const directions: Direction[] = ['front', 'right', 'back', 'left']

export const directionLabels: Record<Direction, string> = {
  front: 'ด้านหน้า',
  right: 'ด้านขวา',
  back: 'ด้านหลัง',
  left: 'ด้านซ้าย',
}

export const defaultCodes: Record<WardrobeSlot, string> = {
  hair: 'hair_novice',
  hat: 'hat_none',
  glasses: 'glasses_none',
  top: 'top_novice',
  bottom: 'bottom_novice',
  shoes: 'shoes_novice',
  back: 'back_none',
  aura: 'aura_none',
}

export function itemCodeFor(slot: WardrobeSlot, equipped: Partial<Record<CharacterSlot, string>>) {
  return equipped[slot] || defaultCodes[slot]
}

export function variant(code?: string) {
  if (!code) return 'none'
  const [, ...parts] = code.split('_')
  return parts.join('_') || 'none'
}

export function palette(code: string, fallback: string) {
  const map: Record<string, string> = {
    novice: '#8b5a2b',
    spiky: '#2f80ed',
    elegant: '#a855f7',
    flaming: '#f97316',
    silver_wave: '#b8c4d9',
    bandana: '#ef4444',
    wizard: '#6554d9',
    crown: '#f6c445',
    conqueror: '#1f2937',
    round: '#e8eef7',
    scholar: '#22d3ee',
    star: '#facc15',
    crystal: '#d8b4fe',
    cardigan: '#13b981',
    sailor: '#0284c7',
    royal: '#7c3aed',
    aurora: '#06b6d4',
    school: '#46566f',
    adventurer: '#7a4219',
    canvas: '#f8fafc',
    wing: '#6aa7ff',
    moon: '#a78bfa',
    satchel: '#9a5a1f',
    cape: '#dc2626',
    wings: '#fff3a5',
  }
  return map[variant(code)] || fallback
}

export function shade(hex: string, amount: number) {
  if (!hex || !hex.startsWith('#')) return hex
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return hex
  const num = parseInt(h, 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0xff) + amount)
  const b = clamp((num & 0xff) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

function directionRotation(direction: Direction) {
  const rotations: Record<Direction, number> = {
    front: 0,
    right: -Math.PI / 2,
    back: Math.PI,
    left: Math.PI / 2,
  }
  return rotations[direction]
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose())
    } else if (material) {
      material.dispose()
    }
  })
}

export default function CharacterPaperDoll({
  equipped,
  inventory,
  direction,
}: {
  equipped: Partial<Record<CharacterSlot, string>>
  inventory: CharacterItem[]
  direction: Direction
}) {
  const mountRef = useRef<HTMLDivElement | null>(null)

  const codes = useMemo(
    () => ({
      hair: itemCodeFor('hair', equipped),
      hat: itemCodeFor('hat', equipped),
      glasses: itemCodeFor('glasses', equipped),
      top: itemCodeFor('top', equipped),
      bottom: itemCodeFor('bottom', equipped),
      shoes: itemCodeFor('shoes', equipped),
      back: itemCodeFor('back', equipped),
      aura: itemCodeFor('aura', equipped),
    }),
    [equipped],
  )

  const equippedNames = useMemo(
    () =>
      inventory.reduce<Record<string, string>>((acc, item) => {
        acc[item.code] = item.name
        return acc
      }, {}),
    [inventory],
  )

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x07111f, 0.035)

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 1.55, 5.45)
    camera.lookAt(0, 1.15, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.domElement.dataset.testid = 'anime-character-canvas'
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    mount.appendChild(renderer.domElement)

    const avatar = new THREE.Group()
    avatar.position.set(0, -0.08, 0)
    avatar.rotation.y = directionRotation(direction)
    scene.add(avatar)

    const materials: THREE.Material[] = []
    const meshes: THREE.Object3D[] = []
    const auraMeshes: THREE.Object3D[] = []

    const makeToon = (color: string, options: { roughness?: number; opacity?: number; transparent?: boolean; emissive?: string; emissiveIntensity?: number } = {}) => {
      const materialOptions: THREE.MeshToonMaterialParameters = {
        color,
        opacity: options.opacity ?? 1,
        emissive: options.emissive ?? '#000000',
        emissiveIntensity: options.emissiveIntensity ?? 0,
      }
      if (options.transparent !== undefined) materialOptions.transparent = options.transparent
      const material = new THREE.MeshToonMaterial(materialOptions)
      materials.push(material)
      return material
    }

    const makeStandard = (color: string, options: { metalness?: number; roughness?: number; opacity?: number; transparent?: boolean; emissive?: string; emissiveIntensity?: number } = {}) => {
      const materialOptions: THREE.MeshStandardMaterialParameters = {
        color,
        metalness: options.metalness ?? 0.02,
        roughness: options.roughness ?? 0.62,
        opacity: options.opacity ?? 1,
        emissive: options.emissive ?? '#000000',
        emissiveIntensity: options.emissiveIntensity ?? 0,
      }
      if (options.transparent !== undefined) materialOptions.transparent = options.transparent
      const material = new THREE.MeshStandardMaterial(materialOptions)
      materials.push(material)
      return material
    }

    const addMesh = (mesh: THREE.Object3D, parent: THREE.Object3D = avatar) => {
      parent.add(mesh)
      meshes.push(mesh)
      return mesh
    }

    const capsule = (radius: number, length: number, color: string, position: [number, number, number], scale: [number, number, number] = [1, 1, 1]) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 10, 20), makeToon(color))
      mesh.position.set(...position)
      mesh.scale.set(...scale)
      mesh.castShadow = true
      mesh.receiveShadow = true
      return addMesh(mesh)
    }

    const topColor = palette(codes.top, '#4f6178')
    const bottomColor = palette(codes.bottom, '#374151')
    const hairColor = palette(codes.hair, '#7c2d12')
    const shoesColor = palette(codes.shoes, '#f8fafc')
    const glassesColor = palette(codes.glasses, '#e8eef7')
    const hatColor = palette(codes.hat, '#ef4444')
    const skin = '#f7c49a'
    const skinShade = '#e49a69'
    const outline = '#1c2435'

    const hairKind = variant(codes.hair)
    const hatKind = variant(codes.hat)
    const glassesKind = variant(codes.glasses)
    const backKind = variant(codes.back)
    const auraKind = variant(codes.aura)

    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 2.1))

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(3.4, 5.2, 4.4)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 12
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x67e8f9, 1.6)
    rimLight.position.set(-3.6, 2.5, -3)
    scene.add(rimLight)

    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.55, 0.1, 72),
      makeStandard('#0b1930', { metalness: 0.2, roughness: 0.42, emissive: '#05233f', emissiveIntensity: 0.5 }),
    )
    ground.position.set(0, -0.03, 0)
    ground.receiveShadow = true
    scene.add(ground)

    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.32, 0.012, 8, 96),
      makeStandard('#22d3ee', { emissive: '#22d3ee', emissiveIntensity: 1.2 }),
    )
    glowRing.rotation.x = Math.PI / 2
    glowRing.position.y = 0.04
    scene.add(glowRing)

    if (auraKind !== 'none') {
      const auraColor = auraKind === 'fire' ? '#fb923c' : auraKind === 'rainbow' ? '#c084fc' : '#22d3ee'
      const auraOuter = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.018, 8, 96),
        makeStandard(auraColor, { transparent: true, opacity: 0.5, emissive: auraColor, emissiveIntensity: 1.5 }),
      )
      auraOuter.rotation.x = Math.PI / 2
      auraOuter.position.y = 0.72
      addMesh(auraOuter)
      auraMeshes.push(auraOuter)

      const auraInner = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.012, 8, 96),
        makeStandard('#fef3c7', { transparent: true, opacity: auraKind === 'rainbow' ? 0.55 : 0.28, emissive: '#fef3c7', emissiveIntensity: 1.2 }),
      )
      auraInner.rotation.x = Math.PI / 2
      auraInner.position.y = 1.25
      addMesh(auraInner)
      auraMeshes.push(auraInner)
    }

    if (backKind === 'cape') {
      const capeShape = new THREE.Shape()
      capeShape.moveTo(-0.45, 0.2)
      capeShape.quadraticCurveTo(-0.85, -0.45, -0.62, -1.35)
      capeShape.quadraticCurveTo(0, -1.58, 0.62, -1.35)
      capeShape.quadraticCurveTo(0.85, -0.45, 0.45, 0.2)
      const cape = new THREE.Mesh(new THREE.ShapeGeometry(capeShape), makeToon('#b91c1c'))
      cape.position.set(0, 1.03, -0.32)
      cape.rotation.x = -0.08
      cape.castShadow = true
      addMesh(cape)
    }

    if (backKind === 'wings') {
      const wingMaterial = makeStandard('#fff3a5', { roughness: 0.5, emissive: '#facc15', emissiveIntensity: 0.18 })
      const makeWing = (side: -1 | 1) => {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0.32)
        shape.bezierCurveTo(side * 0.62, 0.75, side * 1.2, 0.1, side * 0.86, -0.46)
        shape.bezierCurveTo(side * 0.45, -0.3, side * 0.12, -0.2, 0, -0.1)
        const wing = new THREE.Mesh(new THREE.ShapeGeometry(shape), wingMaterial)
        wing.position.set(side * 0.4, 1.2, -0.25)
        wing.rotation.y = side * -0.24
        wing.castShadow = true
        addMesh(wing)
      }
      makeWing(-1)
      makeWing(1)
    }

    if (backKind === 'satchel') {
      const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.92, 12), makeToon('#6b3f17'))
      strap.position.set(0.06, 1.06, 0.28)
      strap.rotation.z = -0.68
      strap.rotation.x = Math.PI / 2
      addMesh(strap)

      const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.26, 0.16), makeToon('#9a5a1f'))
      satchel.position.set(0.42, 0.88, 0.08)
      satchel.rotation.y = -0.2
      satchel.castShadow = true
      addMesh(satchel)
    }

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.42, 10, 24), makeToon(topColor))
    torso.position.set(0, 0.95, 0)
    torso.scale.set(1.05, 0.9, 0.72)
    torso.castShadow = true
    torso.receiveShadow = true
    addMesh(torso)

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.018, 8, 42, Math.PI * 1.25), makeStandard('#ffffff', { transparent: true, opacity: 0.72 }))
    collar.position.set(0, 1.26, 0.3)
    collar.rotation.x = 0.22
    collar.rotation.z = Math.PI * 0.88
    addMesh(collar)

    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 8, 56), makeToon(shade(topColor, -40)))
    belt.position.set(0, 0.68, 0)
    belt.rotation.x = Math.PI / 2
    belt.scale.set(1.1, 0.72, 1)
    addMesh(belt)

    const leftArm = capsule(0.08, 0.43, topColor, [-0.46, 0.96, 0.03], [0.92, 1, 0.92])
    leftArm.rotation.z = -0.36
    leftArm.rotation.x = 0.08
    const rightArm = capsule(0.08, 0.43, topColor, [0.46, 0.96, 0.03], [0.92, 1, 0.92])
    rightArm.rotation.z = 0.36
    rightArm.rotation.x = -0.08

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), makeToon(skinShade))
    leftHand.position.set(-0.61, 0.68, 0.09)
    leftHand.castShadow = true
    addMesh(leftHand)

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), makeToon(skinShade))
    rightHand.position.set(0.61, 0.68, 0.09)
    rightHand.castShadow = true
    addMesh(rightHand)

    const leftLeg = capsule(0.095, 0.38, bottomColor, [-0.18, 0.42, 0], [0.9, 1, 0.85])
    leftLeg.rotation.z = 0.04
    const rightLeg = capsule(0.095, 0.38, bottomColor, [0.18, 0.42, 0], [0.9, 1, 0.85])
    rightLeg.rotation.z = -0.04

    const leftShoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.18, 8, 18), makeToon(shoesColor))
    leftShoe.position.set(-0.21, 0.14, 0.11)
    leftShoe.rotation.z = Math.PI / 2
    leftShoe.scale.set(1.2, 0.82, 0.7)
    leftShoe.castShadow = true
    addMesh(leftShoe)

    const rightShoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.18, 8, 18), makeToon(shoesColor))
    rightShoe.position.set(0.21, 0.14, 0.11)
    rightShoe.rotation.z = Math.PI / 2
    rightShoe.scale.set(1.2, 0.82, 0.7)
    rightShoe.castShadow = true
    addMesh(rightShoe)

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.18, 24), makeToon(skin))
    neck.position.set(0, 1.36, 0)
    neck.castShadow = true
    addMesh(neck)

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 48, 32), makeToon(skin))
    head.position.set(0, 1.82, 0.05)
    head.scale.set(0.92, 1.02, 0.84)
    head.castShadow = true
    head.receiveShadow = true
    addMesh(head)

    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 24), makeToon(hairColor))
    hairCap.position.set(0, 2.04, -0.02)
    hairCap.scale.set(0.94, 0.48, 0.86)
    hairCap.castShadow = true
    addMesh(hairCap)

    const backHair = new THREE.Mesh(new THREE.SphereGeometry(0.49, 32, 20), makeToon(shade(hairColor, -20)))
    backHair.position.set(0, 1.78, -0.36)
    backHair.scale.set(0.88, 0.9, 0.45)
    backHair.castShadow = true
    addMesh(backHair)

    const bangMaterial = makeToon(hairColor)
    const makeBang = (x: number, angle: number, length = 0.35) => {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.105, length, 16), bangMaterial)
      bang.position.set(x, 1.91, 0.52)
      bang.rotation.z = angle
      bang.rotation.x = Math.PI * 0.62
      bang.castShadow = true
      addMesh(bang)
    }

    if (hairKind === 'spiky') {
      ;[-0.32, -0.12, 0.08, 0.28].forEach((x, index) => makeBang(x, -0.45 + index * 0.28, 0.42))
      const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 16), bangMaterial)
      topSpike.position.set(0.05, 2.39, 0)
      topSpike.rotation.z = -0.16
      addMesh(topSpike)
    } else if (hairKind === 'elegant') {
      makeBang(-0.18, -0.22, 0.3)
      makeBang(0.12, 0.12, 0.28)
      const leftTail = capsule(0.11, 0.42, hairColor, [-0.54, 1.68, -0.02], [1, 1, 0.75])
      leftTail.rotation.z = -0.24
      const rightTail = capsule(0.11, 0.42, hairColor, [0.54, 1.68, -0.02], [1, 1, 0.75])
      rightTail.rotation.z = 0.24
    } else if (hairKind === 'flaming') {
      ;[-0.34, -0.12, 0.12, 0.34].forEach((x, index) => {
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5 + index * 0.02, 18), makeToon(index % 2 ? '#f97316' : '#fb923c'))
        flame.position.set(x, 2.28 + Math.abs(x) * 0.1, 0.06)
        flame.rotation.z = x * -0.9
        flame.castShadow = true
        addMesh(flame)
      })
      makeBang(0, 0.03, 0.42)
    } else if (hairKind === 'silver_wave') {
      makeBang(-0.24, -0.24, 0.34)
      makeBang(0.16, 0.18, 0.34)
      const leftWave = capsule(0.12, 0.6, hairColor, [-0.54, 1.6, -0.03], [0.95, 1, 0.72])
      leftWave.rotation.z = -0.08
      const rightWave = capsule(0.12, 0.6, hairColor, [0.54, 1.6, -0.03], [0.95, 1, 0.72])
      rightWave.rotation.z = 0.08
    } else {
      makeBang(-0.22, -0.2, 0.28)
      makeBang(0.08, 0.1, 0.28)
    }

    if (hatKind === 'bandana') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.035, 8, 60), makeToon('#ef4444'))
      band.position.set(0, 2.06, 0.04)
      band.rotation.x = Math.PI / 2
      band.scale.set(1, 0.78, 1)
      addMesh(band)
    }

    if (hatKind === 'wizard') {
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.92, 32), makeToon(hatColor))
      hat.position.set(0, 2.58, 0.02)
      hat.rotation.z = -0.1
      hat.castShadow = true
      addMesh(hat)

      const brim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.045, 8, 64), makeToon(shade(hatColor, -20)))
      brim.position.set(0, 2.18, 0.02)
      brim.rotation.x = Math.PI / 2
      brim.scale.set(1.18, 0.8, 1)
      addMesh(brim)
    }

    if (hatKind === 'crown') {
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.13, 36), makeToon('#f6c445'))
      crownBase.position.set(0, 2.23, 0.01)
      crownBase.castShadow = true
      addMesh(crownBase)
      ;[-0.27, 0, 0.27].forEach((x) => {
        const point = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 16), makeToon('#fde68a'))
        point.position.set(x, 2.42, 0.03)
        addMesh(point)
      })
    }

    if (hatKind === 'conqueror') {
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 16), makeStandard('#1f2937', { metalness: 0.25, roughness: 0.35 }))
      helm.position.set(0, 2.08, -0.01)
      helm.scale.set(1, 0.38, 0.86)
      addMesh(helm)
      const crest = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 16), makeToon('#ef4444'))
      crest.position.set(0, 2.38, 0)
      addMesh(crest)
    }

    if (glassesKind !== 'none') {
      const glassMaterial = makeStandard(glassesColor, {
        metalness: glassesKind === 'crystal' ? 0.3 : 0.06,
        roughness: 0.22,
        emissive: glassesKind === 'star' ? '#facc15' : '#000000',
        emissiveIntensity: glassesKind === 'star' ? 0.35 : 0,
      })

      if (glassesKind === 'star') {
        ;[-0.2, 0.2].forEach((x) => {
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), glassMaterial)
          star.position.set(x, 1.84, 0.52)
          star.scale.set(1, 0.8, 0.35)
          addMesh(star)
        })
      } else {
        ;[-0.2, 0.2].forEach((x) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.012, 8, 32), glassMaterial)
          ring.position.set(x, 1.84, 0.53)
          ring.scale.set(1, 1, 0.5)
          addMesh(ring)
        })
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), glassMaterial)
        bridge.position.set(0, 1.84, 0.53)
        bridge.rotation.z = Math.PI / 2
        addMesh(bridge)
      }
    }

    const eyeMaterial = makeStandard('#121826', { roughness: 0.18 })
    const sparkleMaterial = makeStandard('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.8 })
    ;[
      [-0.2, 1.84, 0.53],
      [0.2, 1.84, 0.53],
    ].forEach(([x, y, z]) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 12), eyeMaterial)
      eye.position.set(x, y, z)
      eye.scale.set(0.72, 1.18, 0.28)
      addMesh(eye)

      const catchLight = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), sparkleMaterial)
      catchLight.position.set(x - 0.018, y + 0.027, z + 0.018)
      catchLight.scale.set(1, 1, 0.45)
      addMesh(catchLight)
    })

    const mouthCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 1.68, 0.545),
      new THREE.Vector3(0, 1.63, 0.565),
      new THREE.Vector3(0.1, 1.68, 0.545),
    ])
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 18, 0.008, 8, false), makeStandard('#9a3412'))
    addMesh(mouth)

    ;[-0.34, 0.34].forEach((x) => {
      const blush = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 10), makeStandard('#fb7185', { transparent: true, opacity: 0.35 }))
      blush.position.set(x, 1.72, 0.5)
      blush.scale.set(1.4, 0.72, 0.18)
      addMesh(blush)
    })

    const bodyOutline = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 24), makeStandard(outline, { transparent: true, opacity: 0.16 }))
    bodyOutline.position.set(0, 1.82, -0.02)
    bodyOutline.scale.set(0.96, 1.06, 0.88)
    bodyOutline.renderOrder = -1
    addMesh(bodyOutline)

    let animationFrame = 0
    const startedAt = performance.now()

    const resize = () => {
      const rect = mount.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    const targetRotation = directionRotation(direction)
    avatar.rotation.y = targetRotation

    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000
      avatar.position.y = -0.08 + Math.sin(elapsed * 2.1) * 0.018
      avatar.rotation.y += (targetRotation - avatar.rotation.y) * 0.12
      glowRing.rotation.z = elapsed * 0.35

      if (auraKind !== 'none') {
        auraMeshes.forEach((mesh) => {
          mesh.rotation.z += 0.006
        })
      }

      renderer.render(scene, camera)
      animationFrame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      disposeObject(avatar)
      disposeObject(ground)
      disposeObject(glowRing)
      materials.forEach((material) => material.dispose())
      meshes.length = 0
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [codes, direction])

  const auraKind = variant(codes.aura)
  const auraBg =
    auraKind === 'fire'
      ? 'radial-gradient(circle at 50% 42%, rgba(249,115,22,.2), transparent 42%), linear-gradient(180deg, rgba(15,23,42,.98), rgba(2,6,23,.98))'
      : auraKind === 'rainbow'
      ? 'radial-gradient(circle at 50% 42%, rgba(168,85,247,.2), transparent 46%), linear-gradient(180deg, rgba(15,23,42,.98), rgba(2,6,23,.98))'
      : 'radial-gradient(circle at 50% 42%, rgba(34,211,238,.16), transparent 45%), linear-gradient(180deg, rgba(15,23,42,.98), rgba(2,6,23,.98))'

  return (
    <div
      className="relative flex aspect-[5/6] w-full max-w-[360px] items-stretch justify-center overflow-hidden rounded-2xl"
      style={{ background: auraBg }}
    >
      <div ref={mountRef} className="absolute inset-0" aria-label={`ตัวละคร 3D ${directionLabels[direction]}`} role="img" />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur">
        <span className="text-xs font-medium text-slate-300">{directionLabels[direction]}</span>
        <span className="truncate text-xs text-slate-500">
          {equippedNames[codes.top] || 'เสื้อเริ่มต้น'} / {equippedNames[codes.hair] || 'ผมเริ่มต้น'}
        </span>
      </div>
    </div>
  )
}
