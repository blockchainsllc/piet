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
import SplitPane from 'react-split-pane'

export class About extends React.Component<{}, {}> {

    render() {
        return  <SplitPane className='scrollable hide-resizer' split="horizontal"  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
           
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' split="horizontal"  defaultSize={1} allowResize={false} >
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
                                    <p><small className='help-text text-muted'>Click <strong>"Choose Files"</strong> to get started.</small></p>
                                    <p><small className='help-text text-muted'>This is a beta release.</small></p>
                                    <p>
                                        <small className='help-text text-muted'>
                                            <strong>Author:</strong> Heiko Burkhardt&nbsp;
                                            <a className='text-muted' href='https://github.com/hai-ko' target='_blank' rel='noopener noreferrer' >
                                                <i className='fas fa-external-link-square-alt'></i>
                                            </a>
                                        </small>
                                    </p>
                                </div>
                                <div className='col-md-2'> </div> 
                            </div>
                            
                        </div>
                    </SplitPane> 
                </SplitPane> 
                       
    }
    
}