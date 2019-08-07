/**
 *   This file is part of Piet.
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
import * as Sol from '../../../solidity-handler/SolidityHandler';
import SplitPane from 'react-split-pane';
import { 
    BlockchainConnection,
    ConnectionType,
    changeBlockchainConfiguration,
    checkBlockchainConnection 
} from '../../../solidity-handler/BlockchainConnector';
import { ErrorHandling, ErrorInfoBox } from '../../shared-elements/ErrorInfoBox';

interface ConfigurationViewProps {
    blockchainConnection: BlockchainConnection;
    content: any;
    viewId: number;
    tabId: number;
    contracts: Sol.Contract[];
    loading: boolean;

}

interface ConfigurationViewState {
    newBlockchainConnection: BlockchainConnection;
    accounts: string[];
    showAddUserView: boolean;
    newPrivateKey: string;
    errorHandling: ErrorHandling;

}

export class ConfigurationView extends React.Component<ConfigurationViewProps, ConfigurationViewState> {

    constructor(props: ConfigurationViewProps) {
        super(props);
        
        this.onConnectionTypeChange = this.onConnectionTypeChange.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.updateAccounts = this.updateAccounts.bind(this);
        this.toggleUserView = this.toggleUserView.bind(this);
        this.addAccount = this.addAccount.bind(this);
        this.onPrivateKeyChange = this.onPrivateKeyChange.bind(this);
        this.removeError = this.removeError.bind(this);
        this.addError = this.addError.bind(this);
     
        this.state = {
            newBlockchainConnection: null,
            accounts: [],
            showAddUserView: false,
            newPrivateKey: null,
            errorHandling: {
                errors: [],
                removeError: this.removeError
            }
        };

    }

    removeError(index: number): void {
        this.setState((prevState: ConfigurationViewState) => {
            prevState.errorHandling.errors.splice(index, 1);

            return {
                errorHandling: prevState.errorHandling
            };

        });
    }

    onPrivateKeyChange(event: any): void {
        event.persist();

        this.setState({
            newPrivateKey: event.target.value
        });

    }

    addAccount(event: any): void {
        this.props.blockchainConnection.addAccount(this.state.newPrivateKey);
        this.setState({
            newPrivateKey: null,
            showAddUserView: false
        });
    }

    toggleUserView(): void {
        this.setState({
            showAddUserView: !this.state.showAddUserView
        });
    } 

    componentDidMount(): void {
        this.update(this.props);
    }

    componentWillReceiveProps(newProps: ConfigurationViewProps): void {
        this.update(newProps);
    }

    update(props: ConfigurationViewProps): void {
        
        this.setState(
            {
                newBlockchainConnection: props.blockchainConnection
            },
            () => this.updateAccounts(props.blockchainConnection)
        );
    }

    async updateAccounts(blockchainConnection: BlockchainConnection): Promise<void> {
        if (
            checkBlockchainConnection(this.props.blockchainConnection)
        ) {
            this.setState({
                accounts: await blockchainConnection.web3.eth.getAccounts()
            });
        }
    }

    onUrlChange(e: any): void {
        e.persist();
        this.setState((pervState: ConfigurationViewState) => {
            pervState.newBlockchainConnection.rpcUrl = e.target.value;
            return {
                newBlockchainConnection: pervState.newBlockchainConnection
            };
        });
    }

    onConnectionTypeChange(event: any): void {
        event.persist();
      
        this.setState((prevState: ConfigurationViewState) => {
            prevState.newBlockchainConnection.connectionType = event.target.value as ConnectionType;
            return {
                newBlockchainConnection: prevState.newBlockchainConnection
            };
        });
    }

    addError(error: Error, operation?: string): void {
        this.setState((prevState: ConfigurationViewState) => {
                prevState.errorHandling.errors.push({
                    name: error.name,
                    message: error.message,
                    timestamp: Date.now().toString(),
                    operation: operation
                });

                return {
                    errorHandling: prevState.errorHandling
                };
        });
    }

    async onSubmit(): Promise<void> {

            const blockchainConnetctionOrError: {blockchainConnection: BlockchainConnection; error: any} =
                 await changeBlockchainConfiguration(this.state.newBlockchainConnection);

            this.props.blockchainConnection.updateBlockchainConnection(blockchainConnetctionOrError.blockchainConnection);
            if (blockchainConnetctionOrError.error) {
                this.addError(blockchainConnetctionOrError.error);
            }
            
    }

    connectionTypeToLabel(connectionType: ConnectionType): string {
        switch (connectionType) {
            case ConnectionType.None:
                return 'None';
            case ConnectionType.Injected:
                return 'Injected';
            case ConnectionType.MainnetIncubed:
                return 'Incubed (Mainnet)';
            case ConnectionType.Rpc:
                return 'RPC';
            case ConnectionType.WebSocketRPC:
                return 'RPC (WebSocket)';
            default:
                return 'Unknown';
        } 
    }

    render(): JSX.Element {

        const conntectionType: JSX.Element[] = Object.keys(ConnectionType).map((enumString: string) => 
            <option value={ConnectionType[enumString]} key={enumString}>
                {this.connectionTypeToLabel(ConnectionType[enumString])}
            </option>
        );
        const memAccounts: string[] = [];

        if (this.props.blockchainConnection.web3) {

            const memWallet: any = this.props.blockchainConnection.web3.eth.accounts.wallet;

            if (memWallet.length > 0) {
                for (let i = 0; i < memWallet.length; i++) {
                    const wallet = memWallet[i];
                    memAccounts.push(wallet.address);
                }
            } 
        }

        const accounts: JSX.Element[] = this.state.accounts.concat(memAccounts).map((account: string) => 
            <button
                className={'list-group-item account-list-element' 
                    + (account === this.props.blockchainConnection.selectedAccount ? ' selected-account' : ' text-muted')} 
                key={account}
                onClick={(): void => this.props.blockchainConnection.selectAccount(account)}
            >
                {account}
            </button>
        );

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                    {this.state.newBlockchainConnection &&
                            <div className='d-flex w-100 justify-content-between'>
                                <div className='form-inline'>
                                    <select 
                                        onChange={this.onConnectionTypeChange} 
                                        value={this.props.blockchainConnection.connectionType}
                                        className='custom-select custom-select-sm conf-select'
                                    >
                                        {conntectionType}
                                    </select>
                                    &nbsp;
                                        &nbsp;
                                        <button className='btn btn-sm btn-outline-info' onClick={this.onSubmit}>Connect</button>
                                  
                                </div>
                                <div className='form-inline'>
                                        <button 
                                            className={'btn btn-sm btn' + (this.state.showAddUserView ? '' : '-outline') + '-info'} 
                                            onClick={this.toggleUserView}
                                        >
                                            <i className='fas fa-user-plus'></i>
                                        </button>
                                </div>
                            </div>
                        
                           
                        }
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal'  defaultSize={1} allowResize={false}>
                        <div></div>
                        <div >
                            
                            {   this.state.newBlockchainConnection &&
                                (this.state.newBlockchainConnection.connectionType === ConnectionType.Rpc ||
                                this.state.newBlockchainConnection.connectionType === ConnectionType.WebSocketRPC) &&
                                <div className='container user-add-container'>
                                    <div className='form-inline'>
                                    
                                        <input 
                                            type='url'
                                            className='form-control form-control-sm dark-input rpc-url input-output w-100'
                                            onChange={this.onUrlChange}
                                            defaultValue={this.state.newBlockchainConnection.rpcUrl}
                
                                        >
                                        </input>
                                    </div>
                                </div>
                            }
                            {this.state.showAddUserView &&
                                <div>
                                    <div className='container user-add-warning'>
                                        <small>
                                            <span className='badge badge-light'>
                                                <i className='fas fa-exclamation-triangle'></i>&nbsp;
                                                Only enter private keys which are exclusively used for testing purposes. 

                                            </span>
                                        </small>
                                    </div>
                                    <div className='container user-add-container'>
                       
                                        <div className='form-inline input-group'>
                                            
                                            <input 
                                                type='text'
                                                className='form-control form-control-sm dark-input input-output'
                                                placeholder='Private key'
                                                onChange={this.onPrivateKeyChange}
                                            >
                                                
                                            </input>
                                            <div className='input-group-append'>
                                                <button className='btn btn-sm btn-outline-info' onClick={this.addAccount}>Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            <ErrorInfoBox errorHandling={this.state.errorHandling}/>
                            <div className='container'>
                                <small>
                                    <div className='list-group list-group-flush account-list'>
                                        <button
                                            className={'list-group-item account-list-element' 
                                                + (this.props.blockchainConnection.useDefaultAccount ? 
                                                    ' selected-account' : ' text-muted')} 
                                            key={'defaultAccount'}
                                            onClick={(): void => this.props.blockchainConnection.selectAccount(null)}
                                        >
                                            Default Account
                                        </button>
                                        {accounts}
                                    </div>
                                </small>
                            </div>       
                        </div>
                    </SplitPane>
                </SplitPane>;
               
    }
}