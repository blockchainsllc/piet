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
import SVG  from 'react-inlinesvg';
import { TabEntityType } from './View';
import { checkBlockchainConnection, BlockchainConnection, ConnectionType } from '../solidity-handler/BlockchainConnector';

export interface SidebarProps { 
    submitFiles: Function;
    changeActiveTab: Function;
    isLoading: boolean;
    addTabEntity: Function;
    blockchainConnection: BlockchainConnection;
    setShowFirstTab: Function;
    showFirstTab: boolean;
    
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
        this.showTools = this.showTools.bind(this);
        this.showTransactionHistory = this.showTransactionHistory.bind(this);
        this.showDocumentation = this.showDocumentation.bind(this);
        this.showPatternListView = this.showPatternListView.bind(this);
        this.toggleShowFirstTab = this.toggleShowFirstTab.bind(this);

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

    toggleShowFirstTab(): void {
        this.props.setShowFirstTab(!this.props.showFirstTab);
    }

    showAbout(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.About,
                name: 'About',
                content: null,
                icon: 'question-circle',
                removable: true,
                isLoading: true
            }, 
                                1,
                                false);
    }

    showPatternListView(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.PatternListView,
                name: 'Pattern',
                content: null,
                icon: 'chalkboard-teacher',
                removable: true,
                isLoading: true
                
            }, 
                                0,
                                false);
    }

    showUICreationView(): void {
        this.props.addTabEntity({
            active: true,
            contentType: TabEntityType.UICreationView,
            name: 'UI Creation',
            content: null,
            icon: 'columns',
            removable: true,
            isLoading: true
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
                removable: true,
                isLoading: true
            }, 
                                1,
                                false);
    }

    showTools(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.Tools,
                name: 'Tools',
                content: null,
                icon: 'tools',
                removable: true,
                isLoading: true
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
                removable: true,
                isLoading: true
            }, 
                                1,
                                false);
    }

    showConfiguration(): void {
        this.props.addTabEntity(
            {
                active: true,
                contentType: TabEntityType.Configuration,
                name: 'Configuration',
                content: null,
                icon: 'network-wired',
                removable: true,
                isLoading: true
            }, 
            0,
            false
        );
        this.props.setShowFirstTab(true);
    }

    showDocumentation(): void {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.DocGenerator,
                name: 'Documentation',
                content: null,
                icon: 'book-open',
                removable: true,
                isLoading: true
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
        
        let netVersion: string = this.props.blockchainConnection.netVersion ? 
        '0x' + (parseInt(this.props.blockchainConnection.netVersion).toString(16)) :
        '-';

        netVersion = netVersion.length >= 6 ? netVersion.substr(0, 3) + '..' + netVersion.substr(netVersion.length - 2) : netVersion;

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
                                href='#' className={'btn btn' + (!this.props.showFirstTab ? '-outline' : '') + '-secondary btn-lg'}
                                onClick={this.toggleShowFirstTab}
                                title='Side View'
                            >
                                    <i className='fas fa-window-maximize fa-rotate-270'></i></a>
                            </div>
                        </div>
                    </div> 
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                            <a 
                                href='#' className='btn btn-outline-secondary btn-lg' 
                                onClick={this.showTools}
                                title='Tools'
                            >
                                    <i className='fas fa-tools'></i></a>
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
                    {/* <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a 
                                    title='Pattern'
                                    href='#' className='btn btn-outline-secondary btn-lg' 
                                    onClick={this.showPatternListView}
                                >
                                    <i className='fas fa-chalkboard-teacher'></i></a>
                            </div>
                        </div>
                    </div> */}
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
                                    {connectionTypeText + ' ' + netVersion} 
                                    
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