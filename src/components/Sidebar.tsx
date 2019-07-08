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

export interface SidebarProps { 
    submitFiles: Function;
    changeActiveTab: Function;
    isLoading: boolean;
    addTabEntity: Function;
    
}

export interface SidebarState {
    loadContractFilesBoxIsShown: boolean;
}

export class Sidebar extends React.Component<SidebarProps, {}> {
    state: SidebarState;
    
    constructor(props: SidebarProps) {
        super(props);
        this.state = { 
            loadContractFilesBoxIsShown: false
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
                icon: 'cog',
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
                    </div>*/}

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
                    {/*<div className='sidebar-buttons-container'>
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
                    <div className='sidebar-buttons-container'>
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
                                title='Configuration'
                                href='#' className='btn btn-outline-secondary btn-lg' 
                                onClick={this.showConfiguration}
                            >
                                    <i className='fas fa-cog'></i></a>
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

                    </div>;
                                    
    }

}