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
import { Element } from '../UIStructure';
import { SelectElement } from './FunctionModal';
import { BlockchainConnection } from '../../../../solidity-handler/BlockchainConnector';

interface ActionElementProps {
    blockchainConnection: BlockchainConnection;
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