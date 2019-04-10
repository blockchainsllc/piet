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
import JSONTree from 'react-json-tree';
import SplitPane from 'react-split-pane';
import * as axios from 'axios';

import { BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';
import { rpcMethods } from './RPCMethods';

interface NodeDiagnosticsViewProps {
    blockchainConnection: BlockchainConnection;
    viewId: number;
    tabId: number;

}

export interface NodeDiagnosticsViewState {
    selectedMethod: string;
    rpcId: number;
    result: any;
    rpcUrl: string;
}

export class NodeDiagnosticsView extends React.Component<NodeDiagnosticsViewProps, NodeDiagnosticsViewState> {

    constructor(props: NodeDiagnosticsViewProps) {
        super(props);

        this.state = {
            selectedMethod: rpcMethods[0],
            rpcId: 0,
            result: null,
            rpcUrl: null
        };

        this.onClickPlay = this.onClickPlay.bind(this);
        this.onMethodChange = this.onMethodChange.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);

    }

    componentDidMount(): void {
        this.setState({
            rpcUrl: this.props.blockchainConnection.rpcUrl
        });
    }

    onUrlChange(e: any): void {
        e.persist();
        this.setState({
                rpcUrl: e.target.value
        });
    }

    async onMethodChange(event: any): Promise<void> {
        event.persist();

        this.setState({
                selectedMethod: event.target.value
        });
    }

    async onClickPlay(): Promise<void> {
        let error: any =  null;
        const result: any = await (axios as any).post(this.state.rpcUrl, {
            jsonrpc: '2.0',
            method: this.state.selectedMethod, 
            params: [], 
            id: this.state.rpcId
        }).catch(e => error = e);

        this.setState((prevState: NodeDiagnosticsViewState) => {
            return ({
                result: error ? error : result.data,
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

        const methods: JSX.Element[] = rpcMethods.map((method: string) => <option value={method}>{method}</option>);

        return <SplitPane className='scrollable hide-resizer' split='horizontal' defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        <div className='form-inline'>
                            <input 
                                type='url'
                                className='form-control form-control-sm dark-input rpc-url'
                                onChange={this.onUrlChange}
                                defaultValue={this.state.rpcUrl}
    
                            >
                            </input>
                            &nbsp;
                            <select 
                                onChange={this.onMethodChange} 
                                
                                className='custom-select custom-select-sm rpc-method-select'
                            >
                                {methods}
                                </select> 
                            &nbsp;
                            <button className={'btn btn-sm btn-outline-info'}
                                onClick={this.onClickPlay}>
                                <i className='fas fa-play'></i>
                            </button>
              
                        </div>
                        
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' 
                    split='horizontal'  defaultSize={1} allowResize={false} >
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
                </SplitPane>;
               
    }
    
}