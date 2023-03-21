/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class GoogleAds {
  /**
   * Process entity based on evaluation.
   *
   * @param {string} identifier
   * @param {string} type
   * @param {boolean} evaluation
   */
  process(identifier, type, evaluation) {
    let entities = [];

    if (type === 'AD_ID') {
      const adIds = identifier
        .split(';')
        .map(pair => pair.split(',').map(id => parseInt(id, 10)));
      entities = entities.concat(this.getAdsByIds(adIds));
    } else if (type === 'AD_LABEL') {
      entities = entities.concat(getAdsByLabel(identifier));
    } else if (type === 'AD_GROUP_ID') {
      const adGroupIds = identifier.split(',').map(id => Number(id));
      entities = entities.concat(this.getAdGroupsByIds(adGroupIds));
    } else if (type === 'AD_GROUP_LABEL') {
      entities = entities.concat(getAdGroupsByLabel(identifier));
    }

    entities.forEach(entity => {
      this.setEntityStatus(entity, evaluation);
    });
  }

  /**
   * Set status of Ad or AdGroup.
   *
   * @param {Ad|AdGroup} entity
   * @param {boolean} enable
   */
  setEntityStatus(entity, enable) {
    if (enable && !entity.isEnabled()) {
      Logger.log(`Enabling ${entity.getId()}...`);
      entity.enable();
    } else if (!enable && entity.isEnabled()) {
      Logger.log(`Pausing ${entity.getId()}...`);
      entity.pause();
    } else {
      Logger.log(`Status for ${entity.getId()} unchanged`);
    }
  }

  /**
   * Get Ads based on their IDs.
   * An ID is a pair of [Ad Group ID, Ad ID]
   *
   * @param {string[][]}
   * @returns {Ad[]}
   */
  getAdsByIds(ids) {
    const ads = [];
    const adsIterator = AdsApp.ads().withIds(ids).get();

    while (adsIterator.hasNext()) {
      ads.push(adsIterator.next());
    }

    return ads;
  }

  /**
   * Get Ad Groups based on their IDs.
   *
   * @param {string[]}
   * @returns {AdGroup[]}
   */
  getAdGroupsByIds(ids) {
    const selectors = [
      AdsApp.adGroups(),
      AdsApp.videoAdGroups(),
      AdsApp.shoppingAdGroups(),
    ];

    const adGroups = [];

    for (let i = 0; i < selectors.length; i++) {
      const adGroupsIterator = selectors[i].adGroups().withIds(ids).get();

      while (adGroupsIterator.hasNext()) {
        adGroups.push(adGroupsIterator.next());
      }
    }

    return adGroups;
  }

  /**
   * Get Ads by their label.
   *
   * @param {string} label
   * @returns {Ad[]}
   */
  getAdsByLabel(label) {
    const ads = [];
    const labelsIterator = AdsApp.labels()
      .withCondition(`label.name = '${label}'`)
      .get();

    if (!labelsIterator.hasNext()) {
      return [];
    }

    const adsIterator = labelsIterator.next().ads().get();

    while (adsIterator.hasNext()) {
      ads.push(adsIterator.next());
    }

    return ads;
  }

  /**
   * Get Ad Groups based on their label.
   *
   * @param {string} label
   * @returns {AdGroup[]}
   */
  getAdGroupsByLabel(label) {
    const adGroups = [];
    const labelsIterator = AdsApp.labels()
      .withCondition(`label.name = '${label}'`)
      .get();

    if (!labelsIterator.hasNext()) {
      return [];
    }

    const adGroupsIterator = labelsIterator.next().adGroups().get();

    while (adGroupsIterator.hasNext()) {
      adGroups.push(adGroupsIterator.next());
    }

    return adGroups;
  }
}
