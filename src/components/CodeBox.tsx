/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react';
import * as Sol from '../solidity-handler/SolidityHandler';
import * as Hljs from 'highlight.js';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import { getFunctionAbi } from '../utils/AbiGenerator';
import * as jsonFormat from 'json-format';
import { spawnSync } from 'child_process';
import { BlockchainConnection, getFunctionSignature } from '../solidity-handler/BlockchainConnector';

export interface CodeBoxProps {
    contextContract: Sol.Contract;
    selectedFunction: Sol.ContractFunction;
    codeBoxIsShown: boolean;
    showCodeBox: Function;
    blockchainConnection: BlockchainConnection; 
    contracts: Sol.Contract[];
    codeToShow: CodeToShow;

}

export enum CodeToShow {
    Solidity,
    Abi
}

export class CodeBox extends React.Component<CodeBoxProps, {}> {

    constructor(props: CodeBoxProps) {
        super(props);

        this.hideCodeBox = this.hideCodeBox.bind(this);
    }

    componentDidMount(): void {

        Hljs.initHighlightingOnLoad();

    }

    hideCodeBox(): void {
        this.props.showCodeBox(false);
    }

    render(): JSX.Element {
        if (!this.props.selectedFunction) {
            return null;
        } 

        let abi: any;
        let abiError: string = null;
        try {
            abi = getFunctionAbi(this.props.selectedFunction, this.props.contracts, this.props.contextContract)[0];
        } catch (e) {
            abiError = e.message;
        }
            
        return  <div 
                    className={'codeModal modal fade' + (this.props.codeBoxIsShown ? ' show force-show' : '')} 
                    role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                    <div className='modal-dialog modal-lg' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>
                                    {this.props.selectedFunction.name}() 
                                </h5>
                                <button type='button' onClick={this.hideCodeBox} 
                                    className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>
                            <div className='modal-body code-modal-body '>
                                <small>
                                
                                    {this.props.codeToShow === CodeToShow.Solidity &&
                                        <SyntaxHighlighter language='javascript' style={docco}>
                                            {'    ' + this.props.selectedFunction.source}
                                        </SyntaxHighlighter>
                                    }
                                    {!abiError && this.props.codeToShow === CodeToShow.Abi &&
                                        <SyntaxHighlighter language='json' style={docco}>
                                            {jsonFormat(abi) }
                                        </SyntaxHighlighter>
                                        
                                    }
                                    {abiError && this.props.codeToShow === CodeToShow.Abi && 
                                        <span>{abiError}</span> 
                                    }
                                </small>
                            </div>
                            <div className='modal-body code-modal-body code-modal-signature'>
                                {abiError === null && 
                                    <small>
                                        <small className='text-muted'>
                                            Signature: {getFunctionSignature(this.props.blockchainConnection, abi)}
                                        s</small>
                                    </small>
                                }                                
                            </div>

                            <div className='modal-footer'>
                            
                                <button type='button' onClick={this.hideCodeBox} 
                                    className='btn btn-secondary' data-dismiss='modal'>
                                    Close
                                </button>
                        
                            </div>
                        </div>
                    </div>
                </div>;

    }

}