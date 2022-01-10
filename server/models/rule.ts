const {Datastore} = require('@google-cloud/datastore');

/**
 * Rules class: handles saving the rule config and retreiving it
 */
export class Rule {
  /**
   * Unique rule ID (used to access the configuration in DB)
   */
  id: string = '';

  /**
   * The configuration "JSON"
   */
  configuration: Object = {};

  /**
   * Constructor
   * @param {string} id Unique ID
   * @param {Object} configuration Configuration object (JSON)
   */
  constructor(id: string, configuration: Object) {
    this.id = id;
    this.configuration = configuration;
  }

  /**
   * Save the rule configuration to DB
   */
  save() {

  }
}
