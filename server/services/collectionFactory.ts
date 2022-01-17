const Firestore = require('@google-cloud/firestore');

class CollectionFactory {
    
    db:any;

    constructor(){
        this.db = new Firestore({
            projectId: 'if-this-then-ad'
        });
    }
    public  getUsersCollection():FireStoreCollection{
        this.db = new Firestore({
            projectId: 'if-this-then-ad'
        });
        // TODO : Perform a check elsewhere to ensure no undefined 
        // properties are sent
        this.db.settings({ ignoreUndefinedProperties: true });
        const users:FireStoreCollection = { name: 'users', db: this.db };
        return users;
    }
}

export default new CollectionFactory()
