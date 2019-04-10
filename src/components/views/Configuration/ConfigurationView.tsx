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
import * as Sol from '../../../solidity-handler/SolidityHandler';
import SplitPane from 'react-split-pane';
import { BlockchainConnection, ConnectionType, changeBlockchainConfiguration } from '../../../solidity-handler/BlockchainConnector';

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

}

export class ConfigurationView extends React.Component<ConfigurationViewProps, ConfigurationViewState> {

    constructor(props: ConfigurationViewProps) {
        super(props);
     
        this.state = {
            newBlockchainConnection: null,
            accounts: [],
            showAddUserView: false,
            newPrivateKey: null
        };
        this.onConnectionTypeChange = this.onConnectionTypeChange.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.updateAccounts = this.updateAccounts.bind(this);
        this.toggleUserView = this.toggleUserView.bind(this);
        this.addAccount = this.addAccount.bind(this);
        this.onPrivateKeyChange = this.onPrivateKeyChange.bind(this);
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

    async componentDidMount(): Promise<void> {
        this.setState({
            newBlockchainConnection: this.props.blockchainConnection
        });
        this.updateAccounts(this.props);

    }

    async componentWillReceiveProps(newProps: ConfigurationViewProps): Promise<void> {
        this.setState({
            newBlockchainConnection: newProps.blockchainConnection
        });
        this.updateAccounts(newProps);
    }

    async updateAccounts(props: ConfigurationViewProps): Promise<void> {

        if (props.blockchainConnection && props.blockchainConnection.web3) {
            await props.blockchainConnection.web3.eth.personal.getAccounts()
            this.setState({
                accounts: await props.blockchainConnection.web3.eth.getAccounts()
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

    async onSubmit(): Promise<void> {
        this.props.blockchainConnection.updateBlockchainConnection(
            await changeBlockchainConfiguration(this.state.newBlockchainConnection)
        );
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

        const memWallet: any = this.props.blockchainConnection.web3.eth.accounts.wallet;
        const memAccounts: string[] = [];
        for (let i: number = 0; i < memWallet.length; i++) {
            memAccounts.push(memWallet[i].address);
        }

        const accounts: JSX.Element[] = this.state.accounts.concat(memAccounts).map((account: string) => 
            <button
                className={'list-group-item account-list-element' 
                    + (account === this.props.blockchainConnection.selectedAccount ? ' selected-account' : ' text-muted')} 
                key={account}
                onClick={() => this.props.blockchainConnection.selectAccount(account)}
            >
                {account}
            </button>
        );

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                    {this.state.newBlockchainConnection &&
                            
                            <div className='form-inline'>
                                <select 
                                    onChange={this.onConnectionTypeChange} 
                                    defaultValue={this.props.blockchainConnection.connectionType}
                                    className='custom-select custom-select-sm conf-select'
                                >
                                    {conntectionType}
                                </select>
                                &nbsp;

                                {(this.state.newBlockchainConnection.connectionType === ConnectionType.Rpc || 
                                    this.state.newBlockchainConnection.connectionType === ConnectionType.WebSocketRPC
                                ) && 
                                    
                                        <input 
                                            type='url'
                                            className='form-control form-control-sm dark-input rpc-url'
                                            onChange={this.onUrlChange}
                                            defaultValue={this.state.newBlockchainConnection.rpcUrl}
                
                                        >
                                        </input>
                              
                                }
                                    &nbsp;
                                    <button className='btn btn-sm btn-outline-info' onClick={this.onSubmit}>Connect</button>
                                    &nbsp;&nbsp;&nbsp;
                                    <button 
                                        className={'btn btn-sm btn' + (this.state.showAddUserView ? '' : '-outline') + '-info'} 
                                        onClick={this.toggleUserView}
                                    >
                                        <i className='fas fa-user-plus'></i>
                                    </button>
                            </div>
                        }
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal'  defaultSize={1} allowResize={false}>
                        <div></div>
                        <div >
                            {this.state.showAddUserView &&
                                <div className='container user-add-container'>
                                    <div className='form-inline'>
                                    
                                        <input 
                                            type='text'
                                            className='form-control form-control-sm dark-input'
                                            defaultValue={this.state.newPrivateKey}
                                            onChange={this.onPrivateKeyChange}
                                        
                                        >
                                        
                                        </input>
                                        &nbsp;
                                        <button className='btn btn-sm btn-outline-info' onClick={this.addAccount}>Add</button>
                                    </div>
                                </div>
                            }
                            <div className='container'>
                                <small>
                                    <div className='list-group list-group-flush account-list'>
                                        <button
                                            className={'list-group-item account-list-element' 
                                                + (this.props.blockchainConnection.useDefaultAccount ? 
                                                    ' selected-account' : ' text-muted')} 
                                            key={'defaultAccount'}
                                            onClick={() => this.props.blockchainConnection.selectAccount(null)}
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