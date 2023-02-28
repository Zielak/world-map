import { MapWay } from './ways'

export const isBuilding = (way: MapWay) => {}

export const buildingStillExists = (way: MapWay): boolean => {
  // TODO: building's size should be taken under consideration
  const { tags } = way

  // range (-2)-(2)
  const byId = Math.sin(way.id / 2) * 2

  let score: number = 0
  switch (tags.building) {
    case 'church':
      score += 10
      break
    case 'apartments':
      score += 0.8
      break
    case 'industrial':
      score += 2
      break
    case 'residential':
      score += 0.6
      break
    case 'house':
      score += 0
      break
    case 'garage':
    case 'garages':
      score += -0.1
      break
    case 'shed':
      score += -0.3
      break
  }

  if ('building:levels' in tags || 'building:height' in tags) {
    score += 2
  }

  return true // byId + score >= 0.5
}
