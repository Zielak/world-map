import { MapBounds } from './bounds'
import { MapNode, MapNodeList } from './nodes'
import { simplifyTags } from './tags'

export class MapWay {
  tags: MapTags
  bounds: MapBounds
  renderedRef: any

  constructor(public id: number, public nodes: MapNode[]) {
    // Mark all nodes with reference to this way
    this.nodes.forEach(node => node.wayRefs.add(this))

    this.calculateBounds()
  }

  private calculateBounds() {
    const [firstNode] = this.nodes
    let minLat = firstNode.lat
    let minLon = firstNode.lon
    let maxLat = firstNode.lat
    let maxLon = firstNode.lon

    this.nodes.forEach(({ lat, lon }) => {
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
    })

    this.bounds = new MapBounds(minLat, minLon, maxLat, maxLon)
  }

  get isRendered(): boolean {
    return this.renderedRef !== undefined
  }
}
export type MapWayList = Map<number, MapWay>

const tagsWhitelist = [
  'building',
  // 'crossing',
  'highway',
  // 'lanes',
  'amenity'
  // 'barrier',
  // 'landuse',
  // 'surface'
]
const tagsValuesBlacklist = new Map([['highway', ['footway']]])

const filterWhitelistedTags = (tag: OSMTag): boolean => {
  return tagsWhitelist.includes(tag.$_k)
}

const hasBlacklistedTagValues = (way: MapWay): boolean => {
  if (!way.tags) return false

  return Object.keys(way.tags)
    .filter(key => tagsValuesBlacklist.has(key))
    .some(key =>
      tagsValuesBlacklist.get(key).includes(way.tags[key].toString())
    )
}

/**
 * Convert OSM way to the way with references to already parsed Nodes.
 */
export const parseWay = (way: OSMWay, nodes: MapNodeList): MapWay => {
  const parsedWay = new MapWay(
    way.$_id,
    way.nd.map(nd => nodes.get(nd.$_ref))
  )

  // Strip useless tags, if any
  if (way.tag) {
    const tags = way.tag.filter(filterWhitelistedTags)
    if (tags.length > 0) {
      parsedWay.tags = simplifyTags(tags)
    }
  }

  return parsedWay
}

/**
 * Filter out uninteresting ways, or without any tags
 * @param way
 */
export const filterWays = (way: MapWay): boolean => {
  const hasAnyTags = way.tags && Object.keys(way.tags).length > 0
  const hasBlacklistedTags = hasBlacklistedTagValues(way)

  // if(way.tags.building)

  return hasAnyTags && !hasBlacklistedTags
}
