import { sourcerepo } from 'googleapis/build/src/apis/sourcerepo';
/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { 
    Rule, 
    COMPARATORS,
    LogicalOperation, 
} from './rule.proposition';

/**
 * New Rule design example. Scenario: For Hamburg activate an ad if it's warm (temp > 10°C)
 * and pollen level is "High". Combine the following rules (even from different agents):
 * - current temperature is > "10°C"
 * - pollen level = "High"
 */
const ruleDesign: Rule = {
    name: 'test-rule',
    owner: 'XyTS82SaaT',
    executionInterval: 60,
    sourcesAndConditions: [
        // First: Weather Source
        {
            source: {
                id: 'open-weather-map',
                params: [
                    {
                        dataPoint: 'targetLocation',
                        value: 'Hamburg, Gemany',
                    },
                ]
            },
            condition: {
                dataPoint: 'temperature',
                comparator: COMPARATORS.greater,
                value: 10,
            },
            // Note an empty "logicalOperation", since this is the first suorce in the list
        },
        // Second: Pollen Source
        {
            source: {
                id: 'ambee',
                params: [
                    {
                        dataPoint: 'targetLocation',
                        value: 'Hamburg, Gemany',
                    },
                ]
            },
            condition: {
                dataPoint: 'pollenRiskLevel',
                comparator: COMPARATORS.equals,
                value: 'High',
            },
            // Note "logicalOperation" is not empty, since we combine this 
            //  condition with the previouse one with the logical AND
            logicalOperation: LogicalOperation.AND,
        },
    ]
};

function logicalOperation(operation: LogicalOperation, v1: boolean, v2: boolean) {
    switch (operation) {
        case LogicalOperation.AND:
            return v1 && v2;

        case LogicalOperation.OR:
            return v1 || v2;
    }

    throw new Error('Not supported operation');
}

// On the evaluation stage:
let sourceAgentResults: Array<boolean> = [];
//sourceAgentResults = ...getResults(ruleDesign.sourcesAndConditions);
let finalEvaluationValue = false;
for (let i=0; i<ruleDesign.sourcesAndConditions.length; i++) {
    if (ruleDesign.sourcesAndConditions[i].logicalOperation) {
        finalEvaluationValue = logicalOperation(
            ruleDesign.sourcesAndConditions[i].logicalOperation!,
            finalEvaluationValue,
            sourceAgentResults[i],
        );
    } else {
        finalEvaluationValue = sourceAgentResults[i];
    }
}

// The 'finalEvaluationValue' should be returned in the JobRunner:runJobs