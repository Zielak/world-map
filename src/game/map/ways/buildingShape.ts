import { MapWay } from './ways'

export const determineBuildingHeight = (way: MapWay): number => {
  // TODO: make use of general shape size to determine height.
  const { tags } = way

  if (typeof tags['building:height'] === 'number') {
    return tags['building:height']
  }

  if (typeof tags['height'] === 'number') {
    return tags['height']
  }

  if (typeof tags['building:levels'] === 'number') {
    const levelHeight = determineLevelHeight(way)
    return tags['building:levels'] * levelHeight
  }

  if ('building' in tags) {
    switch (tags.building) {
      case 'church':
        return 50
      case 'apartments':
        return 20
      case 'industrial':
        return 12
      case 'residential':
        return 12
      case 'house':
        return 6.5
      case 'garage':
      case 'garages':
        return 2.2
      case 'shed':
        return 2
    }
  }

  if ('shop' in tags) {
    switch (tags.shop) {
      case 'kiosk':
        return 2.4
    }
  }

  // Fallback for generic building=yes and nothing else...
  if (tags.building === 'yes') {
    return 3
  }

  return 5
}

const determineLevelHeight = (way: MapWay): number => {
  const { tags } = way

  switch (tags.building) {
    case 'retail':
      return 4
    case 'commercial':
      return 3.3
    case 'residential':
      return 2.4
    case 'apartments':
      return 2.8
  }

  return 3
}
