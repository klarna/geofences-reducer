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
  config = { precision: defaultPrecision }
): Geofence[] {
  validateGeofences(geofences)
  if (config) validateConfig(config)

  if (geofences.length === 0) return geofences

  const geohashesList: string[][] = convertToGeohash(geofences, config.precision)
  const geohashFrequency = geohashesList.flat().reduce((freqMap, geohash) => {
	freqMap.set(geohash, (freqMap.get(geohash) || 0) + 1);
	return freqMap;
  }, new Map<string, number>());

  const selectedGeofences: Geofence[] = []
  const coveredGeohashes: Set<string> = new Set()
  const remainingGeofences: { geofence: Geofence; geohashes: string[] }[] = []

  geofences.forEach((geofence, index) => {
    const geohashes = geohashesList[index]
    const hasUniqueGeohash = geohashes.some((geohash) => geohashFrequency.get(geohash) === 1)
    if (hasUniqueGeohash) {
      selectedGeofences.push(geofence)
      geohashes.forEach((geohash) => coveredGeohashes.add(geohash))
    } else {
      remainingGeofences.push({ geofence, geohashes })
    }
  })

  remainingGeofences.forEach(({ geofence, geohashes }) => {
    const newGeohashes = geohashes.filter((geohash) => !coveredGeohashes.has(geohash))
    if(geofence.latitude === 48.2946) {
      console.log(newGeohashes)
    }
    if (newGeohashes.length > 0) {
      selectedGeofences.push(geofence)
      newGeohashes.forEach((geohash) => coveredGeohashes.add(geohash))
    }
  })

  return selectedGeofences
}

function validateGeofences(geofences: Geofence[]) {
  if (!Array.isArray(geofences)) {
    throw new Error('Geofences must be an array')
  }

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

function convertToGeohash(geofences: Geofence[], precision: number) {
  return geofences.map(geofence =>
    vicinityhash.convert(
      geofence,
      {
        precision,
        compress: false,
        compressMin: 1,
        compressMax: precision
      }
  ))
}
