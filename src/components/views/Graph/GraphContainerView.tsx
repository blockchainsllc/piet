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
import Web3Type from '../../../types/web3';
import { GraphView, ViewType } from './GraphView';
import SplitPane from 'react-split-pane';

interface GraphContainerViewProps {
    selectedElement: Sol.NodeElement;
    web3: Web3Type;
    contracts: Sol.Contract[];
    changeSelectedElement: Function;
    selectedContractName: string;
    removeContractToSelect: Function;
}

interface GraphContainerViewState {
    graphScale: number;
    viewType: ViewType;
}

export class GraphContainerView extends React.Component<GraphContainerViewProps, GraphContainerViewState> {

    constructor(props: GraphContainerViewProps) {
        super(props);
        this.state = {
            viewType: ViewType.Inheritance,
            graphScale: 1
        };

        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.changeSubView = this.changeSubView.bind(this);
       
    }

    changeSubView(viewType: ViewType): void {
        this.setState({
            viewType: viewType
        });
    }

    zoomOut(): void {
        this.setState((prevState: GraphContainerViewState) => ({
            graphScale: prevState.graphScale - 0.1 >= 0.1 ? prevState.graphScale - 0.1 : 0.1
        }));
    }

    zoomIn(): void {
        this.setState((prevState: GraphContainerViewState) => ({
            graphScale: prevState.graphScale + 0.1
        }));
    }

    render(): JSX.Element {
        return  <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        <button 
                            title='Zoom Out'
                            className='btn btn-sm btn-outline-info'
                            onClick={() => this.zoomOut()}
                        >
                            <i className='fa fa-minus' aria-hidden='true'></i>
                        </button>
                        &nbsp;
                        <button 
                            title='Zoom In'
                            className='btn btn-sm btn-outline-info' 
                            onClick={() => this.zoomIn()}
                        >
                            <i className='fa fa-plus' aria-hidden='true'></i>
                        </button>
                        &nbsp;
                        &nbsp;
                        &nbsp;
                        <button 
                            className={'btn btn-sm' + (this.state.viewType === ViewType.Inheritance ? ' btn-info' : ' btn-outline-info')}
                            onClick={() => this.changeSubView(ViewType.Inheritance)}
                        >
                            Inheritance
                        </button>
                        &nbsp;
                        <button 
                            className={'btn btn-sm' + (this.state.viewType === ViewType.TypeResolution ? ' btn-info' : ' btn-outline-info')}
                            onClick={() => this.changeSubView(ViewType.TypeResolution)}
                        >
                            References
                        </button>
                    </div>
                    <SplitPane 
                        className='scrollable hide-resizer empty-first-pane' 
                        split='horizontal'
                        defaultSize={1}
                        allowResize={false}
                    >
                        <div></div>
                        <GraphView 
                            removeContractToSelect={this.props.removeContractToSelect}
                            graphScale={this.state.graphScale} 
                            changeSelectedElement={this.props.changeSelectedElement}
                            viewType={this.state.viewType}
                            contracts={this.props.contracts}
                            selectedContractName={this.props.selectedContractName} 
                        />
                    </SplitPane>
                </SplitPane>;
                   
    }
    
}