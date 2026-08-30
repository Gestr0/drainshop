'use client'

import { useEffect, useRef } from 'react'

type Vec3 = { x: number; y: number; z: number }

// --- Coarse continent outlines as [lon, lat] rings (recognizable, not exact) ---
const CONTINENTS: number[][][] = [
  // North America
  [
    [-168, 66], [-166, 68], [-156, 71], [-130, 70], [-124, 73], [-100, 74],
    [-92, 74], [-82, 73], [-80, 67], [-70, 63], [-64, 60], [-56, 52],
    [-66, 45], [-70, 41], [-74, 40], [-76, 35], [-81, 25], [-84, 30],
    [-90, 29], [-97, 26], [-97, 20], [-105, 20], [-110, 23], [-115, 29],
    [-117, 33], [-121, 35], [-124, 40], [-124, 48], [-130, 54], [-135, 58],
    [-140, 60], [-150, 60], [-158, 58], [-165, 60], [-168, 66],
  ],
  // Greenland
  [
    [-45, 60], [-42, 64], [-38, 66], [-30, 68], [-22, 70], [-18, 74],
    [-22, 78], [-30, 82], [-40, 83], [-50, 82], [-58, 80], [-55, 74],
    [-50, 68], [-48, 63], [-45, 60],
  ],
  // South America
  [
    [-81, 8], [-77, 8], [-72, 11], [-64, 10], [-60, 5], [-51, 0], [-50, -2],
    [-48, -6], [-42, -6], [-38, -12], [-40, -20], [-48, -25], [-53, -34],
    [-58, -40], [-65, -45], [-68, -50], [-70, -54], [-73, -53], [-74, -45],
    [-73, -37], [-71, -30], [-71, -20], [-70, -18], [-76, -14], [-81, -6],
    [-81, -2], [-80, 2], [-78, 5], [-81, 8],
  ],
  // Africa
  [
    [-17, 15], [-16, 20], [-10, 27], [-5, 32], [0, 34], [10, 37], [11, 33],
    [20, 32], [25, 32], [32, 31], [34, 28], [37, 22], [38, 15], [43, 11],
    [51, 12], [51, 7], [48, 2], [42, -2], [40, -8], [39, -15], [35, -20],
    [33, -26], [28, -33], [22, -34], [18, -34], [16, -28], [14, -22],
    [13, -16], [9, -3], [9, 3], [3, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 15],
  ],
  // Eurasia
  [
    [-10, 36], [-9, 43], [-2, 43], [0, 48], [-5, 48], [-4, 54], [2, 58],
    [5, 61], [8, 63], [12, 65], [15, 68], [22, 70], [28, 71], [40, 73],
    [55, 73], [70, 73], [85, 74], [100, 76], [110, 74], [125, 73], [140, 72],
    [160, 70], [170, 68], [178, 67], [175, 62], [162, 60], [160, 55],
    [155, 52], [142, 48], [140, 45], [133, 43], [130, 35], [126, 35],
    [122, 30], [121, 25], [110, 21], [108, 15], [105, 10], [104, 8],
    [100, 6], [98, 8], [95, 16], [90, 22], [88, 21], [82, 17], [77, 8],
    [73, 15], [70, 20], [65, 25], [60, 25], [56, 27], [52, 30], [48, 30],
    [43, 40], [36, 36], [28, 36], [22, 40], [18, 40], [13, 38], [-10, 36],
  ],
  // Australia
  [
    [113, -22], [114, -26], [115, -32], [118, -35], [124, -34], [129, -32],
    [134, -33], [138, -35], [141, -38], [147, -38], [150, -37], [153, -32],
    [153, -26], [146, -19], [142, -11], [137, -12], [135, -15], [130, -13],
    [124, -16], [122, -18], [117, -21], [113, -22],
  ],
]

// ray-casting point-in-polygon on [lon, lat]
function inPolygon(lon: number, lat: number, poly: number[][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0]
    const yi = poly[i][1]
    const xj = poly[j][0]
    const yj = poly[j][1]
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function isLand(lat: number, lon: number): boolean {
  if (lat < -62) return true // Antarctica ice cap
  for (const poly of CONTINENTS) {
    if (inPolygon(lon, lat, poly)) return true
  }
  return false
}

// lat/lon (degrees) -> point on unit sphere
function latLon(lat: number, lon: number): Vec3 {
  const phi = (lat * Math.PI) / 180
  const lambda = (lon * Math.PI) / 180
  return {
    x: Math.cos(phi) * Math.cos(lambda),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.sin(lambda),
  }
}

// build land dots via fibonacci sphere, keeping only points over land
function landDots(sampleCount: number): Vec3[] {
  const pts: Vec3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < sampleCount; i++) {
    const y = 1 - (i / (sampleCount - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r
    const lat = (Math.asin(y) * 180) / Math.PI
    const lon = (Math.atan2(z, x) * 180) / Math.PI
    if (isLand(lat, lon)) pts.push({ x, y, z })
  }
  return pts
}

type Blinker = Vec3 & { phase: number; speed: number; hi: boolean }

// pick a random subset of land dots to twinkle independently
function makeBlinkers(dots: Vec3[], count: number): Blinker[] {
  const out: Blinker[] = []
  const step = Math.max(1, Math.floor(dots.length / count))
  for (let i = 0; i < dots.length; i += step) {
    const p = dots[i]
    out.push({
      ...p,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 2.6,
      hi: Math.random() < 0.22, // some are brighter "hotspots"
    })
  }
  return out
}

const MARKERS: Vec3[] = [
  latLon(40.7, -74), // New York
  latLon(51.5, -0.1), // London
  latLon(35.7, 139.7), // Tokyo
  latLon(1.35, 103.8), // Singapore
  latLon(-33.9, 151.2), // Sydney
  latLon(55.8, 37.6), // Moscow
  latLon(-23.6, -46.6), // Sao Paulo
  latLon(19.1, 72.9), // Mumbai
  latLon(37.8, -122.4), // San Francisco
  latLon(25.2, 55.3), // Dubai
]

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dots = landDots(26000)
    const blinkers = makeBlinkers(dots, 320)
    let raf = 0
    let angle = -1.6 // start over the Atlantic-ish
    let size = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      size = rect.width
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = size * dpr
      canvas.height = size * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const cx = (size * dpr) / 2
      const cy = (size * dpr) / 2
      const R = (size * dpr) / 2 - 6 * dpr

      ctx.clearRect(0, 0, size * dpr, size * dpr)

      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // ocean sphere fill + glow
      const glow = ctx.createRadialGradient(
        cx - R * 0.25,
        cy - R * 0.25,
        R * 0.1,
        cx,
        cy,
        R,
      )
      glow.addColorStop(0, 'rgba(18, 60, 42, 0.55)')
      glow.addColorStop(0.7, 'rgba(8, 28, 20, 0.45)')
      glow.addColorStop(1, 'rgba(4, 14, 10, 0.15)')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // rim
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(90, 240, 150, 0.30)'
      ctx.lineWidth = 1 * dpr
      ctx.stroke()

      // land dots (rotate around Y axis, hide far side)
      for (const p of dots) {
        const rx = p.x * cos + p.z * sin
        const rz = -p.x * sin + p.z * cos
        if (rz < 0) continue // back face hidden
        const depth = rz // 0..1 toward viewer
        const px = cx + rx * R
        const py = cy - p.y * R
        const s = (0.6 + depth * 1.0) * dpr
        const alpha = 0.25 + depth * 0.65
        ctx.fillStyle = `rgba(74, 234, 140, ${alpha})`
        ctx.fillRect(px - s / 2, py - s / 2, s, s)
      }

      const t = performance.now() / 1000

      // scattered twinkling dots across the land
      for (const b of blinkers) {
        const rx = b.x * cos + b.z * sin
        const rz = -b.x * sin + b.z * cos
        if (rz < 0) continue
        const depth = rz
        const px = cx + rx * R
        const py = cy - b.y * R
        const blink = 0.5 + 0.5 * Math.sin(t * b.speed + b.phase)
        const s = (b.hi ? 1.6 : 1.0) * (0.7 + depth * 0.9) * dpr
        const alpha = (b.hi ? 0.5 : 0.3) + blink * 0.5 * depth
        if (b.hi) {
          ctx.beginPath()
          ctx.arc(px, py, s + blink * 2.4 * dpr, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(120, 255, 170, ${0.12 * depth * blink})`
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(px, py, s, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(150, 255, 190, ${alpha})`
        ctx.fill()
      }

      // pulsing node markers
      MARKERS.forEach((m, i) => {
        const rx = m.x * cos + m.z * sin
        const rz = -m.x * sin + m.z * cos
        if (rz < -0.02) return
        const depth = (rz + 1) / 2
        const px = cx + rx * R
        const py = cy - m.y * R
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i)
        const core = (1.6 + depth * 1.4) * dpr

        ctx.beginPath()
        ctx.arc(px, py, core + pulse * 6 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120, 255, 170, ${0.14 * depth})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py, core, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(190, 255, 205, ${0.6 + depth * 0.4})`
        ctx.fill()
      })

      angle += 0.0032
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    requestAnimationFrame(() => {
      canvas.style.opacity = '1'
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: '1',
        opacity: 0,
        transition: 'opacity 1s ease',
      }}
      aria-hidden="true"
    />
  )
}
