const {Datastore} = require('@google-cloud/datastore');

/**
 * Handles communication with datastore
 */
export class DatastoreEntity {
  /**
   * Datastore object
   */
  private datastore: typeof Datastore;
  
  /**
   * Entity name, used to form the datastore key = <Entity name>, <id>
   */
  entityName: string = '';

  /**
   * Entity ID (used to access the entity in datastore)
   */
  id: string;

  /**
   * The data in "JSON"
   */
  data: Object;

  /**
   * Constructor
   * @param {string} id Entity ID
   * @param {Object} data Data object (JSON)
   */
  constructor(id?: string, data?: Object) {
    this.id = id || '';
    this.data = data || {};

    this.datastore = new Datastore();
  }

  private createKey() {
    /**
     * Entity name & id are mandatory properties, that define the proper 
     * Datastore key.
     */
    if (! this.entityName || ! this.id) {
      throw new Error('Entity name and id should not be empty!');
    }

    return this.datastore.key([ this.entityName, this.id ]);
  }

  /**
   * Save the entity data to DB
   */
  async save() {
    const saveObject: Object = { 
      key: this.createKey(),
      data: this.data,
    };
    
    await this.datastore.save(saveObject);
  }

  /**
   * Get entity data from DB
   */
  async get() {
    const ret = await this.datastore.get(this.createKey());
    return ret[0];
  }

  /**
   * List the Datastore entries
   */
  async list() {
    /**
     * Entity name & id are mandatory properties, that define the proper 
     * Datastore key.
     */
    if (! this.entityName) {
      throw new Error('Entity name should not be empty!');
    }

    const query = this.datastore.createQuery(this.entityName);
    const [datastoreList] = await this.datastore.runQuery(query);

    const entities: Object[] = [];
    for (const data of datastoreList) {
      const id = data[this.datastore.KEY].name;
      entities.push({id, data});
    }

    return entities;
  }

  /**
   * Delete entity from DB
   */
  async deleteEntity() {
    await this.datastore.delete(this.createKey(), (err:Error) => {
      if (err) {
        throw err;
      }
    });
  }

  /**
   * Update entity in DB
   */
  async update(data?: Object) {
    this.data = data || this.data;
    this.save();
  }
}