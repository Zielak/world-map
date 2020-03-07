import { Vector3 } from '@babylonjs/core'

import { MapSectorBottom } from '../mapSector'
import { simplifyTags } from '../tags'
import { MapWay } from '../ways/ways'

type MapNodeOptions = {
  id: number
  lat: number
  lon: number
  tags?: MapTags
  sector?: MapSectorBottom
}

export class MapNode {
  id: number
  lat: number
  lon: number

  tags: MapTags
  wayRefs: Set<MapWay>

  sector: MapSectorBottom

  /**
   * Node's 3D position relative to the center of sector
   */
  relativePosition: Vector3

  renderedRef: any

  constructor(options: MapNodeOptions) {
    this.id = options.id
    this.lat = options.lat
    this.lon = options.lon

    this.wayRefs = new Set()

    if (options.tags) {
      this.tags = options.tags
    }
    if (options.sector) {
      this.addToSector(options.sector)
    }
  }

  /**
   * Prepare node's location in 3D space and hook it to its sector
   * @param sector
   */
  addToSector(sector: MapSectorBottom) {
    if (this.sector) {
      throw new Error(`Nod${this.id} already exists in other sector!`)
    }
    this.sector = sector

    // parse node's position, relative to sector
    const { east, north, up } = sector.geoConv.geodetic2Enu(
      this.lat,
      this.lon,
      0
    )
    this.relativePosition = new Vector3(east, up, north)
    // console.log('node relative ENU:', this.relativePosition)
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
  'surface',
  'test'
]

const filterTags = (tag: OSMTag): boolean => {
  if (tagsWhitelist.includes(tag.$_k)) {
    return true
  }
  return false
}

export const parseNode = (node: OSMNode): MapNode => {
  const options: MapNodeOptions = {
    id: node.$_id,
    lat: node.$_lat,
    lon: node.$_lon
  }

  // Strip useless tags, if any
  if (node.tag) {
    const tags = node.tag.filter(filterTags)
    if (tags.length > 0) {
      options.tags = simplifyTags(tags)
    }
  }

  return new MapNode(options)
}

/**
 * Filter out uninteresting ways, or without any tags
 * @param way
 */
// export const filterNodes = (node: MapNode): boolean => {
//   if()
// }
