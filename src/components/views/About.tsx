/**
 *  This file is part of Piet.
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
                                        <SVG className='logo-svg' src='assets/Logo.svg' /> 
                                    </div>
                                </div>
                                <div className='col-md-2'> </div> 
                            </div>
                            <div className='row'>
                                <div className='col-md-2'> </div> 
                                <div className='col-md-8 help-text-container'>
                                    <h1 className='help-text text-muted'>Piet</h1>
                                    <p><small className='help-text text-muted'>
                                        
                                        <span className='badge badge-light'>
                                            <i className='fas fa-exclamation-triangle'></i> Not for poductive use

                                        </span>
                                        <br />
                                        Be aware that Piet has not yet undergone in-depth testing yet and may contain severe bugs.
                                    </small></p>
                                    <p><small className='help-text text-muted'>
                                        <strong>Getting started:</strong>&nbsp;
                                        Click <strong>"Load"</strong> to and select solidity files, truffle build files or a piet file.
                                    </small></p>
                                    
                                    <p>
                                        <small className='help-text text-muted'>
                                            <strong>Author:</strong> Heiko Burkhardt&nbsp;
                                            <a 
                                                className='text-muted'
                                                href='https://github.com/hai-ko'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                <i className='fas fa-external-link-square-alt'></i>
                                            </a>
                                            
                                        </small>
                                    </p>
                                    <p>
                                    <small className='help-text text-muted'>
                                            
                                            <a 
                                                className='text-muted'
                                                href='https://slock.it'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                Slock.it GmbH
                                            </a>
                                            
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