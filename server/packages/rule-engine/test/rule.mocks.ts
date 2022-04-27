import { AgentResult, COMPARATORS, Rule } from "../src/interfaces"


export const PollenTestRule:Rule = {
    condition: {
        comparator: COMPARATORS.equals,
        dataPoint: 'pollenRiskLevel', 
        dataType: 'enum',
        name: 'pollen-level',
        value:'Moderate'
    },
    executionInterval: 60,
    name: 'polen-test-1',
    source: {
        id:'ambee',
        name: 'Ambee'
    }, 
    targets: [], 
    id: 'idvalue',
    owner: 'owner',
    jobId: 'jobId'
}

export const HazardousAirRule:Rule = {
    condition: {
        comparator: COMPARATORS.equals,
        dataPoint: 'airQualityLevel', 
        dataType: 'enum',
        name: 'air-quality',
        value:'Hazardous'
    },
    executionInterval: 60,
    name: 'polen-test-1',
    source: {
        id:'ambee',
        name: 'Ambee'
    }, 
    targets: [], 
    id: 'idvalue',
    owner: 'owner',
    jobId: 'jobId'
}

export const PollenAgentResult:AgentResult = {
    agentId: "ambee",
    jobId: "jobid",
    agentName: "ambee-agent",
    data: {
        targetLocation : 'Hamburg',
        pollenRiskLevel : 'Moderate',
        airQualityLevel : 'Hazardous'
    },
    timestamp: new Date(Date.parse('2022-01-28T15:05:26.715Z')),
}
