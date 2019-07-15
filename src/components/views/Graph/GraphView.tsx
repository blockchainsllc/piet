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
import * as joint from 'jointjs';
import * as ReactDOM from 'react-dom';
import * as SolidityHandler from '../../../solidity-handler/SolidityHandler';
import * as JointElements from './JointElements';
import { Graph, graphGenerator, getDefaultGraph, GraphViewType, extractElementsFromGraph } from './GraphGenerator';

interface GraphViewProps {
    contracts: SolidityHandler.Contract[];
    graphScale: number;
    changeSelectedElement: Function;
    selectedContractName: string;
    removeContractToSelect: Function;
    graph: Graph;
    setGraph: Function;
    graphViewType: GraphViewType;
}
export class GraphView extends React.Component<GraphViewProps, {}> {
    paper: any;
    model: any;
    inheritanceLinks: any;
    nodeIdNamePairs: any;
    otherLinks: any;

    constructor(props: GraphViewProps) {
        super(props);

        this.scale = this.scale.bind(this);
        this.storeGraph = this.storeGraph.bind(this);
        
    }

    componentDidMount(): void {
  
        this.update(this.props);

        if (this.props.selectedContractName) {
            this.highlightContract(null, this.props.selectedContractName);
            this.props.removeContractToSelect();
        }

    }

    hightlightNode(slectedNodeElement: any, node: any): void {
        switch (slectedNodeElement.elementType) {
            case SolidityHandler.ElementType.Contract:
                node.attr(JointElements.contractNodeHighlighted(slectedNodeElement));
                break;
            case SolidityHandler.ElementType.Enum:
                node.attr(JointElements.enumHighlighted(slectedNodeElement.shortName));
                break;
            case SolidityHandler.ElementType.Struct:
                node.attr(JointElements.structHighlighted(slectedNodeElement.shortName));
                break;
            default:
                
        }
    }

    highlightContract(cellView: any, contratName: any): void {

        const nodenodeIdNamePair: JointElements.NodeNameIdPair = this.nodeIdNamePairs
            .find((item: JointElements.NodeNameIdPair) =>
                cellView ? item.jointjsNode.id.toString() === cellView.model.id : item.nodeElement.name === contratName);
        const nodeName: string =  nodenodeIdNamePair ? nodenodeIdNamePair.nodeElement.name : undefined;
        const slectedNodeElement: SolidityHandler.NodeElement = this.findNodeElement(nodeName);
        if (slectedNodeElement) {
            this.inheritanceLinks.forEach((link: any) => { link.attr(JointElements.inheritanceLinkNotHighlighted); });
            this.otherLinks.forEach((link: any) => { link.attr(JointElements.otherLinkNotHighlighted); });
            this.props.changeSelectedElement(slectedNodeElement);
            
            this.nodeIdNamePairs.forEach((nodeIdNamePair: JointElements.NodeNameIdPair) =>
            this.unHightlightNode(nodeIdNamePair.nodeElement, nodeIdNamePair.jointjsNode));

            this.hightlightNode(slectedNodeElement, nodenodeIdNamePair.jointjsNode);
            
            nodenodeIdNamePair.inheritanceLinks.forEach((link: any) => { 
                link.attr(JointElements.inheritanceLinkHighlighted);
                link.toFront();
            });
            nodenodeIdNamePair.otherLinks.forEach((link: any) => { 
                link.attr(JointElements.otherLinkHighlighted);
                link.toFront();
                
            });
                    
        }
        
    }

    unHightlightNode(slectedNodeElement: any, node: any): void {
        switch (slectedNodeElement.elementType) {
            case SolidityHandler.ElementType.Contract:
                node.attr(JointElements.contractNodeNotHighlighted(slectedNodeElement));
                break;
            case SolidityHandler.ElementType.Enum:
                node.attr(JointElements.enumNotHighlighted(slectedNodeElement.shortName));
                break;
            case SolidityHandler.ElementType.Struct:
                node.attr(JointElements.structNotHighlighted(slectedNodeElement.shortName));
                break;
            default:
        }
    }

    findNodeElement(name: string): SolidityHandler.NodeElement {
        for (const contract of this.props.contracts) {
            if (contract.name === name) {
                return contract;
            }

            const enumResult: SolidityHandler.NodeElement = contract.enumerations
                .find((nodeElement: SolidityHandler.NodeElement) => nodeElement.name === name);
            if (enumResult !== undefined) {
                return enumResult;
            }

            const structResult: SolidityHandler.NodeElement = contract.structs
                .find((nodeElement: SolidityHandler.NodeElement) => nodeElement.name === name);
            if (structResult !== undefined) {
                return structResult;
            }

        } 
        return null;
        
    }

    componentWillReceiveProps(newProps: GraphViewProps): void {
        
        if (this.props.graphScale !== newProps.graphScale) {
            this.scale(newProps.graphScale);
        }

        if ((this.props.graph && !newProps.graph) || newProps.contracts.length === 0) {
            const defaultGraph: Graph = getDefaultGraph();
            this.paper = new joint.dia.Paper(
                {
                    el: ReactDOM.findDOMNode(this.refs.placeholder),
                    width: '100%',
                    height: 2000,
                    model: defaultGraph,
                    gridSize: 20
                    
                } as any
            );
        }
        
        if (
            (!this.props.graph && newProps.graph) || 
            (newProps.contracts.length > 0 && !newProps.graph) ||
            (
                (newProps.graph && this.props.graph) &&
                ((newProps.graph as any).pietFileName !== (this.props.graph as any).pietFileName)
            )
        ) {
            this.update(newProps);
        }
        
    }

    storeGraph(): void {
        this.props.setGraph({ 
            graph: this.model.toJSON(),
            inheritanceLinks: this.inheritanceLinks,
            otherLinks: this.otherLinks,
            nodeIdNamePairs: this.nodeIdNamePairs
        });
    }   

    update(props: GraphViewProps): void {
        
        const defaultGraph: Graph = getDefaultGraph();
    
        this.paper = new joint.dia.Paper(
            {
                el: ReactDOM.findDOMNode(this.refs.placeholder),
                width: '100%',
                height: 2000,
                model: defaultGraph.graph,
                gridSize: 20
                
            } as any
        );

        if (props.graph) {
            defaultGraph.graph.fromJSON(props.graph.graph);
            defaultGraph.nodeIdNamePairs = props.graph.nodeIdNamePairs;
            defaultGraph.otherLinks = props.graph.otherLinks;
            defaultGraph.inheritanceLinks = props.graph.inheritanceLinks;
        }

        const graph: Graph = props.graph ? 
            extractElementsFromGraph(defaultGraph) :
            graphGenerator(props.contracts, props.graphViewType, defaultGraph);
        
        this.model = graph.graph;
        this.nodeIdNamePairs = graph.nodeIdNamePairs;
        this.inheritanceLinks = graph.inheritanceLinks;
        this.otherLinks = graph.otherLinks;

        this.paper.on('cell:pointerdown', (cellView: any, evt: any, x: any, y: any) => { 
            this.highlightContract(cellView, null);
        });

        this.paper.on('element:pointerup', (cellView: any, evt: any, x: any, y: any) => { 
            this.storeGraph();
        });

        this.props.setGraph({ 
            graph: graph.graph.toJSON(),
            inheritanceLinks: graph.inheritanceLinks,
            otherLinks: graph.otherLinks,
            nodeIdNamePairs: graph.nodeIdNamePairs
        });

        this.scale(props.graphScale);
    
    }

    scale(factor: number): void {
        
        this.paper.scale(factor, factor);
        this.paper.fitToContent({
            padding: 40,
            gridWidth: 1,
            gridHeight: 1,
            allowNewOrigin: 'any'
        });

    }

    render(): JSX.Element {
        return  <div>  
                    <div className='graph-placeholder'>
                        <div   ref='placeholder'></div>
                    </div>
                </div>;
    }
    
}
