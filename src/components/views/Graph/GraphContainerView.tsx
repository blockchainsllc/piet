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
                        />
                    </SplitPane>
                </SplitPane>;
                   
    }
    
}