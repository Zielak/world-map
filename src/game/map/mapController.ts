import { Renderer } from '../renderer'

import { MapBounds } from './bounds'
import { MapNode } from './nodes'
import { MapSector, isBottomSector } from './mapSector'
import { MapWay } from './ways'

export const isPolygon = (way: MapWay) =>
  way.nodes[0] === way.nodes[way.nodes.length - 1]

class MapController {
  sectors: MapSector

  nodes: Map<number, MapNode>

  constructor() {
    this.sectors = new MapSector({
      bounds: new MapBounds(-90, -180, 90, 180),
      level: 0
    })
    this.nodes = new Map()

    const { sectors } = this.sectors
    sectors.set(
      0,
      new MapSector({
        bounds: new MapBounds(-90, -180, 90, 0),
        level: 1,
        parentSector: this.sectors
      })
    )
    sectors.set(
      1,
      new MapSector({
        bounds: new MapBounds(-90, 0, 90, 180),
        level: 1,
        parentSector: this.sectors
      })
    )
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
   * Put all known things to 3D space scene
   * @param renderer
   */
  bake(renderer: Renderer, lat: number, lon: number) {
    const { sectors } = this

    const chunk = sectors.getAllSectorsByCoords(lat, lon)
    // const chunk = sectors
    //   .getAllSectorsByLevel(14)
    console.debug('BAKE: sectors to bake:', chunk.length)

    chunk.map(sector => {
      // FIXME: ADD distance between sectors, from lat/lon difference

      // Dump nodes
      if (isBottomSector(sector)) {
        sector.nodes.forEach(node => {
          node.render(renderer)
        })
      }

      // Dump ways
      // FIXME: Ways should rely on positions of already present nodes and their PARSED positions.
      // Way's nodes may be in other sectors, need to account for that.
      // sector.ways.forEach(way => {
      //   way.renderedRef = renderer.addPolygonWay(
      //     way,
      //     way.nodes
      //       .map(function convertNodeCoords(node) {
      //         const enu = geoConv.geodetic2Enu(node.lat, node.lon, 0)
      //         return new Vector2(enu.east, enu.north)
      //       })
      //       .slice(0, -1)
      //   )
      // })
    })
  }
}

export { MapController }
