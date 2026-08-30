'use client'

import { useEffect, useRef } from 'react'

type Vec3 = { x: number; y: number; z: number }

// evenly distribute N points on a unit sphere (fibonacci sphere)
function fibonacciSphere(n: number): Vec3[] {
  const pts: Vec3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }
  return pts
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

    const dots = fibonacciSphere(1100)
    let raf = 0
    let angle = 0
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

      // faint sphere outline + inner shading
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(90, 240, 150, 0.25)'
      ctx.lineWidth = 1 * dpr
      ctx.stroke()

      const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R)
      glow.addColorStop(0, 'rgba(40, 200, 110, 0.10)')
      glow.addColorStop(1, 'rgba(10, 30, 20, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()

      // rotate + project the dot field
      for (const p of dots) {
        const rx = p.x * cos + p.z * sin
        const rz = -p.x * sin + p.z * cos
        const depth = (rz + 1) / 2 // 0 (back) .. 1 (front)
        const px = cx + rx * R
        const py = cy - p.y * R
        const radius = (0.5 + depth * 1.4) * dpr
        const alpha = 0.12 + depth * 0.6
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(70, 230, 140, ${alpha})`
        ctx.fill()
      }

      // node markers with pulse
      const t = performance.now() / 1000
      MARKERS.forEach((m, i) => {
        const rx = m.x * cos + m.z * sin
        const rz = -m.x * sin + m.z * cos
        if (rz < -0.05) return // hide when on far side
        const depth = (rz + 1) / 2
        const px = cx + rx * R
        const py = cy - m.y * R
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i)
        const core = (2 + depth * 1.5) * dpr

        // halo
        ctx.beginPath()
        ctx.arc(px, py, core + pulse * 6 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120, 255, 170, ${0.12 * depth})`
        ctx.fill()
        // core
        ctx.beginPath()
        ctx.arc(px, py, core, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 255, 200, ${0.6 + depth * 0.4})`
        ctx.fill()
      })

      angle += 0.0035
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
