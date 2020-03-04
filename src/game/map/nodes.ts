import { Vector3 } from '@babylonjs/core'

import { Renderer } from '../renderer'
import { MapSectorBottom } from './mapSector'
import { simplifyTags } from './tags'
import { MapWay } from './ways'

export class MapNode {
  tags: MapTags
  wayRefs: Set<MapWay>

  sector: MapSectorBottom
  relativePosition: Vector3

  renderedRef: any

  constructor(public id: number, public lat: number, public lon: number) {
    this.wayRefs = new Set()
  }

  addToSector(sector: MapSectorBottom) {
    this.sector = sector

    // parse node's position, relative to sector
    const { east, north, up } = sector.geoConv.geodetic2Enu(
      this.lat,
      this.lon,
      0
    )
    this.relativePosition = new Vector3(east, north, up)
    console.log('node relative ENU:', this.relativePosition)
  }

  render(renderer: Renderer) {
    this.renderedRef = renderer.addNode(this.id, this.relativePosition, 100)
    return this.renderedRef
  }

  /**
   * Node is used in some Way object
   */
  get inWay(): boolean {
    return this.wayRefs.size > 0
  }

  /**
   * Node has enough information to be used alone in rendering
   */
  get standalone(): boolean {
    return typeof this.tags !== 'undefined' && Object.keys(this.tags).length > 0
  }

  get isRendered(): boolean {
    return this.renderedRef !== undefined
  }
}

export type MapNodeList = Map<number, MapNode>

// Nodes with these tags are very important
const tagsKeepers = {
  amenity: ['parking'],
  barrier: [
    'fence',
    'wall',
    'gate',
    'bollard',
    'retaining_wall',
    'ditch',
    'city_wall'
  ],
  building: [],
  highway: [],
  power: ['tower', 'pole', 'generator', 'line'],
  natural: ['tree', 'water', 'wood', 'scrub', 'wetland', 'grassland', 'peak']
}

// Nodes with these tags should NOT be remembered
const tagsBlacklist = {
  tram: []
}

// Only tags with these key names will be remembered
const tagAmenitiesWhitelist = ['shelter_type']
const tagsWhitelist = [
  'crossing',
  'highway',
  'amenity',
  'barrier',
  'landuse',
  'surface'
]

const filterTags = (tag: OSMTag): boolean => {
  if (tagsWhitelist.includes(tag.$_k)) {
    return true
  }
  return false
}

export const parseNode = (node: OSMNode): MapNode => {
  const parsedNode = new MapNode(node.$_id, node.$_lat, node.$_lon)

  // Strip useless tags, if any
  if (node.tag) {
    const tags = node.tag.filter(filterTags)
    if (tags.length > 0) {
      parsedNode.tags = simplifyTags(tags)
    }
  }

  return parsedNode
}

/**
 * Filter out uninteresting ways, or without any tags
 * @param way
 */
// export const filterNodes = (node: MapNode): boolean => {
//   if()
// }
