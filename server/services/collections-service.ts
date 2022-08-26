import { Firestore } from '@google-cloud/firestore';
import { FirebaseCollection } from '../collections/firebase-collection';
import { JobsCollection } from '../collections/jobs-collection';
import { UsersCollection } from '../collections/users-collection';
import { Rule } from '../common/rule';

/**
 * Provides access to model collections.
 */
export class CollectionService {
  readonly users = new UsersCollection(this.prefix + 'users', this.fireStore);
  readonly rules = new FirebaseCollection<Rule>(
    this.prefix + 'rules',
    this.fireStore
  );
  readonly jobs = new JobsCollection(this.prefix + 'jobs', this.fireStore);

  /**
   * Creates a collection service based on the environment variable configuration.
   * @returns {CollectionService} configured collection service.
   */
  static fromEnv() {
    const projectId = process.env.PROJECT_ID;
    if (!projectId) {
      throw new Error('Undefined env variable PROJECT_ID');
    }

    const envPrefix = process.env.DEMO_ENV_NAME;
    const prefix = envPrefix ? envPrefix.replace('/', '-') + ':' : '';

    const fireStore = new Firestore({ projectId });
    fireStore.settings({ ignoreUndefinedProperties: true });
    return new CollectionService(fireStore, prefix);
  }

  /**
   * Constructor.
   * @param {Firestore} fireStore the underlying Firestore database connection
   * @param {string} prefix a prefix for Firebase collections
   */
  constructor(
    private readonly fireStore: Firestore,
    private readonly prefix = ''
  ) {}
}

/**
 * The default singleton collections service.
 */
export const collectionService = CollectionService.fromEnv();
