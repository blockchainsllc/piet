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
import { getStateVariableAbi } from '../../../utils/AbiGenerator';
import { TabEntity, TabEntityType } from '../../View';
import { StateVariableUITools } from '../ui-creation/InspectorTools/StateVariableUITools';
import { UICreationHandling } from '../ui-creation/UIStructure';

interface ContractStateVaribaleViewProps {
    selectedContract: Sol.Contract;
    testMode: boolean;
    web3: Web3Type;
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

export class ContractStateVaribaleView extends React.Component<ContractStateVaribaleViewProps, {}> {
    state: ContractStateVaribaleViewState;

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

    componentDidMount(): void  {
        const numberOfStateVariables: number = this.props.selectedContract.stateVariables.length
            + this.props.selectedContract.inheritedStateVariables.length;
        this.setState({
            resultMapping: Array(numberOfStateVariables).fill(false)

        },            this.getAll);
    }

    componentWillReceiveProps(nextProps: ContractStateVaribaleViewProps): void  {

        if (this.props.selectedContract.name !== nextProps.selectedContract.name) {
            const numberOfStateVariables: number = this.props.selectedContract.stateVariables.length
                + this.props.selectedContract.inheritedStateVariables.length;
            this.setState({
                resultMapping: Array(numberOfStateVariables).fill(false)
            },            this.getAll);
        }
    }

    getAll(): void  {
        [...this.props.selectedContract.stateVariables, ...this.props.selectedContract.inheritedStateVariables]
                .forEach((sv: Sol.ContractStateVariable, index: number) => this.call(sv, index));
    }

    async call(stateVariable: Sol.ContractStateVariable, index: number): Promise<void> {

        if (stateVariable.visibility === 'public' 
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
            this.setState({lastResult: ''});
            const abi: any = getStateVariableAbi(stateVariable, this.props.web3, this.props.contracts);

            const contract: any = new this.props.web3.eth.Contract(
                abi,
                this.props.selectedContract.deployedAt);

            let result: any; 
            try {
                const arrayOrMappingKey: any = stateVariable.solidityType.mapping || stateVariable.solidityType.isArray 
                    ? this.state.stateVariableInput[stateVariable.name] : [];

                if (stateVariable.solidityType.mapping) {
                    result = await (this.state.parameterMapping[stateVariable.name] ? 
                        contract.methods[stateVariable.name](...this.state.parameterMapping[stateVariable.name], arrayOrMappingKey).call() :
                        contract.methods[stateVariable.name](arrayOrMappingKey).call());
                } else {
                    result = await (this.state.parameterMapping[stateVariable.name] ? 
                        contract.methods[stateVariable.name](
                            ...this.state.parameterMapping[stateVariable.name], 
                            ...arrayOrMappingKey).call() :
                            contract.methods[stateVariable.name](...arrayOrMappingKey).call());
                }

                result = typeof result === 'object' ? JSON.stringify(result) : result.toString();
            } catch (e) {
                result = e.toString();
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
                            <a href='#' onClick={() => {this.props.toggleInheritance(); }} className={'text-muted'}>
                                {contract.inheritedStateVariables.length}
                                &nbsp;inherited state variable{contract.inheritedStateVariables.length === 1 ? '' : 's'}
                            </a>
                        </small>
            </div>];
        }

        return stateVariables.map((stateVariable: Sol.ContractStateVariable, index: number) => {
            const svIndexOffset: number = inherited ? contract.stateVariables.length : 0;

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
                                    className='form-control form-control-sm'
                                    type='text'
                                    onChange={(e) => this.onStateVariableInputChange(e, stateVariable.name)} />
                            }
                                <div className='input-group mb-3 state-varibale-result-container'>
                                
                                    <input  className='form-control form-control-sm' type='text' disabled
                                        value={this.state.resultMapping[svIndexOffset + index] ? 
                                            this.state.resultMapping[svIndexOffset + index] : ''} />
                                    <div className='input-group-append'>
                                        <button type='button' className='btn btn-outline-secondary btn-sm sv-call' data-toggle='modal' 
                                            data-target={'#resultModal' + 'SV' + this.props.selectedContract.name}
                                            onClick={() => this.call(stateVariable, svIndexOffset + index)}>
                                            <i className='fas fa-sync'></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        
                            : null 
                        }
                        {
                            this.props.selectedTabTypeForView[1] === TabEntityType.UICreationView && <StateVariableUITools />
                        }
        
                    </div>;
        });

    }

    render (): JSX.Element {
        if (this.props.selectedContract.stateVariables.length === 0 && this.props.selectedContract.inheritedStateVariables.length === 0) {
            return null;
        }
    
        return  <div >
                    <h5 className='member-headline'><i className='fas fa-database'></i> State varibales</h5>
                    <div className='list-group'>
                        {this.getStateVariableList(this.props.selectedContract, false)}
                        {this.getStateVariableList(this.props.selectedContract, true)}
                    </div>
                    <br />
                </div>;
    }
    
}