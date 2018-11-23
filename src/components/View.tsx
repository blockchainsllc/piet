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

import * as Sol from '../solidity-handler/SolidityHandler';
import Web3Type from '../types/web3';
import { TabList } from './TabList';
import { InspectorContainerView } from './views/Inspector/InspectorContainerView';
import { GraphContainerView } from './views/Graph/GraphContainerView';
import { CodeContainerView } from './views/CodeContainerView';
import { EventCatcherView } from './views/EventCatcherView';
import { JsonView } from './views/JsonView';
import { FileBrowserView } from './views/FileBrowserView';
import { About } from './views/About';
import { MigrationAssistent } from './views/migration-assistent/MigrationAssistent';
import SplitPane from 'react-split-pane';
import { UICreationView } from './views/ui-creation/UICreationView';
import { UICreationHandling } from './views/ui-creation/UIStructure';

export enum TabEntityType {
    Structure,
    Graph,
    Code,
    EventCatcher,
    Json,
    FileBrowser,
    About,
    MigrationAssistent,
    UICreationView
}

export interface TabEntity {
    contentType: TabEntityType; 
    name: string;
    active: boolean;
    content: any;
    icon: string;
    removable: boolean;
}

interface ViewProps {
    selectedElement: Sol.NodeElement;
    changeActiveTab: Function;
    web3: Web3Type;
    contracts: Sol.Contract[];
    changeSelectedElement: Function;
    tabEntities: TabEntity[];
    activeTab: number[];
    addTabEntity: Function;
    viewId: number;
    markCode: Function;
    changeContractAddress: Function;
    getEvents: Function;
    contentChange: Function;
    submitFiles: Function;
    loading: boolean;
    removeTabEntity: Function;
    selectedContractName: string;
    removeContractToSelect: Function;
    globalErrors: Error[];
    selectedTabTypeForView: TabEntityType[];
    uiCreationHandling: UICreationHandling;
    
}

export class View extends React.Component<ViewProps, {}> {

    render(): JSX.Element {
        if (!this.props.tabEntities) {
            return null;
        }

        const tabNames: string[] = this.props.tabEntities.map((tabEntity: TabEntity) => tabEntity.name);
        const removable: boolean[]  = this.props.tabEntities.map((tabEntity: TabEntity) => tabEntity.removable);
        const tabIcons: string[]  = this.props.tabEntities.map((tabEntity: TabEntity) => tabEntity.icon);

        const contentType: TabEntityType = this.props.activeTab[this.props.viewId] !== null ?
             this.props.tabEntities[this.props.activeTab[this.props.viewId]].contentType : null;
        let content: JSX.Element;

        switch (contentType) {

            case TabEntityType.About:
                content =   <About />;
                break;

            case TabEntityType.Graph:
                content =   <GraphContainerView
                                removeContractToSelect={this.props.removeContractToSelect}
                                selectedContractName={this.props.selectedContractName}
                                selectedElement={this.props.selectedElement}
                                web3={this.props.web3}
                                contracts={this.props.contracts}
                                changeSelectedElement={this.props.changeSelectedElement}
                            />;
                break;

            case TabEntityType.Structure:
                content =   <InspectorContainerView
                                uiCreationHandling={this.props.uiCreationHandling}
                                selectedTabTypeForView={this.props.selectedTabTypeForView}
                                contracts={this.props.contracts}
                                changeContractAddress={this.props.changeContractAddress}
                                addTabEntity={this.props.addTabEntity}
                                markCode={this.props.markCode}
                                selectedElement={this.props.selectedElement}
                                web3={this.props.web3}
                                getEvents={this.props.getEvents}
                            />;
                break;

            case TabEntityType.Code:
                content =   <CodeContainerView 
                                key={'codeView' + this.props.activeTab[this.props.viewId]} 
                                activeTabId={this.props.activeTab[this.props.viewId]} 
                                tabEntities={this.props.tabEntities} 
                            />;
                break;

            case TabEntityType.EventCatcher:
                const contract: Sol.Contract = this.props.tabEntities[this.props.activeTab[this.props.viewId]].content.contract;
                const event: any = this.props.tabEntities[this.props.activeTab[this.props.viewId]].content.event;
                content =   <EventCatcherView 
                                contracts={this.props.contracts}
                                key={'eventCatcher' + this.props.activeTab[this.props.viewId] }
                                viewId={this.props.viewId}
                                tabId={this.props.activeTab[this.props.viewId]}
                                content={this.props.tabEntities[this.props.activeTab[this.props.viewId]].content}
                                contentChange={this.props.contentChange}
                                web3={this.props.web3}
                            />;
                break;
            
            case TabEntityType.Json:
            content =   <JsonView 
                            key={'eventCatcher' + this.props.activeTab[this.props.viewId] }
                            viewId={this.props.viewId}
                            tabId={this.props.activeTab[this.props.viewId]}
                            content={this.props.tabEntities[this.props.activeTab[this.props.viewId]].content}
                            web3={this.props.web3}
                        />;
            break;

            case TabEntityType.FileBrowser:
                content =   <FileBrowserView 
                                globalErrors={this.props.globalErrors}
                                key={'eventCatcher' + this.props.activeTab[this.props.viewId] }
                                viewId={this.props.viewId}
                                tabId={this.props.activeTab[this.props.viewId]}
                                content={this.props.tabEntities[this.props.activeTab[this.props.viewId]].content}
                                web3={this.props.web3}
                                submitFiles={this.props.submitFiles}
                                contracts={this.props.contracts}
                                loading={this.props.loading}
                            />;
                break;

            case TabEntityType.MigrationAssistent:
                content =   <MigrationAssistent 
                                key={'Migration Assistent'}
                                viewId={this.props.viewId}
                                tabId={this.props.activeTab[this.props.viewId]}
                                content={null}
                                web3={this.props.web3}
                                contracts={this.props.contracts}
                            />;
                break;
            
            case TabEntityType.UICreationView:
                content =   <UICreationView 
                                uiCreationHandling={this.props.uiCreationHandling}
                                key={'Migration Assistent'}
                                viewId={this.props.viewId}
                                tabId={this.props.activeTab[this.props.viewId]}
                                content={null}
                                web3={this.props.web3}
                           
                            />;
                break;
                                
            default:
                content = null;
        }
        
        return  <div className='h-100'>
                    <SplitPane split='horizontal' className='hide-resizer' defaultSize={50} allowResize={false} >
                        <div className='tabs-container h-100 w-100'>
                            <TabList 
                                removable={removable} 
                                removeTabEntity={this.props.removeTabEntity} 
                                viewId={this.props.viewId} 
                                activeTabId={this.props.activeTab[this.props.viewId]}
                                tabNames={tabNames}
                                tabIcons={tabIcons}
                                changeActiveTab={this.props.changeActiveTab}
                            />
                        </div>
                        <div>
                            
                            {content}
                        </div>
                    </SplitPane>
                </div>;   
  
    }
    
}