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
import SplitPane from 'react-split-pane';
import { GraphContainerView, GraphContainerViewProps } from '../Graph/GraphContainerView';
import { DocGeneratorView } from '../documentatin-generator/DocGeneratorView';
import { Contract, parseContent } from '../../../solidity-handler/SolidityHandler';
import { patternToMarkdown, Pattern } from '../../../utils/Pattern';
import { GraphViewType, Graph } from '../Graph/GraphGenerator';
import CodeTabView from '../CodeTabView/CodeTabView';
import { deployContract, BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface PatternViewProps {
    content: Pattern;
    graphContainerViewProps: GraphContainerViewProps;
    blockchainConnection: BlockchainConnection;
    setIsLoading: Function;
    isLoading: boolean;

}

// tslint:disable-next-line:function-name
export default function PatternView(props: PatternViewProps): JSX.Element {

    const [contracts, setContracts] = React.useState<Contract[]>([]);
    const [graph, setGraph] = React.useState<Graph>(null);
    const id = props.content ? props.content.id : null;
    React.useEffect(
        () => {
            
            const loadedContracts: Contract[] = props.content.sourceCodes.length > 0 ? parseContent(props.content.sourceCodes) : [];
            setContracts(loadedContracts);
            setGraph(null);
            
        },
        [id]
    );

    const tags: JSX.Element[] = props.content.tags.map((tag: string) => 
        <span key={tag}>&nbsp;
            <small><span className='badge badge-secondary' >{tag}</span></small>
        </span>
    );

    const deploy = async (): Promise<void> => {
        props.setIsLoading(true);
        for (let i: number = 0; i < props.content.deploymentData.length; i++) {
            const result = await deployContract(props.content.deploymentData[i], props.blockchainConnection);
            setContracts((prevContracts: Contract[]) => {
                
                const mappedContract = prevContracts.find((contract: Contract) => 
                    contract.name === props.content.deploymentData[i].contractName
                );

                if (mappedContract) {
                    mappedContract.deployedAt = result.contractAddress;
                }
                
                return prevContracts;
            });
        }
        props.setIsLoading(false);
        
    };
 
    return <SplitPane className='scrollable hide-resizer' split='horizontal' defaultSize={40} allowResize={false} >
        <div className='h-100 w-100 toolbar'>
            <div className='d-flex w-100 justify-content-between full-block'>
                <div>
                    {props.content.deploymentData.length > 0 && !props.isLoading &&
                        <button 
                            title='Deploy Pattern Example'
                            className='btn btn-sm btn-outline-info'
                            onClick={deploy}
                        >
                            Deploy Example
                        </button>
                    }
                    
                </div>
                <div>{tags}</div>
            </div>
        </div>
        <SplitPane 
            className='scrollable hide-resizer empty-first-pane' 
            split='horizontal'  
            defaultSize={1} 
            allowResize={false}
        >
            <div></div>
            <SplitPane 
                className='scrollable  empty-first-pane  toolbar-pane' 
                split='vertical'  
                defaultSize={600} 
                allowResize={true}
            >
                <SplitPane 
                    className='scrollable  empty-first-pane  toolbar-pane' 
                    split='horizontal'  
                    defaultSize={200} 
                    allowResize={true}
                >
                    
                    <GraphContainerView 
                        blockchainConnection={props.graphContainerViewProps.blockchainConnection}
                        changeGraphView={null}
                        changeSelectedElement={props.graphContainerViewProps.changeSelectedElement}
                        contracts={contracts}
                        graph={graph}
                        graphViewType={GraphViewType.Inheritance}
                        selectedContractName={props.graphContainerViewProps.selectedContractName}
                        setGraph={setGraph}
                        loadedPietFileName={null}
                        selectedElement={props.graphContainerViewProps.selectedElement}
                        removeContractToSelect={props.graphContainerViewProps.removeContractToSelect}
                    />
                    <SplitPane 
                        className='scrollable hide-resizer empty-first-pane  toolbar-pane' 
                        split='vertical'  
                        defaultSize={1} 
                        allowResize={false}
                    >
                        <div></div>
                        <DocGeneratorView content={patternToMarkdown(props.content, false)} />
                    
                    </SplitPane>

                </SplitPane>
                    
                <SplitPane 
                    className='scrollable hide-resizer empty-first-pane  toolbar-pane' 
                    split='vertical'  
                    defaultSize={1} 
                    allowResize={false}
                >
                    <div></div>
                    
                    <CodeTabView sourceCodes={props.content.sourceCodes} />
                        
                </SplitPane>
            </SplitPane>
                
        </SplitPane>
    </SplitPane>;

}