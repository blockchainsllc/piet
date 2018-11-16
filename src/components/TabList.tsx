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

        const tabs = this.props.tabNames.map((tab: string, index: number) => 
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