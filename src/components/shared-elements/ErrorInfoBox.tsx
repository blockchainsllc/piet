/**  
 *   This file is part of Piet.
 *
 *   Copyright (C) 2019  Heiko Burkhardt <heiko@slock.it>, Slock.it GmbH
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   Permissions of this strong copyleft license are conditioned on
 *   making available complete source code of licensed works and 
 *   modifications, which include larger works using a licensed work,
 *   under the same license. Copyright and license notices must be
 *   preserved. Contributors provide an express grant of patent rights.
 *   
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
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