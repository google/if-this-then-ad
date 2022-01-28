import {Request, Response} from 'express'
import log from '../../../util/logger'; 
import {AgentResult} from './interfaces'; 
import {RulesProcessor} from './rules-processor'
// export const messageHandler = (req:Request, res:Response) => {


//         if(req.body){
//             if(!req.body.message){
//                 log.error('Invalid message format received'); 
//                 res.status(400).send(`Bad request : invalid message format`);
//                 return;
//             }

//             const msg = req.body.message; 
//             const msgData = msg.data ? Buffer.from(msg.data, 'base64').toString().trim() : {}; 
            
//             console.log(msgData);
//         }
// }

export const processMessage = async (message: AgentResult ) => {
    console.log('Received incoming message');
    console.log(message);
    const rp = new RulesProcessor();
    await rp.processAgentResult(message);
}