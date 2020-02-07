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
import * as Sol from '../../../solidity-handler/SolidityHandler';
import * as Hljs from 'highlight.js';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { BlockchainConnection, getFunctionSignature } from '../../../solidity-handler/BlockchainConnector';

export interface ContractCodeBoxProps {
    contract: Sol.Contract;
    codeBoxIsShown: boolean;
    showContractCodeBox: Function;
    blockchainConnection: BlockchainConnection; 
}

export class ContractCodeBox extends React.Component<ContractCodeBoxProps, {}> {

    constructor(props: ContractCodeBoxProps) {
        super(props);

        this.hideContractCodeBox = this.hideContractCodeBox.bind(this);
    }

    componentDidMount(): void {

        Hljs.initHighlightingOnLoad();

    }

    hideContractCodeBox(): void {
        this.props.showContractCodeBox(false);
    }

    render(): JSX.Element {

            
        return  <div 
                    className={'contractCodeModal modal fade' + (this.props.codeBoxIsShown ? ' show force-show' : '')} 
                    role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                    <div className='modal-dialog modal-dialog-scrollable modal-lg' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>
                                    {this.props.contract ? this.props.contract.name : 'No Contract' } 
                                </h5>
                                <button type='button' onClick={this.hideContractCodeBox} 
                                    className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>
                            <div className='modal-body code-modal-body '>
                                <small>
                                {this.props.contract &&
                                    <SyntaxHighlighter language='javascript' style={docco}>
                                        {this.props.contract ? this.props.contract.source : ''}
                                    </SyntaxHighlighter>
                                }
                                    
                                </small>
                            </div>

                            <div className='modal-footer'>
                            
                                <button type='button' onClick={this.hideContractCodeBox} 
                                    className='btn btn-secondary' data-dismiss='modal'>
                                    Close
                                </button>
                        
                            </div>
                        </div>
                    </div>
                </div>;

    }

}