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
import { getFunctionAbi, getStateVariableAbi } from '../../../utils/AbiGenerator';
import { TabEntityType } from '../../View';
import { ValueBox } from '../ui-creation/InspectorTools/ValueBox';
import { UICreationHandling } from '../ui-creation/UIStructure';
import { callFunction, BlockchainConnection, checkBlockchainConnection } from '../../../solidity-handler/BlockchainConnector';

interface ContractStateVaribaleViewProps {
    selectedContract: Sol.Contract;
    testMode: boolean;
    blockchainConnection: BlockchainConnection;
    showInheritedMembers: boolean;
    contracts: Sol.Contract[];
    toggleInheritance: Function;
    selectedTabTypeForView: TabEntityType[];
    uiCreationHandling: UICreationHandling;
}

interface ContractStateVaribaleViewState {
    resultBoxIsShown: boolean;

    parameterMapping: any[];
    resultMapping: any[];
    stateVariableInput: any[];
}

export class ContractStateVaribaleView extends React.Component<ContractStateVaribaleViewProps, ContractStateVaribaleViewState> {

    constructor(props: ContractStateVaribaleViewProps) {
        super(props);
        this.state = {
            resultBoxIsShown: false,
            parameterMapping: [],
            resultMapping: [],
            stateVariableInput: []
        };

        this.call = this.call.bind(this);
        this.showResultBox = this.showResultBox.bind(this);
        this.onStateVariableInputChange = this.onStateVariableInputChange.bind(this);

    }

    showResultBox(show: boolean): void  {
        this.setState({resultBoxIsShown: show});
    }

    onStateVariableInputChange(e: any, stateVariableName: string): void  {
        e.persist();
        this.setState((prevState: ContractStateVaribaleViewState) => {

            prevState.stateVariableInput[stateVariableName] = e.target.value;

            return {
                stateVariableInput: prevState.stateVariableInput
            };

        },            () => {
            const stateVariables: Sol.ContractStateVariable[] = 
                [...this.props.selectedContract.stateVariables, ...this.props.selectedContract.inheritedStateVariables];
            const stateVariableIndex: number = stateVariables.findIndex((sv: Sol.ContractStateVariable) => sv.name === stateVariableName);
            if (stateVariableIndex !== -1) {
                this.call(stateVariables[stateVariableIndex], stateVariableIndex);
            }
        });

    }

    reset(props: ContractStateVaribaleViewProps): void {
        const numberOfStateVariables: number = props.selectedContract.stateVariables.length
            + props.selectedContract.inheritedStateVariables.length;
        this.setState(
            {
                resultMapping: Array(numberOfStateVariables).fill(false)
            },
            () => this.getAll(props)
        );
    }

    componentDidMount(): void  {
        this.reset(this.props);
    }

    componentWillReceiveProps(nextProps: ContractStateVaribaleViewProps): void  {
        if (
            this.props.selectedContract.name !== nextProps.selectedContract.name || 
            this.props.selectedContract.deployedAt !== nextProps.selectedContract.deployedAt
        ) {
            this.reset(nextProps);
        }
    }

    getAll(props: ContractStateVaribaleViewProps): void  {
        [...props.selectedContract.stateVariables, ...props.selectedContract.inheritedStateVariables]
                .forEach((sv: Sol.ContractStateVariable, index: number) => this.call(sv, index));
    }

    async call(stateVariable: Sol.ContractStateVariable, index: number): Promise<void> {

        if (stateVariable.visibility === 'public' 
            && checkBlockchainConnection(this.props.blockchainConnection)
            && this.props.selectedContract.deployedAt 
            && ((stateVariable.solidityType.mapping && this.state.stateVariableInput[stateVariable.name]) 
                || !stateVariable.solidityType.mapping)
            && ((stateVariable.solidityType.isArray && this.state.stateVariableInput[stateVariable.name]) 
                || !stateVariable.solidityType.isArray)
            ) {
            this.setState({
                resultMapping: [...this.state.resultMapping.slice(0, index),
                                '',
                                ...this.state.resultMapping.slice(index + 1)]

            });
 
            let result: any; 
            let abi: any = null;
            try {
                abi = getStateVariableAbi(
                    stateVariable.getter,
                    this.props.contracts,
                    this.props.selectedContract
                );
            } catch (e) {
                result = 'could not create abi for ' + stateVariable.name;
            }

            if (abi) {
                const contract: any = new this.props.blockchainConnection.web3.eth.Contract(
                    abi,
                    this.props.selectedContract.deployedAt);

                result = await callFunction(
                    stateVariable.getter,
                    this.props.blockchainConnection,
                    this.props.selectedContract.deployedAt,
                    abi,
                    stateVariable.solidityType.mapping || stateVariable.solidityType.isArray ? 
                        [this.state.stateVariableInput[stateVariable.name]] : []
                );
                
            }
            
            this.setState({
                resultMapping: [
                    ...this.state.resultMapping.slice(0, index),
                    result,
                    ...this.state.resultMapping.slice(index + 1)
                ]
            });
        }   
    }

    getStateVariableList (contract: Sol.Contract, inherited: boolean): JSX.Element[] {
        
        const stateVariables: Sol.ContractStateVariable[] = inherited ? contract.inheritedStateVariables : contract.stateVariables;

        if (!this.props.showInheritedMembers && inherited) {
            if (contract.inheritedStateVariables.length === 0) {
                return null;
            }

            return  [<div className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                        key={'stateVariable' + contract.name + 'inheritedInfo'}>
                        <small>
                            <a href='#' onClick={(): void => this.props.toggleInheritance()} className={'text-muted'}>
                                {contract.inheritedStateVariables.length}
                                &nbsp;inherited state variable{contract.inheritedStateVariables.length === 1 ? '' : 's'}
                            </a>
                        </small>
            </div>];
        }

        return stateVariables.map((stateVariable: Sol.ContractStateVariable, index: number) => {
            const svIndexOffset: number = inherited ? contract.stateVariables.length : 0;
            let abi: any = null;
            try {
                abi = getFunctionAbi(
                    stateVariable.getter,
                    this.props.contracts,
                    this.props.selectedContract
                );
            } catch (e) {
                console.log('could not create abi for ' + stateVariable.name);
            }

            const result: any = this.state.resultMapping[svIndexOffset + index];

            const outputValue: any = result ? Array.isArray(result) ? result[0] : result : '';

            return  <div className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                        key={'stateVariable' + contract.name + stateVariable.name}>
                        <div className='d-flex w-100 justify-content-between'>
                            <div>
                                <strong>
                                    <span className={'member-name' + (inherited ? ' text-muted' : '')}> 
                            
                                        {stateVariable.name} 
                                    </span>
                                </strong>
                                <small>&nbsp;{stateVariable.solidityType.name}</small>
                            </div>
                                    
                            <div>{stateVariable.visibility === 'public' ? 
                                <i className='fas fa-lock-open'></i> : 
                                <i className='fas fa-lock'></i>}
                            
                            </div> 
                        </div>
                        { this.props.testMode && contract.deployedAt != null && stateVariable.visibility === 'public' ?
                            <div>{(stateVariable.solidityType.mapping || stateVariable.solidityType.isArray) && 
                                <input  
                                    className='form-control form-control-sm input-output'
                                    type='text'
                                    onChange={(e: any): void  => this.onStateVariableInputChange(e, stateVariable.name)} />
                            }
                                <div className='input-group mb-3 state-varibale-result-container'>
                                    {stateVariable.solidityType.userDefined ?
                                    <textarea  
                                        className='form-control form-control-sm input-output' 
                                        disabled
                                        rows={(outputValue.match(/\n/g) || []).length + 1}
                                        value={outputValue} 
                                    />

                                    : <input  className='form-control form-control-sm input-output' type='text' disabled
                                        value={outputValue} />
                                    
                                    }
                                    
                                    <div className='input-group-append'>
                                        <button type='button' className='btn btn-outline-secondary btn-sm sv-call' data-toggle='modal' 
                                            data-target={'#resultModal' + 'SV' + this.props.selectedContract.name}
                                            onClick={(): void => {this.call(stateVariable, svIndexOffset + index); }}>
                                            <i className='fas fa-sync'></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        
                            : null 
                        }
                        {
                            this.props.selectedTabTypeForView[1] === TabEntityType.UICreationView &&
                            <ValueBox 
                                placeHolderName={stateVariable.name}
                                uiCreationHandling={this.props.uiCreationHandling}
                                contractAddress={contract.deployedAt}
                                abi={abi}
                                stateVariableName={stateVariable.name}
                            />
                        }
        
                    </div>;
        });

    }

    render (): JSX.Element {
        if (this.props.selectedContract.stateVariables.length === 0 && this.props.selectedContract.inheritedStateVariables.length === 0) {
            return null;
        }
    
        return  <div >
                    <h5 className='member-headline'><i className='fas fa-database'></i> State variables</h5>
                    <div className='list-group'>
                        {this.getStateVariableList(this.props.selectedContract, false)}
                        {this.getStateVariableList(this.props.selectedContract, true)}
                    </div>
                    <br />
                </div>;
    }
    
}