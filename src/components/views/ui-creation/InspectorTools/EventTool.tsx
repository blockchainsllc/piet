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
import { UICreationHandling, Row, ElementType } from '../UIStructure';
import { ContractEvent } from '../../../../solidity-handler/SolidityHandler';
interface EventToolProps {
    uiCreationHandling: UICreationHandling;
    placeHolderName: string;
    contractAddress: string;
    abi: any;
    event: ContractEvent;
}

interface EventToolState {

    label: string;
}

export class EventTool extends React.Component<EventToolProps, EventToolState> {

    constructor(props: EventToolProps) {
        super(props);

        this.state = {
     
            label: null
        };

        this.selectRow = this.selectRow.bind(this);
        this.onLableChange = this.onLableChange.bind(this);

    }

    componentDidMount(): void {
        this.setState({
            label: this.props.placeHolderName
        });

    }

    selectRow(rowIndex: number): void {
        this.props.uiCreationHandling.addElementToRow(rowIndex, {
            elementType: ElementType.EventTable,
            data: {
                fromBlock: '0',
                toBlock: 'latest',
                params: this.props.event.params,
                label: this.state.label
            },
            contractAddress: this.props.contractAddress,
            abi: this.props.abi,
            functionName: this.props.event.name
        });
 
    }

    onLableChange(e: any): void {
        e.persist();
        this.setState({
            label: e.target.value
        });
    }

    render(): JSX.Element {

        const rows: JSX.Element[] = this.props.uiCreationHandling.uiStructure.rows
            .map((row: Row, index: number) => 
                <a key={'row' + index} className='dropdown-item' href='#' onClick={() => this.selectRow(index)}>
                    Row {index}
                </a>
            );

        rows.push(<a key={'newRow'} className='dropdown-item' href='#' onClick={() => this.selectRow(-1)}>
            New Row
        </a>);
        
        return <div className='input-group mb-3 state-varibale-result-container'>
                                
        <input 
            onChange={(e) => this.onLableChange(e)}
            className='form-control form-control-sm'
            type='text'
            placeholder={this.props.placeHolderName}
        />
        <div className='input-group-append'>
            <button 
                className='btn btn-sm btn-outline-primary dropdown-toggle sv-call'
                type='button' 
                data-toggle='dropdown' 
                aria-haspopup='true' 
                aria-expanded='false'
            >
                Add to Row
            </button>
            <div className='dropdown-menu'>{rows}</div>
        </div>

    </div>;
               
    }
    
}