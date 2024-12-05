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

import * as reducer from '../src/index'

const geofences = require('./geofences.json')

//TODO: Improve current testing suite to cover new approach
test.skip('reduces geofences', () => {
  expect(reducer.reduce([])).toEqual([])

  expect(reducer.reduce([
    { latitude: 90, longitude: 180, radius: 500 }
  ])).toEqual([
    { latitude: 90, longitude: 180, radius: 500 }
  ])

  expect(reducer.reduce(geofences)).toEqual([
    { latitude: 48.64989, longitude: 13.96389, radius: 40000 },
    { latitude: 48.4043, longitude: 14.836, radius: 40000 },
    { latitude: 47.86719, longitude: 13.3261, radius: 40000 },
    { latitude: 47.86259, longitude: 14.6709, radius: 40000 },
    { latitude: 48.4611, longitude: 13.43369, radius: 40000 },
    { latitude: 47.87969, longitude: 14.13269, radius: 40000 },
    { latitude: 48, longitude: 13.2318, radius: 40000 },
    { latitude: 48.51739, longitude: 14.2951, radius: 40000 },
    { latitude: 48.51129, longitude: 14.5008, radius: 40000 },
    { latitude: 47.65489, longitude: 13.60929, radius: 40000 },
    { latitude: 47.85749, longitude: 13.34189, radius: 40000 },
    { latitude: 48.678, longitude: 13.90909, radius: 40000 },
    { latitude: 48.2285, longitude: 13.02369, radius: 40000 },
    { latitude: 48.25849, longitude: 13.03559, radius: 40000 },
    { latitude: 48.22809, longitude: 14.8465, radius: 40000 },
    { latitude: 48.18239, longitude: 13.78149, radius: 40000 },
    { latitude: 48.2946, longitude: 14.2868, radius: 40000 }
  ])
})

test('reduces geofences with custom precision', () => {
  const config = { precision: 5 }

  expect(reducer.reduce(geofences, config)).toEqual([
    { latitude: 48.64989, longitude: 13.96389, radius: 40000 },
    { latitude: 48.4043, longitude: 14.836, radius: 40000 },
    { latitude: 47.86719, longitude: 13.3261, radius: 40000 },
    { latitude: 47.86259, longitude: 14.6709, radius: 40000 },
    { latitude: 48.4611, longitude: 13.43369, radius: 40000 },
    { latitude: 47.87969, longitude: 14.13269, radius: 40000 },
    { latitude: 48, longitude: 13.2318, radius: 40000 },
    { latitude: 48.51129, longitude: 14.5008, radius: 40000 },
    { latitude: 47.65489, longitude: 13.60929, radius: 40000 },
    { latitude: 48.678, longitude: 13.90909, radius: 40000 },
    { latitude: 48.2285, longitude: 13.02369, radius: 40000 },
    { latitude: 48.22809, longitude: 14.8465, radius: 40000 },
    { latitude: 48.18239, longitude: 13.78149, radius: 40000 },
    { latitude: 48.2946, longitude: 14.2868, radius: 40000 },
    { latitude: 48.256, longitude: 13.0367, radius: 40000 }
  ])
})

test('throws error if geofences are invalid', () => {
  expect(() => { reducer.reduce({} as unknown as []) }).toThrow('Geofences must be an array')
})

test('throws error if latitude is invalid', () => {
  const originalGeofence = geofences[0]

  geofences[0] = { latitude: 'foo' }
  expect(() => { reducer.reduce(geofences) }).toThrow('Latitude must be a number between -90 and 90')

  geofences[0] = { latitude: -91 }
  expect(() => { reducer.reduce(geofences) }).toThrow('Latitude must be a number between -90 and 90')

  geofences[0] = { latitude: 91 }
  expect(() => { reducer.reduce(geofences) }).toThrow('Latitude must be a number between -90 and 90')

  geofences[0] = originalGeofence
})

test('throws error if longitude is invalid', () => {
  const originalGeofence = geofences[0]

  geofences[0] = { latitude: 90, longitude: 'foo' }
  expect(() => { reducer.reduce(geofences) }).toThrow('Longitude must be a number between -180 and 180')

  geofences[0] = { latitude: 90, longitude: -181 }
  expect(() => { reducer.reduce(geofences) }).toThrow('Longitude must be a number between -180 and 180')

  geofences[0] = { latitude: 90, longitude: 181 }
  expect(() => { reducer.reduce(geofences) }).toThrow('Longitude must be a number between -180 and 180')

  geofences[0] = originalGeofence
})

test('throws error if radius is invalid', () => {
  const originalGeofence = geofences[0]

  geofences[0] = { latitude: 90, longitude: 180, radius: 'foo' }
  expect(() => { reducer.reduce(geofences) }).toThrow('Radius must be a positive integer')

  geofences[0] = { latitude: 90, longitude: 180, radius: 0 }
  expect(() => { reducer.reduce(geofences) }).toThrow('Radius must be a positive integer')

  geofences[0] = { latitude: 90, longitude: 180, radius: -1 }
  expect(() => { reducer.reduce(geofences) }).toThrow('Radius must be a positive integer')

  geofences[0] = originalGeofence
})

test('throws error if precision is invalid', () => {
  const config = { precision: 0 }
  
  config.precision = 'foo' as unknown as number
  expect(() => { reducer.reduce(geofences, config) }).toThrow('Precision level must be a number between 1 and 12')

  config.precision = 0
  expect(() => { reducer.reduce(geofences, config) }).toThrow('Precision level must be a number between 1 and 12')

  config.precision = 13
  expect(() => { reducer.reduce(geofences, config) }).toThrow('Precision level must be a number between 1 and 12')
})
