import { Color3 } from '@babylonjs/core'

import { limit } from '../../../utils/numbers'

import { MapWay } from './ways'

export const isRoad = (way: MapWay) => {
  const { nodes, tags } = way

  const enclosed = nodes[0] === nodes[nodes.length - 1]

  const roadyTags = tags && 'highway' in tags

  return !enclosed && roadyTags
}

export const getRoadsLineColor = (way: MapWay): Color3 => {
  const { tags } = way

  const c = (v: number) => limit(v, 0, 255) / 255

  switch (tags.highway) {
    case 'motorway':
      return new Color3(c(145), c(145), c(145))
    case 'motorway_link':
      return new Color3(c(112), c(112), c(112))
    case 'primary':
      return new Color3(c(252), c(214), c(164))
    case 'secondary':
      return new Color3(c(247), c(250), c(191))
    case 'tertiary':
      return new Color3(c(200), c(200), c(200))
    case 'residential':
      return new Color3(c(191), c(250), c(247))
    case 'service':
      return new Color3(c(240), c(160), c(250))
    case 'footway':
      return new Color3(c(180), c(180), c(0))
    case 'path':
      return new Color3(c(180), c(180), c(80))
    case 'steps':
      return new Color3(c(120), c(180), c(120))
  }

  return new Color3(1, 0, 0)
}
