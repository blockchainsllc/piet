/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react'

import * as Sol from '../../../solidity-handler/SolidityHandler'
import { Conversion, Convert } from '../../../solidity-handler/TypeConversion'
import Web3Type from '../../../types/web3'
import JSONTree from 'react-json-tree'
import * as CsvParse from 'csv-parse'
import * as PromiseFileReader from 'promise-file-reader'
import SplitPane from 'react-split-pane'

interface MigrationAssistentProps {
    web3: Web3Type,
    content: any,
    viewId: number,
    tabId: number,
    contracts: Sol.Contract[]

}

interface MigrationFunction {
    selectedContract: Sol.Contract,
    selectedFunction: Sol.ContractFunction,
    parameterColumnMapping: MigrationFunctionMapping[]

}

interface MigrationFunctionMapping {
    columnNumber: number,
    parameterName: string,
    conversion: Conversion

}

interface MigrationAssistentState {

    parsedCsv: any[][],
    migrationFunctions: MigrationFunction[],
    outputMessages: string[]

}

export class MigrationAssistent extends React.Component<MigrationAssistentProps, MigrationAssistentState> {

    constructor(props) {
        super(props)

        this.state = {
            parsedCsv: null,
            migrationFunctions: [],
            outputMessages: []
        }

        this.parseCsvFile = this.parseCsvFile.bind(this)
        this.onSelectContract = this.onSelectContract.bind(this)
        this.onSelectFunction = this.onSelectFunction.bind(this)
        this.onSelectParameter = this.onSelectParameter.bind(this)
        this.onClickPlay = this.onClickPlay.bind(this)
        this.onSelectConversion = this.onSelectConversion.bind(this)
        this.onAddFunction = this.onAddFunction.bind(this)

    }

    componentDidMount() {
        this.setState({
            migrationFunctions: [{
                selectedContract: null,
                selectedFunction: null,
                parameterColumnMapping: []

            }]
        })
    }

    onAddFunction() {
        this.setState((prevState: MigrationAssistentState) => {

            return {
                    migrationFunctions: [...prevState.migrationFunctions, {
                    selectedContract: null,
                    selectedFunction: null,
                    parameterColumnMapping: []
                }]
            }
        })
    }

    onClickPlay() {
        this.addOutputMessage('Starting Migration...')
        this.state.migrationFunctions.forEach((migrationFunction: MigrationFunction) => {
            
            const convertedParams = Array(this.state.parsedCsv.length).fill(
                Array(migrationFunction.selectedFunction.params.length).fill(null)
            )
            
            this.state.parsedCsv.forEach((row, rowIndex: number) => {
                
                migrationFunction.parameterColumnMapping.forEach((migrationFunctionMapping: MigrationFunctionMapping, index: number) => {
                    if (migrationFunctionMapping) {
                        const paramIndex = migrationFunction.selectedFunction.params.findIndex((param: Sol.ContractFunctionParam) => 
                            param.name === migrationFunctionMapping.parameterName
                        )
                        
                        convertedParams[rowIndex] = [
                            ...convertedParams[rowIndex].slice(0, paramIndex),
                            Convert(migrationFunctionMapping.conversion, row[migrationFunctionMapping.columnNumber], this.props.web3),
                            ...convertedParams[rowIndex].slice(paramIndex + 1)
                        ] 
                            
                    }
                })
            })

            convertedParams.forEach(async line => {
                let log = migrationFunction.selectedContract.name + '.' + migrationFunction.selectedFunction.name + '('
            
                line.forEach((value: any, index: number) => {
                    log += value + (index < migrationFunction.parameterColumnMapping.length - 1 ? ', ' : '')
                })
                log += ')'
                this.addOutputMessage('Try to send Tx: ' + log)
                await this.send(migrationFunction, line)

            })
          
        })
    }

    async send(migrationFunction: MigrationFunction, params: any[]) {

        const accounts = await this.props.web3.eth.getAccounts()
        
        if (accounts.length > 0) {
            
            const contract = new this.props.web3.eth.Contract(
                migrationFunction.selectedContract.meta.abi, 
                migrationFunction.selectedContract.deployedAt)

            try {
                await contract.methods[migrationFunction.selectedFunction.name](...params).send({from: accounts[0]}) 
                this.addOutputMessage('Tx successfully send')
            } catch (e) {
                this.addOutputMessage('ERROR: ' + e.message.toString())
            } 

        }
    }

    async parseCsvFile(fileList: FileList) {
      
        const reader = new FileReader()
        const fileContentPromises =  Array(fileList.length).fill(null)
            .map(async (item, index) => ({
                content: await PromiseFileReader.readAsText(fileList[index]),
                fileName: fileList[index].name
            }))
        
        const fileContents = await Promise.all(fileContentPromises)
        if (fileContents.length > 0) {
            CsvParse(fileContents[0].content, {comment: '#'}, (err, output) => {
                if (!err) {
                    this.setState({
                        parsedCsv: output
                    })
                }
                
            })
        }
       
    }

    onSelectContract(event, index) {
     
        const selectedContract = this.props.contracts.find((contract: Sol.Contract) => contract.name === event.target.value)
        
        this.setState((prevState: MigrationAssistentState) => {
            prevState.migrationFunctions[index].selectedContract = selectedContract ? selectedContract : null
            prevState.migrationFunctions[index].selectedFunction = null
            prevState.migrationFunctions[index].parameterColumnMapping = []

            return { migrationFunctions: prevState.migrationFunctions}
        })
        
    }

    onSelectFunction(event, selectedContract: Sol.Contract, index: number) {
   
        const selectedFunction = selectedContract.inheritedFunctions
            .concat(selectedContract.functions)
            .find((contractFunction: Sol.ContractFunction) =>
                contractFunction.name === event.target.value
        )

        this.setState((prevState: MigrationAssistentState) => {
            prevState.migrationFunctions[index].selectedFunction = selectedFunction ? selectedFunction : null
            prevState.migrationFunctions[index].parameterColumnMapping = selectedFunction ? 
                Array(selectedFunction.params.length).fill(null) : []
            return { migrationFunctions: prevState.migrationFunctions}
        })

    }

    onSelectParameter(event, selectedFunction: Sol.ContractFunction, lineIndex: number, colIndex: number) {
     
        const selectedParameter = selectedFunction.params
            .find((param: Sol.ContractFunctionParam) => param.name === event.target.value)
        
        this.setState((prevState: MigrationAssistentState) => {
            prevState.migrationFunctions[lineIndex].parameterColumnMapping[colIndex] = selectedParameter ? 
                {
                    columnNumber: colIndex,
                    parameterName: selectedParameter.name,
                    conversion: Conversion.NoConversion 
                } : null
            return { migrationFunctions: prevState.migrationFunctions}
        })
        
    }

    onSelectConversion(event, lineIndex: number, colIndex: number) {
        
        const conversionIndex = parseInt(event.target.value, 10)
       
        this.setState((prevState: MigrationAssistentState) => {
            const selectedMapping = prevState.migrationFunctions[lineIndex].parameterColumnMapping[colIndex]
            prevState.migrationFunctions[lineIndex].parameterColumnMapping[colIndex] = selectedMapping ?
             
                {
                    ...selectedMapping,
                    conversion: conversionIndex
                } : null
            
            return { migrationFunctions: prevState.migrationFunctions}
        })
        
    }

    functionSelector(migrationFunction: MigrationFunction, index: number) {

        if (!migrationFunction.selectedContract) {
            return null
        }

        const functionOptions = migrationFunction.selectedContract.inheritedFunctions
            .concat(migrationFunction.selectedContract.functions)
            .map((contractFunction: Sol.ContractFunction) => 
                <option key={migrationFunction.selectedContract.name + '-' + contractFunction.name} value={contractFunction.name}> 
                    {contractFunction.name}
                </option>
            )

        return (
            <select 
                onChange={(event) => this.onSelectFunction(event, migrationFunction.selectedContract, index)} 
                className='custom-select custom-select-sm migration-select migration-select-down'
            >
                <option key={'null'}>Select Function</option>
                {functionOptions}
            </select>
        )
    }

    functionParameters(selectedFunction: Sol.ContractFunction, lineIndex: number, numberOfColumns: number) {
        if (!selectedFunction) {
            return Array(numberOfColumns)
                .fill(null)
                .map((item, index: number) => 
                    <td key={index}></td>
                )
        }
        const parameterOptions = (currentIndex: number) => selectedFunction.params
            .filter((param: Sol.ContractFunctionParam) => -1 === this.state.migrationFunctions[lineIndex].parameterColumnMapping
                    .findIndex((migrationFunctionMapping: MigrationFunctionMapping, findIndex: number) => 
                        migrationFunctionMapping && migrationFunctionMapping.parameterName === param.name && currentIndex !== findIndex)
            )
            .map((param: Sol.ContractFunctionParam) =>
                <option key={selectedFunction.name + '-' + param.name} value={param.name}> 
                    {param.name}
                </option>
            )
        
        return Array(numberOfColumns)
            .fill(null)
            .map((item, index: number) => 
                <td key={index}>
                    <select 
                        onChange={(event) => this.onSelectParameter(event, selectedFunction, lineIndex, index)} 
                        className='custom-select custom-select-sm migration-select'
                    >
                        <option key={'null'}></option>
                        {parameterOptions(index)}
                    </select>
                    {this.parameterConversions(this.state.migrationFunctions[lineIndex].parameterColumnMapping[index], lineIndex, index)}
                </td>
                
            )

    }

    addOutputMessage(message: string) {
        message = '[' + new Date().toLocaleString() + '] ' + message
        this.setState((prevState: MigrationAssistentState) => {
            prevState.outputMessages.push(message)
            return {outputMessages: prevState.outputMessages}
        })
    }

    parameterConversions(migrationFunctionMapping: MigrationFunctionMapping, lineIndex: number, colIndex: number) {
        if (!migrationFunctionMapping) {
            return null
        }

        const conversions = Object.entries(Conversion)
            .filter(entry =>  typeof entry[1] === 'number')
            .map((item, index: number) => 
                <option key={item[1]} value={item[1]}>{item[0]}</option>
            )
        
        return (
            <select 
            onChange={(event) => this.onSelectConversion(event, lineIndex, colIndex)} 
                className='custom-select custom-select-sm migration-select migration-select-down'
            >
                {conversions}
            </select>
        )

    }

    migrationFunctions(migrationFunctions: MigrationFunction[], selectedContracts: Sol.Contract[], numberOfColumns: number) {
        const contractSelect = selectedContracts.map((contract: Sol.Contract) => 
                <option key={contract.name} value={contract.name}> 
                    {contract.name}
                </option>)

        return migrationFunctions.map((migrationFunction: MigrationFunction, index: number) => 
            <tr key={index}> 
                <td className='migration-function-cell'>
                    <select 
                        onChange={(event) => this.onSelectContract(event, index)} 
                        className='custom-select custom-select-sm migration-select'
                    >
                        <option key={'null'}>Select Contract</option>
                        {contractSelect}
                    </select>
                   
                    {this.functionSelector(migrationFunction, index)}
                    
                </td>
                {this.functionParameters(migrationFunction.selectedFunction, index, numberOfColumns)}
            </tr>
        )
    }

    render() {

        let tableHeader
        let tableBody
        let maxLength = 0

        if (this.state.parsedCsv) {

            maxLength = Math.max(...this.state.parsedCsv.map((line: any[]) => line.length))
            
            tableHeader = Array(maxLength)
                .fill(null)
                .map((item, index) => <th key={'col' + index}>Column {index}</th>)
            tableHeader = [<th key={'colFunction'}>Functions</th>].concat(tableHeader)

            const data = this.state.parsedCsv.length > 3 ? 
                this.state.parsedCsv.slice(0, 3).concat([Array(maxLength).fill('...')]) :
                this.state.parsedCsv

            tableBody = data.map((line: any[], lineIndex: number) => 
                <tr key={'line' + lineIndex}>
                    {[<td key='valueFunction'></td>].concat(line.map((value, index) => <td key={'value' + index}>{value}</td>))}
                </tr>)
                
        }

        const outputMessages = this.state.outputMessages.map((message: String, index: number) => 
            <span key={index} className='output-message'>{message}<br /></span>
        )

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
                                                    {this.migrationFunctions(this.state.migrationFunctions, this.props.contracts, maxLength)}
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
                                <SplitPane className='scrollable hide-resizer empty-first-pane' split='horizontal'  defaultSize={1} allowResize={false}>
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
                </SplitPane>
               
    }
    
}