import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import { Geofence, reduce } from '../../src';

interface Scenario {
  label: string;
  geofences: Geofence[];
}

interface MeasurePerformanceResult {
  avgTime: number;
  lastResultSize: number;
  times: number[];
}

const FOLDER_PATH = './tests/performance/cases';
const ITERATIONS = 10;
const MAX_ALLOWED_TIME = 3500;

describe('Performance Tests', () => {
  const loadScenarios = (folderPath: string): Scenario[] => {
    return fs
      .readdirSync(folderPath)
      .filter((file) => file.toLowerCase().endsWith('.json'))
      .map((file) => {
        const fullPath = path.join(folderPath, file);
        try {
          const raw = fs.readFileSync(fullPath, 'utf8');
          const geofences = JSON.parse(raw);
          if (Array.isArray(geofences)) {
            return { label: file, geofences };
          }
          console.warn(`File "${file}" does not contain a valid geofence array.`);
        } catch (err) {
          console.error(`Failed to parse file "${file}":`, err);
        }
        return null;
      })
      .filter((scenario): scenario is Scenario => scenario !== null);
  };

  const measurePerformance = (
    reduceFn: (geofences: Geofence[], options: { precision: number }) => Geofence[],
    geofences: Geofence[],
    precision: number,
    iterations: number
  ): MeasurePerformanceResult => {
    const times: number[] = [];
    let lastResult: Geofence[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      lastResult = reduceFn(geofences, { precision });
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

    return { avgTime, lastResultSize: lastResult.length, times };
  };

  const scenarios = loadScenarios(FOLDER_PATH);

  if (scenarios.length === 0) {
    console.error('No valid geofence files found. Exiting.');
    return;
  }

  const testCases = scenarios.flatMap(({ label, geofences }) =>
    [4, 5, 6].map((precision) => ({ label, geofences, precision }))
  );

  test.concurrent.each(testCases)(
    'Scenario %s',
    async ({ label, geofences, precision }) => {
      const { avgTime, lastResultSize, times } = measurePerformance(reduce, geofences, precision, ITERATIONS);

      expect(avgTime).toBeLessThan(MAX_ALLOWED_TIME);
      expect(lastResultSize).toBeGreaterThan(0);

      console.log(
        `  > Scenario: ${label}, Precision: ${precision}, Avg Time: ${avgTime.toFixed(2)}ms, Min Time: ${Math.min(
          ...times
        ).toFixed(2)}ms, Max Time: ${Math.max(...times).toFixed(2)}ms, Result Size: ${lastResultSize}`
      );
    }
  );
});
