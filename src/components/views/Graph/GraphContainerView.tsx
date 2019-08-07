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

import * as Sol from '../../../solidity-handler/SolidityHandler';
import { GraphView } from './GraphView';
import SplitPane from 'react-split-pane';
import { Graph, GraphViewType } from './GraphGenerator';
import { BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';

interface GraphContainerViewProps {
    selectedElement: Sol.NodeElement;
    blockchainConnection: BlockchainConnection;
    contracts: Sol.Contract[];
    changeSelectedElement: Function;
    selectedContractName: string;
    removeContractToSelect: Function;
    graph: Graph;
    changeGraphView: Function;
    setGraph: Function;
    graphViewType: GraphViewType;
    loadedPietFileName: string;
}

interface GraphContainerViewState {
    graphScale: number;
}

export class GraphContainerView extends React.Component<GraphContainerViewProps, GraphContainerViewState> {

    constructor(props: GraphContainerViewProps) {
        super(props);
        this.state = {
            graphScale: 1
        };

        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
       
    }

    zoomOut(): void {
        if (this.props.graph) {
            this.setState((prevState: GraphContainerViewState) => ({
                graphScale: prevState.graphScale - 0.1 >= 0.1 ? prevState.graphScale - 0.1 : 0.1
            }));
        }   
    }

    zoomIn(): void {
        if (this.props.graph) {
            this.setState((prevState: GraphContainerViewState) => ({
                graphScale: prevState.graphScale + 0.1
            }));
        }
    }

    render(): JSX.Element {
        return  <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        <button 
                            title='Zoom Out'
                            className='btn btn-sm btn-outline-info'
                            onClick={this.zoomOut}
                        >
                            <i className='fa fa-minus' aria-hidden='true'></i>
                        </button>
                        &nbsp;
                        <button 
                            title='Zoom In'
                            className='btn btn-sm btn-outline-info' 
                            onClick={this.zoomIn}
                        >
                            <i className='fa fa-plus' aria-hidden='true'></i>
                        </button>
                        {/* &nbsp;
                        &nbsp;
                        &nbsp;
                        <button 
                            className={'btn btn-sm' + (this.props.graph &&  this.props.graphViewType === GraphViewType.Inheritance ? 
                                ' btn-info' : 
                                ' btn-outline-info'
                            )}
                            onClick={() => this.props.changeGraphView(GraphViewType.Inheritance)}
                        >
                            Inheritance
                        </button>
                        &nbsp;
                        <button 
                            className={'btn btn-sm' + (this.props.graph && this.props.graphViewType === GraphViewType.TypeResolution ? 
                                ' btn-info' : 
                                ' btn-outline-info'
                            )}
                            onClick={() => this.props.changeGraphView(GraphViewType.TypeResolution)}
                        >
                            References
                        </button> */}
                    </div>
                    <SplitPane 
                        className='scrollable hide-resizer empty-first-pane' 
                        split='horizontal'
                        defaultSize={1}
                        allowResize={false}
                    >
                        <div></div>
                        <GraphView 
                            setGraph={this.props.setGraph}
                            removeContractToSelect={this.props.removeContractToSelect}
                            graphScale={this.state.graphScale} 
                            changeSelectedElement={this.props.changeSelectedElement}
                            contracts={this.props.contracts}
                            selectedContractName={this.props.selectedContractName} 
                            graph={this.props.graph}
                            graphViewType={this.props.graphViewType}
                            loadedPietFileName={this.props.loadedPietFileName}
                        />
                    </SplitPane>
                </SplitPane>;
                   
    }
    
}