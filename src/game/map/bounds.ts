import { middle } from '../../utils/numbers'

export class MapBounds {
  centerLat: number
  centerLon: number

  constructor(
    public minLat: number,
    public minLon: number,
    public maxLat: number,
    public maxLon: number
  ) {
    this.centerLat = middle(minLat, maxLat)
    this.centerLon = middle(minLon, maxLon)
  }

  get sizeLat() {
    return Math.abs(this.maxLat - this.minLat)
  }

  get sizeLon() {
    return Math.abs(this.maxLon - this.minLon)
  }

  /**
   * Can the `other` bounds completely fit inside THIS bounds.
   * @param other
   * @returns `false` is at least one of the edges cross outside of this bounds
   */
  canFitBounds(other: MapBounds) {
    const { minLat, minLon, maxLat, maxLon } = this

    const minlat = minLat < other.minLat && other.minLat <= maxLat
    const maxlat = minLat < other.maxLat && other.maxLat <= maxLat
    const minlon = minLon < other.minLon && other.minLon <= maxLon
    const maxlon = minLon < other.maxLon && other.maxLon <= maxLon

    return minlat && maxlat && minlon && maxlon
  }

  canFitPoint(lat: number, lon: number): boolean {
    const { minLat, maxLat, minLon, maxLon } = this

    // return isWithin(lat, minLat, maxLat) && isWithin(lon, minLon, maxLon)
    const fitsLan = minLat < lat && lat <= maxLat
    const fitsLon = minLon < lon && lon <= maxLon
    return fitsLan && fitsLon
  }
}

export const parseBounds = ({
  $_minlat,
  $_minlon,
  $_maxlat,
  $_maxlon
}: OSMBounds): MapBounds => {
  return new MapBounds($_minlat, $_minlon, $_maxlat, $_maxlon)
}
