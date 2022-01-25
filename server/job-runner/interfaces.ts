
export interface Job {
    jobId: string,
    agentId: string, 
    query?:{
        dataPoint: string, 
        value: string|number|boolean
    } 
}

