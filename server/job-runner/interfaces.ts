import * as firestore from '@google-cloud/firestore';
import Timestamp = firestore.Timestamp;

export interface Job {
    id?: string;
    agentId: string;
    executionInterval: number;
    lastExecution?: Timestamp;
    query?: {
        dataPoint: string;
        value: string | number | boolean;
    };
}
export interface ExecutionTime {
    jobId: string;
    lastExecution: Date;
}

export const _Timestamp = firestore.Timestamp;
