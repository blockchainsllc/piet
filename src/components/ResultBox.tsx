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
import JSONTree from 'react-json-tree';

export interface ResultBoxProps {
    result: string;
    id: string;
    resultBoxIsShown: boolean;
    showResultBox: Function;
    name: string;

}

export class ResultBox extends React.Component<ResultBoxProps, {}> {

    constructor(props: ResultBoxProps) {
        super(props);

        this.hideResultBox = this.hideResultBox.bind(this);
    }

    hideResultBox(): void {
        this.props.showResultBox(false);
    }

    render(): JSX.Element {
        const data: any = this.props.result ? JSON.parse(this.props.result) :  null;

        const theme: any = {
            scheme: 'monokai',
            author: 'wimer hazenberg (http://www.monokai.nl)',
            base00: '#232323',
            base01: '#383830',
            base02: '#49483e',
            base03: '#75715e',
            base04: '#a59f85',
            base05: '#f8f8f2',
            base06: '#f5f4f1',
            base07: '#f9f8f5',
            base08: '#f92672',
            base09: '#fd971f',
            base0A: '#f4bf75',
            base0B: '#a6e22e',
            base0C: '#a1efe4',
            base0D: '#66d9ef',
            base0E: '#ae81ff',
            base0F: '#cc6633'
        };

        return  <div id={'resultModal' + this.props.id } 
                    className={'modal fade' + (this.props.resultBoxIsShown ? ' show force-show' : '')} 
                    role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                    <div className='modal-dialog modal-lg' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>
                                    {this.props.name}
                                </h5>
                                <button type='button' onClick={this.hideResultBox} 
                                    className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>
                            <div className='modal-body json-body'>
                
                                <small>
                                    {data ? <JSONTree data={data} theme={theme} invertTheme={false}/> : null }
                         
                                </small>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' onClick={this.hideResultBox} 
                                    className='btn btn-secondary' data-dismiss='modal'>
                                    Close
                                </button>
                        
                            </div>
                        </div>
                    </div>
                </div>;

    }

}