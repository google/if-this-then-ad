import {Request, Response} from 'express'; 
import ruleengine from '../packages/rule-engine'

/**
 * Handler for the incoming messages to the rules engine
 * originating from the pubsub push subscription. 
 * @param req 
 * @param res 
 */
export const messageHandler = async(req:Request, res:Response) => {
    
    //ruleengine.processMessage()
}