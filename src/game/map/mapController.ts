import { bearingBetweenCoords } from '../../utils/coordinates'

import { Renderer } from '../renderer'

import { MapBounds } from './bounds'
import { MapNode } from './nodes/nodes'
import { MapSector, isBottomSector, LEVELS, MapSectorBottom } from './mapSector'
import { MapWay } from './ways/ways'
import { rad2deg, decimal } from '../../utils/numbers'
import { ParsedMapData } from './osmXmlParser'

export const isPolygon = (way: MapWay) =>
  way.nodes[0] === way.nodes[way.nodes.length - 1]

class MapController {
  sectors: MapSector

  nodes: Map<number, MapNode>

  constructor() {
    this.sectors = new MapSector({
      idx: -1,
      bounds: new MapBounds(-90, -180, 90, 180),
      level: 0
    })
    this.nodes = new Map()

    this.sectors.add({
      idx: 0,
      bounds: new MapBounds(-90, -180, 90, 0)
    })
    this.sectors.add({
      idx: 1,
      bounds: new MapBounds(-90, 0, 90, 180)
    })
  }

  addNewData(data: ParsedMapData) {
    data.nodesMap?.forEach(this.addNode, this)
    data.waysMap?.forEach(this.addWay, this)
  }

  addNode(node: MapNode) {
    const { sectors } = this

    this.nodes.set(node.id, node)
    sectors.addNode(node)
  }

  addWay(way: MapWay) {
    // console.debug('addWay')
    if (isPolygon(way)) {
      this.addPolygonWay(way)
    }
  }

  addPolygonWay(way: MapWay) {
    // Construct a polygon out of given nodes.
    const { sectors } = this

    sectors.addWay(way)
  }

  /**
   * First will always be the one containing lat/lon location
   * @param lat
   * @param lon
   */
  getNeighborsForCoords(lat: number, lon: number): MapSectorBottom[] {
    const { sectors } = this
    const d = LEVELS[LEVELS.length - 1]

    const target = sectors.getBottomSectorByCoords(lat, lon)
    const { centerLat: cLat, centerLon: cLon } = target.bounds

    const values = [
      [
        [lat + d, lon - d],
        [lat + d, lon],
        [lat + d, lon + d]
      ],
      [
        [lat, lon - d],
        [lat, lon],
        [lat, lon + d]
      ],
      [
        [lat - d, lon - d],
        [lat - d, lon],
        [lat - d, lon + d]
      ]
    ]
    const flags = [
      [lat > cLat && lon < cLon, lat > cLat, lat > cLat && lon > cLon],
      [lon < cLon, false, lon > cLon],
      [lat < cLat && lon < cLon, lat < cLat, lat < cLat && lon > cLon]
    ]

    return [
      target,
      ...flags
        .reduce((results, flagsRow, rowIdx) => {
          results.push(
            ...flagsRow.map((flagValue, colIdx) => {
              if (flagValue) {
                return sectors.getBottomSectorByCoords(
                  values[rowIdx][colIdx][0],
                  values[rowIdx][colIdx][1]
                )
              }
            })
          )
          return results
        }, [] as MapSectorBottom[])
        .filter(val => val)
    ]
  }

  layDownSectors(
    targetSector: MapSectorBottom,
    restSectors: MapSectorBottom[]
  ) {
    if (restSectors.length > 100) {
      throw new Error(
        `layDown ${restSectors.length} sectors? This must be a mistake. Don't place more than you can chew.`
      )
    }
    console.debug(
      '--- layDownSectors. position',
      targetSector.transformNode.position.x,
      targetSector.transformNode.position.z
    )

    restSectors.map(sector => {
      console.debug(
        `=== sector ${sector.id} === ${sector.ways.length} ways, ${sector.nodes.length} nodes`
      )
      console.debug('\tsize by nodes:', sector.sizeByNodes)
      // Prepare sectors
      // FIXME: ADD distance between sectors, from lat/lon difference
      const distance = targetSector.geoConv.distanceTo(
        sector.bounds.centerLat,
        sector.bounds.centerLon
      )
      const bearing = targetSector.geoConv.bearingTo(
        sector.bounds.centerLat,
        sector.bounds.centerLon
      )

      const newPos = targetSector.transformNode.position.clone()
      newPos.x += Math.cos(bearing) * distance
      newPos.y = 0
      newPos.z += Math.sin(bearing) * distance

      sector.transformNode.position.copyFrom(newPos)

      console.debug('\tposition', newPos.x, newPos.z)
      console.debug(
        '\tfrom target:',
        decimal(distance, 2),
        decimal(rad2deg(bearing), 2)
      )
    })
  }
}

export { MapController }
