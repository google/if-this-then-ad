import JobRunner from './job-runner';
import TaskConfiguration from './task-configuration';

/**
 * Starts execution of all available jobs
 */
export const execute = async () => {
    await JobRunner.runAll();
};

export const refreshToken = async (userId: string, accessToken: string) => {
    return await TaskConfiguration.reissueAuthTokenForUser(userId, accessToken);
};
