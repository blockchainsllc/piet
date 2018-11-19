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
import Web3Type from '../../types/web3';
import JSONTree from 'react-json-tree';
import SplitPane from 'react-split-pane';

interface JsonViewProps {
    web3: Web3Type;
    content: any;
    viewId: number;
    tabId: number;

}

export class JsonView extends React.Component<JsonViewProps, {}> {

    render(): JSX.Element {
        
        const theme: any = {
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

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                     
                    </div>
                    <SplitPane 
                        className='scrollable hide-resizer empty-first-pane'
                        split='horizontal'
                        defaultSize={1}
                        allowResize={false}
                    >
                        <div></div>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-12'>
                                    <small className='events-json-container'>
                                        {this.props.content ? 
                                            <JSONTree data={this.props.content} theme={theme} invertTheme={false}/> : null
                                        }
                                    </small>
                                </div>
                            </div>
                        </div>
                    </SplitPane>
                </SplitPane>;
               
    }
    
}