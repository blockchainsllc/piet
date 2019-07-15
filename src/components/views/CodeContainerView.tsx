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

import { TabEntity } from '../View';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import SplitPane from 'react-split-pane';

interface CodeContainerViewProps {

    tabEntities: TabEntity[];
    activeTabId: number;

}

export class CodeContainerView extends React.Component<CodeContainerViewProps, {}> {

    render(): JSX.Element {
        return  (
        <SplitPane 
            className='scrollable hide-resizer'
            split='horizontal' 
            defaultSize={40} 
            allowResize={false}
            >
            <div className='h-100 w-100 toolbar'>
        
            </div>
            <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal' defaultSize={1} allowResize={false} >
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
        </SplitPane>);
               
    }
    
}