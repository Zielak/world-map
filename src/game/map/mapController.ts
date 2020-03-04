import {
  bearingBetweenCoords,
  distanceBetweenCoords
} from '../../utils/coordinates'

import { Renderer } from '../renderer'

import { MapBounds } from './bounds'
import { MapNode } from './nodes'
import { MapSector, isBottomSector, LEVELS, MapSectorBottom } from './mapSector'
import { MapWay } from './ways'

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
  getNeighborsForCoords(lat: number, lon: number) {
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

  /**
   * Put all known things to 3D space scene
   * @param renderer
   */
  bake(renderer: Renderer, lat: number, lon: number) {
    const chunk = this.getNeighborsForCoords(lat, lon)
    const [targetSector] = chunk
    // const chunk = sectors
    //   .getAllSectorsByLevel(14)
    console.debug('BAKE: sectors to bake:', chunk.length)

    chunk
      .map(sector => {
        if (sector === targetSector) return sector

        // Prepare sectors
        // FIXME: ADD distance between sectors, from lat/lon difference
        const distance = distanceBetweenCoords(
          lat,
          lon,
          sector.bounds.centerLat,
          sector.bounds.centerLon
        )
        const bearing = bearingBetweenCoords(
          lat,
          lon,
          sector.bounds.centerLat,
          sector.bounds.centerLon
        )
        const newPos = targetSector.renderedRef.position.clone()
        newPos.x += Math.cos(bearing) * distance
        newPos.z += Math.sin(bearing) * distance

        sector.renderedRef.position.copyFrom(newPos)

        return sector
      })
      .map(sector => {
        // Dump nodes
        if (isBottomSector(sector)) {
          sector.nodes.forEach(node => {
            node.render(renderer)
          })
        }

        // Dump ways
        // FIXME: Ways should rely on positions of already present nodes and their PARSED positions.
        // Way's nodes may be in other sectors, need to account for that.
        sector.ways.forEach(way => {
          let material
          switch (sector.idx) {
            case 0:
              material = 'terrain0'
              break
            case 1:
              material = 'terrain1'
              break
            case 2:
              material = 'terrain2'
              break
            case 3:
              material = 'terrain3'
              break
          }
          if (sector === targetSector) material = 'building'

          way.renderedRef = renderer.addPolygonWay(way, material)
        })
      })
  }
}

export { MapController }
