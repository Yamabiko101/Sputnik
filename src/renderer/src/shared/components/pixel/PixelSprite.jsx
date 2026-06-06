import { useEffect, useMemo, useRef, useState } from 'react'

export function PixelSprite({
  frames,
  palette,
  pixelSize = 5,
  frameDuration = 320,
  loop = true,
  className = '',
  title = 'Pixel sprite'
}) {
  const canvasRef = useRef(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const safeFrames = useMemo(() => normalizeFrames(frames), [frames])
  const frame = safeFrames[frameIndex] ?? safeFrames[0]
  const width = frame?.[0]?.length ?? 0
  const height = frame?.length ?? 0

  useEffect(() => {
    setFrameIndex(0)
  }, [safeFrames])

  useEffect(() => {
    if (safeFrames.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        const next = current + 1
        if (next < safeFrames.length) return next
        return loop ? 0 : current
      })
    }, frameDuration)

    return () => window.clearInterval(timer)
  }, [frameDuration, loop, safeFrames])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !frame) return

    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.imageSmoothingEnabled = false

    frame.forEach((row, y) => {
      row.forEach((token, x) => {
        const color = palette[token] ?? palette.T
        if (!color || color === palette.T) return
        context.fillStyle = color
        context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      })
    })
  }, [frame, palette, pixelSize])

  return (
    <canvas
      aria-label={title}
      className={`pixelSprite ${className}`.trim()}
      height={height * pixelSize}
      ref={canvasRef}
      role="img"
      style={{
        width: `${width * pixelSize}px`,
        height: `${height * pixelSize}px`
      }}
      width={width * pixelSize}
    />
  )
}

function normalizeFrames(frames = []) {
  return frames.filter((frame) => {
    if (!Array.isArray(frame) || !frame.length) return false
    const width = frame[0]?.length
    return width > 0 && frame.every((row) => Array.isArray(row) && row.length === width)
  })
}
