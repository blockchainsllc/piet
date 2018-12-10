
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
import { Element } from '../UIStructure';
import { ActionElement } from './ActionElement';
import Web3Type from '../../../../types/web3';
import { SelectElement } from './FunctionModal';

interface NavBarProps {
    actions: Element[];
    showMetaInformation: boolean;
    web3: Web3Type;
    selectFunctionElement: SelectElement;
}
export class NavBar extends React.Component<NavBarProps, {} > {

    render(): JSX.Element {

        const actions: JSX.Element[] = this.props.actions.map((element: Element) => 
            <ActionElement 
                key={element.contractAddress + element.functionName}
                element={element} 
                showMetaInformation={this.props.showMetaInformation} 
                web3={this.props.web3}
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