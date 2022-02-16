import EntityManager from './entity-manager';
import { InstanceOptions, EntityType } from './interfaces';

const token = '';

// List partners:
const options: InstanceOptions = {
    entityType: 'Partner',
    parentId: -1,
    entityId: -1,
    action: '',
};

EntityManager.getInstance(options, token)
    .list(true, true)
    .then((x) => console.log(x));
/*
// List advertisers:
const options: InstanceOptions  = {
    entityType: 'Advertiser',
    parentId: 234340,
    entityId: -1,
    action: '',
};

EntityManager
    .getInstance(options, token)
    .list()
    .then(x => console.log(x));

// List campaigns:
const options: InstanceOptions  = {
    entityType: 'Campaign',
    parentId: 4304640,
    entityId: -1,
    action: '',
};

EntityManager
    .getInstance(options, token)
    .list(false)
    .then(x => console.log(x));


// List OIs:
const options: InstanceOptions  = {
    entityType: 'InsertionOrder',
    parentId: 4304640,
    entityId: -1,
    action: '',
};

EntityManager
    .getInstance(options, token)
    .list()
    .then(x => console.log(x));

// List LIs:
const options: InstanceOptions  = {
    entityType: 'LineItem',
    parentId: 4304640,
    entityId: -1,
    action: '',
};

EntityManager
    .getInstance(options, token)
    .list()
    .then(x => console.log(x));
*/
