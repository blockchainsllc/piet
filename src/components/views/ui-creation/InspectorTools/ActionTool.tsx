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