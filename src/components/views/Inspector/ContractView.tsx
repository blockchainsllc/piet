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
import { ContractStateVaribaleView } from './ContractStateVaribaleView';
import { ContractEventView } from './ContractEventView';
import { ContractModifierView } from './ContractModifierView';
import { ContractFunctionView } from './ContractFunctionView';
import { TabEntity, TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';
import { BlockchainConnection, checkBlockchainConnection } from '../../../solidity-handler/BlockchainConnector';
import { CompilerMetaDataView } from './CompilerMetaDataView';
import { toSimpleHex } from 'in3/js/src/util/util';
interface ContractViewProps {
    selectedContract: Sol.Contract;
    contracts: Sol.Contract[];
    testMode: boolean;
    blockchainConnection: BlockchainConnection;
    showInheritedMembers: boolean;
    addTabEntity: Function;
    markCode: Function;
    editContractAddress: boolean;
    changeContractAddress: Function;
    getEvents: Function;
    toggleInheritance: Function;
    selectedTabTypeForView: TabEntityType[];
    uiCreationHandling: UICreationHandling;
    weiBalance: string;
    toogleEditContractAddress: Function;
}

interface ContractViewState {
    contractAddress: string;
}

export class ContractView extends React.Component<ContractViewProps, ContractViewState> {

    constructor(props: ContractViewProps) {
        super(props);
        this.state = {
            contractAddress: ''
        };

        this.onChangeContractAddress = this.onChangeContractAddress.bind(this);
    }

    onChangeContractAddress(e: any): void {
        e.persist();
        this.setState({
            contractAddress: e.target.value
        });
    }

    render(): JSX.Element {

        const contract: Sol.Contract = this.props.selectedContract as Sol.Contract;
        const subtitle: string = this.props.selectedContract.kind === 'contract' && this.props.selectedContract.isAbstract ? 
            'abstract contract' : 
            this.props.selectedContract.kind;

        const title: Sol.SolidityAnnotation = this.props.selectedContract.annotations
            .find((annotation: Sol.SolidityAnnotation) => annotation.name === 'title');
        const notice: Sol.SolidityAnnotation = this.props.selectedContract.annotations
            .find((annotation: Sol.SolidityAnnotation) => annotation.name === 'notice');
        return  <div className='card selected-card h-100'>
                   
                    <div className=
                        {'card-body selected-card ' + (contract.isAbstract  ? 'abstract-contract-inspector' : 'contract-inspector')}
                    >
                        <div className='text-center'>
                            {/* <h3>
                                 <a 
                                    href='#' 
                                    className='inspector-view-headline' 
                                    onClick={() => this.props.addTabEntity(tabEntity, 1, false)}
                                 >
                                    {this.props.selectedContract.name}
                                 </a>
                            </h3>  */}
                            <h3 className='inspector-view-headline'>{this.props.selectedContract.name}</h3>
                            <h6 className='card-subtitle mb-2 contract-subtitle'>
                                <span className='badge badge-dark'>{subtitle}</span>
                            </h6>

                            { !contract.source && <div className='text-muted-light' ><p>
                                    <span className='badge badge-danger'>
                                        <i className='fas fa-exclamation-circle'></i> No sources found for this Contract
                                    </span>
                                </p>
                                <p>Child contracts don't show members inhertited from this contract. </p>                              
                            </div> }
                            <div className='text-muted-light normal-line-height'>
                          
                                {title && <p><i><small>{title.value}</small></i></p>}
                                
                            </div>
                        </div>
                        <br />
                        <ContractStateVaribaleView
                            uiCreationHandling={this.props.uiCreationHandling}
                            selectedTabTypeForView={this.props.selectedTabTypeForView}  
                            toggleInheritance={this.props.toggleInheritance}
                            contracts={this.props.contracts}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers}
                            testMode={this.props.testMode} 
                            blockchainConnection={this.props.blockchainConnection} />
                        <ContractFunctionView 
                            uiCreationHandling={this.props.uiCreationHandling}
                            selectedTabTypeForView={this.props.selectedTabTypeForView}
                            toggleInheritance={this.props.toggleInheritance}
                            contracts={this.props.contracts}
                            markCode={this.props.markCode}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers} 
                            testMode={this.props.testMode}
                            blockchainConnection={this.props.blockchainConnection} 
                            addTabEntity={this.props.addTabEntity}
                        />
                        <ContractModifierView 
                            toggleInheritance={this.props.toggleInheritance}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers} />
                        <ContractEventView 
                            contracts={this.props.contracts}
                            uiCreationHandling={this.props.uiCreationHandling}
                            selectedTabTypeForView={this.props.selectedTabTypeForView}
                            blockchainConnection={this.props.blockchainConnection} 
                            toggleInheritance={this.props.toggleInheritance}
                            testMode={this.props.testMode}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers}
                            getEvents={this.props.getEvents}
                        />
                        
                            <div>
                                <h5 id='meta' className='member-headline'><i className='fas fa-info-circle'></i> Instance information</h5>
                                <div className='list-group'>
                                    <a  href='#' 
                                        className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                                    >
                                        <strong>Address</strong>
                                        <div>
                                            
                                            <div>
                                                {this.props.editContractAddress ?
                                                    <input
                                               
                                                        onChange={(e: any): void => this.onChangeContractAddress(e)}
                                                        className='form-control form-control-sm input-output' 
                                                        type='text'
                                                        defaultValue={contract.deployedAt}
                                                        disabled={!this.props.editContractAddress}
                                                    /> : <span className='input-output'>{contract.deployedAt}</span>
                                                }
                                                <div className='text-right functionOperations'>
                                                {this.props.editContractAddress ?
                                                    <button 
                                                        type='button'
                                                        className='function-operation-button btn btn-outline-primary btn-sm'
                                                        onClick={(): void => {
                                                            this.props.changeContractAddress(this.state.contractAddress, contract.name); 
                                                        }}
                                                    >
                                                        Save
                                                    </button> :
                                                    <button 
                                                        type='button'
                                                        className='function-operation-button btn btn-outline-primary btn-sm'
                                                        onClick={() => {this.props.toogleEditContractAddress()}}
                                                    >
                                                        {contract.deployedAt ? 'Change' : 'Set Address'}
                                                    </button>

                                                }
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </a>
                                    
                                    <CompilerMetaDataView 
                                        addTabEntity={this.props.addTabEntity}
                                        contractAddress={this.props.selectedContract.deployedAt} 
                                        blockchainConnection={this.props.blockchainConnection} 
                                    />
                                    { this.props.weiBalance &&
                                        <a  href='#' 
                                            className='
                                                selected-list-item
                                                list-group-item
                                                list-group-item-action
                                                flex-column
                                                align-items-start
                                            '
                                        >
                                        <strong>Wei balance</strong>
                                        <div>
                                            <span className='input-output'>{this.props.weiBalance}</span>
                                        </div>
                                    </a>
                                    }
                                    
                                </div>
                            </div>
                          
                        <div className='text-muted-light normal-line-height'>
                            {notice && <p><br /><i><small>{notice.value}</small></i></p>}
                        </div>
                    </div>
                </div>;   
  
    }
    
}