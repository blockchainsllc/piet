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

interface SingleValueBoxProps {
    lable: string;
    result: string;
    showMetaInformation: boolean;
}

export class SingleValueBox extends React.Component<SingleValueBoxProps, {} > {

    render(): JSX.Element {

        return <div className='col-sm'>
            <div className='card'>
                <div className='card-body'>
                    {this.props.showMetaInformation && <span><span className='badge badge-secondary'>ValueBox</span>&nbsp;</span>}
                    <p className='card-text ui-creation-value'>
                        { this.props.result ? 
                            <strong>{this.props.result}</strong>
                            : <i>Loading...</i>
                        }
                            
                    </p>
                    <span className='text-muted'><small>{this.props.lable}</small></span>
                    
                </div>
            </div>
        </div>;
    }
    
}