/**
 * Copyright 2022 Klarna Bank AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vicinityhash from 'vicinityhash'

type Geofence = {
  latitude: number
  longitude: number
  radius: number
}

const defaultPrecision = 6

export function reduce (
  geofences: Geofence[],
  config = { precision: 6 })
{
  validateGeofences(geofences)
  if (config) validateConfig(config)
  
  const geofencesDeduplicated: Geofence[] = deduplicate(geofences)
  const geohashes = convertToGeohash(geofencesDeduplicated, config.precision)

  const geofencesReduced: Geofence[] = []
  const geofencesRemoved: Geofence[] = []
  const geohashesRemoved: string[][] = []

  // Find geofences with unique geohashes
  for (let index = 0; index < geofencesDeduplicated.length; index++) {
    const geofence: Geofence = geofencesDeduplicated[index]
    const geofenceGeohashes: string[] = geohashes[index]

    let geohashesCopy = geohashes.slice()
    geohashesCopy.splice(index, 1)
    const otherGeohashes: string[] = [ ...new Set(geohashesCopy.flat()) ]

    if (containsUniqueGeohash(geofenceGeohashes, otherGeohashes)) {
      geofencesReduced.push(geofence)
    } else {
      geofencesRemoved.push(geofence)
      geohashesRemoved.push(geofenceGeohashes)
    }
  }

  const geohashesCovered = convertToGeohash(geofencesReduced, config.precision)
  let geohashesCoveredUnique = [ ...new Set(geohashesCovered.flat()) ]

  // Find geofences within removed that contains missing geohashes
  for (let index = 0; index < geofencesRemoved.length; index++) {
    const geofence = geofencesRemoved[index]
    const geofenceGeohashes: string[] = geohashesRemoved[index]

    if (containsUniqueGeohash(geofenceGeohashes, geohashesCoveredUnique)) {
      geofencesReduced.push(geofence)
      geohashesCoveredUnique = geohashesCoveredUnique.concat(geofenceGeohashes)
    }
  }

  return geofencesReduced
}

function validateGeofences(geofences: Geofence[]) {
  if (!Array.isArray(geofences)) throw new Error('Geofences must be an array')

  geofences.forEach(geofence => validateGeofence(geofence))
}

function validateGeofence(geofence: Geofence) {
  const { latitude, longitude, radius } = geofence

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be a number between -90 and 90')
  }
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be a number between -180 and 180')
  }
  if (isNaN(radius) || !Number.isInteger(radius) || radius <= 0) {
    throw new Error('Radius must be a positive integer')
  }
}

function validateConfig(config: { precision: number }) {
  const { precision = defaultPrecision } = config

  if (isNaN(precision) || !Number.isInteger(precision) || precision < 1 || precision > 12) {
    throw new Error('Precision level must be a number between 1 and 12')
  }
}

function deduplicate(geofences: Geofence[]): Geofence[] {
  return geofences.filter((geofence, index, geofences) => {
    const indexFound: number = geofences.findIndex(geofenceFound =>
      areGeofencesEqual(geofenceFound, geofence)
    )

    if (index === indexFound) {
      return true
    }
    return false
  })
}

function areGeofencesEqual(subject: Geofence, target: Geofence): boolean {
  if (subject.latitude !== target.latitude) return false
  if (subject.longitude !== target.longitude) return false
  if (subject.radius !== target.radius) return false
  return true
}

function convertToGeohash(geofences: Geofence[], precision: number) {
  return geofences.map(geofence =>
    vicinityhash.convert(
      geofence,
      {
        precision,
        compress: true,
        compressMin: 1,
        compressMax: precision
      }
  ))
}

function containsUniqueGeohash(subset: string[], set: string[]): boolean {
  for (const subsetPart of subset) {
    let unique: boolean = false
    for (const setPart of set) {
      if (subsetPart.includes(setPart)) {
        unique = true
        break
      }
    }

    if (!unique) {
      return true
    }
  }
  return false
}
