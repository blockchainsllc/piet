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
interface ValueBoxProps {
    uiCreationHandling: UICreationHandling;
    placeHolderName: string;
    contractAddress: string;
    abi: any;
    stateVariableName: string;
}

interface ValueBoxState {

    label: string;
}

export class ValueBox extends React.Component<ValueBoxProps, ValueBoxState> {

    constructor(props: ValueBoxProps) {
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
            elementType: ElementType.ValueBox,
            data: this.state.label,
            contractAddress: this.props.contractAddress,
            abi: this.props.abi,
            functionName: this.props.stateVariableName
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
        
        return <div className='input-group mb-3 state-varibale-result-container'>
                                
        <input 
            onChange={(e) => this.onLableChange(e)}
            className='form-control form-control-sm'
            type='text'
            placeholder={this.props.placeHolderName}
        />
        <div className='input-group-append'>
            <button 
                className='btn  btn-sm btn-outline-primary dropdown-toggle sv-call'
                type='button' 
                data-toggle='dropdown' 
                aria-haspopup='true' 
                aria-expanded='false'
            >
                Add to Row
            </button>
            <div className='dropdown-menu'>{rows}</div>
        </div>
        {/* <div className='input-group-append'>
            <button type='button' className='btn btn-outline-primary btn-sm sv-call' 
                onClick={null}>
                Add
            </button>
        </div> */}
    </div>;
               
    }
    
}