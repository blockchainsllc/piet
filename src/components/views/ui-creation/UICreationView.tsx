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
import { EventTable } from './ui-elements/EventTable';
import { NavBar } from './ui-elements/NavBar';
import { FunctionModal } from './ui-elements/FunctionModal';
import * as PromiseFileReader from 'promise-file-reader';

interface UICreationViewProps {
    web3: Web3Type;
    content: any;
    viewId: number;
    tabId: number;
    uiCreationHandling: UICreationHandling;
    productiveMode: boolean;
}

interface UICreationViewState {
    showMetaInformation: boolean;
    results: string[];
    functionBoxIsShown: boolean;
    selectedFunctionElement: Element;
}

export class UICreationView extends React.Component<UICreationViewProps, UICreationViewState> {

    constructor(props: UICreationViewProps) {
        super(props);

        this.state = {
            showMetaInformation: true,
            results: [],
            functionBoxIsShown: false,
            selectedFunctionElement: null
        };

        this.toogleshowMetaInformation = this.toogleshowMetaInformation.bind(this);
        this.selectFunctionElement = this.selectFunctionElement.bind(this);
        this.loadUIFile = this.loadUIFile.bind(this);

    }

    selectFunctionElement(element: Element): void {

        this.setState({

            selectedFunctionElement: element
        });
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

    updateAll(props: UICreationViewProps): void {
        props.uiCreationHandling.uiStructure.rows
            .forEach((row: Row) => 
                row.elements.forEach((element: Element) => 
                    this.call(element.abi, element.contractAddress, element.functionName)
                )
            );
    }

    componentDidMount(): void {
        this.updateAll(this.props);
    }

    componentWillReceiveProps(props: UICreationViewProps): void {
        this.updateAll(props);
    }

    async loadUIFile(fileList: FileList): Promise<void> {

        const reader: FileReader = new FileReader();
        const fileContentPromises: any[] =  Array(fileList.length).fill(null)
            .map(async (item: any, index: number) => ({
                content: await PromiseFileReader.readAsText(fileList[index]),
                fileName: fileList[index].name
            }));

        if (fileContentPromises.length === 1) {
            const fileContents: any = await Promise.all(fileContentPromises);
            this.props.uiCreationHandling.setUIStructure(JSON.parse(fileContents[0].content));
  
        }
           
    }

    render(): JSX.Element {

        const rows: JSX.Element[] = this.props.uiCreationHandling.uiStructure.rows
            .map((row: Row, index: number) => {
                const elements: JSX.Element[] = row.elements.map((element: Element) => {
                    switch (element.elementType) {
                        case ElementType.ValueBox:
                            return <SingleValueBox 
                                key={element.contractAddress + element.functionName}
                                showMetaInformation={this.state.showMetaInformation}
                                lable={element.data} 
                                result={this.state.results[element.contractAddress + element.functionName] 
                                    && this.state.results[element.contractAddress + element.functionName] } 
                            />;
                        case ElementType.EventTable:
                            return <EventTable 
                                key={element.contractAddress + element.functionName}
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

        const createdUI: JSX.Element = <div style={{width: '100%'}}>
            <NavBar 
                web3={this.props.web3}
                showMetaInformation={this.state.showMetaInformation}
                actions={this.props.uiCreationHandling.uiStructure.actionElements}
                selectFunctionElement={this.selectFunctionElement}
            />
            
            <div className='container'>
                <FunctionModal 
                    web3={this.props.web3}
                    selectElement={this.selectFunctionElement}
                    selectedElement={this.state.selectedFunctionElement}
                />
                {rows}
            </div>
        </div>;

        if (this.props.productiveMode) {
            return createdUI;
        }
            
        return <SplitPane className='scrollable hide-resizer ui-creation-main' split='horizontal'  defaultSize={40} allowResize={false} >
            <div className='h-100 w-100 toolbar'>
                
                <button
                    title='Edit Mode' 
                    className={'btn btn-sm btn' + (this.state.showMetaInformation ? '' : '-outline') + '-info'}
                    onClick={this.toogleshowMetaInformation}
                >
                    <i className='fas fa-edit'></i>
                </button>
                &nbsp;
                &nbsp;
                &nbsp;
                {/* <button 
                    title='Create Value Box Container'
                    className='btn btn-sm btn-outline-info'
                    onClick={this.props.uiCreationHandling.addRow}
                >
                    New Row
                </button>
                &nbsp; */}
                <a 
                    download='ui.json'
                    href={'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.props.uiCreationHandling.uiStructure))}
                    title='Save UI File'
                    className='btn btn-sm btn-outline-info'
                >
                    Save
                </a>
                &nbsp;
     
                <label className={'btn btn-sm btn-outline-info load-ui'} title='Load UI File' htmlFor='ui-file'>Load</label>
                <input id='ui-file' className='files-input' type='file' onChange={(e) => this.loadUIFile(e.target.files)} />
                              
            </div>
            <SplitPane 
                className='scrollable hide-resizer empty-first-pane' 
                split='horizontal'  
                defaultSize={1} 
                allowResize={false} 
            >
                <div></div>
                {createdUI}
                
            </SplitPane>
                
        </SplitPane>;
               
    }
    
}