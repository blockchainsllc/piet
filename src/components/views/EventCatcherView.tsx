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
import * as Sol from '../../solidity-handler/SolidityHandler';
import JSONTree from 'react-json-tree';
import SplitPane from 'react-split-pane';
import { getEventAbi } from '../../utils/AbiGenerator';
import { BlockchainConnection } from '../../solidity-handler/BlockchainConnector';

interface EventCatcherViewProps {
    blockchainConnection: BlockchainConnection;
    content: EventViewContent;
    contentChange: Function;
    viewId: number;
    tabId: number;
    contracts: Sol.Contract[];
}

export interface EventViewContent {
    contract: Sol.Contract;
    event: Sol.ContractEvent;
    fromBlock: string;
    toBlock: string;
    result: any;
}

export interface EventCatcherViewState {
    rawView: boolean;
}

export class EventCatcherView extends React.Component<EventCatcherViewProps, EventCatcherViewState> {

    constructor(props: EventCatcherViewProps) {
        super(props);

        this.state = {
            rawView: false
        };

        this.onChangeFromBlock = this.onChangeFromBlock.bind(this);
        this.onChangeToBlock = this.onChangeToBlock.bind(this);
        this.onClickPlay = this.onClickPlay.bind(this);
        this.onClickRaw = this.onClickRaw.bind(this);

    }

    onChangeFromBlock(e: any): void {
        this.props.contentChange(this.props.viewId, this.props.tabId, {
            ...this.props.content,
            fromBlock: e.target.value
        });
    }

    onChangeToBlock(e: any): void {
        this.props.contentChange(this.props.viewId, this.props.tabId, {
            ...this.props.content,
            toBlock: e.target.value
        });
    }

    async onClickPlay(): Promise<void> {
        this.props.contentChange(this.props.viewId, this.props.tabId, {
            ...this.props.content,
            result: null
        });
        const fromBlock: string = this.props.content.fromBlock ? this.props.content.fromBlock : '0';
        const toBlock: string = this.props.content.toBlock ? this.props.content.toBlock : 'latest';
        const contract: any = new this.props.blockchainConnection.web3.eth.Contract(
            getEventAbi(this.props.content.event, this.props.contracts, this.props.content.contract),
            this.props.content.contract.deployedAt);
        this.props.contentChange(this.props.viewId, this.props.tabId, {
            ...this.props.content,
            result: await (contract as any).getPastEvents(this.props.content.event.name, {fromBlock: fromBlock, toBlock: toBlock})
        });
     
    }

    onClickRaw(): void {
        this.setState({
            rawView: !this.state.rawView
        });
     
    }

    render(): JSX.Element {
        const fromBlock: string = this.props.content.fromBlock ? this.props.content.fromBlock : '0';
        const toBlock: string = this.props.content.toBlock ? this.props.content.toBlock : 'latest';

        const theme: any = {
            scheme: 'monokai',
            author: 'wimer hazenberg (http://www.monokai.nl)',
            base00: '#232323',
            base01: '#383830',
            base02: '#49483e',
            base03: '#75715e',
            base04: '#a59f85',
            base05: '#f8f8f2',
            base06: '#f5f4f1',
            base07: '#f9f8f5',
            base08: '#f92672',
            base09: '#fd971f',
            base0A: '#f4bf75',
            base0B: '#a6e22e',
            base0C: '#a1efe4',
            base0D: '#66d9ef',
            base0E: '#ae81ff',
            base0F: '#cc6633'
        };

        let tableHeader: JSX.Element[]  = null;
        let tableBody: JSX.Element[]  = null;

        if (this.props.content && this.props.content.result) {
            tableHeader = [<th key={'headerBlockNo'}>block</th>,
                ...(this.props.content as any).params
                    .map((param: Sol.ContractFunctionParam) =>  <th key={'header' + param.name}>{param.name}</th>)];

            tableBody = (this.props.content.result.map((event: any) => <tr key={event.transactionHash}>
                    <td>{event.blockNumber}</td>
                    {(this.props.content as any).params.map((param: Sol.ContractFunctionParam) => 
                        <td key={param.name}>{event.returnValues[param.name]}</td>)}
                </tr>));

        }
          
        return <SplitPane className='scrollable hide-resizer' split='horizontal' defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        <div className='form-inline'>
                            <input 
                                placeholder={'from block'} onChange={this.onChangeFromBlock}
                                defaultValue={fromBlock}
                                size={10}
                                className='form-control form-control-sm dark-input'
                                type='text' 
                            />
                            &nbsp;
                            <input 
                                placeholder={'to block'} onChange={this.onChangeToBlock}
                                defaultValue={toBlock}
                                size={10}
                                className='form-control form-control-sm dark-input'
                                type='text' 
                            />
                            &nbsp;
                            <button className={'btn btn-sm btn-outline-info'}
                                onClick={(): Promise<void> => this.onClickPlay()}>
                                <i className='fas fa-play'></i>
                            </button>
                            &nbsp;
                            &nbsp;
                            &nbsp;
                            <button className={'btn btn-sm btn-' + (this.state.rawView ? '' : 'outline-') + 'info'}
                                onClick={(): void => this.onClickRaw()}>
                                Raw View
                            </button>
                        </div>
                        
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' 
                    split='horizontal'  defaultSize={1} allowResize={false} >
                        <div></div>
                        <div>
                        
                            {this.props.content.result && !this.state.rawView ?
                                <small>
                                    <table className='table event-table'>
                                        <thead>
                                        <tr>{tableHeader}</tr>
                                        </thead>
                                        <tbody>
                                            {tableBody}
                                            </tbody>
                                    </table>
                                </small>
                                : null }
                            {this.props.content.result && this.state.rawView ?
                                <div className='container-fluid'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <small>
                                                <JSONTree data={this.props.content.result} theme={theme} invertTheme={false}/> 
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            : null }
                        </div>
                            
                    </SplitPane>
                </SplitPane>;
               
    }
    
}