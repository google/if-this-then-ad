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

import { Request, Response } from 'express';
import { log } from '@iftta/util';

export const login = (req: Request, res: Response) => {
    // Store origin URL
    req.session['returnTo'] = req.query.returnTo;

    // Redirect to authentication
    res.redirect('/api/auth/google');
};

export const authDone = (req: Request, res: Response) => {
    const returnTo = req.session['returnTo'] || '';
    const user = JSON.stringify(req.user) || '';
    const redirectUrl = process.env.NODE_ENV === 'development' ? 'https://localhost:4200' : ''

    res.redirect(`${redirectUrl}/logged-in?returnTo=${returnTo}&user=${encodeURIComponent(user)}`);
};

export const logout = (req: Request, res: Response) => {
    req.logOut();
    res.redirect('/');
};
