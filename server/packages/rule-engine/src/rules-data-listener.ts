const { PubSub } = require('@google-cloud/pubsub');

const client = new PubSub();

const subscriptionName = 'agent-results_subs';
const timeout = 60; 


export const listenForMessages = () => {
    const subscription = client.subscription(subscriptionName);

    const messageHandler = (msg) => {
        console.log(`Got message ${msg.id}`); 
        console.log(JSON.stringify(msg.data)); 
        console.log(`\tData: ${msg.data}`);
        console.log(`\tAttributes: ${msg.attributes}`);
        msg.ack(); 
    }

    subscription.on('message', messageHandler);

    setTimeout(() => {
        subscription.removeListener('message', messageHandler);
        console.log(`Listened destroyed`);
    }, timeout * 1000);
}

listenForMessages();