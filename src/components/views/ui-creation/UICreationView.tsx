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
import Web3Type from '../../../types/web3';
import SplitPane from 'react-split-pane';
import { UICreationHandling, Row, Element, ElementType } from './UIStructure';
import { SingleValueBox } from './ui-elements/SingleValueBox';
import { url } from 'inspector';
import { EventTable } from './ui-elements/EventTable';

interface UICreationViewProps {
    web3: Web3Type;
    content: any;
    viewId: number;
    tabId: number;
    uiCreationHandling: UICreationHandling;
}

interface UICreationViewState {
    showMetaInformation: boolean;
    results: string[];
}

export class UICreationView extends React.Component<UICreationViewProps, UICreationViewState> {

    constructor(props: UICreationViewProps) {
        super(props);

        this.state = {
            showMetaInformation: true,
            results: []
        };
        this.toogleshowMetaInformation = this.toogleshowMetaInformation.bind(this);

    }

    toogleshowMetaInformation (): void {
        this.setState((prevState: UICreationViewState) => ({showMetaInformation: !prevState.showMetaInformation}));
    }

    async call(abi: any, contractAddress: string, functionName: string): Promise<void> {

        const contract: any = new this.props.web3.eth.Contract(abi, contractAddress);

        let result: any; 
        try {
            result = await contract.methods[functionName]().call();
            result = typeof result === 'object' ? JSON.stringify(result) : result.toString();
        } catch (e) {
            result = e;
        }  

        this.setState((prev: UICreationViewState) => {
            prev.results[contractAddress + functionName] = result.toString();
            return {
                reuslts: prev.results
            } as any;
        });
    }

    updateAll(): void {
        this.props.uiCreationHandling.uiStructure.rows
            .forEach((row: Row) => 
                row.elements.forEach((element: Element) => 
                    this.call(element.abi, element.contractAddress, element.functionName)
                )
            );
    }

    componentDidMount(): void {
        this.updateAll();
    }

    componentWillReceiveProps(): void {
        this.updateAll();
    }

    render(): JSX.Element {

        const rows: JSX.Element[] = this.props.uiCreationHandling.uiStructure.rows
            .map((row: Row, index: number) => {
                const elements: JSX.Element[] = row.elements.map((element: Element) => {
                    switch (element.elementType) {
                        case ElementType.ValueBox:
                            return <SingleValueBox 
                                showMetaInformation={this.state.showMetaInformation}
                                lable={element.data} 
                                result={this.state.results[element.contractAddress + element.functionName] 
                                    && this.state.results[element.contractAddress + element.functionName] } 
                            />;
                        case ElementType.EventTable:
                            return <EventTable 
                                showMetaInformation={this.state.showMetaInformation}
                                element={element}
                                web3={this.props.web3}
                            />;
                        default:
                            return null;
                    }
                });

                return <div key={'row' + index} className='ui-creation-row'>
                    {this.state.showMetaInformation &&
                     <div className='row'>
                        <div className='col-sm'>
                            <span className='badge badge-info'>Row {index}</span>
                        </div>
      
                    </div>
                    }
                    <div className='row'>
           
                        {elements}
                    </div>
                </div>;
 
            }); 
            
        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
        <div className='h-100 w-100 toolbar'>
            
            <button
                title='Edit Mode' 
                
                className={'btn btn-sm btn' + (this.state.showMetaInformation ? '' : '-outline') + '-info'}
                onClick={this.toogleshowMetaInformation}
            >
                <i className='fas fa-edit'></i>
            </button>
            &nbsp;
            <button 
                title='Create Value Box Container'
                className='btn btn-sm btn-outline-info'
                onClick={this.props.uiCreationHandling.addRow}
            >
                New Row
            </button>
        </div>
        <SplitPane 
            className='scrollable hide-resizer empty-first-pane  ui-creation-main' 
            split='horizontal'
            defaultSize={1}
            allowResize={false}
        >
        <div className='container'>
            {rows}
        </div>
            
        </SplitPane>
    </SplitPane>;
               
    }
    
}