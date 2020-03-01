import { MapWay } from '../ways'

export const buildingStillExists = (way: MapWay): boolean => {
  // TODO: building's size should be taken under consideration
  const { tags } = way

  // range (-1)-(2)
  const byId = Math.sin(way.id / 2) * 2

  let strength: number = 0
  if ('building' in tags) {
    switch (tags.building) {
      case 'church':
        strength = 10
        break
      case 'apartments':
        strength = 0.8
        break
      case 'industrial':
        strength = 2
        break
      case 'residential':
        strength = 0.6
        break
      case 'house':
        strength = 0
        break
      case 'garage':
      case 'garages':
        strength = -0.1
        break
      case 'shed':
        strength = -0.3
        break
    }
  }

  return byId + strength >= 1
}
