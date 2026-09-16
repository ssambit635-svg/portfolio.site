import blobUrl from '../assets/models/blob.glb?url'
import knotUrl from '../assets/models/knot.glb?url'
import crystalUrl from '../assets/models/crystal.glb?url'
import pillarUrl from '../assets/models/pillar.glb?url'

export const modelUrls = {
  blob: blobUrl,
  knot: knotUrl,
  crystal: crystalUrl,
  pillar: pillarUrl
} as const

export type ModelName = keyof typeof modelUrls
