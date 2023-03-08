/**
 * @license
 * Copyright 2023 Google LLC
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

class GoogleAds {
  /**
   * Process entity based on evaluation.
   *
   * @param {string} identifier
   * @param {string} type
   * @param {boolean} evaluation
   */
  process(identifier, type, evaluation) {
    /*const condition = `Name = '${params.identifier}'`;
    this.switchAdGroupStatus(condition, evaluation);*/

    let ads = [];
    let adGroups = [];

    if (type === 'AD_ID') {
      const adIds = identifier
        .split(';')
        .map((pair) => pair.split(',').map((id) => parseInt(id, 10)));
      ads = ads.concat(this.getAdsByIds(adIds));
    } else if (type === 'AD_LABEL') {
      ads = ads.concat(getAdsByLabel(identifier));
    } else if (type === 'AD_GROUP_ID') {
      const adGroupIds = identifier.split(',').map((id) => Number(id));
      adGroups = adGroups.concat(this.getAdGroupsByIds(adGroupIds));
    } else if (type === 'AD_GROUP_LABEL') {
      adGroups = adGroups.concat(getAdGroupsByLabel(identifier));
    }

    // Enable/pause the Ad Groups
    /*const adGroupIds = identifier.split(';').map((id) => parseInt(id, 10));
    const adGroupsByIds = getAdGroupsByIds(adGroupIds);
    const adGroupsByLabel = getAdGroupsByLabel(
      row[CONFIG.feed.columns.adGroupLabel]
    );
    const adGroups = [...adGroupsByIds, ...adGroupsByLabel];*/
    adGroups.forEach((adGroup) => {
      if (enable && !adGroup.isEnabled()) {
        Logger.log(`Enabling Ad Group ${adGroup.getId()}`);
        adGroup.enable();
      } else if (enable && adGroup.isEnabled()) {
        Logger.log(`Ad Group ${adGroup.getId()} already enabled`);
      } else if (!enable && adGroup.isEnabled()) {
        Logger.log(`Pausing Ad Group ${adGroup.getId()}`);
        adGroup.pause();
      } else {
        Logger.log(`Ad Group ${adGroup.getId()} already paused`);
      }
    });
    // Enable/pause the Ads
    /*const adIds = row[CONFIG.feed.columns.adIds]
      ? row[CONFIG.feed.columns.adIds]
          .split(';')
          .map((pair) => pair.split(',').map((id) => parseInt(id, 10)))
      : [];
    const adsByIds = getAdsByIds(adIds);
    const adsByLabel = getAdsByLabel(row[CONFIG.feed.columns.adLabel]);
    const ads = [...adsByIds, ...adsByLabel];*/
    ads.forEach((ad) => {
      if (enable && !ad.isEnabled()) {
        Logger.log(`Enabling Ad ${ad.getId()}`);
        ad.enable();
      } else if (enable && ad.isEnabled()) {
        Logger.log(`Ad ${ad.getId()} already enabled`);
      } else if (!enable && ad.isEnabled()) {
        Logger.log(`Pausing Ad ${ad.getId()}`);
        ad.pause();
      } else {
        Logger.log(`Ad ${ad.getId()} already paused`);
      }
    });
  }

  /**
   * Check if supposed entity status matches its actual live status.
   *
   * @param {string} identifier
   * @param {string} type
   * @param {boolean} evaluation
   * @returns {string[]}
   */
  validate(identifier, type, evaluation) {}

  /**
   * Enable or pause an AdGroup by its name
   *
   * @param {string} condition AdGroup name
   * @param {boolean} enable If true, then enable, else pause
   */
  switchAdGroupStatus(condition, enable) {
    const selectors = [
      AdsApp.adGroups(),
      AdsApp.videoAdGroups(),
      AdsApp.shoppingAdGroups(),
    ];

    for (var i = 0; i < selectors.length; i++) {
      const adGroupIter = selectors[i].withCondition(condition).get();

      if (adGroupIter.hasNext()) {
        const adGroup = adGroupIter.next();

        this.switchEntityStatus(adGroup, enable);
      }
    }
  }

  switchEntityStatus(entity, enable) {
    if (enable && !entity.isEnabled()) {
      entity.enable();
    } else if (enable && !entity.isEnabled()) {
      entity.pause();
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
    const adGroups = [];
    const adGroupsIterator = AdsApp.adGroups().withIds(ids).get();

    while (adGroupsIterator.hasNext()) {
      adGroups.push(adGroupsIterator.next());
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
