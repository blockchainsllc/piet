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
import JSONTree from 'react-json-tree';
import SplitPane from 'react-split-pane';
import { BlockchainConnection, sendJSONRpcQuery } from '../../../solidity-handler/BlockchainConnector';
import { rpcMethods, RpcMethod, Param, JsonType } from './RPCMethods';

interface NodeDiagnosticsViewProps {
    blockchainConnection: BlockchainConnection;
    viewId: number;
    tabId: number;

}

export interface NodeDiagnosticsViewState {
    selectedMethod: RpcMethod;
    rpcId: number;
    result: any;
    params: any[];

}

export class NodeDiagnosticsView extends React.Component<NodeDiagnosticsViewProps, NodeDiagnosticsViewState> {

    constructor(props: NodeDiagnosticsViewProps) {
        super(props);

        this.state = {
            selectedMethod: rpcMethods[0],
            rpcId: 0,
            result: {},
            params: []
        };

        this.onClickPlay = this.onClickPlay.bind(this);
        this.onMethodChange = this.onMethodChange.bind(this);
        this.onParamChange = this.onParamChange.bind(this);

    }

    async onMethodChange(event: any): Promise<void> {
        event.persist();
        const rpcMethod: RpcMethod = rpcMethods.find((value: RpcMethod) => value.name === event.target.value);
        this.setState({
            selectedMethod: rpcMethod,
            params: rpcMethod.params ? Array(rpcMethod.params.length).fill(null) : []
        });
    }

    onParamChange(event: any, index: number): void {
        event.persist();
        this.setState((prevState: NodeDiagnosticsViewState) => {
            let value: any;
            switch (this.state.selectedMethod.params[index].jsonType) {
                case JsonType.Bool:
                    value = event.target.value === 'true';
                    break;
                case JsonType.Number:
                    value = parseInt(event.target.value, 10);
                    break;
                case JsonType.Json:
                    try {
                        value = JSON.parse(event.target.value);
                    } catch {
                        value = event.target.value;
                    }
                    break;
                case JsonType.StringOrNumber:
                    value = parseInt(event.target.value) ? 
                        parseInt(event.target.value) :
                        event.target.value;
                    break;
                case JsonType.String:
                default:
                    value = event.target.value;
            }

            prevState.params[index] = value;
            return {
                params: prevState.params
            };
        });
    }

    async onClickPlay(): Promise<void> {
        let error: any =  null;
        this.setState((prevState: NodeDiagnosticsViewState) => {
            return ({
                result: {}
            });
        });

        const result: any = await sendJSONRpcQuery(
            this.props.blockchainConnection, 
            {
                jsonrpc: '2.0',
                method: this.state.selectedMethod.name, 
                params: this.state.params, 
                id: this.state.rpcId
            }
        ).catch((e: Error) => error = e);

        this.setState((prevState: NodeDiagnosticsViewState) => {
            return ({
                result: error ? error : result,
                rpcId: ++prevState.rpcId
            });
        });
    }

    render(): JSX.Element {

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

        const methods: JSX.Element[] = rpcMethods.map((method: RpcMethod) => 
            <option key={method.name} value={method.name}>{method.name}</option>
        );
        const paramInputs: JSX.Element[] = this.state.selectedMethod.params ? 
            this.state.selectedMethod.params.map((value: Param, index: number) =>
                <div key={value.name} className='form-group'>
                    <small className='inputl-label'>{value.name}</small>
                    <input 
                        type='text'
                        className='form-control form-control-sm dark-input rpc-url input-output'
                        onChange={(e) => this.onParamChange(e, index)}
                        placeholder={JsonType[value.jsonType]}
                    >
                    </input>
                    { value.notice &&
                        <small className='text-muted'><p><i>{value.notice}</i></p></small>
                    }
                </div>
            ) :
            [];

        return <SplitPane className='scrollable hide-resizer' split='horizontal' defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        
                    </div>
                    <SplitPane 
                        className='scrollable hide-resizer empty-first-pane' 
                        split='horizontal'  
                        defaultSize={1} 
                        allowResize={false}
                    >
                        <div></div>
                        <SplitPane 
                            className='scrollable hide-resizer empty-first-pane  toolbar-pane' 
                            split='vertical'  
                            defaultSize={300} 
                            allowResize={false}
                        >
                            
                            <div className='h-100 w-100 toolbar'>
                                <div className='form node-diagnostics-form'>
                                    <div className='form-group'>
                         
                                        <select 
                                            onChange={this.onMethodChange} 
                                            className='custom-select custom-select-sm rpc-method-select'
                                        >
                                            {methods}
                                        </select> 
                                    </div>
                                    { this.state.selectedMethod && this.state.selectedMethod.notice &&
                                        <small className='text-muted'><p><i>{this.state.selectedMethod.notice}</i></p></small>
                                    }

                                    {paramInputs}
                                   
                                    <button 
                                        className={'btn btn-sm btn-outline-info'}
                                        onClick={this.onClickPlay}
                                    >
                                        Send
                                    </button>
                    
                                </div>
                            
                            </div>
                            <SplitPane 
                                className='scrollable hide-resizer empty-first-pane  toolbar-pane' 
                                split='vertical'  
                                defaultSize={1} 
                                allowResize={false}
                            >
                                <div></div>
                                <div>
                            
                                    <div className='container-fluid'>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <small>
                                                    <JSONTree data={this.state.result} theme={theme} invertTheme={false}/> 
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                            
                                </div>
                            </SplitPane>
                        </SplitPane>
                            
                    </SplitPane>
                </SplitPane>;
               
    }
    
}