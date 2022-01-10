const {Datastore} = require('@google-cloud/datastore');

/**
 * Rules class: handles saving the rule config and retreiving it
 */
export class Rule {
  /**
   * Datastore object
   */
  datastore: typeof Datastore = {};

  /**
   * Entity name, used to form the datastore key = <Entity name>, <id>
   */
  entityName: string = "rule";

  /**
   * Unique rule ID (used to access the configuration in DB)
   */
  id: string = '';

  /**
   * Datastore key to access objects in db
   */
  datastoreKey: any;
  
  /**
   * The configuration "JSON"
   */
  configuration: Object = {};

  /**
   * Constructor
   * @param {string} id Unique ID
   * @param {Object} configuration Configuration object (JSON)
   */
  constructor(id: string, configuration?: Object) {
    this.id = id;
    this.configuration = configuration || {};

    this.datastore = new Datastore();
    this.datastoreKey = this.datastore.key([ this.entityName, this.id ]);
  }

  /**
   * Save the rule configuration to DB
   */
  async save() {
    const saveObject: Object = { 
      key: this.datastoreKey,
      data: this.configuration,
    };
    
    await this.datastore.save(saveObject);
  }

  /**
   * Get rule configuration from DB
   */
  async get() {
    const ret = await this.datastore.get(this.datastoreKey);
    return ret[0];
  }
}
