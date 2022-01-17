const Firestore = require('@google-cloud/firestore');

class CollectionFactory {
    
    db:any;

    constructor(){
        this.db = new Firestore({
            projectId: 'if-this-then-ad'
        });
        this.db.settings({ ignoreUndefinedProperties: true });
    }
    //TODO: Discuss if we want to have a method for each collection type
    // to reduce possibility of typos creeping in.
    public get(collectionName:string){
        const collection:FireStoreCollection = {name:collectionName, db:this.db}
        return collection;
    }
}

export default new CollectionFactory()
