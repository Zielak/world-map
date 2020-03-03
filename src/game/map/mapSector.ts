import { MapNode } from './nodes'
import { MapWay, MapWayList } from './ways'
import { MapBounds } from './bounds'
import { isWithin } from '../../utils/numbers'

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

const LEVELS = Object.freeze([
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

export class MapSector {
  level: number
  bounds: MapBounds
  halfSizeLat: number
  halfSizeLon: number

  sectors: LimitedMap<MapSector>

  nodes: MapNode[]
  ways: MapWay[]

  constructor(bounds: MapBounds, level: number) {
    this.bounds = bounds
    this.level = level
    this.halfSizeLat = bounds.sizeLat / 2
    this.halfSizeLon = bounds.sizeLon / 2

    this.nodes = []
    this.ways = []

    /** ________
     * | 0 | 1 |
     * | 2 | 3 |
     */
    this.sectors = new LimitedMap(4)
  }

  /**
   * Gets you all sub-sectors for given coordinates
   * @param lat
   * @param lon
   * @param _resultsArray used internally, don't pass any value here
   */
  getAllSectorsByCoords(
    lat: number,
    lon: number,
    _resultsArray: MapSector[] = []
  ): MapSector[] {
    if (!this.coordsFitHere(lat, lon)) {
      return _resultsArray
    }

    if (!this.isSubdivided) {
      _resultsArray.push(this)
      return _resultsArray
    }

    for (const subSector of this.sectors.values()) {
      if (subSector.coordsFitHere(lat, lon)) {
        _resultsArray.push(this)
        return subSector.getAllSectorsByCoords(lat, lon, _resultsArray)
      }
    }
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
    const { minLat, maxLat, minLon, maxLon } = this.bounds

    // return isWithin(lat, minLat, maxLat) && isWithin(lon, minLon, maxLon)
    const fitsLan = minLat < lat && lat <= maxLat
    const fitsLon = minLon < lon && lon <= maxLon
    return fitsLan && fitsLon
  }

  /**
   * Find the best inner sector to put this way in.
   * @param way
   */
  addWay(way: MapWay) {
    if (!this.bounds.canFit(way.bounds)) {
      return false
    }

    // It can fit inside this sector
    if (this.level === LEVELS.length - 1) {
      // Can't dig any deeper, let's just add it in here.
      this.ways.push(way)
      return true
    }

    // See if it could fit in any sub-sector
    if (
      way.bounds.sizeLat < this.halfSizeLat &&
      way.bounds.sizeLon < this.halfSizeLon
    ) {
      // Size-wise it could fit, but still, bounds position matters.
      if (!this.isSubdivided) {
        this.subdivide()
      }
      let targetSector: MapSector
      for (const subSector of this.sectors.values()) {
        if (subSector.bounds.canFit(way.bounds)) {
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
  }

  /**
   * Find the best inner sector to put this node in.
   * @param node
   */
  addNode(node: MapNode) {
    if (this.level === LEVELS.length - 1) {
      // Can't dig any deeper, let's just add it in here.
      this.nodes.push(node)
      return true
    }

    // See if it could fit in any sub-sector
    if (!this.isSubdivided) {
      this.subdivide()
    }
    let targetSector: MapSector
    for (const subSector of this.sectors.values()) {
      if (subSector.bounds.canFitPoint(node.lat, node.lon)) {
        targetSector = subSector
        break
      }
    }

    if (targetSector) {
      targetSector.addNode(node)
    } else {
      // No sub-sector could fit this guy, add it here
      // FIXME: probably won't happen with nodes.
      this.nodes.push(node)
    }
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

    this.sectors.set(
      0,
      new MapSector(
        new MapBounds(minLat, minLon, centerLat, centerLon),
        level + 1
      )
    )
    this.sectors.set(
      1,
      new MapSector(
        new MapBounds(minLat, centerLon, centerLat, maxLon),
        level + 1
      )
    )
    this.sectors.set(
      2,
      new MapSector(
        new MapBounds(centerLat, minLon, maxLat, centerLon),
        level + 1
      )
    )
    this.sectors.set(
      3,
      new MapSector(
        new MapBounds(centerLat, centerLon, maxLat, maxLon),
        level + 1
      )
    )
  }

  get isSubdivided(): boolean {
    return this.sectors.size !== 0
  }

  get(idx: number) {
    this.sectors.get(idx)
  }
}
