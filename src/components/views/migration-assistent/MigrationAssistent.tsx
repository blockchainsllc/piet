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
import * as Sol from '../../../solidity-handler/SolidityHandler';
import { Conversion, convert } from '../../../solidity-handler/TypeConversion';
import * as CsvParse from 'csv-parse';
import * as PromiseFileReader from 'promise-file-reader';
import SplitPane from 'react-split-pane';
import { sendFunction, BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';

interface MigrationAssistentProps {
    blockchainConnection: BlockchainConnection;
    content: any;
    viewId: number;
    tabId: number;
    contracts: Sol.Contract[];

}

interface MigrationFunction {
    selectedContract: Sol.Contract;
    selectedFunction: Sol.ContractFunction;
    parameterColumnMapping: MigrationFunctionMapping[];

}

interface MigrationFunctionMapping {
    columnNumber: number;
    parameterName: string;
    conversion: Conversion;

}

interface MigrationAssistentState {

    parsedCsv: any[][];
    migrationFunctions: MigrationFunction[];
    outputMessages: string[];

}

export class MigrationAssistent extends React.Component<MigrationAssistentProps, MigrationAssistentState> {

    constructor(props: MigrationAssistentProps) {
        super(props);

        this.state = {
            parsedCsv: null,
            migrationFunctions: [],
            outputMessages: []
        };

        this.parseCsvFile = this.parseCsvFile.bind(this);
        this.onSelectContract = this.onSelectContract.bind(this);
        this.onSelectFunction = this.onSelectFunction.bind(this);
        this.onSelectParameter = this.onSelectParameter.bind(this);
        this.onClickPlay = this.onClickPlay.bind(this);
        this.onSelectConversion = this.onSelectConversion.bind(this);
        this.onAddFunction = this.onAddFunction.bind(this);

    }

    componentDidMount(): void {
        this.setState({
            migrationFunctions: [{
                selectedContract: null,
                selectedFunction: null,
                parameterColumnMapping: []

            }]
        });
    }

    onAddFunction(): void {
        this.setState((prevState: MigrationAssistentState) => {

            return {
                    migrationFunctions: [...prevState.migrationFunctions, {
                    selectedContract: null,
                    selectedFunction: null,
                    parameterColumnMapping: []
                }]
            };
        });
    }

    async onClickPlay(): Promise<void> {
        this.addOutputMessage('Starting Migration...');
        for (const migrationFunction of this.state.migrationFunctions) {
        
            
            const convertedParams: any[] = Array(this.state.parsedCsv.length).fill(
                Array(migrationFunction.selectedFunction.params.length).fill(null)
            );
            
            this.state.parsedCsv.forEach((row: any, rowIndex: number) => {
                
                migrationFunction.parameterColumnMapping.forEach((migrationFunctionMapping: MigrationFunctionMapping, index: number) => {
                    if (migrationFunctionMapping) {
                        const paramIndex: number = migrationFunction.selectedFunction.params
                            .findIndex((param: Sol.ContractFunctionParam) => 
                                param.name === migrationFunctionMapping.parameterName
                            );
                        
                        convertedParams[rowIndex] = [
                            ...convertedParams[rowIndex].slice(0, paramIndex),
                            convert(migrationFunctionMapping.conversion, row[migrationFunctionMapping.columnNumber], this.props.blockchainConnection),
                            ...convertedParams[rowIndex].slice(paramIndex + 1)
                        ]; 
                            
                    }
                });
            });

            for (const line of convertedParams) {
                let log: string = migrationFunction.selectedContract.name + '.' + migrationFunction.selectedFunction.name + '(';
            
                line.forEach((value: any, index: number) => {
                    log += value + (index < migrationFunction.parameterColumnMapping.length - 1 ? ', ' : '');
                });
                log += ')';
                //this.addOutputMessage('Try to send Tx: ' + log);
                await this.send(migrationFunction, line);

            }
          
        }
    }

    async send(migrationFunction: MigrationFunction, params: any[]): Promise<void> {

        try {
            await sendFunction(
                migrationFunction.selectedFunction, 
                this.props.blockchainConnection, 
                migrationFunction.selectedContract.deployedAt, 
                migrationFunction.selectedContract.meta.abi,
                params
            );
            this.addOutputMessage('Tx successfully send: ' + migrationFunction.selectedFunction.name);
        } catch (e) {
            this.addOutputMessage('ERROR: ' + e.message.toString());
        } 

    }

    async parseCsvFile(fileList: FileList): Promise<void> {
      
        const reader: FileReader = new FileReader();
        const fileContentPromises: any =  Array(fileList.length).fill(null)
            .map(async (item: any, index: number) => ({
                content: await PromiseFileReader.readAsText(fileList[index]),
                fileName: fileList[index].name
            }));
        
        const fileContents: any = await Promise.all(fileContentPromises);
        if (fileContents.length > 0) {
            CsvParse(fileContents[0].content, {comment: '#'}, (err: any, output: any) => {
                if (!err) {
                    this.setState({
                        parsedCsv: output
                    });
                }
                
            });
        }
       
    }

    onSelectContract(event: any, index: number): void {
     
        const selectedContract: Sol.Contract = this.props.contracts.find((contract: Sol.Contract) => contract.name === event.target.value);
        
        this.setState((prevState: MigrationAssistentState) => {
            prevState.migrationFunctions[index].selectedContract = selectedContract ? selectedContract : null;
            prevState.migrationFunctions[index].selectedFunction = null;
            prevState.migrationFunctions[index].parameterColumnMapping = [];

            return { migrationFunctions: prevState.migrationFunctions};
        });
        
    }

    onSelectFunction(event: any, selectedContract: Sol.Contract, index: number): void {
   
        const selectedFunction: Sol.ContractFunction = selectedContract.inheritedFunctions
            .concat(selectedContract.functions)
            .find((contractFunction: Sol.ContractFunction) =>
                contractFunction.name === event.target.value
        );

        this.setState((prevState: MigrationAssistentState) => {
            prevState.migrationFunctions[index].selectedFunction = selectedFunction ? selectedFunction : null;
            prevState.migrationFunctions[index].parameterColumnMapping = selectedFunction ? 
                Array(selectedFunction.params.length).fill(null) : [];
            return { migrationFunctions: prevState.migrationFunctions};
        });

    }

    onSelectParameter(event: any, selectedFunction: Sol.ContractFunction, lineIndex: number, colIndex: number): void {
     
        const selectedParameter: Sol.ContractFunctionParam = selectedFunction.params
            .find((param: Sol.ContractFunctionParam) => param.name === event.target.value);
        
        this.setState((prevState: MigrationAssistentState) => {
            prevState.migrationFunctions[lineIndex].parameterColumnMapping[colIndex] = selectedParameter ? 
                {
                    columnNumber: colIndex,
                    parameterName: selectedParameter.name,
                    conversion: Conversion.NoConversion 
                } : null;
            return { migrationFunctions: prevState.migrationFunctions};
        });
        
    }

    onSelectConversion(event: any, lineIndex: number, colIndex: number): void {
        
        const conversionIndex: number = parseInt(event.target.value, 10);
       
        this.setState((prevState: MigrationAssistentState) => {
            const selectedMapping: any = prevState.migrationFunctions[lineIndex].parameterColumnMapping[colIndex];
            prevState.migrationFunctions[lineIndex].parameterColumnMapping[colIndex] = selectedMapping ?
             
                {
                    ...selectedMapping,
                    conversion: conversionIndex
                } : null;
            
            return { migrationFunctions: prevState.migrationFunctions};
        });
        
    }

    functionSelector(migrationFunction: MigrationFunction, index: number): JSX.Element {

        if (!migrationFunction.selectedContract) {
            return null;
        }

        const functionOptions: JSX.Element[] = migrationFunction.selectedContract.inheritedFunctions
            .concat(migrationFunction.selectedContract.functions)
            .map((contractFunction: Sol.ContractFunction) => 
                <option key={migrationFunction.selectedContract.name + '-' + contractFunction.name} value={contractFunction.name}> 
                    {contractFunction.name}
                </option>
            );

        return (
            <div className='form-group migration-select-form'>
                <select 
                    onChange={(event) => this.onSelectFunction(event, migrationFunction.selectedContract, index)} 
                    className='custom-select custom-select-sm migration-select'
                >
                    <option key={'null'}>Select Function</option>
                    {functionOptions}
                </select>
            </div>
        );
    }

    functionParameters(selectedFunction: Sol.ContractFunction, lineIndex: number, numberOfColumns: number): JSX.Element[] {
        if (!selectedFunction) {
            return Array(numberOfColumns)
                .fill(null)
                .map((item, index: number) => 
                    <td key={index}></td>
                );
        }
        const parameterOptions: (currentIndex: number) => JSX.Element[] = (currentIndex: number): JSX.Element[] => selectedFunction.params
            .filter((param: Sol.ContractFunctionParam) => 
                this.state.migrationFunctions[lineIndex].parameterColumnMapping
                    .findIndex((migrationFunctionMapping: MigrationFunctionMapping, findIndex: number) => 
                        migrationFunctionMapping && migrationFunctionMapping.parameterName === param.name && currentIndex !== findIndex) 
                === -1
            )
            .map((param: Sol.ContractFunctionParam) =>
                <option key={selectedFunction.name + '-' + param.name} value={param.name}> 
                    {param.name}
                </option>
            );
        
        return Array(numberOfColumns)
            .fill(null)
            .map((item: any, index: number) => 
                <td key={index}>
                    <div className='form-group migration-select-form'>
                        <select 
                            onChange={(event) => this.onSelectParameter(event, selectedFunction, lineIndex, index)} 
                            className='custom-select custom-select-sm migration-select'
                        >
                            <option key={'null'}></option>
                            {parameterOptions(index)}
                        </select>
                    </div>
                    {this.parameterConversions(this.state.migrationFunctions[lineIndex].parameterColumnMapping[index], lineIndex, index)}
                    
                </td>
                
            );

    }

    addOutputMessage(message: string): void {
        const outputMessage: string = '[' + new Date().toLocaleString() + '] ' + message;
        this.setState((prevState: MigrationAssistentState) => {
            prevState.outputMessages.push(message);
            return {outputMessages: prevState.outputMessages};
        });
    }

    parameterConversions(migrationFunctionMapping: MigrationFunctionMapping, lineIndex: number, colIndex: number): JSX.Element {
        if (!migrationFunctionMapping) {
            return null;
        }

        const conversions: JSX.Element[] = Object.entries(Conversion)
            .filter((entry: any) =>  typeof entry[1] === 'number')
            .map((item: any, index: number) => 
                <option key={item[1]} value={item[1]}>{item[0]}</option>
            );
        
        return (
            <div className='form-group migration-select-form'>
                <select 
                onChange={(event) => this.onSelectConversion(event, lineIndex, colIndex)} 
                    className='custom-select custom-select-sm migration-select migration-select-down'
                >
                    {conversions}
                </select>
            </div>
        );

    }

    migrationFunctions(migrationFunctions: MigrationFunction[], selectedContracts: Sol.Contract[], numberOfColumns: number): JSX.Element[] {
        const contractSelect: JSX.Element[] = selectedContracts.map((contract: Sol.Contract) => 
                <option key={contract.name} value={contract.name}> 
                    {contract.name}
                </option>);

        return migrationFunctions.map((migrationFunction: MigrationFunction, index: number) => 
            <tr key={index}> 
                <td className='migration-function-cell'>
                    <div className='form-group migration-select-form'>
                        <select 
                            onChange={(event) => this.onSelectContract(event, index)} 
                            className='custom-select custom-select-sm migration-select'
                        >
                            <option key={'null'}>Select Contract</option>
                            {contractSelect}
                        </select>
                    </div>
                    
                        {this.functionSelector(migrationFunction, index)}
                    
                    
                </td>
                {this.functionParameters(migrationFunction.selectedFunction, index, numberOfColumns)}
            </tr>
        );
    }

    render(): JSX.Element {

        let tableHeader: JSX.Element[];
        let tableBody: JSX.Element[];
        let maxLength: number = 0;

        if (this.state.parsedCsv) {

            maxLength = Math.max(...this.state.parsedCsv.map((line: any[]) => line.length));
            
            tableHeader = Array(maxLength)
                .fill(null)
                .map((item: any, index: number) => <th key={'col' + index}>Column {index}</th>);
            tableHeader = [<th key={'colFunction'}>Functions</th>].concat(tableHeader);

            const data: any = this.state.parsedCsv.length > 3 ? 
                this.state.parsedCsv.slice(0, 3).concat([Array(maxLength).fill('...')]) :
                this.state.parsedCsv;

            tableBody = data.map((line: any[], lineIndex: number) => 
                <tr key={'line' + lineIndex}>
                    {[<td key='valueFunction'></td>]
                        .concat(line.map((value: any, index: number) => <td key={'value' + index}>{value}</td>))}
                </tr>);
                
        }

        const outputMessages: JSX.Element[] = this.state.outputMessages.map((message: String, index: number) => 
            <span key={index} className='output-message'>{message}<br /></span>
        );

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        <div className='form-inline'>
                            <label className={'btn btn-sm btn-outline-info'} htmlFor='csv-file'>Load CSV File</label>
                            <input id='csv-file' className='files-input' type='file' onChange={ (e) => this.parseCsvFile(e.target.files)} />
                      
                        </div>
                    </div>
                    <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal' defaultSize={1} allowResize={false} >
                        <div></div>
                        
                        <SplitPane className='scrollable' split='horizontal'  defaultSize={500} allowResize={true} >
                            <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={1} allowResize={false} >
                                <div></div>
                                <div className='w-100'>
                                    {this.state.parsedCsv ? 
                                        <small>
                                            <table className='table event-table'>
                                                <thead>
                                                <tr>{tableHeader}</tr>
                                                </thead>
                                                <tbody>
                                                    {tableBody}
                                                    {this.migrationFunctions(
                                                            this.state.migrationFunctions,
                                                            this.props.contracts, maxLength)
                                                    }
                                                    <tr>
                                                        <td colSpan={maxLength + 1}> 
                                                            <button className={'btn btn-sm btn-outline-info'}
                                                                onClick={() => this.onAddFunction()}>
                                                                <i className='fas fa-plus'></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </small>
                                    : null}
                                </div>
                            </SplitPane>
                            <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                                <div className='h-100 w-100 toolbar'>
                                    <div className='form-inline'>
                                
                                        <button className={'btn btn-sm btn-outline-info'}
                                            onClick={() => this.onClickPlay()}>
                                            <i className='fas fa-play'></i>
                                        </button>
                                    </div>
                                </div>
                                <SplitPane 
                                    className='scrollable hide-resizer empty-first-pane'
                                    split='horizontal'
                                    defaultSize={1}
                                    allowResize={false}
                                >
                                    <div></div>
                                    <div className='output-message-container'>
                                        <small>
                                            {outputMessages}
                                        </small>
                                    </div>
                                </SplitPane>
                            </SplitPane>
                        </SplitPane>
                            
                    </SplitPane>
                </SplitPane>;
               
    }
    
}