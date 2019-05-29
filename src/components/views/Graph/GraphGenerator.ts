// tslint:disable-next-line:missing-jsdoc
import * as JointElements from './JointElements';
import * as joint from 'jointjs';
import * as SolidityHandler from '../../../solidity-handler/SolidityHandler';
import * as ReactDOM from 'react-dom';

export enum GraphViewType {
    Inheritance,
    TypeResolution
}

export interface Graph {
    graph: joint.dia.Graph;
    nodeIdNamePairs: JointElements.NodeNameIdPair[];
    inheritanceLinks: any[];
    otherLinks: any[];
}

export const getDefaultGraph: Function = (): Graph => {
    return {
        graph: new joint.dia.Graph(),
        nodeIdNamePairs: [],
        inheritanceLinks: [],
        otherLinks: []
    };
};

export function graphGenerator(
    contracts: SolidityHandler.Contract[], 
    viewType: GraphViewType,
    graph: Graph = getDefaultGraph()
): Graph {

    const nodes: any[] = [];

    contracts.forEach((contract: SolidityHandler.Contract) => {
            
        const contractNode: any = JointElements.contractNode(contract);
        const newContract: any = {
            nodeElement: contract,
            jointjsNode: contractNode,
            inheritanceLinks: [],
            otherLinks: []
        };
        graph.nodeIdNamePairs.push(newContract);
      
        nodes.push(contractNode);
        
        if (viewType === GraphViewType.Inheritance) {
            contract.enumerations.forEach((contractEnum: SolidityHandler.ContractEnumeration) =>  {
                const enumNode: any = JointElements.enumerationNode(contractEnum.shortName);
                nodes.push(enumNode);
                const link: any = JointElements.contractElementLink(enumNode.id.toString(), contractNode.id.toString());
                graph.nodeIdNamePairs.push({
                    jointjsNode: enumNode,
                    nodeElement: contractEnum,
                    inheritanceLinks: [],
                    otherLinks: [link]
                });
                newContract.otherLinks.push(link);
                
                graph.otherLinks.push(link);

                });
                
            contract.structs.forEach((contractStruct: SolidityHandler.ContractStruct) =>  {
                    const structNode: any = JointElements.structNode(contractStruct.shortName);
                    nodes.push(structNode);
                    
                    const link: any = JointElements.contractElementLink(structNode.id.toString(), contractNode.id.toString());
                    graph.nodeIdNamePairs.push({
                        nodeElement: contractStruct,
                        jointjsNode: structNode,
                        inheritanceLinks: [],
                        otherLinks: [link]
                    });
                    
                    newContract.otherLinks.push(link);
                    graph.otherLinks.push(link);
                    
            });
        }
        
    });

    if (viewType === GraphViewType.TypeResolution) {

        contracts.forEach((contract: SolidityHandler.Contract) => {
            graph.inheritanceLinks = graph.inheritanceLinks.concat(contract.references.map((generalContractName: string) => {
                const fromContract: JointElements.NodeNameIdPair = graph.nodeIdNamePairs
                    .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === contract.name);
                const toContract: JointElements.NodeNameIdPair = graph.nodeIdNamePairs
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

    if (viewType === GraphViewType.Inheritance) {
        contracts.forEach((contract: SolidityHandler.Contract) => {
            graph.inheritanceLinks = graph.inheritanceLinks.concat(contract.baseContracts.map((generalContractName: string) => {
                const fromContract: JointElements.NodeNameIdPair = graph.nodeIdNamePairs
                    .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === contract.name);
                const toContract: JointElements.NodeNameIdPair = graph.nodeIdNamePairs
                    .find((item: JointElements.NodeNameIdPair) => item.nodeElement.name === generalContractName);
                const link: any = JointElements
                    .inheritanceLink(fromContract.jointjsNode.id.toString(), toContract.jointjsNode.id.toString());
                fromContract.inheritanceLinks.push(link);
                toContract.inheritanceLinks.push(link);
                return link;
                
            }));
        
        });
    }
    
    nodes.forEach((node: any) => {
        node.attributes.size.width = 150;
        node.toFront();
    });

    graph.graph.addCells(nodes.concat(graph.inheritanceLinks).concat(graph.otherLinks));
    const graphBBox: joint.g.Rect  = joint.layout.DirectedGraph.layout(graph.graph, {
        nodeSep: 30,
        edgeSep: 30,
        ranker: 'network-simplex',  // tight-tree longest-path network-simplex
        rankDir: 'LR'
    });
    graph.inheritanceLinks.forEach((link: any) => link.toBack());
    graph.otherLinks.forEach((link: any) => link.toBack());

    return graph;

}

function findElement(graph: joint.dia.Graph, id: string): any {
    return graph.attributes.cells.models.find((model: any) => model.id === id);
}

export function extractElementsFromGraph(graph: Graph): Graph {
    return {
        graph: graph.graph,
        inheritanceLinks: graph.inheritanceLinks.map((link: any) => findElement(graph.graph, link.id)),
        nodeIdNamePairs: graph.nodeIdNamePairs.map((nodeIdNamePair: JointElements.NodeNameIdPair) => {
            nodeIdNamePair.jointjsNode = findElement(graph.graph, nodeIdNamePair.jointjsNode.id.toString());
            nodeIdNamePair.inheritanceLinks = nodeIdNamePair.inheritanceLinks.map((link: any) => findElement(graph.graph, link.id));
            nodeIdNamePair.otherLinks = nodeIdNamePair.otherLinks.map((link: any) => findElement(graph.graph, link.id));
            return nodeIdNamePair;
        }),
        otherLinks: graph.otherLinks.map((link: any) => findElement(graph.graph, link.id))
    };

}