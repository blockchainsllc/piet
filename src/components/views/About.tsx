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
import SplitPane from 'react-split-pane';

export class About extends React.Component<{}, {}> {

    render(): JSX.Element {
        return  <SplitPane 
                    className='scrollable hide-resizer'
                    split='horizontal' 
                    defaultSize={40}
                    allowResize={false}
                >
                    <div className='h-100 w-100 toolbar'>
        
                    </div>
                    <SplitPane
                        className='scrollable hide-resizer empty-first-pane'
                        split='horizontal'
                        defaultSize={1}
                        allowResize={false}
                    >
                        <div></div>
                        <div className='container text-center w-100'>
                            <div className='row'>
                                <div className='col-md-2'> </div> 
                                <div className='col-md-8 '>
                                    <div className='logo-container text-center'>
                                        <img src="assets/logo-icon.png" style={{width: '250px'}}/>
                                    </div>
                                </div>
                                <div className='col-md-2'> </div> 
                            </div>
                            <div className='row'>
                                <div className='col-md-2'> </div> 
                                <div className='col-md-8 help-text-container'>
                                    <h1 className='help-text text-muted'>Blockchains Piet</h1>
                                    <p><small className='help-text text-muted'>
                                        
                                        <span className='badge badge-light'>
                                            <i className='fas fa-exclamation-triangle'></i> Not for poductive use

                                        </span>
                                        <br />
                                        Blockchains Piet has not yet undergone in-depth testing and may contain serious bugs.
                                        <br />
                                        A list of known issues can be found at the&nbsp; 
                                        <strong>
                                            <a 
                                                className='text-muted' 
                                                href='https://github.com/slockit/piet'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                Piet GitHub repository
                                            </a>
                                        </strong>
                                        .

                                    </small></p>
                                    <br />
                                    <h5 className='help-text text-muted'>Getting started</h5> 
                                    <p><small className='help-text text-muted'>
                                        
                                     
                                        Click <strong>"Load"</strong> and select solidity files, truffle build files or a piet file.
                                        <br />
                                        <br />
                                        You can also load the following examples:

                                        <br />
                    
                                        <strong>
                                            <a 
                                                className='' 
                                                href='/?container=examples%2Fin3-export1581003982763.piet.json&rpc=https%3A%2F%2Frpc.slock.it%2Fmainnet%2Fparity-pruned'
                                            >
                                                in3 Contracts
                                            </a>
                                        </strong>
                                        <br />
                                        <strong>
                                            <a 
                                                className='' 
                                                href='/?container=examples%2Fgs111-export1581005493087.piet.json&rpc=https%3A%2F%2Frpc.slock.it%2Fmainnet%2Fparity-pruned'
                                            >
                                                GnosisSafe Contracts
                                            </a>
                                        </strong>
                                        
                                    </small></p>
                                    <br />

                                    <p>
                                        <small>
                                            <small className='help-text text-muted'>
                                                
                                                <a 
                                                    className='text-muted'
                                                    href='https://github.com/hai-ko'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    Heiko Burkhardt
                                                </a>
                                                &nbsp;-&nbsp;
                                                <a 
                                                    className='text-muted'
                                                    href='https://blockchains.com'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    Blockchains LLC
                                                </a>
                                                
                                            </small>
                                        </small>
                                    </p>
                   

                                </div>
                                <div className='col-md-2'> </div> 
                            </div>
                            
                        </div>
                    </SplitPane> 
                </SplitPane>; 
                       
    }
    
}