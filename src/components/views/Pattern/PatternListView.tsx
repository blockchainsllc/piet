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

import { ElementType, Contract, NodeElement, parseContent } from '../../../solidity-handler/SolidityHandler';

import { TabEntityType } from '../../View';
import { examplePattern, Pattern, getPattern } from '../../../utils/Pattern';

export interface PatternListViewProps {
    addTabEntity: Function;
}

// tslint:disable-next-line:function-name
export default function PatternListView(props: PatternListViewProps): JSX.Element {
    const pattern: Pattern[] = getPattern();
    
    const uniqueTags: String[] = [...new Set<String>([].concat.apply(['All'], pattern.map((aPattern: Pattern) => aPattern.tags)))];
    const uniqueTagElements: JSX.Element[] = uniqueTags.map((tag: string, index: number) => <option value={index} key={tag}>{tag}</option>);

    const [filterTagIndex, setFilterTagIndex] = React.useState(0);
    
    const changeFilter = (e: any) => {
        setFilterTagIndex(parseInt(e.target.value));
    };

    const patternToShow = filterTagIndex === 0 ? pattern : pattern.filter((filterPattern: Pattern) => 
        filterPattern.tags.find((tag: string) => tag === uniqueTags[filterTagIndex])
    );

    const showPatternView = (index: number): void => {
        props.addTabEntity(
            {
                active: true,
                contentType: TabEntityType.PatternView,
                name: pattern[index].title,
                content: pattern[index],
                icon: 'chalkboard-teacher',
                removable: true,
                isLoading: true
            }, 
            1,
            false
        );
    };

    const patternListEntries: JSX.Element[] = patternToShow.map((mappedPattern: Pattern, index: number) => {
        const tags: JSX.Element[] = mappedPattern.tags.map((tag: string) => 
            <span key={tag}>&nbsp;
                <span className='badge badge-secondary' >{tag}</span>
            </span>
        );
        return <button
            className={'list-group-item account-list-element text-muted'} 
            key={mappedPattern.id}
            onClick={() => showPatternView(index)}
        >
            {mappedPattern.title} {tags}
        </button>;

    });
        
    return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
        <div className='h-100 w-100 toolbar'>
  
            <div className='d-flex w-100 justify-content-between'>
                <div className='form-inline'>
                    <select 
                        className='custom-select custom-select-sm conf-select'
                        onChange={changeFilter}
                    >
                        {uniqueTagElements}
                    </select>

                </div>
                <div className='form-inline'>
                        
                </div>
            </div>
        </div>
        <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal'  defaultSize={1} allowResize={false}>
            <div></div>
            <div >
                
                <div className='container'>
                    <small>
                        <div className='list-group list-group-flush account-list'>
                            
                            {patternListEntries}
                        </div>
                    </small>
                </div>       
            </div>
        </SplitPane>
    </SplitPane>;

}