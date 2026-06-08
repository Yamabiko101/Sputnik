import { useMemo } from 'react'
import {
  getLaikaSpriteSet,
  LAIKA_PALETTE
} from '../../assets/pixel/laikaSprites.js'
import { PixelSprite } from './PixelSprite.jsx'

const PIXEL_SIZES = {
  dock: 5,
  focus: 7,
  stage: 9
}

export function PetSprite({ pet, mood = 'idle', size = 'dock', className = '', animated = true }) {
  const skin = pet?.skin_key ?? pet?.skin_palette ?? 'classic'
  const pixelSize = PIXEL_SIZES[size] ?? PIXEL_SIZES.dock
  const spriteSet = useMemo(
    () => getLaikaSpriteSet({ skin, mood }),
    [skin, mood]
  )
  const frames = animated ? spriteSet.frames : spriteSet.frames.slice(0, 1)

  return (
    <PixelSprite
      className={`petSprite petSprite-${size} petSprite-${spriteSet.mood} ${className}`.trim()}
      frameDuration={spriteSet.frameDuration}
      frames={frames}
      palette={LAIKA_PALETTE}
      pixelSize={pixelSize}
      title={`${pet?.name ?? 'Laika'} ${spriteSet.mood}`}
    />
  )
}
