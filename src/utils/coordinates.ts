import { deg2rad, rad2deg } from './numbers'

// var M = 1 / (2 * Math.sqrt(2) - 2) - 1

const R = 6371e3 // (Mean) radius of earth
/**
 * https://www.movable-type.co.uk/scripts/latlong.html
 */
export const distanceBetweenCoords = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  var lat1 = deg2rad(lat1)
  var lat2 = deg2rad(lat2)
  var Δlat = deg2rad(lat2 - lat1)
  var Δlon = deg2rad(lon2 - lon1)

  var a =
    Math.sin(Δlat / 2) * Math.sin(Δlat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(Δlon / 2) * Math.sin(Δlon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const bearingBetweenCoords = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  return deg2rad(Math.atan2(y, x))
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
 */
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
