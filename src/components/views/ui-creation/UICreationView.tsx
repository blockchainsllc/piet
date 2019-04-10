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
import SVG  from 'react-inlinesvg';
import { BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';

interface UICreationViewProps {
    blockchainConnection: BlockchainConnection;
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
        this.updateAll = this.updateAll.bind(this);

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
        
        const contract: any = new this.props.blockchainConnection.web3.eth.Contract(abi, contractAddress);

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


    updateAllProps(props: UICreationViewProps): void {
        props.uiCreationHandling.uiStructure.rows
            .forEach((row: Row) => 
                row.elements.forEach((element: Element) => 
                    this.call(element.abi, element.contractAddress, element.functionName)
                )
            );
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
        this.updateAllProps(this.props);
    }

    componentWillReceiveProps(props: UICreationViewProps): void {
        this.updateAllProps(props);
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

        const devMode: boolean = this.state.showMetaInformation && !this.props.productiveMode;

        const rows: JSX.Element[] = this.props.uiCreationHandling.uiStructure.rows
            .map((row: Row, index: number) => {
                const elements: JSX.Element[] = row.elements.map((element: Element) => {
                    switch (element.elementType) {
                        case ElementType.ValueBox:
                            return <SingleValueBox 
                                key={element.contractAddress + element.functionName}
                                showMetaInformation={devMode}
                                lable={element.data} 
                                result={this.state.results[element.contractAddress + element.functionName] 
                                    && this.state.results[element.contractAddress + element.functionName] } 
                            />;
                        case ElementType.EventTable:
                            return <EventTable 
                                key={element.contractAddress + element.functionName}
                                showMetaInformation={devMode}
                                element={element}
                                web3={this.props.blockchainConnection.web3}
                            />;
                        default:
                            return null;
                    }
                });

                return <div key={'row' + index} className='ui-creation-row'>
                    {devMode &&
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

        const navBar: JSX.Element = <NavBar 
                        uiCreationHandling={this.props.uiCreationHandling}
                        web3={this.props.blockchainConnection.web3}
                        showMetaInformation={devMode}
                        actions={this.props.uiCreationHandling.uiStructure.actionElements}
                        selectFunctionElement={this.selectFunctionElement}
                    />

        const createdUI: JSX.Element = <div className='ui-creation-container'>
            
            
            <div className='container plain-background'>
                <FunctionModal 
                    updateAll={this.updateAll}
                    uiCreationHandling={this.props.uiCreationHandling}
                    blockchainConnection={this.props.blockchainConnection}
                    selectElement={this.selectFunctionElement}
                    selectedElement={this.state.selectedFunctionElement}
                />
                {rows}
            </div>
        </div>;

        const uiContent: JSX.Element = <SplitPane 
            className='scrollable hide-resizer' 
            split='horizontal'  
            defaultSize={40} 
            allowResize={false} 
        >
            <div className='navbar-pane'>{navBar}</div>
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

        if (this.props.productiveMode) {
     
            if (this.props.uiCreationHandling.uiStructure.actionElements.length !== 0
                || this.props.uiCreationHandling.uiStructure.rows.length !== 0
                || this.props.uiCreationHandling.uiStructure.contracts.length !== 0
            ) {
                return uiContent;
            } else {
                return <div className='text-center help-text-container'>
                    <h1 className='help-text text-muted'>Piet UI Loader</h1>
                  
                    <div className='load-ui-file-container'>
                        <label className={'btn btn-info load-ui'} title='Load UI File' htmlFor='ui-file'>Load UI File</label>
                        <input id='ui-file' className='files-input' type='file' onChange={(e) => this.loadUIFile(e.target.files)} />
                    </div>

                    <p>
                        <small className='help-text text-muted'>
                          
                        </small>
                    </p>
                    <div className='logo-container text-center'>
                        <SVG className='logo-svg' src='assets/Logo.svg' /> 
                    </div>
                </div>
                
                ;
            }
            
        }
            
        return <SplitPane className='scrollable hide-resizer ui-creation-main' split='horizontal'  defaultSize={40} allowResize={false} >
            <div className='h-100 w-100 toolbar'>
                
                <button
                    title='Edit Mode' 
                    className={'btn btn-sm btn' + (devMode ? '' : '-outline') + '-info'}
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
            {uiContent}
                
        </SplitPane>;
               
    }
    
}