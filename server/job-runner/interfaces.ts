import * as firestore from '@google-cloud/firestore';

export interface Job {
    id?: string;
    agentId: string;
    executionInterval: number;
    lastExecution?: Date | number;
    query?: {
        dataPoint: string;
        value: string | number | boolean;
    };
}
export interface ExecutionTime {
    jobId: string;
    lastExecution: Date;
}
