/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { AgentSettingMetadata } from 'common/common';
import { SourceAgentDataPointMetadata } from 'common/source';
import { SimpleSourceAgent } from '../simple-source-agent';

interface AmbeePollenData {
  data: Array<{
    Risk: {
      grass_pollen: string;
      tree_pollen: string;
      weed_pollen: string;
    };
    updatedAt: string;
  }>;
}
const POLLEN_LEVELS = ['Low', 'Moderate', 'High', 'Very High'];

/**
 * Returns the highest pollen level from a list of levels.
 * @param {string[]} levels the levels to compare
 * @returns {string} the highest pollen level
 */
function getHighestPollenLevel(...levels: string[]): string {
  const indices = levels
    .map((level) => POLLEN_LEVELS.indexOf(level))
    .filter((index) => index >= 0);
  const highest = Math.max(0, ...indices);
  return POLLEN_LEVELS[highest];
}

interface AmbeeAirQualityData {
  message: string;
  stations: Array<{
    AQI: number;
    aqiInfo: {
      pollutant: string;
      concentration: number;
      category: string;
    };
  }>;
}

const AMBEE_API_KEY_SETTNG: AgentSettingMetadata = {
  key: 'AMBEE_API_KEY',
  name: 'Ambee API Key',
};
const POLLEN_LEVEL_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'pollen-level',
  name: 'Pollen Level',
  type: 'enum',
  values: POLLEN_LEVELS,
};
const AIR_QUALITY_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'air-quality',
  name: 'Air Quality',
  type: 'enum',
  values: [
    'Good',
    'Moderate',
    'Unhealthy for Sensitive Groups',
    'Unhealthy',
    'Very Unhelathy',
    'Hazardous',
  ],
};

/**
 * An agent for the Ambee API.
 */
export class AmbeeAgent extends SimpleSourceAgent {
  /**
   * Constructor.
   */
  constructor() {
    super({
      id: 'ambee',
      name: 'Air Quality & Pollen',
      type: 'source',
      settings: [AMBEE_API_KEY_SETTNG],
      parameters: [{ key: 'location', type: 'location', name: 'Location' }],
      dataPoints: [POLLEN_LEVEL_DATAPOINT, AIR_QUALITY_DATAPOINT],
    });
  }

  /**
   * @inheritdoc
   */
  protected async fetch(
    dataPoint: string,
    sourceParameters: Record<string, unknown>,
    ownerSettings: Record<string, string>
  ): Promise<Record<string, string>> {
    const apiKey = ownerSettings[AMBEE_API_KEY_SETTNG.key];
    if (!apiKey) {
      throw new Error('Missing API key for Ambee API.');
    }

    const baseURL = 'https://api.ambeedata.com/latest';
    const headers = { 'x-api-key': apiKey };

    const location = sourceParameters['location'];
    if (dataPoint === POLLEN_LEVEL_DATAPOINT.key) {
      const response = await this.executeHttpRequest<AmbeePollenData>(
        `${baseURL}/pollen/by-place`,
        { params: { place: location }, headers }
      );

      if (response.data?.data && response.data?.data.length > 0) {
        const risk = response.data.data[0].Risk;
        const highest = getHighestPollenLevel(
          risk.grass_pollen,
          risk.tree_pollen,
          risk.weed_pollen
        );
        return { [POLLEN_LEVEL_DATAPOINT.key]: highest };
      } else {
        throw new Error(
          `Unexpected response format for Ambee data point: ${dataPoint}`
        );
      }
    } else if (dataPoint === AIR_QUALITY_DATAPOINT.key) {
      const response = await this.executeHttpRequest(`${baseURL}/by-city`, {
        params: { city: location },
        headers,
      });

      if (response.data?.stations && response.data?.stations.length) {
        const station = (response.data as AmbeeAirQualityData).stations[0];
        return { [AIR_QUALITY_DATAPOINT.key]: station.aqiInfo.category };
      } else {
        throw new Error(
          `Unexpected response format for Ambee data point: ${dataPoint}`
        );
      }
    } else {
      throw new Error(`Unsupported Ambee data point: ${dataPoint}`);
    }
  }
}
