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
import { rpcMethods, RpcMethod, Param, JsonType, Category, EthereumjsUtilWrapper } from './RPCMethods';

interface ToolsViewProps {
    blockchainConnection: BlockchainConnection;
    viewId: number;
    tabId: number;

}

export interface ToolsViewState {
    selectedMethod: RpcMethod;
    rpcId: number;
    result: any;
    params: any[];
    category: Category;
    searchString: string;

}

export class ToolsView extends React.Component<ToolsViewProps, ToolsViewState> {

    constructor(props: ToolsViewProps) {
        super(props);

        this.state = {
            selectedMethod: null,
            rpcId: 0,
            result: {},
            params: [],
            category: Category.JsonRpcEth,
            searchString: ''
        };

        this.onClickPlay = this.onClickPlay.bind(this);
        this.onMethodChange = this.onMethodChange.bind(this);
        this.onParamChange = this.onParamChange.bind(this);
        this.onCategoryChange = this.onCategoryChange.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.getParams = this.getParams.bind(this);
    }

    componentDidMount(): void {
        this.setState(this.getParams(null, null, null).newState);

    }

    getParams(newSearchString: string, newCategory: string, newSelectedMethod: RpcMethod): any {
        const searchString = newSearchString === '' ? '' : newSearchString ? newSearchString : this.state.searchString;
        
        const filteredMethods: RpcMethod[] = searchString === '' ? 
            rpcMethods.filter((method: RpcMethod) => 
                method.category === (newCategory ? newCategory : this.state.category)
            ) :
            rpcMethods.filter((method: RpcMethod) => method.name.toUpperCase().includes(this.state.searchString.toUpperCase()));
        const selectedMethod = newSelectedMethod ? newSelectedMethod : filteredMethods.length >= 1 ? filteredMethods[0] : null;
        const category = newCategory ? Category[newCategory] : selectedMethod ? selectedMethod.category : null;
        
        return {
            filteredMethods,
            newState : {
                category,
                searchString,
                selectedMethod: selectedMethod,
                params: selectedMethod && selectedMethod.params ? Array(selectedMethod.params.length).fill(null) : []
            }
            
        };
    }

    async onSearchChange(event: any): Promise<void> {
        event.persist();
        this.setState(this.getParams(event.target.value, null, null).newState);
    }

    async onMethodChange(event: any): Promise<void> {
        event.persist();
        const rpcMethod: RpcMethod = rpcMethods.find((value: RpcMethod) => value.name === event.target.value);
        this.setState(this.getParams(null, null, rpcMethod).newState);
    }

    async onCategoryChange(event: any): Promise<void> {
        event.persist();
        this.setState(this.getParams(null, Category[event.target.value], null).newState);
    }

    onParamChange(event: any, index: number): void {
        event.persist();
        this.setState((prevState: ToolsViewState) => {
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
        this.setState((prevState: ToolsViewState) => {
            return ({
                result: {}
            });
        });

        let result: any;

        switch (this.state.category) {
            

            case Category.Web3jsAccount:
                result = await this.props.blockchainConnection.web3.eth.accounts[this.state.selectedMethod.name](...this.state.params);
                break;
            case Category.Web3jsUtils:
                result = await this.props.blockchainConnection.web3.utils[this.state.selectedMethod.name](...this.state.params);
                break;
            case Category.EthereumjsUtil:
                result = await EthereumjsUtilWrapper[this.state.selectedMethod.name](...this.state.params);
                break;

            default:
                result = await sendJSONRpcQuery(
                    this.props.blockchainConnection, 
                    {
                        jsonrpc: '2.0',
                        method: this.state.selectedMethod.name, 
                        params: this.state.params, 
                        id: this.state.rpcId
                    }
                ).catch((e: Error) => error = e);
        }

        this.setState((prevState: ToolsViewState) => {
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

        const categories: JSX.Element[] = Object.values(Category)
            .map((key: string) => <option value={key} key={key}>{Category[key]}</option>);
            
        const methods = this.getParams(null, null, null).filteredMethods.map((method: RpcMethod) => 
            <option key={method.name} value={method.name} >{method.name}</option>
        ); 
        const paramInputs: JSX.Element[] = this.state.selectedMethod && this.state.selectedMethod.params ? 
            this.state.selectedMethod.params.map((value: Param, index: number) =>
                <div key={value.name} className='form-group'>
                    <small className='inputl-label'>{value.name}</small>

                    {value.jsonType === JsonType.Json ?
                    <textarea 
                        className='form-control form-control-sm dark-input rpc-url input-output'
                        onChange={(e) => this.onParamChange(e, index)}
                        placeholder={JsonType[value.jsonType]}
                    >

                    </textarea>
                    
                    :
                        <input 
                            type='text'
                            className='form-control form-control-sm dark-input rpc-url input-output'
                            onChange={(e) => this.onParamChange(e, index)}
                            placeholder={JsonType[value.jsonType]}
                        >
                    </input>
                    }
                    
                    { value.notice &&
                        <small className='text-muted'><i>{value.notice}</i>&nbsp;</small>
                    }

                    { value.example &&
                        <small className='text-muted'><i>Example:</i><pre className='text-muted'>{value.example}</pre></small>
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
                            defaultSize={400} 
                            allowResize={false}
                        >
                            
                            <div className='h-100 w-100 toolbar'>
                                <div className='form node-tools-form'>
                                    <div className='form-group'>
                                        <input 
                                            type='text'
                                            className='tools-search form-control form-control-sm dark-input rpc-url input-output'
                                            onChange={(e) => this.onSearchChange(e)}
                                            placeholder='search'
                                        />
                                        {this.state.searchString === '' &&
                                            <select
                                                defaultValue={Category[this.state.category]}
                                                onChange={this.onCategoryChange} 
                                                className='custom-select custom-select-sm rpc-method-select rpc-method-select-category'
                                            >
                                                {categories}
                                            </select> 
                                        }
                         
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
                                    {this.state.selectedMethod &&
                                        <button 
                                            className={'btn btn-sm btn-outline-info'}
                                            onClick={this.onClickPlay}
                                        >
                                            Send
                                        </button>
                                    }
                    
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