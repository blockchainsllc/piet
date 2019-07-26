/**
 *  This file is part of Piet.
 *
 *  Piet is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Piet is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Piet.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  @author Heiko Burkhardt <heiko@slock.it>, Slock.it GmbH
 * 
 */

import * as React from 'react';
import { App } from './components/AppContainer';
import * as Sentry from '@sentry/browser';

export class EntryPoint extends React.Component<{}, {}> {

    constructor(props: any) {
        super(props);
        this.state = { error: null, eventId: null };
    }

    componentDidCatch(error: any, info: any): void {
    
        Sentry.withScope((scope: Sentry.Scope) => {
            scope.setExtras(info);
            Sentry.captureException(error);
        });
  
      }

    render(): JSX.Element {
   
        return  <App />;

    }

}