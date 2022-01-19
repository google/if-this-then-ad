
interface Rule {
    id:string;
    groupId:string;
    name:string; 
    dataSourceId: string;
    dataPoint:string;
    dataPointCondition:string;
    dataPointValue:string|number|boolean;
}