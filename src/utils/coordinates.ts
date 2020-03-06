import { deg2rad, rad2deg } from './numbers'

// var M = 1 / (2 * Math.sqrt(2) - 2) - 1

// const R = 6371e3 // (Mean) radius of earth
const R = 6371e3 // (Mean) radius of earth
/**
 * https://www.movable-type.co.uk/scripts/latlong.html
 */
export function distanceBetweenCoords(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  // a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
  // δ = 2·atan2(√(a), √(1−a))
  // see mathforum.org/library/drmath/view/51879.html for derivation

  const φ1 = deg2rad(lat1)
  const λ1 = deg2rad(lon1)
  const φ2 = deg2rad(lat2)
  const λ2 = deg2rad(lon2)
  const Δφ = φ2 - φ1
  const Δλ = λ2 - λ1

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c

  return d
}

/**
 * Bearing between points in RADIANS
 * @param lat1
 * @param lon1
 * @param lat2
 * @param lon2
 */
export const bearingBetweenCoords = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const lat1_rad = deg2rad(lat1)
  const lon1_rad = deg2rad(lon1)
  const lat2_rad = deg2rad(lat2)
  const lon2_rad = deg2rad(lon2)

  const y = Math.sin(lon2_rad - lon1_rad) * Math.cos(lat2_rad)
  const x =
    Math.cos(lat1_rad) * Math.sin(lat2_rad) -
    Math.sin(lat1_rad) * Math.cos(lat2_rad) * Math.cos(lon2_rad - lon1_rad)
  return Math.atan2(y, x)
}

export const destinationPoint = (
  lat: number,
  lon: number,
  distance: number,
  bearing: number
): GeodeticCoords => {
  const lat_rad = deg2rad(lat)
  const lon_rad = deg2rad(lon)

  const latitude = Math.asin(
    Math.sin(lat_rad) * Math.cos(distance / R) +
      Math.cos(lat_rad) * Math.sin(distance / R) * Math.cos(bearing)
  )
  const longitude =
    lon +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lon_rad),
      Math.cos(distance / R) - Math.sin(lon_rad) * Math.sin(latitude)
    )

  return {
    longitude: rad2deg(longitude),
    latitude: rad2deg(latitude),
    altitude: 0
  }
}

/**
 * Returns the destination point from a given point, having travelled the given distance
 * on the given initial bearing.
 *
 * @param   {number} lat - initial latitude in decimal degrees (eg. 50.123)
 * @param   {number} lon - initial longitude in decimal degrees (e.g. -4.321)
 * @param   {number} distance - Distance travelled (metres).
 * @param   {number} bearing - Initial bearing (in degrees from north).
 * @returns {array} destination point as [latitude,longitude] (e.g. [50.123, -4.321])
 *
 * @example
 *     var p = destinationPoint(51.4778, -0.0015, 7794, 300.7); // 51.5135°N, 000.0983°W
 *
 * https://stackoverflow.com/a/19356304/1404284
 /
export function destinationPoint(lat, lon, distance, bearing): GeodeticCoords {
  // sinφ2 = sinφ1·cosδ + cosφ1·sinδ·cosθ
  // tanΔλ = sinθ·sinδ·cosφ1 / cosδ−sinφ1·sinφ2
  // see mathforum.org/library/drmath/view/52049.html for derivation

  var δ = Number(distance) / R // angular distance in radians
  var θ = deg2rad(Number(bearing))

  var φ1 = deg2rad(Number(lat))
  var λ1 = deg2rad(Number(lon))

  var sinφ1 = Math.sin(φ1),
    cosφ1 = Math.cos(φ1)
  var sinδ = Math.sin(δ),
    cosδ = Math.cos(δ)
  var sinθ = Math.sin(θ),
    cosθ = Math.cos(θ)

  var sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * cosθ
  var φ2 = Math.asin(sinφ2)
  var y = sinθ * sinδ * cosφ1
  var x = cosδ - sinφ1 * sinφ2
  var λ2 = λ1 + Math.atan2(y, x)

  return {
    latitude: rad2deg(φ2),
    longitude: ((rad2deg(λ2) + 540) % 360) - 180, // normalize to −180..+180°
    altitude: 0
  }
}
*/
