import { deg2rad } from './numbers'

var M = 1 / (2 * Math.sqrt(2) - 2) - 1

const distance = (lat1, lon1, lat2, lon2) => {
  var R = 6371e3 // metres
  var φ1 = deg2rad(lat1)
  var φ2 = deg2rad(lat2)
  var Δφ = deg2rad(lat2 - lat1)
  var Δλ = deg2rad(lon2 - lon1)

  var a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  var d = R * c
}
