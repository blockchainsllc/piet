
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
import { Element, UICreationHandling } from '../UIStructure';
import { ActionElement } from './ActionElement';
import { SelectElement } from './FunctionModal';
import { BlockchainConnection } from '../../../../solidity-handler/BlockchainConnector';

interface NavBarProps {
    actions: Element[];
    showMetaInformation: boolean;
    blockchainConnection: BlockchainConnection;
    selectFunctionElement: SelectElement;
    uiCreationHandling: UICreationHandling;
}

interface NavBarState {
    privateKey: string;
}
export class NavBar extends React.Component<NavBarProps, NavBarState > {

    

    constructor(props: NavBarProps) {
        super(props);

        this.state = {
            privateKey: null
        };


       

    }




    

    render(): JSX.Element {

        

        

        
        const actions: JSX.Element[] = this.props.actions.map((element: Element) => 
            <ActionElement 
                key={element.contractAddress + element.functionName}
                element={element} 
                showMetaInformation={this.props.showMetaInformation} 
                blockchainConnection={this.props.blockchainConnection}
                selectFunctionElement={this.props.selectFunctionElement}
            />
            );

        return <nav className='navbar sticky-top navbar-dark bg-primary navbar-expand-lg'>
            <a className='navbar-brand' href='#'>
                {this.props.showMetaInformation && <span><span className='badge badge-light'>NavBar</span>&nbsp;</span>}
                New UI
            </a>
            <button 
                className='navbar-toggler' 
                type='button' 
                data-toggle='collapse' 
                data-target='#navbarSupportedContent' 
                aria-controls='navbarSupportedContent' 
                aria-expanded='false' 
                aria-label='Toggle navigation'
            >
                <span className='navbar-toggler-icon'></span>
            </button>
         
            <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                <ul className='navbar-nav mr-auto'>
                    {actions.length > 0 &&
                        <li className='nav-item dropdown'>
                            <a 
                                className='nav-link dropdown-toggle'
                                href='#' id='navbarDropdown'
                                role='button'
                                data-toggle='dropdown'
                                aria-haspopup='true'
                                aria-expanded='false'
                            >
                                Actions
                            </a>
                            <div className='dropdown-menu' aria-labelledby='navbarDropdown'>
                                {actions}
                            </div>
                        </li>
                    }
                
                </ul>
 
            </div>
        </nav>;
    }
    
}