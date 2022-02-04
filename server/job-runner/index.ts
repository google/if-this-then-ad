import JobRunner from './job-runner'; 

/**
 * Starts execution of all available jobs
 */
export const execute = async () => {
    await JobRunner.runAll(); 
}
