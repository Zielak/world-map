import { Matrix3 } from 'three/src/math/Matrix3'
import { Vector3 } from 'three/src/math/Vector3'

import { deg2rad, rad2deg } from './numbers'

/**
BSD 3 - Clause License

Copyright (c) 2017, ETHZ ASL
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Geodetic system parameters
const kSemiMajorAxis = 6378137
const kSemiMinorAxis = 6356752.3142
const kFirstEccentricitySquared = 6.69437999014 * 0.001
const kSecondEccentricitySquared = 6.73949674228 * 0.001
const kFlattening = 1 / 298.257223563

class GeodeticConverter {
  initial_latitude_: number
  initial_longitude_: number
  initial_altitude_: number

  initial_ecef_x_: number
  initial_ecef_y_: number
  initial_ecef_z_: number

  ecef_to_ned_matrix_: Matrix3
  ned_to_ecef_matrix_: Matrix3

  haveReference_: boolean

  getReference(): GeodeticCoords {
    return {
      latitude: this.initial_latitude_,
      longitude: this.initial_longitude_,
      altitude: this.initial_altitude_
    }
  }

  setReference(latitude: number, longitude: number, altitude: number) {
    // Save NED origin
    this.initial_latitude_ = deg2rad(latitude)
    this.initial_longitude_ = deg2rad(longitude)
    this.initial_altitude_ = altitude

    {
      // Compute ECEF of NED origin
      const { x, y, z } = this.geodetic2Ecef(latitude, longitude, altitude)
      this.initial_ecef_x_ = x
      this.initial_ecef_y_ = y
      this.initial_ecef_z_ = z
    }

    // Compute ECEF to NED and NED to ECEF matrices
    const phiP: number = Math.atan2(
      this.initial_ecef_z_,
      Math.sqrt(
        Math.pow(this.initial_ecef_x_, 2) + Math.pow(this.initial_ecef_y_, 2)
      )
    )

    this.ecef_to_ned_matrix_ = this.nRe(phiP, this.initial_longitude_)
    this.ned_to_ecef_matrix_ = this.nRe(
      this.initial_latitude_,
      this.initial_longitude_
    ).transpose()
  }

  /**
   * Convert geodetic coordinates to ECEF.
   * http://code.google.com/p/pysatel/source/browse/trunk/coord.py?r=22
   * @param latitude
   * @param longitude
   * @param altitude
   */
  geodetic2Ecef(
    latitude: number,
    longitude: number,
    altitude: number
  ): EcefCoords {
    const lat_rad = deg2rad(latitude)
    const lon_rad = deg2rad(longitude)
    const xi = Math.sqrt(
      1 - kFirstEccentricitySquared * Math.sin(lat_rad) * Math.sin(lat_rad)
    )

    return {
      x:
        (kSemiMajorAxis / xi + altitude) *
        Math.cos(lat_rad) *
        Math.cos(lon_rad),
      y:
        (kSemiMajorAxis / xi + altitude) *
        Math.cos(lat_rad) *
        Math.sin(lon_rad),
      z:
        ((kSemiMajorAxis / xi) * (1 - kFirstEccentricitySquared) + altitude) *
        Math.sin(lat_rad)
    }
  }

  /**
   * Convert ECEF coordinates to geodetic coordinates.
   * J. Zhu, "Conversion of Earth-centered Earth-fixed coordinates
   * to geodetic coordinates," IEEE Transactions on Aerospace and
   * Electronic Systems, vol. 30, pp. 957-961, 1994.
   * @param x
   * @param y
   * @param z
   */
  ecef2Geodetic(x: number, y: number, z: number): GeodeticCoords {
    const r = Math.sqrt(x * x + y * y)
    const Esq =
      kSemiMajorAxis * kSemiMajorAxis - kSemiMinorAxis * kSemiMinorAxis
    const F = 54 * kSemiMinorAxis * kSemiMinorAxis * z * z
    const G =
      r * r +
      (1 - kFirstEccentricitySquared) * z * z -
      kFirstEccentricitySquared * Esq
    const C =
      (kFirstEccentricitySquared * kFirstEccentricitySquared * F * r * r) /
      Math.pow(G, 3)
    const S = Math.cbrt(1 + C + Math.sqrt(C * C + 2 * C))
    const P = F / (3 * Math.pow(S + 1 / S + 1, 2) * G * G)
    const Q = Math.sqrt(
      1 + 2 * kFirstEccentricitySquared * kFirstEccentricitySquared * P
    )
    const r_0 =
      -(P * kFirstEccentricitySquared * r) / (1 + Q) +
      Math.sqrt(
        0.5 * kSemiMajorAxis * kSemiMajorAxis * (1 + 1.0 / Q) -
          (P * (1 - kFirstEccentricitySquared) * z * z) / (Q * (1 + Q)) -
          0.5 * P * r * r
      )
    const U = Math.sqrt(
      Math.pow(r - kFirstEccentricitySquared * r_0, 2) + z * z
    )
    const V = Math.sqrt(
      Math.pow(r - kFirstEccentricitySquared * r_0, 2) +
        (1 - kFirstEccentricitySquared) * z * z
    )
    const Z_0 = (kSemiMinorAxis * kSemiMinorAxis * z) / (kSemiMajorAxis * V)

    return {
      altitude:
        U * (1 - (kSemiMinorAxis * kSemiMinorAxis) / (kSemiMajorAxis * V)),
      latitude: rad2deg(Math.atan((z + kSecondEccentricitySquared * Z_0) / r)),
      longitude: rad2deg(Math.atan2(y, x))
    }
  }

  /**
   * Converts ECEF coordinate position into local-tangent-plane NED.
   * Coordinates relative to given ECEF coordinate frame.
   * @param x
   * @param y
   * @param z
   */
  ecef2Ned(x: number, y: number, z: number): NedCoords {
    const vector = new Vector3()
    vector.x = x - this.initial_ecef_x_
    vector.y = y - this.initial_ecef_y_
    vector.z = z - this.initial_ecef_z_
    const ret = vector.applyMatrix3(this.ecef_to_ned_matrix_)

    return {
      north: ret.x,
      east: ret.y,
      down: -ret.z
    }
  }

  /**
   * NED (north/east/down) to ECEF coordinates
   * @param north
   * @param east
   * @param down
   */
  ned2Ecef(north: number, east: number, down: number): EcefCoords {
    const ned = new Vector3(north, east, -down)
    const ret = ned.applyMatrix3(this.ned_to_ecef_matrix_)

    return {
      x: ret.x + this.initial_ecef_x_,
      y: ret.y + this.initial_ecef_y_,
      z: ret.z + this.initial_ecef_z_
    }
  }

  /**
   * Geodetic position to local NED frame
   * @param latitude
   * @param longitude
   * @param altitude
   */
  geodetic2Ned(
    latitude: number,
    longitude: number,
    altitude: number
  ): NedCoords {
    const { x, y, z } = this.geodetic2Ecef(latitude, longitude, altitude)

    return this.ecef2Ned(x, y, z)
  }

  /**
   * Local NED position to geodetic coordinates
   * @param north
   * @param east
   * @param down
   */
  ned2Geodetic(north: number, east: number, down: number): GeodeticCoords {
    const { x, y, z } = this.ned2Ecef(north, east, down)

    return this.ecef2Geodetic(x, y, z)
  }

  /**
   * Geodetic position to local ENU frame
   * @param latitude
   * @param longitude
   * @param altitude
   */
  geodetic2Enu(
    latitude: number,
    longitude: number,
    altitude: number
  ): EnuCoords {
    const { x, y, z } = this.geodetic2Ecef(latitude, longitude, altitude)
    const { north: aux_north, east: aux_east, down: aux_down } = this.ecef2Ned(
      x,
      y,
      z
    )

    return {
      east: aux_east,
      north: aux_north,
      up: -aux_down
    }
  }

  /**
   * Local ENU position to geodetic coordinates
   * @param east
   * @param north
   * @param up
   */
  enu2Geodetic(east: number, north: number, up: number): GeodeticCoords {
    const aux_north = north
    const aux_east = east
    const aux_down = -up

    const { x, y, z } = this.ned2Ecef(aux_north, aux_east, aux_down)

    return this.ecef2Geodetic(x, y, z)
  }

  private nRe(lat_radians: number, lon_radians: number): Matrix3 {
    const sLat = Math.sin(lat_radians)
    const sLon = Math.sin(lon_radians)
    const cLat = Math.cos(lat_radians)
    const cLon = Math.cos(lon_radians)

    const ret = new Matrix3()
    ret.set(
      -sLat * cLon,
      -sLat * sLon,
      cLat,
      -sLon,
      cLon,
      0.0,
      cLat * cLon,
      cLat * sLon,
      sLat
    )

    return ret
  }
}

export { GeodeticConverter }
