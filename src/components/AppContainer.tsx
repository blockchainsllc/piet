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
import * as Sol from '../solidity-handler/SolidityHandler';
import * as queryString from 'query-string';
import { Sidebar } from './Sidebar';
import { View, TabEntity, TabEntityType } from './View';
import * as $ from 'jquery';
import SplitPane from 'react-split-pane';
import { getContracts, getPietContainer } from '../utils/GitHub';
import { withRouter } from 'react-router-dom';
import * as axios from 'axios';
import { UIStructure, UICreationHandling, Element } from './views/ui-creation/UIStructure';
import { UICreationView } from './views/ui-creation/UICreationView';
import { BlockchainConnection, ConnectionType, initBlockchainConfiguration } from '../solidity-handler/BlockchainConnector';
import { Graph, GraphViewType } from './views/Graph/GraphGenerator';
import * as PromiseFileReader from 'promise-file-reader';
import { ErrorHandling } from './shared-elements/ErrorInfoBox';

interface AppContainerState {
    contracts: Sol.Contract[];
    contractToSelect: string;
    contractToSelectAddress: string;
    selectedElement: Sol.NodeElement;
    isLaoding: boolean;
    tabEntities: TabEntity[][];
    activeTab: number[];
    globalErrorHandling: ErrorHandling;
    createdUIStructure: UIStructure;
    blockchainConnection: BlockchainConnection;
    graph: Graph;
    graphToLoad: Graph;
    graphViewType: GraphViewType;
    loadedPietFileName: string;
}

class AppContainer extends React.Component<{}, {}> {
    state: AppContainerState;

    constructor(props: any) {
        super(props);

        this.updateContractNames = this.updateContractNames.bind(this);
        this.changeSelectedElement = this.changeSelectedElement.bind(this);
        this.setIsLoading = this.setIsLoading.bind(this);
        this.addTabEntity = this.addTabEntity.bind(this);
        this.changeActiveTab = this.changeActiveTab.bind(this);
        this.markCode = this.markCode.bind(this);
        this.changeContractAddress = this.changeContractAddress.bind(this);
        this.getEvents = this.getEvents.bind(this);
        this.contentChange = this.contentChange.bind(this);
        this.removeTabEntity = this.removeTabEntity.bind(this);
        this.gotContractsFromGithub = this.gotContractsFromGithub.bind(this);
        this.removeContractToSelect = this.removeContractToSelect.bind(this);
        this.setUIStructure = this.setUIStructure.bind(this);
        this.addRow = this.addRow.bind(this);
        this.addElementToRow = this.addElementToRow.bind(this);
        this.addElementToAction = this.addElementToAction.bind(this);
        this.updateBlockchainConnection = this.updateBlockchainConnection.bind(this);
        this.addAccount = this.addAccount.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
        this.addTransactionToHistory = this.addTransactionToHistory.bind(this);
        this.changeGraphView = this.changeGraphView.bind(this);
        this.setGraph = this.setGraph.bind(this);
        this.loadFromConatinerFile = this.loadFromConatinerFile.bind(this);
        this.removeError = this.removeError.bind(this);

        this.state = {
            contracts: [],
            selectedElement: null,
            contractToSelect: null,
            contractToSelectAddress: null,
            isLaoding: false,
            globalErrorHandling: {
                errors: [],
                removeError: this.removeError

            },
            tabEntities: [[], []],
            activeTab: [null, null],
            createdUIStructure: {
                contracts: [],
                rows: [],
                actionElements: []
            },
            blockchainConnection: {
                connectionType: ConnectionType.None,
                rpcUrl: null,
                web3: null,
                updateBlockchainConnection: null,
                selectedAccount: null,
                selectAccount: this.selectAccount,
                addAccount: this.addAccount,
                addTransactionToHistory: this.addTransactionToHistory,
                useDefaultAccount: true,
                transactionHistory: [],
                netVersion: null
            },
            loadedPietFileName: null,
            graph: null,
            graphToLoad: null,
            graphViewType: GraphViewType.Inheritance
        };

    }

    setGraph(graph: Graph): void {
        this.setState({
            graph
        });
    }

    removeError(index: number): void {
        this.setState((prevState: AppContainerState) => {
            prevState.globalErrorHandling.errors.splice(index, 1);

            return {
                globalErrorHandling: prevState.globalErrorHandling
            };

        });
    }

    changeGraphView(graphViewType: GraphViewType): void {
        this.setState((prev: AppContainerState) => {
            return {
                graphViewType: graphViewType,
                graph: null
            };
        });

    }

    addTransactionToHistory(transaction: any): void {
        this.setState((prev: AppContainerState) => {
            prev.blockchainConnection.transactionHistory.push(transaction);
            return {
                blockchainConnection: prev.blockchainConnection
            };
        });
    }

    updateBlockchainConnection(blockchainConnection: BlockchainConnection): void {
        this.setState({
            blockchainConnection
        });
    }

    addRow(): void {
        this.setState((prev: AppContainerState) => {
            prev.createdUIStructure.rows.push({
                elements: []
            });

            return {
                createdUIStructure: prev.createdUIStructure
            };
        });
    }

    selectAccount(address: string): void {
        this.setState((prevState: AppContainerState) => {
            prevState.blockchainConnection.selectedAccount = address;
            prevState.blockchainConnection.useDefaultAccount = address ? false : true;
            return {
                blockchainConnection: prevState.blockchainConnection
            };
        });
    }

    addAccount(privateKey: string): void {
        
        this.setState((prev: AppContainerState) => {
            prev.blockchainConnection.web3.eth.accounts.wallet.clear();

            let address: string;
            try {
                address = prev.blockchainConnection.web3.eth.accounts.wallet.add(privateKey).address;
            } catch (e) {
                address = null;
                
            }
            
            return {
                blockchainConnection: prev.blockchainConnection
            };
        });
    }

    addElementToRow(rowIndex: number, element: Element): void {

        this.setState(
            (prev: AppContainerState) => {

                if (rowIndex >= 0) {
                    prev.createdUIStructure.rows[rowIndex].elements.push(element);
                } else {
                    prev.createdUIStructure.rows.push({
                        elements: [element]
                    });
                }
                
                return {
                    createdUIStructure: prev.createdUIStructure
                };
            }, 
            () => console.log(JSON.stringify(this.state.createdUIStructure))
        );
    }

    addElementToAction(element: Element): void {
  
        this.setState((prev: AppContainerState) => {

            prev.createdUIStructure.actionElements.push(element);
            
            return {
                createdUIStructure: prev.createdUIStructure
            };
        });
    }

    removeContractToSelect(): void {
        this.setState({
            contractToSelect: null
        });
    }

    contentChange(viewId: number, tabId: number, content: any): void {
        this.setState((prevState: AppContainerState) => {
            prevState.tabEntities[viewId][tabId].content = content;
            return {
                tabEntities: prevState.tabEntities
            };
        });
    }

    setUIStructure(uiStructure: UIStructure): void {
        this.setState({
            createdUIStructure: uiStructure
        });
    }
    
    changeContractAddress(newContractAddress: string, contractName: string): void {
      
        this.setState((prevState: AppContainerState) => {
            const contractIndex: number = prevState.contracts.findIndex((c: Sol.Contract) => c.name === contractName);
            if (contractIndex !== -1) {
                prevState.contracts[contractIndex].deployedAt = newContractAddress;
                prevState.selectedElement = prevState.contracts[contractIndex];
            }

            return {
                contracts: prevState.contracts,
                selectedElement: prevState.selectedElement
            };

        });
        
    }

    changeActiveTab(viewId: number, tabId: number): void {
        this.setState((prevState: AppContainerState) => {
            prevState.activeTab[viewId] = tabId;

            return {
                activeTab: prevState.activeTab
            };

        });
    }

    setIsLoading(isLoading: boolean): void {
        this.setState({isLaoding: isLoading});
    }

    async componentDidMount(): Promise<void> {

        this.initViews();
        const params: any = queryString.parse((this.props as any).location.search);

        const blockchainConnection: BlockchainConnection = await initBlockchainConfiguration(
            params.rpc,
            this.updateBlockchainConnection,
            this.addAccount,
            this.selectAccount,
            this.addTransactionToHistory
        );
        
        this.setState({
            blockchainConnection,
            contractToSelect: params.contract ? params.contract : null,
            contractToSelectAddress: params.contractAddress ? params.contractAddress : null
        
        });

        if (params.solFile) {
            try {
                const solFile: any = await (axios as any).get('https://eth.slock.it/api/file/' + params.solFile);

                this.gotContractsFromGithub([{
                    fileName: params.solFile + '.sol',
                    content: solFile.data[0].content
                }]);

            } catch (e) {
                this.addError(new Error('Can not get https://eth.slock.it/api/file/' + params.solFile));
            }
            
        } else if (params.containerSha) {
            this.setIsLoading(true);
            await getPietContainer(
                (params.gitHubUser as string),
                (params.gitHubRepo as string),
                this.loadFromConatinerFile, 
                params.containerSha as string
            );

        } else if (params.gitHubRepo) {
            
            this.setIsLoading(true);
            await getContracts(
                (params.gitHubUser as string),
                (params.gitHubRepo as string),
                this.gotContractsFromGithub, 
                params.subDir as string
            );
            
        } else if (params.container) {
            this.setIsLoading(true);
            const file: any = await (axios as any).get(params.container);
            this.loadFromConatinerFile(file.data, params.container);

        } 

        setTimeout(() => { 

            $('.animation-container').css('display', 'none');
            $('.non-animation-container').css('display', 'block');

        },         1);

    }

    addError(error: Error, operation?: string): void {
        this.setState((prevState: AppContainerState) => {
                prevState.globalErrorHandling.errors.push({
                    name: error.name,
                    message: error.message,
                    timestamp: Date.now().toString(),
                    operation: operation
                });

                return {
                    globalErrorHandling: prevState.globalErrorHandling
                };
        });
        this.setIsLoading(false);
    }

    gotContractsFromGithub(files: any, error?: Error): void {

        if (error) {
            this.addError(error);
    
        } else {
            try {
                const contracts: Sol.Contract[] = Sol.parseContent(files);
            
            
                const params: any = queryString.parse((this.props as any).location.search);
                const contractName: string = params.contract ? params.contract.toString() : null;
                const selectedContract: Sol.Contract = contracts.find((contract: Sol.Contract) => contract.name === contractName);
                if (selectedContract) {
                    selectedContract.deployedAt = params.contractAddress ? params.contractAddress as string : selectedContract.deployedAt;
                }

                this.setState({
                    contractToSelect: selectedContract ? selectedContract.name : null,
                    contracts: contracts
                });
                this.removeTabEntity('About');
            }  catch (e) {
                this.addError(e);
            }
            
        }

        this.setIsLoading(false);

    }

    loadFromConatinerFile(file: any, name: string): void {

        this.setState(
            {
                contracts: file.contracts,
                graph: file.graph,
                selectedElement: file.selectedElement,
                loadedPietFileName: name
            }, 
            () => {
                this.setIsLoading(false);
                this.removeTabEntity('About');
                this.changeActiveTab(0, 1);
          
            }
            
        );
        
    }

    async updateContractNames(selectorFiles: FileList): Promise<void> {
        if (selectorFiles.length === 1 && selectorFiles[0].name.endsWith('.piet.json')) {
            const file: any = JSON.parse(await PromiseFileReader.readAsText(selectorFiles[0]));
            this.loadFromConatinerFile(file, selectorFiles[0].name);
   
        } else {
 
            try {
                
                this.setState({selectedElement: null});
                this.setIsLoading(true);

                const contracts: Sol.Contract[] = await Sol.pushFiles(selectorFiles);

                this.setState((prev: AppContainerState) => ({
                    contracts,
                    graph: null,
                    loadedPietFileName: null
                }));
                this.setIsLoading(false);
                this.removeTabEntity('About');    
                this.changeActiveTab(0, 1);
            }  catch (e) {
                this.addError(e, 'Loading file');
            }

        }
    
    }

    removeTabEntity(tabName: string): void {
        
        let tabIndex: number = -1;

        const viewIndex: number = this.state.tabEntities.findIndex((tabEntities: TabEntity[]) => {
            tabIndex = tabEntities.findIndex((tabEntity: TabEntity) =>     
                tabEntity.name === tabName
            );
            return tabIndex !== -1;
        });

        if (tabIndex !== -1) {
            
            this.changeActiveTab(viewIndex, 0);
            this.setState((prevState: AppContainerState) => {
                
                prevState.tabEntities[viewIndex].splice(tabIndex, 1);

                return {
                    activeTab: prevState.activeTab,
                    tabEntities: prevState.tabEntities
                };
            });
        }
    }

    addTabEntity(tabEntity: TabEntity, viewId: number, replace: boolean): void {
        const index: number = this.state.tabEntities[viewId].findIndex((item: TabEntity) => item.name === tabEntity.name);

        if (index === -1) {
            this.setState((prevState: AppContainerState) => {
                const newIndex: number = prevState.tabEntities[viewId].push(tabEntity) - 1;
                if (tabEntity.active) {
                    prevState.activeTab[viewId] = newIndex;
                }

                return {
                    tabEntities: prevState.tabEntities,
                    activeTab: prevState.activeTab
                };
            });
        } else {
            this.setState((prevState: AppContainerState) => {
    
                prevState.activeTab[viewId] = index;

                if (replace) {            
                    prevState.tabEntities[viewId][index] = tabEntity;
                    return {
                        tabEntities: prevState.tabEntities,
                        activeTab: prevState.activeTab
                    };
                }

                return {
   
                    activeTab: prevState.activeTab
                };
            });
        }

    }

    getEvents(contract: Sol.Contract, event: Sol.ContractEvent, params: Sol.ContractFunctionParam[]): void {

        this.addTabEntity({
            active: true,
            contentType: TabEntityType.EventCatcher,
            name: event.name,
            content: {
                contract: contract,
                event: event,
                params: params
            },
            icon: 'bell',
            removable: true
           
        },                1, true);
    }

    markCode(start: number, end: number, contract: Sol.Contract): void {
        this.addTabEntity({
            active: true,
            contentType: TabEntityType.Code,
            name: contract.name,
            content: { 
                source: contract.source,
                marker: null
            },
            icon: 'code',
            removable: true
           
        },                1, false);

        const startLine: number = contract.source.substring(0, start).split('\n').length - 1;
        const endLine: number = startLine + contract.source.substring(start, end).split('\n').length;

        this.setState((prevState: AppContainerState) => {
            const tabEntityIndex: number = prevState.tabEntities[1].findIndex((tabEntity: TabEntity) => tabEntity.name === contract.name);
            prevState.tabEntities[1][tabEntityIndex].content.markers = [{
                startRow: startLine,
                startCol: 0,
                endRow: endLine,
                endCol: 0,
                className: 'ace_highlight-marker',
                type: 'background'
            }];
            return {
                tabEntities: prevState.tabEntities
            };

        });  

    }

    initViews(): void {

            const structureTab: TabEntity = {
                active: false,
                contentType: TabEntityType.Structure,
                name: 'Inspector',
                content: null,
                icon: 'stethoscope',
                removable: false
            };

            const fileTab: TabEntity = {
                active: true,
                contentType: TabEntityType.FileBrowser,
                name: 'Files',
                content: this.state.contracts,
                icon: 'copy',
                removable: false
            };

            const graphTab: TabEntity = {
                active: false,
                contentType: TabEntityType.Graph,
                name: 'Graph',
                content: null,
                icon: 'map',
                removable: false
            };

            const aboutTab: TabEntity = {
                active: true,
                contentType: TabEntityType.About,
                name: 'About',
                content: null,
                icon: 'question-circle',
                removable: true
            };

            this.setState((prevState: AppContainerState) => {
                prevState.tabEntities[0].push(fileTab);
                prevState.tabEntities[0].push(structureTab);
                prevState.tabEntities[1].push(aboutTab);
                prevState.tabEntities[1].push(graphTab);
                
                return {
                    tabEntities: prevState.tabEntities,
                    activeTab: [0, 0]
                };
            });

    }

    changeSelectedElement(selectedElement: Sol.NodeElement): void {
        this.changeActiveTab(0, 1);
        this.changeActiveTab(1, 0);

        this.setState({
            selectedElement: selectedElement,
            contractToSelect: selectedElement.name
        });
    }

    render(): JSX.Element {
        const selectedTabTypeForView: TabEntityType[] = this.state.tabEntities.map((tabs: TabEntity[], index: number) =>
             (this.state.tabEntities[index][this.state.activeTab[index]] ? 
                this.state.tabEntities[index][this.state.activeTab[index]].contentType : 
                null)
        );

        const uiCreationHandling: UICreationHandling = {
            addRow: this.addRow,
            setUIStructure: this.setUIStructure,
            uiStructure: this.state.createdUIStructure,
            addElementToRow: this.addElementToRow,
            addElementToAction: this.addElementToAction,
    
            ethAccount: this.state.blockchainConnection.selectedAccount
            
        };

        const params: any = queryString.parse((this.props as any).location.search);

        if (params.ui === 'true') {
            return <UICreationView 
                uiCreationHandling={uiCreationHandling}
                key={'Migration Assistent'}
                viewId={0}
                tabId={0}
                content={null}
                blockchainConnection={this.state.blockchainConnection}
                productiveMode={true}
            />;
        }

        return  <div>
                    <SplitPane split='vertical' minSize={400} defaultSize={550} >
                    
                        <SplitPane split='vertical'  defaultSize={70} allowResize={false} >
                                
                                <Sidebar 
                                    addTabEntity={this.addTabEntity}
                                    isLoading={this.state.isLaoding} 
                                    submitFiles={this.updateContractNames} 
                                    changeActiveTab={this.changeActiveTab}
                                    blockchainConnection={this.state.blockchainConnection}
                                />
                                <View
                                    loadedPietFileName={this.state.loadedPietFileName}
                                    setGraph={this.setGraph}
                                    graph={this.state.graph}
                                    changeGraphView={this.changeGraphView}
                                    uiCreationHandling={uiCreationHandling}
                                    selectedTabTypeForView={selectedTabTypeForView}
                                    globalErrorHandling={this.state.globalErrorHandling}
                                    removeContractToSelect={this.removeContractToSelect}
                                    selectedContractName={this.state.contractToSelect}
                                    removeTabEntity={this.removeTabEntity}
                                    loading={this.state.isLaoding}
                                    viewId={0}
                                    markCode={this.markCode}  
                                    activeTab={this.state.activeTab}
                                    tabEntities={this.state.tabEntities[0]}
                                    addTabEntity={this.addTabEntity}
                                    selectedElement={this.state.selectedElement}
                                    blockchainConnection={this.state.blockchainConnection} 
                                    changeContractAddress={this.changeContractAddress}
                                    changeSelectedElement={this.changeSelectedElement}
                                    contracts={this.state.contracts}
                                    changeActiveTab={this.changeActiveTab}
                                    getEvents={this.getEvents}
                                    contentChange={this.contentChange}
                                    submitFiles={this.updateContractNames}
                                    graphViewType={this.state.graphViewType}
                                />
                                    
                        </SplitPane>
                    
                            <View
                                loadedPietFileName={this.state.loadedPietFileName}
                                graphViewType={this.state.graphViewType}
                                setGraph={this.setGraph}
                                graph={this.state.graph}
                                changeGraphView={this.changeGraphView}
                                uiCreationHandling={uiCreationHandling}
                                selectedTabTypeForView={selectedTabTypeForView}
                                globalErrorHandling={this.state.globalErrorHandling}
                                removeContractToSelect={this.removeContractToSelect}
                                selectedContractName={this.state.contractToSelect}
                                removeTabEntity={this.removeTabEntity}
                                loading={this.state.isLaoding}
                                markCode={this.markCode}   
                                viewId={1}
                                activeTab={this.state.activeTab}
                                tabEntities={this.state.tabEntities[1]}
                                addTabEntity={this.addTabEntity}
                                selectedElement={this.state.selectedElement}
                                blockchainConnection={this.state.blockchainConnection} 
                                changeContractAddress={this.changeContractAddress}
                                changeSelectedElement={this.changeSelectedElement}
                                contracts={this.state.contracts}
                                changeActiveTab={this.changeActiveTab}
                                getEvents={this.getEvents}
                                contentChange={this.contentChange}
                                submitFiles={this.updateContractNames}
                            />
                
                    </SplitPane> 
                       
                </div>;

    }

}

export const App: any = withRouter(AppContainer);