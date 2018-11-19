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

interface ContractModifierViewProps {
    selectedContract: Sol.Contract;
    showInheritedMembers: boolean;
    toggleInheritance: Function;
    
}

interface ContractModifierViewState {
    modifierCollapsed: boolean[];
}

export class ContractModifierView extends React.Component<ContractModifierViewProps, {}> {
    state: ContractModifierViewState;

    constructor(props: ContractModifierViewProps) {
        super(props);
        this.state = {
            modifierCollapsed: []
        };

        this.toogleCollapse = this.toogleCollapse.bind(this);
    }

    componentDidMount(): void {
        this.setState({
            modifierCollapsed: 
                Array(this.props.selectedContract.modifiers.length + this.props.selectedContract.inheritedModifiers.length).fill(false)
        });
    }

    componentWillReceiveProps(nextProps: ContractModifierViewProps): void {
        if (this.props.selectedContract.name !== nextProps.selectedContract.name) {
            this.setState({
                modifierCollapsed:
                    Array(this.props.selectedContract.modifiers.length + this.props.selectedContract.inheritedModifiers.length).fill(false)
            });
        }
    }

    toogleCollapse(index: number): void {
        
        this.setState((prevState: ContractModifierViewState) => {
            prevState.modifierCollapsed[index] = !prevState.modifierCollapsed[index];
            return {modifierCollapsed: prevState.modifierCollapsed};
        });
    }

    getModifierList(contract: Sol.Contract, inherited: boolean): JSX.Element[]  {
        const modifiers: Sol.ContractModifier[] = inherited ? contract.inheritedModifiers : contract.modifiers;
        const modifierIndexOffset: number = inherited ? contract.modifiers.length : 0;

        if (!this.props.showInheritedMembers && inherited) {
            if (contract.inheritedModifiers.length === 0) {
                return null;
            }

            return  [<div className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                        key={'modifier' + contract.name + 'inheritedInfo'}>
                        <small>
                        <a href='#' onClick={() => {this.props.toggleInheritance(); }} className={'text-muted'}>
                                {contract.inheritedModifiers.length}
                                &nbsp;inherited modifier{contract.inheritedModifiers.length === 1 ? '' : 's'}
                            </a>
                        </small>
                    </div>];
        }

        return modifiers.map((modifier: Sol.ContractModifier, modifierIndex: number) => {
            const params = [];
            modifier.params.forEach((param: Sol.ContractFunctionParam, index: number) => {
                params.push(
                    <div key={'param' + contract.name + param.name} className='param'>
                        <i className='fas fa-arrow-circle-right' aria-hidden='true'></i>&nbsp;
                        <strong>{param.name}</strong><small>&nbsp;{param.solidityType.name}</small>
                       
                    </div>
                );
            });

            return  <div 
                        className='
                            member-parent-container
                            selected-list-item
                            list-group-item
                            list-group-item-action
                            flex-column
                            align-items-start
                            with-detailed-view'
                        key={'modifier' + contract.name + modifier.name}
                    >
                        <div className='member-container'>
                            <div className='left-member'>
                                <button
                                    data-target={'#modifier' + contract.name + modifier.name}
                                    data-toggle='collapse'
                                    type='button'
                                    onClick={() => this.toogleCollapse(modifierIndexOffset + modifierIndex)}
                                    className='btn btn-outline-dark detailed-button left-member'
                                >
                    
                                    <div className={(this.state.modifierCollapsed[modifierIndexOffset + modifierIndex] ? '' : ' dontShow')}>
                                        <i className='fas fa-angle-down'></i>
                                    </div> 
                                    <div className={(this.state.modifierCollapsed[modifierIndexOffset + modifierIndex] ? ' dontShow' : '')}>
                                        <i className='fas fa-angle-right'></i>
                                    </div>
                                    
                                </button>
                            </div>
                            <div className='right-member'>
                                <strong>
                                    <span className={'member-name' + (inherited ? ' text-muted' : '')}> 
                                        {modifier.name} 
                                    </span>
                                </strong>
                                <div className='collapse' id={'modifier' + contract.name + modifier.name}>
                                    {params.length > 0 ? <small>{params}</small> : null} 
                                </div>
                            </div>
                                
                        </div>
                      
                    </div>;
            }
        );

    }

    render(): JSX.Element {
        if (this.props.selectedContract.modifiers.length === 0 && this.props.selectedContract.inheritedModifiers.length === 0) {
            return null;
        }

        return  <div>
                    <h5 className='member-headline'><i className='fas fa-indent'></i> Modifiers</h5>
                    <div className='list-group'>
                        {this.getModifierList(this.props.selectedContract, false)}
                        {this.getModifierList(this.props.selectedContract, true)}
                    </div>
                    <br />
                </div>;
    }
    
}