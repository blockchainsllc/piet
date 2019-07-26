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

import * as Sol from '../../../solidity-handler/SolidityHandler';
import { ContractStateVaribaleView } from './ContractStateVaribaleView';
import { ContractEventView } from './ContractEventView';
import { ContractModifierView } from './ContractModifierView';
import { ContractFunctionView } from './ContractFunctionView';
import { TabEntity, TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';
import { BlockchainConnection, checkBlockchainConnection } from '../../../solidity-handler/BlockchainConnector';
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

        const tabEntity: TabEntity = {
            active: true,
            contentType: TabEntityType.Code,
            name: this.props.selectedContract.name,
            content: { 
                source: contract.source,
                markers: null
            },
            icon: 'code',
            removable: true
        };

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
                                <strong className='error-red'>No sources found for this Contract.</strong> </p>
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
                        {contract.deployedAt || this.props.editContractAddress ? 
                            <div>
                                <h5 id='meta' className='member-headline'><i className='fas fa-info-circle'></i> Instance information</h5>
                                <div className='list-group'>
                                    <a  href='#' 
                                        className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                                    >
                                        <strong>Address</strong>
                                        <div>
                                            {this.props.editContractAddress ?
                                            <div>
                                                <input
                                                    placeholder={contract.deployedAt}
                                                    onChange={(e: any): void => this.onChangeContractAddress(e)}
                                                    className='form-control form-control-sm input-output' 
                                                    type='text'
                                                />
                                                <div className='text-right functionOperations'>
                                                <button 
                                                    type='button'
                                                    className='function-operation-button btn btn-outline-primary btn-sm'
                                                    onClick={(): void => {
                                                        this.props.changeContractAddress(this.state.contractAddress, contract.name); 
                                                    }}
                                                >
                                                        Save
                                                </button>
                                                </div>
                                            </div>
                                            : <span className='input-output'>{contract.deployedAt}</span>}
                                        </div>
                                    </a>
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
                            : null
                        }
                        <div className='text-muted-light normal-line-height'>
                            {notice && <p><br /><i><small>{notice.value}</small></i></p>}
                        </div>
                    </div>
                </div>;   
  
    }
    
}