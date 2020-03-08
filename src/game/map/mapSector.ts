import { TransformNode } from '@babylonjs/core'

import { GeodeticConverter } from '../../utils/geodeticConverter'

import { MapBounds } from './bounds'
import { MapNode } from './nodes/nodes'
import { MapWay } from './ways/ways'

class LimitedMap<T> extends Map<number, T> {
  constructor(private limit: number) {
    super()
  }
  set(index: number, value: T) {
    if (this.size < this.limit) {
      super.set(index, value)
    } else {
      throw new Error(`Can't add any more items in this LimitedMap`)
    }
    return this
  }
}

// const MAX_NODES = 100

export const LEVELS = Object.freeze([
  360,
  180,
  90,
  45,
  22.5,
  11.25,
  5.625,
  2.8125,
  1.40625,
  0.703125,
  0.3515625,
  0.17578125,
  0.087890625,
  0.0439453125,
  0.02197265625
])

export type MapSectorOptions = {
  bounds: MapBounds
  idx: number
  level?: number
  parent?: MapSector
}

export const isBottomSector = (
  sector: MapSector | MapSectorBottom
): sector is MapSectorBottom => {
  return sector.level === LEVELS.length - 1
}

let sectorIdCounter = 0

export class MapSector {
  id: number
  idx: number
  level: number
  bounds: MapBounds
  halfSizeLat: number
  halfSizeLon: number

  parent: MapSector
  sectors: LimitedMap<MapSector>

  ways: MapWay[]

  constructor(options: MapSectorOptions) {
    this.id = sectorIdCounter++
    this.idx = options.idx
    this.bounds = options.bounds
    this.parent = options.parent
    this.level = options.level
    this.halfSizeLat = options.bounds.sizeLat / 2
    this.halfSizeLon = options.bounds.sizeLon / 2

    this.ways = []

    /** ________
     * | 0 | 1 |
     * | 2 | 3 |
     */
    this.sectors = new LimitedMap(4)
  }

  add(options: MapSectorOptions) {
    const sectorConstructor =
      this.level === LEVELS.length - 2 ? MapSectorBottom : MapSector

    this.sectors.set(
      options.idx,
      new sectorConstructor({
        ...options,
        level: this.level + 1,
        idx: options.idx,
        parent: this
      })
    )
  }

  /**
   * Gets you all sub-sectors (all levels) for given coordinates
   * @param lat
   * @param lon
   */
  getSectorsByCoords(lat: number, lon: number): MapSector[] {
    const travel = (sector: MapSector, result: MapSector[] = []) => {
      if (!sector.coordsFitHere(lat, lon)) {
        return result
      }

      if (!sector.isSubdivided) {
        result.push(sector)
        return result
      }

      for (const subSector of sector.sectors.values()) {
        if (subSector.coordsFitHere(lat, lon)) {
          result.push(sector)
          return travel(subSector, result)
        }
      }
    }

    return travel(this, [])
  }

  /**
   * Gets only the bottom sector with its neighbors.
   * @param lat
   * @param lon
   */
  getBottomSectorByCoords(lat: number, lon: number): MapSectorBottom {
    const travel = (sector: MapSector) => {
      if (!sector.coordsFitHere(lat, lon)) {
        return
      }

      if (!sector.isSubdivided) {
        return
      }

      for (const subSector of sector.sectors.values()) {
        if (subSector.coordsFitHere(lat, lon)) {
          if (isBottomSector(subSector)) {
            return subSector
          }
          return travel(subSector)
        }
      }
    }

    return travel(this)
  }

  getAllSectorsByLevel(level: number): MapSector[] {
    if (level < 0 || level > LEVELS.length - 1) {
      throw new Error(`getAllSectorsByLevel, invalid level requested: ${level}`)
    }
    if (level === this.level) {
      return [this]
    }
    if (level >= this.level) {
      return [...this.sectors.values()].reduce(
        (arr, sector) => arr.concat(sector.getAllSectorsByLevel(level)),
        []
      )
    }
  }

  coordsFitHere(lat: number, lon: number): boolean {
    return this.bounds.canFitPoint(lat, lon)
  }

  /**
   * Find the best inner sector to put this way in.
   * @param way
   */
  addWay(way: MapWay) {
    if (!this.bounds.canFitBounds(way.bounds)) {
      return false
    }

    // It can fit inside this sector
    if (isBottomSector(this)) {
      // Can't dig any deeper, let's just add it in here.
      this.ways.push(way)
      return true
    }

    if (!this.isSubdivided) {
      this.subdivide()
    }
    let targetSector: MapSector
    for (const subSector of this.sectors.values()) {
      if (subSector.bounds.canFitBounds(way.bounds)) {
        targetSector = subSector
        break
      }
    }

    if (targetSector) {
      targetSector.addWay(way)
    } else {
      // No sub-sector could fit this guy, add it here
      this.ways.push(way)
    }
  }

  /**
   * Find the most bottom sector to put this node in.
   * Populates node with its position in 3D space, relative to sector's origin
   * @param node
   */
  addNode(node: MapNode) {
    // See if it could fit in any sub-sector
    if (!this.isSubdivided && !isBottomSector(this)) {
      this.subdivide()
    }
    for (const subSector of this.sectors.values()) {
      if (subSector.bounds.canFitPoint(node.lat, node.lon)) {
        return subSector.addNode(node)
      }
    }
    throw new Error(`sector.addNode() couldn't add for some reason?`)
    // return false
  }

  /**
   * Creates 4 new sub-sectors
   */
  subdivide() {
    if (this.isSubdivided) {
      throw new Error(`This section has already been subdivided`)
    }

    const { level } = this
    const { minLat, maxLat, minLon, maxLon, centerLon, centerLat } = this.bounds

    this.add({
      idx: 0,
      bounds: new MapBounds(minLat, minLon, centerLat, centerLon),
      level: level + 1,
      parent: this
    })
    this.add({
      idx: 1,
      bounds: new MapBounds(minLat, centerLon, centerLat, maxLon),
      level: level + 1,
      parent: this
    })
    this.add({
      idx: 2,
      bounds: new MapBounds(centerLat, minLon, maxLat, centerLon),
      level: level + 1,
      parent: this
    })
    this.add({
      idx: 3,
      bounds: new MapBounds(centerLat, centerLon, maxLat, maxLon),
      level: level + 1,
      parent: this
    })
  }

  get isSubdivided(): boolean {
    return this.sectors.size !== 0
  }

  get(idx: number) {
    this.sectors.get(idx)
  }
}

export class MapSectorBottom extends MapSector {
  geoConv: GeodeticConverter

  nodes: MapNode[]
  // Once everything is ready, a sector should be rendered as a container of all its things
  transformNode: TransformNode

  constructor(options: MapSectorOptions) {
    super(options)

    this.geoConv = new GeodeticConverter()
    this.geoConv.setReference(
      options.bounds.centerLat,
      options.bounds.centerLon,
      0
    )

    const firstNode = new MapNode({
      id: -1000 - this.id,
      lat: options.bounds.centerLat,
      lon: options.bounds.centerLon,
      tags: { test: 'yes' },
      sector: this
    })

    this.nodes = [firstNode]

    this.transformNode = new TransformNode(`${this.id}_${this.level}`)
  }

  addNode(node: MapNode) {
    // Can't dig any deeper, let's just add it in here.
    node.addToSector(this)
    this.nodes.push(node)
    return true
  }

  subdivide() {}
  get isSubdivided(): boolean {
    return false
  }

  get position() {
    return this.transformNode?.position
  }

  get sizeByNodes() {
    const sizeByNodes = this.nodes.reduce(
      (res, node) => {
        if (node.relativePosition.x < res.minX)
          res.minX = node.relativePosition.x
        if (node.relativePosition.z < res.minZ)
          res.minZ = node.relativePosition.z
        if (node.relativePosition.x > res.maxX)
          res.maxX = node.relativePosition.x
        if (node.relativePosition.z > res.maxZ)
          res.maxZ = node.relativePosition.z

        return res
      },
      { minX: 0, minZ: 0, maxX: 0, maxZ: 0, x: 0, z: 0 }
    )

    sizeByNodes.x = Math.abs(sizeByNodes.minX - sizeByNodes.maxX)
    sizeByNodes.z = Math.abs(sizeByNodes.minZ - sizeByNodes.maxZ)

    return sizeByNodes
  }
}
