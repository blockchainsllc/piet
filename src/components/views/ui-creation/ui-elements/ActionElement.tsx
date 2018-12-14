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
import Web3Type from '../../../../types/web3';
import { Element } from '../UIStructure';
import * as Sol from '../../../../solidity-handler/SolidityHandler';
import { SelectElement } from './FunctionModal';

interface ActionElementProps {
    web3: Web3Type;
    element: Element;
    showMetaInformation: boolean;
    selectFunctionElement: SelectElement;
}

interface ActionElementState {
    result: any;
    
}

export class ActionElement extends React.Component<ActionElementProps, ActionElementState > {

    constructor(props: ActionElementProps) {
        super(props);

        this.state = {
            result: null
        };

    }

    render(): JSX.Element {

        return <a 
            key={this.props.element.contractAddress + this.props.element.functionName}
            className='dropdown-item' 
            onClick={() => this.props.selectFunctionElement(this.props.element)}
            href='#'
        >
            {this.props.showMetaInformation && <span><span className='badge badge-secondary'>Action</span>&nbsp;</span>}
            {this.props.element.data.label}
        </a>;
    }
    
}