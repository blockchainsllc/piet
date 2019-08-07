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

interface TabListProps {
    tabNames: string[];
    activeTabId: number;
    changeActiveTab: Function;
    viewId: number;
    tabIcons: string[];
    removable: boolean[];
    removeTabEntity: Function;
 
}

interface TabListState {
    showCross: boolean[];

}

export class TabList extends React.Component<TabListProps, TabListState> {

    constructor(props: TabListProps) {
        super(props);
        this.state = {
            showCross: []
        };

        this.closeTab = this.closeTab.bind(this);

    }

    componentDidMount(): void {
        this.setState({
            showCross: Array(this.props.tabNames.length).fill(false)
        });

        this.isInFocus = this.isInFocus.bind(this);
    }

    isInFocus(inFocus: boolean, index: number): void {
        this.setState((prevState: TabListState) => {
            
            prevState.showCross[index] = inFocus;

            return {
                showCross: prevState.showCross
            };
        });
    }

    closeTab(e: any, tabName: string): void {
        e.stopPropagation();
        this.props.removeTabEntity(tabName);
    }
 
    render(): JSX.Element {

        const tabs: JSX.Element[] = this.props.tabNames.map((tab: string, index: number) => 
            <li key={tab} className='nav-item nav-tab-item'>
                <span>
                    <a 
                        onMouseOver={() => this.isInFocus(true, index)}
                        onMouseLeave={() => this.isInFocus(false, index)}
                        onClick={() => this.props.changeActiveTab(this.props.viewId, index)}
                        className={'no-radius nav-link' + (this.props.activeTabId === index ? ' active' : '') } 
                        href='#'
                    >
                            <i className={'fas fa-' + this.props.tabIcons[index]}></i> {tab} 
                            &nbsp;&nbsp;
                            {this.props.removable[index] && this.state.showCross[index] && 
                                <span onClick={(e) => this.closeTab(e, this.props.tabNames[index])}>
                                    <i className='fas fa-times'></i>
                                </span>
                            } 
                    </a>
                </span>
            </li>);

        return  <ul className='nav nav-tabs'>
                    {tabs}
                </ul>;
                    
    }

}