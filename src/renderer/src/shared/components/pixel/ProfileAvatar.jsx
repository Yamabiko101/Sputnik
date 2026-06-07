import { useMemo } from 'react'
import {
  getProfileAvatar,
  PROFILE_AVATAR_PALETTE
} from '../../assets/pixel/profileAvatars.js'
import { PixelSprite } from './PixelSprite.jsx'

const PIXEL_SIZES = {
  small: 3,
  medium: 5,
  large: 7
}

export function ProfileAvatar({ avatarKey, size = 'medium', className = '' }) {
  const avatar = useMemo(() => getProfileAvatar(avatarKey), [avatarKey])

  return (
    <PixelSprite
      className={`profileAvatar profileAvatar-${size} ${className}`.trim()}
      frameDuration={avatar.frameDuration}
      frames={avatar.frames}
      palette={PROFILE_AVATAR_PALETTE}
      pixelSize={PIXEL_SIZES[size] ?? PIXEL_SIZES.medium}
      title={avatar.name}
    />
  )
}
