
import EntityManager from './entity-manager';
import { InstanceOptions, EntityType } from './interfaces';

const options: InstanceOptions  = {
    entityType: 'LineItem',
    parentId: 4304640,
    entityId: 50389587,
    action: 'activate',
};
const token = '';

EntityManager
    .getInstance(options, token)
    .activate()
    .then(x => console.log(x));