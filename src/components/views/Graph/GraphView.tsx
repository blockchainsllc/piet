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
import * as joint from 'jointjs';
import * as ReactDOM from 'react-dom';
import * as SolidityHandler from '../../../solidity-handler/SolidityHandler';
import { JointElements } from '../../../utils/JointElements';

export enum ViewType {
    Inheritance,
    TypeResolution
}
interface GraphViewProps {
    contracts: SolidityHandler.Contract[];
    changeSelectedElement: Function;
    graphScale: number;
    viewType: ViewType;
    selectedContractName: string;
    removeContractToSelect: Function;
}

export class GraphView extends React.Component<GraphViewProps, {}> {

    graph: joint.dia.Graph;
    paper: joint.dia.Paper;
    cells: any[];
    nodeIdNamePairs: JointElements.NodeNameIdPair[];
    inheritanceLinks: any[];
    otherLinks: any[];

    constructor(props: GraphViewProps) {
        super(props);
        
    }

    init(): void {
        this.graph = new joint.dia.Graph();

        this.paper = new joint.dia.Paper(
            {
                el: ReactDOM.findDOMNode(this.refs.placeholder),
                width: '100%',
                height: 2000,
                model: this.graph,
                gridSize: 20
                
            } as any
        );
    }

    componentDidMount(): void {
        
        this.init();
        this.initInteraction();
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

    initInteraction(): void {

        this.paper.on('cell:pointerdown', 
                      (cellView: any, evt: any, x: any, y: any) => { 
                        this.highlightContract(cellView, null);
                
            }
        );
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
        if (this.props.contracts !== newProps.contracts) {
            this.init();
            this.initInteraction();
            this.update(newProps);
        }
        if (this.props.viewType !== newProps.viewType) {
            this.init();
            this.initInteraction();
            this.update(newProps);
        }

    }

    update(props: GraphViewProps): void {
        
        this.nodeIdNamePairs = [];
        const nodes: any[] = [];
        this.inheritanceLinks = [];
        this.otherLinks = [];
     
        props.contracts.forEach((contract: SolidityHandler.Contract) => {
            
            const contractNode: any = JointElements.contractNode(contract);
            const newContract: any = {
                nodeElement: contract,
                jointjsNode: contractNode,
                inheritanceLinks: [],
                otherLinks: []
            };
            this.nodeIdNamePairs.push(newContract);
          
            nodes.push(contractNode);
            
            if (props.viewType === ViewType.Inheritance) {
                contract.enumerations.forEach((contractEnum: SolidityHandler.ContractEnumeration) =>  {
                    const enumNode: any = JointElements.enumerationNode(contractEnum.shortName);
                    nodes.push(enumNode);
                    const link: any = JointElements.contractElementLink(enumNode.id.toString(), contractNode.id.toString());
                    this.nodeIdNamePairs.push({
                        jointjsNode: enumNode,
                        nodeElement: contractEnum,
                        inheritanceLinks: [],
                        otherLinks: [link]
                    });
                    newContract.otherLinks.push(link);
                    
                    this.otherLinks.push(link);

                    });
                    
                contract.structs.forEach((contractStruct: SolidityHandler.ContractStruct) =>  {
                        const structNode: any = JointElements.structNode(contractStruct.shortName);
                        nodes.push(structNode);
                        
                        const link: any = JointElements.contractElementLink(structNode.id.toString(), contractNode.id.toString());
                        this.nodeIdNamePairs.push({
                            nodeElement: contractStruct,
                            jointjsNode: structNode,
                            inheritanceLinks: [],
                            otherLinks: [link]
                        });
                        
                        newContract.otherLinks.push(link);
                        this.otherLinks.push(link);
                        
                });
            }
            
        });

        if (props.viewType === ViewType.TypeResolution) {

            props.contracts.forEach((contract: SolidityHandler.Contract) => {
                this.inheritanceLinks = this.inheritanceLinks.concat(contract.references.map((generalContractName: string) => {
                    const fromContract: JointElements.NodeNameIdPair = this.nodeIdNamePairs
                        .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === contract.name);
                    const toContract: JointElements.NodeNameIdPair = this.nodeIdNamePairs
                        .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === generalContractName);

                    if (fromContract && toContract) {
                        const link: any = JointElements.inheritanceLink(
                            fromContract.jointjsNode.id.toString(),
                            toContract.jointjsNode.id.toString());
                        fromContract.inheritanceLinks.push(link);
                        toContract.inheritanceLinks.push(link);
                        return link;
                    } else {
                        return null;
                    }
                    
                })).filter((item: any) => item != null);

            });
        }

        if (props.viewType === ViewType.Inheritance) {
            props.contracts.forEach((contract: SolidityHandler.Contract) => {
                this.inheritanceLinks = this.inheritanceLinks.concat(contract.baseContracts.map((generalContractName: string) => {
                    const fromContract: JointElements.NodeNameIdPair = this.nodeIdNamePairs
                        .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === contract.name);
                    const toContract: JointElements.NodeNameIdPair = this.nodeIdNamePairs
                        .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === generalContractName);
                    const link: any = JointElements
                        .inheritanceLink(fromContract.jointjsNode.id.toString(), toContract.jointjsNode.id.toString());
                    fromContract.inheritanceLinks.push(link);
                    toContract.inheritanceLinks.push(link);
                    return link;
                    
                }));
            
            });
        }
        
        // const getMax = (max, cur) => Math.max(max, cur)
        // const maxWidth = nodes.map(node  => node.attributes.size.width).reduce(getMax, -Infinity)
        // nodes.forEach(node => node.attributes.size.width = Math.min(maxWidth, 160))
        
        nodes.forEach((node: any) => {
            node.attributes.size.width = 150;
            node.toFront();
        });

        this.graph.addCells(nodes.concat(this.inheritanceLinks).concat(this.otherLinks));
        const graphBBox: joint.g.Rect  = joint.layout.DirectedGraph.layout(this.graph, {
            nodeSep: 30,
            edgeSep: 30,
            ranker: 'network-simplex',  // tight-tree longest-path network-simplex
            rankDir: 'LR'
        });
        this.inheritanceLinks.forEach((link: any) => link.toBack());
        this.otherLinks.forEach((link: any) => link.toBack());

        this.scale(this.props.graphScale);
        
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