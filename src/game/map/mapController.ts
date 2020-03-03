import { GeodeticConverter } from '../../utils/geodeticConverter'
import { Renderer } from '../renderer'
import { MapWay } from './ways'

import { MapSector } from './mapSector'
import { MapBounds } from './bounds'
import { Vector2 } from '@babylonjs/core'
import { MapNode } from './nodes'

export const isPolygon = (way: MapWay) =>
  way.nodes[0] === way.nodes[way.nodes.length - 1]

class MapController {
  geoConv: GeodeticConverter
  sectors: MapSector

  constructor(options: {}, private renderer: Renderer) {
    this.geoConv = new GeodeticConverter()

    this.sectors = new MapSector(new MapBounds(-90, -180, 90, 180), 0)

    const { sectors } = this.sectors
    sectors.set(0, new MapSector(new MapBounds(-90, -180, 90, 0), 1))
    sectors.set(1, new MapSector(new MapBounds(-90, 0, 90, 180), 1))
  }

  addNode(node: MapNode) {
    const { sectors } = this

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
    const { geoConv, sectors } = this

    // const chunk = sectors.getAllSectorsByCoords(lat, lon)
    const chunk = sectors
      .getAllSectorsByLevel(14)
      .filter(sector => sector.nodes.length || sector.ways.length)
    console.debug('BAKE: sectors to bake:', chunk.length)

    chunk.map(sector => {
      // Set new reference point
      geoConv.setReference(sector.bounds.centerLat, sector.bounds.centerLon, 0)

      // Dump nodes
      sector.nodes.forEach(node => {
        const enu = geoConv.geodetic2Enu(node.lat, node.lon, 0)
        // FIXME: ADD distance between sectors, from lat/lon difference
        console.log('addNode ENU:', enu)

        node.renderedRef = renderer.addNode(
          node.id,
          enu.east,
          enu.up,
          enu.north,
          100
        )
      })

      // Dump ways
      sector.ways.forEach(way => {
        way.renderedRef = renderer.addPolygonWay(
          way,
          way.nodes
            .map(function convertNodeCoords(node) {
              const enu = geoConv.geodetic2Enu(node.lat, node.lon, 0)
              return new Vector2(enu.east, enu.north)
            })
            .slice(0, -1)
        )
      })
    })
  }
}

export { MapController }
