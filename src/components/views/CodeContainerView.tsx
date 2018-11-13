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

import * as Sol from '../../solidity-handler/SolidityHandler'
import Web3Type from '../../types/web3'
import { TabEntity } from '../View'
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import SplitPane from 'react-split-pane'


interface CodeContainerViewProps {

    tabEntities: TabEntity[],
    activeTabId: number

    
}


export class CodeContainerView extends React.Component<CodeContainerViewProps, {}> {


    render() {
        return <SplitPane className='scrollable hide-resizer' split="horizontal"  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' split="horizontal"  defaultSize={1} allowResize={false} >
                        <div></div>
                        <div className='row'>
                            <div className='col-12'>
                                <AceEditor
                                mode='java'
                                theme='monokai'
                                name='UNIQUE_ID_OF_DIV'
                                value={this.props.tabEntities[this.props.activeTabId].content.source}
                                width='100%'
                                height='1000px'
                                highlightActiveLine={true}
                                readOnly={true}
                                markers={this.props.tabEntities[this.props.activeTabId].content.markers}
                                setOptions={{maxLines: Infinity}}/>
                            </div>
                        </div>
                    </SplitPane>
                </SplitPane>
               
  
    }
    
}