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
import * as Sol from '../../solidity-handler/SolidityHandler';
import {Treebeard, decorators} from 'react-treebeard';
import SplitPane from 'react-split-pane';
import { Graph } from './Graph/GraphGenerator';
import { saveAs } from 'file-saver';
import { BlockchainConnection } from '../../solidity-handler/BlockchainConnector';

interface FileBrowserViewProps {
    blockchainConnection: BlockchainConnection;
    content: any;
    viewId: number;
    tabId: number;
    submitFiles: Function;
    contracts: Sol.Contract[];
    loading: boolean;
    globalErrors: Error[];
    selectedElement: Sol.NodeElement;
    graph: Graph;

}

interface FileBrowserViewState {
    cursor: any;
    data: any;
}

decorators.Header = ({style, node}: any): any => {
    const iconStyle: any = {marginRight: '5px'};

    return (
        <div style={style.base}>
            <div style={style.title}>
                <i
                    className={node.icon ? node.icon + ' ' + (node.className ? node.className : '') : ''}
                    style={node.icon ? iconStyle : {}}
                />

                {node.name}
            </div>
        </div>
    );
};

decorators.Toggle =  ({style}: any): JSX.Element => {
    const {height, width}: any = style;
    const midHeight: number = height * 0.5;
    const points: string = `0,0 0,${height} ${width},${midHeight}`;

    return (
        <div style={style.base}>
            <div style={style.wrapper}>
                <svg height={height} width={width}>
                    <polygon points={points}
                             style={style.arrow}/>
                </svg>
            </div>
        </div>
    );
};

export class FileBrowserView extends React.Component<FileBrowserViewProps, FileBrowserViewState> {

    constructor(props: FileBrowserViewProps) {
        super(props);
     
        this.state = {
            cursor: null,
            data: null
        };
        
        this.submitFiles = this.submitFiles.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.save = this.save.bind(this);
       
    }

    save(): void {
        const stateData: string = JSON.stringify(
            {
                pietFileVersion: '0.0.1',
                contracts: this.props.contracts,
                graph: this.props.graph,
                selectedElement: this.props.selectedElement
            },
            null,
            2
        );

        saveAs(new Blob([stateData], {type : 'application/json'}), 'export' + Date.now() + '.piet.json');

    }

    componentDidMount(): void {
        this.parseContracts(this.props.contracts);

    }

    componentWillReceiveProps(newProps: FileBrowserViewProps): void {
        this.parseContracts(newProps.contracts);

    }

    parseContracts(contracts: Sol.Contract[]): void {
        const files: any[] = [];

        contracts.forEach((contract: Sol.Contract) => {
            const file: any = files.find((aFile: any) => aFile.name === contract.inFile);

            const contractChildren: any = [
                ...contract.enumerations.map((contractEnum: Sol.ContractEnumeration) => ({
                    name: contractEnum.shortName,
                    icon: 'fas fa-list-ol',
                    className: 'enum-icon'
                })),
                ...contract.structs.map((contractStruct: Sol.ContractStruct) => ({
                    name: contractStruct.shortName,
                    icon: 'fas fa-archive',
                    className: 'struct-icon'
                }))
            ];

            const contractRepresentation: any = {
                name: contract.name + (contract.deployedAt ? ' (' + contract.deployedAt.substr(0, 6) + '...)' : ''),
                icon: 'fas fa-file-alt',
                className: 'contract-icon',
                children: contractChildren.length > 0 ? contractChildren : undefined

            };

            if (file) {
                file.children.push(contractRepresentation);
            } else {
                files.push({
                    name: contract.inFile,
                    children: [
                        contractRepresentation
                    ]
                });
            }
        });

        const data: any = {
            name: 'Files',
            toggled: true,
            children: [
                ...files
                   
            ]
        };

        this.setState({
            data: data
        });
     
    }

    submitFiles(selectorFiles: FileList): void {
        
        this.props.submitFiles(selectorFiles);
        
    }

    onToggle(node: any, toggled: boolean): void {

        if (this.state.cursor) {
            this.state.cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState({ cursor: node });
    }

    render(): JSX.Element {

        const theme: any = {
            scheme: 'monokai',
            author: 'wimer hazenberg (http://www.monokai.nl)',
            base00: '#272822',
            base01: '#383830',
            base02: '#49483e',
            base03: '#75715e',
            base04: '#a59f85',
            base05: '#f8f8f2',
            base06: '#f5f4f1',
            base07: '#f9f8f5',
            base08: '#f92672',
            base09: '#fd971f',
            base0A: '#f4bf75',
            base0B: '#a6e22e',
            base0C: '#a1efe4',
            base0D: '#66d9ef',
            base0E: '#ae81ff',
            base0F: '#cc6633'
          };

        const errorsToShow: JSX.Element[] = this.props.globalErrors.map((error: Error) =>  
            <div key={error.message + error.name} className='file-browser-alert alert alert-danger' role='alert'>   
                <small><i className='fas fa-exclamation-circle'></i> <strong>Error:</strong> {error.message}</small>
             </div> 
        );

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                    
                        <label className={'btn btn-sm btn-outline-info'} htmlFor='file'>Load</label>
                        <input 
                            id='file' 
                            className='files-input' 
                            type='file' 
                            onChange={ (e: any): void => this.submitFiles(e.target.files)} 
                            multiple 
                        />
                        
                       &nbsp;
                        <button 
                            title='Zoom Out'
                            className='btn btn-sm btn-outline-info save-button'
                            onClick={this.save}
                        >
                            Save
                        </button>

                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal'  defaultSize={1} allowResize={false}>
                        <div></div>
                        <div>
                            { this.props.globalErrors.length > 0 &&
                                errorsToShow
                            }   
                            {this.props.globalErrors.length === 0  && this.props.loading ? 
                                <div className='file-browser-alert alert alert-warning' role='alert'>
                                    <small><i className='fas fa-info-circle'></i> Parsing Code: This may take a while...</small>
                                </div> :   
                        
                                (this.props.contracts.length > 0 &&  this.state.data ? 
                                    <div className='container'>
                                        <div className='row'>
                                            <div className='col-12 file-tree default-background'>
                                            
                                                <Treebeard 
                                                    className='default-background' 
                                                    data={this.state.data} 
                                                    decorators={decorators} 
                                                    onToggle={this.onToggle}
                                                /> 
                                            
                                            </div>
                                        </div>
                                    </div> :
                                    null
                                )
                            }
                        </div>
                    </SplitPane>
                </SplitPane>;
               
    }
    
}