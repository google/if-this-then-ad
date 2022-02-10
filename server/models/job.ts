export interface Job {
    id?: string;
    agentId: string;
    executionInterval: number;
    lastExecution?: Date;
    query?: {
        dataPoint: string;
        value: string | number | boolean;
    };
}
