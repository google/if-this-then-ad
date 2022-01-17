const Firestore = require('@google-cloud/firestore');

class CollectionFactory {
    
    db:any;

    constructor(){
        this.db = new Firestore({
            projectId: 'if-this-then-ad'
        });
        this.db.settings({ ignoreUndefinedProperties: true });
    }
    
    public get(collectionName:string){
        const collection:FireStoreCollection = {name:collectionName, db:this.db}
        return collection;
    }
}

export default new CollectionFactory()
