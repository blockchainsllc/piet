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
import SplitPane from 'react-split-pane';
import AceEditor from 'react-ace';
import { SourceCode } from '../../../utils/Pattern';

export interface CodeTabViewProps {
    sourceCodes: SourceCode[];

}

// tslint:disable-next-line:function-name
export default function CodeTabView(props: CodeTabViewProps): JSX.Element {

    const [fileIndex, setFileIndex] = React.useState(0);

    const changeFile = (e: any): void => {
        setFileIndex(parseInt(e.target.value));
    };

    const files: JSX.Element[] = props.sourceCodes
        .map((source: SourceCode, index: number) => <option value={index} key={source.fileName}>{source.fileName}</option>);

 
    return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
        <div className='h-100 w-100 toolbar'>
        <div className='form-inline'>
                    <select 
                        className='custom-select custom-select-sm conf-select'
                        onChange={changeFile}
                    >
                        {files}
                    </select>

                </div>
        
        </div>
        <SplitPane 
            className='scrollable hide-resizer empty-first-pane' 
            split='horizontal'
            defaultSize={1}
            allowResize={false}
        >
            <div></div>
            { props.sourceCodes.length > 0 &&
                <AceEditor
                                
                    mode='java'
                    theme='monokai'
                    value={props.sourceCodes[fileIndex].content}
                    width='100%'
                    height='100%'
                    highlightActiveLine={true}
                    readOnly={true}
                />
            }
        </SplitPane>
    </SplitPane>;

}