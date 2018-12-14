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

interface EventTableProps {
    web3: Web3Type;
    element: Element;
    showMetaInformation: boolean;
}

interface EventTableState {
    result: any;
    
}

export class EventTable extends React.Component<EventTableProps, EventTableState > {

    constructor(props: EventTableProps) {
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

        let tableHeader: JSX.Element[]  = null;
        let tableBody: JSX.Element[]  = null;

        if (this.state.result) {
            tableHeader = [<th key={'headerBlockNo'}>block</th>,
                ...this.props.element.data.params
                    .map((param: Sol.ContractFunctionParam) =>  <th key={'header' + param.name}>{param.name}</th>)];

            tableBody = (this.state.result.map((event: any) => <tr key={event.transactionHash}>
                    <td>{event.blockNumber}</td>
                    {this.props.element.data.params.map((param: Sol.ContractFunctionParam) => 
                        <td key={param.name}>{event.returnValues[param.name]}</td>)}
                </tr>));

        }

        return <div className='col-sm'>
            {this.props.showMetaInformation && <span><span className='badge badge-secondary'>EventTable</span>&nbsp;</span>}
            <small>
            
            <span className='text-muted'>{this.props.element.data.label}</span>
                { this.state.result ? 
                    <table className='table'>
                        <thead>
                            <tr>{tableHeader}</tr>
                        </thead>
                        <tbody>
                            {tableBody}
                        </tbody>
                    </table>
                    : <p><i>Loading...</i></p>
                }
                
            </small>
        </div>;
    }
    
}