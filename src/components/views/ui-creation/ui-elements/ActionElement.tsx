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

interface ActionElementProps {
    web3: Web3Type;
    element: Element;
    showMetaInformation: boolean;
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

    componentDidMount(): void {
        this.updateEvents();
    }

    componentWillReceiveProps(): void {
        this.updateEvents();
    }

    async updateEvents(): Promise<void> {

        const contract: any = new this.props.web3.eth.Contract(
            this.props.element.abi,
            this.props.element.contractAddress);
        this.setState({
            result: await (contract as any).getPastEvents(
                this.props.element.functionName, 
                {fromBlock: this.props.element.data.fromBlock, toBlock: this.props.element.data.toBlock}
            )
        });
     
    }

    render(): JSX.Element {

        return <a key={this.props.element.contractAddress + this.props.element.functionName} className='dropdown-item' href='#'>
            {this.props.showMetaInformation && <span><span className='badge badge-secondary'>Action</span>&nbsp;</span>}
            {this.props.element.data.label}
        </a>;
    }
    
}