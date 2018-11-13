/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react'
import SVG  from 'react-inlinesvg'
import { TabEntityType } from './View'


export interface SidebarProps { 
    submitFiles: Function,
    changeActiveTab: Function,
    isLoading: boolean,
    addTabEntity: Function,
    
}

export interface SidebarState {
    loadContractFilesBoxIsShown: boolean
}

export class Sidebar extends React.Component<SidebarProps, {}> {
    state: SidebarState
    
    constructor(props) {
        super(props)
        this.state = { 
            loadContractFilesBoxIsShown: false
        }

        this.showLoadContractFilesBox = this.showLoadContractFilesBox.bind(this)
        this.showAbout = this.showAbout.bind(this)
        this.showMigrationAssistent = this.showMigrationAssistent.bind(this)

    }

    showLoadContractFilesBox(show: boolean) {
        this.setState({loadContractFilesBoxIsShown: show})
    }

    showAbout() {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.About,
                name: 'About',
                content: null,
                icon: 'question-circle',
                removable: true
            }, 
            1,
            false)
    }

    showMigrationAssistent() {
        this.props.addTabEntity({
                active: true,
                contentType: TabEntityType.MigrationAssistent,
                name: 'Migration Assistent',
                content: null,
                icon: 'random'
            }, 
            1,
            false)
    }

    render() {

        return  <div className='sidebar h-100'>
                    <div className='row'>
                        <div className='col-sm text-center'>
                            <SVG className={'loader-logo ' + (this.props.isLoading ? 'loader-logo-loading' : '')} 
                            src='assets/Black_Logo.svg' /> 
                        </div>
                    </div>
                    
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg' 
                                    onClick={() => this.props.changeActiveTab(0,0)}><i className='fas fa-copy'></i></a>
                            </div>
                        </div>
                    </div>
                    {/*<div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg' 
                                    onClick={this.showMigrationAssistent}><i className='fas fa-random'></i></a>
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
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg' >
                                    <i className='fas fa-cog'></i></a>
                            </div>
                        </div>
                    </div> */}
                    <div className='sidebar-buttons-container'>
                        <div className='row'>
                            <div className='col-sm text-center'>
                                <a href='#' className='btn btn-outline-secondary btn-lg' onClick={this.showAbout}>
                                    <i className='fas fa-question-circle'></i></a>
                            </div>
                        </div>
                    </div>

                    </div>
                                    
    }

}