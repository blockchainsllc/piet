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

import * as Sol from '../../../solidity-handler/SolidityHandler';
import Web3Type from '../../../types/web3';
import { ContractStateVaribaleView } from './ContractStateVaribaleView';
import { ContractEventView } from './ContractEventView';
import { ContractModifierView } from './ContractModifierView';
import { ContractFunctionView } from './ContractFunctionView';
import { TabEntity, TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';
interface ContractViewProps {
    selectedContract: Sol.Contract;
    contracts: Sol.Contract[];
    testMode: boolean;
    web3: Web3Type;
    showInheritedMembers: boolean;
    addTabEntity: Function;
    markCode: Function;
    editContractAddress: boolean;
    changeContractAddress: Function;
    getEvents: Function;
    toggleInheritance: Function;
    selectedTabTypeForView: TabEntityType[];
    uiCreationHandling: UICreationHandling;
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
        const subtitle: string = this.props.selectedContract.kind;

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
                   
                    <div className='card-body selected-card contract-card'>
                        <div className='text-center'>
                            {/* <h3>
                                 <a href='#' className='inspector-view-headline' onClick={() => this.props.addTabEntity(tabEntity, 1, false)}>
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
                            web3={this.props.web3} />
                        <ContractFunctionView 
                            toggleInheritance={this.props.toggleInheritance}
                            contracts={this.props.contracts}
                            markCode={this.props.markCode}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers} 
                            testMode={this.props.testMode}
                            web3={this.props.web3} 
                            addTabEntity={this.props.addTabEntity}
                        />
                        <ContractModifierView 
                            toggleInheritance={this.props.toggleInheritance}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers} />
                        <ContractEventView 
                            toggleInheritance={this.props.toggleInheritance}
                            testMode={this.props.testMode}
                            selectedContract={this.props.selectedContract} 
                            showInheritedMembers={this.props.showInheritedMembers}
                            getEvents={this.props.getEvents}
                        />
                        {contract.deployedAt || this.props.editContractAddress ? 
                            <div>
                                <h5 id='meta' className='member-headline'><i className='fas fa-info-circle'></i> Meta</h5>
                                <div className='list-group'>
                                    <a  href='#' 
                                        className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                                    >
                                        <strong>Deployed at</strong>
                                        <div>
                                            {this.props.editContractAddress ?
                                            <div>
                                                <input
                                                    placeholder={contract.deployedAt}
                                                    onChange={(e) => this.onChangeContractAddress(e)}
                                                    className='form-control form-control-sm' type='text'
                                                />
                                                <div className='text-right functionOperations'>
                                                <button 
                                                    type='button'
                                                    className='function-operation-button btn btn-outline-primary btn-sm'
                                                    onClick={() => {this.props.changeContractAddress(this.state.contractAddress, contract.name); }}
                                                >
                                                        Save
                                                </button>
                                                </div>
                                            </div>
                                            : <small>{contract.deployedAt}</small>}
                                        </div>
                                    </a>
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