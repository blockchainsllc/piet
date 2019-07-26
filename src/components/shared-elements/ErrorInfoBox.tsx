/**
 *   This file is part of Piet.
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
import { timingSafeEqual } from 'crypto';

type RemoveError = (index: number) => void;
type AddError = (error: any) => void;

export interface ErrorInfo {
    message: string;
    name: string;
    operation: string;
    timestamp: string;
}

export interface ErrorHandling {
    errors: ErrorInfo[];
    removeError: RemoveError;
}

export interface ErrorInfoBoxProps {
    errorHandling: ErrorHandling;
    operation?: string;
}

export class ErrorInfoBox extends React.Component<ErrorInfoBoxProps, {}> {

    constructor(props: ErrorInfoBoxProps) {
        super(props);

        this.removeError = this.removeError.bind(this);
    }

    removeError(index: number): void {
        this.props.errorHandling.removeError(index);
    }

    render(): JSX.Element {

        const errorsToShow: JSX.Element[] = this.props.errorHandling.errors
        .filter((errorInfo: ErrorInfo) => !this.props.operation ? true : errorInfo.operation === this.props.operation)
        .map(
            (error: ErrorInfo, index: number, errorList: ErrorInfo[]) =>  
                <div 
                    key={error.message + error.name + error.timestamp} 
                    className={(index < errorList.length - 1 ? 'not-last-alert ' : '') + 'file-browser-alert alert alert-danger'} 
                    role='alert'
                >   
                    
                    <div className='d-flex w-100 justify-content-between'>
                        <small className='error-message'>
                            <i className='fas fa-exclamation-circle'></i> <strong>Error:</strong> {error.message}
                        </small>
                        <button type='button' onClick={() => this.removeError(index)} className='close'>
                            <span aria-hidden='true'>&times;</span>
                        </button>
                    </div>
                </div> 
        );

        return <div>
            {errorsToShow}
        </div> ;
               
    }
}