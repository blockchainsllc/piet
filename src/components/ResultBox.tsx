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
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/styles/hljs'
import JSONTree from 'react-json-tree'

export interface ResultBoxProps {
    result: string,
    id: string,
    resultBoxIsShown: boolean,
    showResultBox: Function,
    name: string

}

export class ResultBox extends React.Component<ResultBoxProps, {}> {

    constructor(props) {
        super(props)

        this.hideResultBox = this.hideResultBox.bind(this)
    }

    hideResultBox() {
        this.props.showResultBox(false)
    }

    render() {
        const data = this.props.result ? JSON.parse(this.props.result) :  null

        const theme = {
            scheme: 'monokai',
            author: 'wimer hazenberg (http://www.monokai.nl)',
            base00: '#272822',
            base01: '#383830',
            base02: '#49483e',
            base03: '#75715e',
            base04: '#a59f85',
            base05: '#f8f8f2',
            base06: '#f5f4f1',
            base07: '#f9f8f5',
            base08: '#f92672',
            base09: '#fd971f',
            base0A: '#f4bf75',
            base0B: '#a6e22e',
            base0C: '#a1efe4',
            base0D: '#66d9ef',
            base0E: '#ae81ff',
            base0F: '#cc6633'
          };

        return  <div id={'resultModal' + this.props.id } 
                    className={'modal fade' + (this.props.resultBoxIsShown ? ' show force-show' : '')} 
                    role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                    <div className='modal-dialog modal-lg' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>
                                    {this.props.name}
                                </h5>
                                <button type='button' onClick={this.hideResultBox} 
                                    className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>
                            <div className='modal-body json-body'>
                
                                <small>
                                    {data ? <JSONTree data={data} theme={theme} invertTheme={true}/> : null }
                         
                                    
                                </small>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' onClick={this.hideResultBox} 
                                    className='btn btn-secondary' data-dismiss='modal'>
                                    Close
                                </button>
                        
                            </div>
                        </div>
                    </div>
                </div>

    }

}