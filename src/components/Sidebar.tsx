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
import SVG  from 'react-inlinesvg';
import { TabEntityType } from './View';
import { checkBlockchainConnection, BlockchainConnection, ConnectionType } from '../solidity-handler/BlockchainConnector';

export interface SidebarProps { 
    submitFiles: Function;
    changeActiveTab: Function;
    isLoading: boolean;
    addTabEntity: Function;
    blockchainConnection: BlockchainConnection;
    
}

export interface SidebarState {
    loadContractFilesBoxIsShown: boolean;
    isConnectedToChain: boolean;
}

export class Sidebar extends React.Component<SidebarProps, SidebarState> {
    
    constructor(props: SidebarProps) {
        super(props);
        this.state = { 
            loadContractFilesBoxIsShown: false,
            isConnectedToChain: false
        };

        this.showLoadContractFilesBox = this.showLoadContractFilesBox.bind(this);
        this.showAbout = this.showAbout.bind(this);
        this.showMigrationAssistent = this.showMigrationAssistent.bind(this);
        this.showUICreationView = this.showUICreationView.bind(this);
        this.showConfiguration = this.showConfiguration.bind(this);
        this.showNodeDiagnostics = this.showNodeDiagnostics.bind(this);
        this.showTransactionHistory = this.showTransactionHistory.bind(this);
        this.showDocumentation = this.showDocumentation.bind(this);

    }

    componentDidMount(): void {
        this.checkConnection(this.props);
    }

    componentWillReceiveProps(props: SidebarProps): void {
        this.checkConnection(props);
    }

    checkConnection(props: SidebarProps): void {
        this.setState({
            isConnectedToChain: checkBlockchainConnection(props.blockchainConnection)
        });
    }

    showLoadContractFilesBox(show: boolean): void {
        this.setState({loadContractFilesBoxIsShown: show});
    }

    showAbout(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.About,
                name: 'About',
                content: null,
                icon: 'question-circle',
                removable: true
            }, 
                                1,
                                false);
    }

    showUICreationView(): void {
        this.props.addTabEntity({
            active: true,
            contentType: TabEntityType.UICreationView,
            name: 'UI Creation',
            content: null,
            icon: 'columns',
            removable: true
        }, 
                                1,
                                false);
    }

    showMigrationAssistent(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.MigrationAssistent,
                name: 'Migration Assistent',
                content: null,
                icon: 'random',
                removable: true
            }, 
                                1,
                                false);
    }

    showNodeDiagnostics(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.NodeDiagnostics,
                name: 'Node Diagnostics',
                content: null,
                icon: 'server',
                removable: true
            }, 
                                1,
                                false);
    }

    showTransactionHistory(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.TransactionHistory,
                name: 'Transaction History',
                content: null,
                icon: 'history',
                removable: true
            }, 
                                1,
                                false);
    }

    showConfiguration(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.Configuration,
                name: 'Configuration',
                content: null,
                icon: 'network-wired',
                removable: true
            }, 
                                0,
                                false);
    }

    showDocumentation(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.DocGenerator,
                name: 'Documentation',
                content: null,
                icon: 'book-open',
                removable: true
            }, 
                                1,
                                false);
    }

    

    render(): JSX.Element {

        let connectionTypeText: string =  null;

        if (this.state.isConnectedToChain) {
            switch (this.props.blockchainConnection.connectionType) {
                case ConnectionType.Injected:
                    connectionTypeText = 'inj.';
                    break;
                case ConnectionType.MainnetIncubed:
                    connectionTypeText = 'in3';
                    break;
                case ConnectionType.Rpc:
                    connectionTypeText = 'RPC';
                    break;
                case ConnectionType.WebSocketRPC:
                    connectionTypeText = 'wsRPC';
                    break;
                default:
                    connectionTypeText = null;
            }
        }
        

        return  <div className='sidebar h-100'>
                    <div className='row'>
                        <div className='col-sm text-center'>
                            <SVG className={'loader-logo ' + (this.props.isLoading ? 'loader-logo-loading' : '')} 
                            src='assets/Black_Logo.svg' /> 
                        </div>
                    </div>
                    
                    {/* <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg' 
                                    onClick={() => this.props.changeActiveTab(0, 0)}><i className='fas fa-copy'></i></a>
                            </div>
                        </div>
                    </div> 
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a  
                                    title='UI Creator'
                                    href='#' 
                                    className='btn btn-outline-secondary btn-lg' 
                                    onClick={this.showUICreationView}
                                >
                                    <i className='fas fa-columns'></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a 
                                    title='Migration Assistent'
                                    href='#' className='btn btn-outline-secondary btn-lg' 
                                    onClick={this.showMigrationAssistent}
                                >
                                    <i className='fas fa-random'></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg'>
                                    <i className='fas fa-users'></i></a>
                            </div>
                        </div>
                    </div>
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg' >
                                    <i className='fas fa-link'></i></a>
                            </div>
                        </div>
                    </div>
                    */}
                    <div className='first-btn sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                            <a 
                                href='#' className='btn btn-outline-secondary btn-lg' 
                                onClick={this.showNodeDiagnostics}
                                title='Node Diagnostics'
                            >
                                    <i className='fas fa-server'></i></a>
                            </div>
                        </div>
                    </div> 
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                            <a 
                                href='#' className='btn btn-outline-secondary btn-lg' 
                                onClick={this.showTransactionHistory}
                                title='Transaction History'
                            >
                                    <i className='fas fa-history'></i></a>
                            </div>
                        </div>
                    </div> 
  
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                            <a 
                                title='Documentation'
                                href='#' className='btn btn-outline-secondary btn-lg' 
                                onClick={this.showDocumentation}
                            >
                                    <i className='fas fa-book-open'></i></a>
                            </div>
                        </div>
                    </div> 
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a 
                                    title='About'
                                    href='#' className='btn btn-outline-secondary btn-lg' 
                                    onClick={this.showAbout}
                                >
                                    <i className='fas fa-question-circle'></i></a>
                            </div>
                        </div>
                    </div>    

                    <div className='to-bottom'>
                        <div className='sidebar-buttons-container text-center'>
                            <a 
                                title='Configuration'
                                href='#' 
                                className={
                                    'btn btn-outline-secondary btn-lg last-btn'  
                                    + (this.state.isConnectedToChain ? ' connected-color' : '')
                                }
                                onClick={this.showConfiguration}
                            >
                                <i className={'fas fa-network-wired' }></i> 
                            </a>
                            {
                                connectionTypeText ?
                                <div className='w-100 badge badge-success connection-badge'>
                                    {connectionTypeText}&nbsp;
                                    {
                                        this.props.blockchainConnection.netVersion ? 
                                        '0x' + parseInt(this.props.blockchainConnection.netVersion).toString(16) :
                                        '-'
                                    } 
                                    
                                </div> :
                                <div className='w-100 badge badge-warning connection-badge-small'>
                                    Disconnected
                                </div> 

                            }
                   
                            
                        </div>
                        </div>
                        <div>
                            
                        
                    </div>   
                </div>;
                                    
    }

}