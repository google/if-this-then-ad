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

import {Request, Response} from 'express';
import {log} from '@iftta/util';
import {refreshToken} from '@iftta/job-runner';

export const login = (req: Request, res: Response) => {
    // Store origin URL
    console.log('### Storing returnTo', req.query.returnTo);
    console.log('### Storing clientUrl', req.query.clientUrl);

    req.session['returnTo'] = req.query.returnTo;
    req.session['clientUrl'] = req.query.clientUrl;

    // Redirect to authentication
    res.redirect(
        `/api/auth/google?returnTo=${req.query.returnTo}&clientUrl=${req.query.clientUrl}`
    );
};

export const authDone = (req: Request, res: Response) => {
    log.debug('### SESSION ###');
    log.debug(req.session);
    log.debug('### CHECK-ME-TOO');
    log.debug(req.query);

    const state = JSON.parse(
        Buffer.from(req.query.state!.toString(), 'base64').toString()
    );

    log.debug(state);

    const returnTo = state['returnTo'] || '';
    const clientUrl = state['clientUrl'];

    //const returnTo = req.session['returnTo'] || '';
    const user = JSON.stringify(req.user) || '';
    //const clientUrl = req.session['clientUrl'];

    res.redirect(
        `${clientUrl}/logged-in?returnTo=${returnTo}&user=${encodeURIComponent(
            user
        )}`
    );
};

export const logout = (req: Request, res: Response) => {
    req.logOut();
    res.redirect('/');
};

/**
 * Reissues access token based on userId and old expired token.
 * @param req
 * @param res
 */
export const renewToken = (req: Request, res: Response) => {
    const userId = req.body.userId;
    const oldToken = req.body.token;
    refreshToken(userId, oldToken)
        .then(newToken => {
            res.json(newToken);
        })
        .catch(reason => {
            res.status(400).json({status: 'error', message: reason});
        });
};
