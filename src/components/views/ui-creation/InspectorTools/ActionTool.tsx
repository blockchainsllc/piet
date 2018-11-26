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
import { UICreationHandling, Row, ElementType } from '../UIStructure';
import { ContractFunction } from '../../../../solidity-handler/SolidityHandler';

interface ActionToolProps {
    uiCreationHandling: UICreationHandling;
    placeHolderName: string;
    contractAddress: string;
    abi: any;
    contractFunction: ContractFunction;
    callAble: boolean;
}

interface ActionToolState {

    label: string;
}

export class ActionTool extends React.Component<ActionToolProps, ActionToolState> {

    constructor(props: ActionToolProps) {
        super(props);

        this.state = {
     
            label: null
        };

        this.onLableChange = this.onLableChange.bind(this);
        this.addAction = this.addAction.bind(this);

    }

    componentDidMount(): void {
        this.setState({
            label: this.props.placeHolderName
        });

    }

    addAction(): void {
        this.props.uiCreationHandling.addElementToAction({
            elementType: ElementType.EventTable,
            data: {
                contractFunction: this.props.contractFunction,
                label: this.state.label,
                callAble: this.props.callAble
            },
            contractAddress: this.props.contractAddress,
            abi: this.props.abi,
            functionName: this.props.contractFunction.name
        });
 
    }

    onLableChange(e: any): void {
        e.persist();
        this.setState({
            label: e.target.value
        });
    }

    render(): JSX.Element {

        
        return <div className='input-group mb-3 state-varibale-result-container'>
                                
        <input 
            onChange={(e) => this.onLableChange(e)}
            className='form-control form-control-sm'
            type='text'
            placeholder={this.props.placeHolderName}
        />
        <div className='input-group-append'>
            <button 
                className='btn btn-sm btn-outline-primary sv-call'
                type='button' 
                aria-haspopup='true' 
                aria-expanded='false'
                onClick={this.addAction}
            >
                Add to Actions
            </button>
           
        </div>

    </div>;
               
    }
    
}