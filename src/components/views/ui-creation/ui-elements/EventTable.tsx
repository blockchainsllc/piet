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
import * as Sol from '../../../../solidity-handler/SolidityHandler';
import { BlockchainConnection } from '../../../../solidity-handler/BlockchainConnector';

interface EventTableProps {
    blockchainConnection: BlockchainConnection;
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

        const contract: any = new this.props.blockchainConnection.web3.eth.Contract(
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