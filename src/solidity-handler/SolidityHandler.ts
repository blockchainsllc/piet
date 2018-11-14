/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as PromiseFileReader from 'promise-file-reader'
import * as parser from 'solidity-parser-antlr'
import { getContracts } from '../utils/GitHub';

enum NodeType {
    ContractDefinition = 'ContractDefinition'
}

enum SubNodeType {
    StructDefinition = 'StructDefinition',
    FunctionDefinition = 'FunctionDefinition',
    StateVariableDeclaration = 'StateVariableDeclaration',
    EventDefinition = 'EventDefinition',
    ModifierDefinition = 'ModifierDefinition',
    EnumDefinition = 'EnumDefinition'
}

export enum ElementType {
    Contract,
    Struct,
    Enum
}

export interface NodeElement {
    name: string
    elementType: ElementType
}

export interface Contract  extends NodeElement {
    
    baseContracts: string[],
    enumerations: ContractEnumeration[],
    structs: ContractStruct[],
    stateVariables: ContractStateVariable[],
    inheritedStateVariables: ContractStateVariable[],
    functions: ContractFunction[],
    inheritedFunctions: ContractFunction[],
    annotations: SolidityAnnotation[],
    deployedAt: string,
    meta: any,
    modifiers: ContractModifier[],
    inheritedModifiers: ContractModifier[],
    events: ContractEvent[],
    inheritedEvents: ContractEvent[],
    heritageDissolved: boolean,
    source: string,
    inFile: string,
    kind: string,
    references: string[]
    isAbstract: boolean

}

export interface ContractEvent {
    name: string,
    params: ContractFunctionParam[]
}

export interface ContractModifier {
    name: string,
    params: ContractFunctionParam[]
}

export interface ContractEnumeration extends NodeElement {
    name: string,
    shortName: string,
    parentName: string,
    entries: EnumEntry[]
}

export interface ContractStruct extends NodeElement {
    name: string,
    shortName: string,
    parentName: string,
    fields: ContractStateVariable[]
}

export interface ContractFunction {
    name: string,
    params: ContractFunctionParam[],
    returnParams: ContractFunctionParam[],
    description: string,
    modifiers: string[],
    source: string,
    start: number,
    end: number,
    annotations: SolidityAnnotation[]
}

export interface ContractStateVariable {
    name: string,
    solidityType: SolidityType,
    visibility: string
}

export interface ContractFunctionParam {
    name: string,
    solidityType: SolidityType,
    isStorage: boolean,
    isIndexed: boolean,
    description: string
}

export interface EnumEntry {
    name: string,
    index: number
}

export interface Mapping {
    key: SolidityType,
    value: SolidityType
}

export interface SolidityType {
    name: string,
    pureName?: string,
    mapping?: Mapping, 
    isArray: boolean,
    userDefined: boolean,
    references: string[]
}

export interface SolidityAnnotation {
    name: string,
    value: string,
    subAnnotation: SolidityAnnotation
}

const getType = (node, references: string[]): SolidityType  => {
    switch (node.type) {
        case 'ElementaryTypeName': 
            return {
                name: node.name,
                userDefined: false,
                references: references,
                isArray: false
            }
        case 'UserDefinedTypeName': 
            return {
                name: node.namePath,
                userDefined: true,
                references: references.concat(node.namePath),
                isArray: false
            }
           
        case 'ArrayTypeName': 
            const theType = getType(node.baseTypeName, references)
            return {
                name: theType.name + '[]',
                pureName: theType.name,
                userDefined: theType.userDefined,
                references: references,
                isArray: true
            }

        case 'Mapping': 
            const keyType = getType(node.keyType, references)
            const valueType = getType(node.valueType, references)
            return {
                name: '(' + keyType.name + ' => ' + valueType.name + ')',
                mapping: {
                    key: keyType,
                    value: valueType
                },
                userDefined: valueType.userDefined,
                references: references,
                isArray: false
            }
        default:
            throw Error('Unknown Solidity type.')
    }
}

const getEnums = (node): ContractEnumeration[] => {
    return node.subNodes
        .filter(subNode => subNode.type && subNode.type === 'EnumDefinition')
        .map(subNode => ({
            name: node.name + '.' + subNode.name,
            shortName: subNode.name,
            parentName: node.name,
            elementType: ElementType.Enum,
            entries: subNode.members
                .filter(enumSubNode => subNode.type && enumSubNode.type === 'EnumValue')
                .map((enumSubNode, index)  => ({
                    name: enumSubNode.name,
                    index: index
                }))
        }))
}

const getStructs = (node): ContractStruct[] => {
    return node.subNodes
        .filter(subNode => subNode.type && subNode.type === 'StructDefinition')
        .map(subNode => ({
            name: node.name + '.' + subNode.name,
            shortName: subNode.name,
            parentName: node.name,
            elementType: ElementType.Struct,
            fields: subNode.members
                .filter(structSubNode => structSubNode.type && structSubNode.type === 'VariableDeclaration')
                .map(structSubNode => ({
                    name: structSubNode.name,
                    solidityType: getType(structSubNode.typeName, []),
                    visibility: null
                }))
        }))
}

const getVariable = (variablesList): ContractFunctionParam => {
    return variablesList
        .filter(subNode => subNode.type && subNode.type === 'VariableDeclaration')
        .map(subNode => ({
            name: subNode.name,
            solidityType: getType(subNode.typeName, []),
            isIndexed: subNode.isIndexed ? true : false,
            visibility: null
        }))
}

const getEvents = (node): ContractEvent[] => {
    return node.subNodes
        .filter(subNode => subNode.type && subNode.type === 'EventDefinition')
        .map(subNode => ({
            name: subNode.name,
            params: subNode.parameters.parameters && subNode.parameters.parameters.length > 0 ?
                getVariable(subNode.parameters.parameters) : []
        }))
}

const getModifiers = (node): ContractModifier[] => {
    return node.subNodes
        .filter(subNode => subNode.type && subNode.type === 'ModifierDefinition')
        .map(subNode => ({
            name: subNode.name,
            params: subNode.parameters.parameters && subNode.parameters.parameters.length > 0 ?
                getParameters(subNode.parameters) : []
        }))
}

const getFunctions = (node, source): ContractFunction[] => {
    return node.subNodes
        .filter(subNode => subNode.type && subNode.type === 'FunctionDefinition')
        .map(subNode => {

            const annotations = getAnnotations(source, subNode)

            return {
                name: subNode.name === null && subNode.isConstructor ? 'constructor' : subNode.name ,
                params: subNode.parameters ? getParameters(subNode.parameters, annotations) : [],
                returnParams: subNode.returnParameters ? getParameters(subNode.returnParameters) : [],
                description: annotations
                    .filter(annotation => annotation.name === 'notice')
                    .map(annotation => annotation.value)
                    .reduce((previous, current, index) => previous + (index !== 0 ? '\n' : '') + current, ''),
                modifiers: subNode.modifiers.map(modifier => modifier.name).concat([subNode.visibility, subNode.stateMutability]),
                source: source.slice(subNode.range[0], subNode.range[1] + 1),
                start: subNode.loc.start,
                end: subNode.loc.end,
                annotations: annotations
            }
        })
}

const getParameters = (parameterList, annotations?: SolidityAnnotation[]): ContractFunctionParam => {
    return parameterList.parameters
        .filter(subNode => subNode.type && subNode.type === 'Parameter')
        .map(subNode => {

            const foundAnnotation = annotations ? annotations
                .find((annotation: SolidityAnnotation) => annotation.name === 'param' && annotation.subAnnotation.name === subNode.name) 
                : null
            
            return {
                name: subNode.name,
                solidityType: getType(subNode.typeName, []),
                isStorage: subNode.storageLocation !== null,
                isIndexed: subNode.isIndexed ? true : false,
                description: foundAnnotation ? foundAnnotation.subAnnotation.value : ''
            }
        })
}

const getStateVariables = (node) => {
    const varibales = node.subNodes
        .filter(subNode => subNode.type && subNode.variables && subNode.type === 'StateVariableDeclaration')
        .map(subNode => subNode.variables[0])

    return varibales.map(variable => ({
            name: variable.name,
            solidityType: getType(variable.typeName, []),
            visibility: variable.visibility
        }))
}

const contractMemberCopy = (contract: Contract, generalContract: Contract) => {
    contract.inheritedFunctions = contract.inheritedFunctions
        .concat(generalContract.functions
            .concat(generalContract.inheritedFunctions)
            .filter((generalF: ContractFunction) => 
                !contract.inheritedFunctions.find((f: ContractFunction) => generalF.name === f.name)
                && !contract.functions.find((f: ContractFunction) => generalF.name === f.name)
                && generalContract.name !== generalF.name
            )
        )
    
    contract.inheritedModifiers = contract.inheritedModifiers
        .concat(generalContract.modifiers
            .concat(generalContract.inheritedModifiers)
            .filter((generalF: ContractFunction) => 
                !contract.inheritedModifiers.find((f: ContractFunction) => generalF.name === f.name)
                && !contract.modifiers.find((f: ContractFunction) => generalF.name === f.name)
            )
        )
    
    contract.inheritedStateVariables = contract.inheritedStateVariables
        .concat(generalContract.stateVariables
            .concat(generalContract.inheritedStateVariables)
            .filter((general: ContractStateVariable) => 
                !contract.stateVariables.find((f: ContractStateVariable) => general.name === f.name)
                && !contract.inheritedStateVariables.find((f: ContractStateVariable) => general.name === f.name)
            )
        )
    
    contract.inheritedEvents = contract.inheritedEvents
        .concat(generalContract.events
            .concat(generalContract.inheritedEvents)
            .filter((general: ContractEvent) => 
                !contract.events.find((f: ContractEvent) => general.name === f.name)
                && !contract.inheritedEvents.find((f: ContractEvent) => general.name === f.name)
            )
        )
    
    return contract

}

const dissolveHeritage = (contract: Contract, contracts: Contract[]): Contract => { 

    if (contract.heritageDissolved || contract.baseContracts.length === 0) {
        contract.heritageDissolved = true
        return contract
    } else {

        let contractToReturn: Contract = contract

        contract.baseContracts.forEach((contractName: string) => {
            let generalContract = contracts.find((c) => c.name === contractName)

            if (generalContract) {
                generalContract = dissolveHeritage(generalContract, contracts)
                // TODO: fix
                contractToReturn = contractMemberCopy(contract, generalContract) 
   
            } else {
                contractToReturn = {
                    elementType: ElementType.Contract,
                    name: contractName,
                    baseContracts: [],
                    enumerations: [],
                    structs: [],
                    stateVariables: [],
                    functions: [],
                    annotations: [],
                    deployedAt: null,
                    meta: null,
                    modifiers: [],
                    events: [],
                    kind: '',
                    heritageDissolved: true,
                    inheritedStateVariables: [],
                    inheritedFunctions: [],
                    inheritedEvents: [],
                    inheritedModifiers: [],
                    source: null,
                    inFile: 'No Sources',
                    references: [],
                    isAbstract: true
                }
                contracts.push(contractToReturn)
            }         

        })
        return contractToReturn
    }

}

const getAnnotationValue = (relevantPart: string): SolidityAnnotation[] => {
    const annotations: SolidityAnnotation[] = []
    const firstSpaceAfterAt = relevantPart.search(/\s/)
    const secondSpaceAfterAt = relevantPart.slice(firstSpaceAfterAt + 1).search(/\s/)
    const secondRelevantPart = relevantPart.slice(firstSpaceAfterAt + 1)
    annotations.push({
        name: relevantPart.slice(0, firstSpaceAfterAt),
        value: relevantPart.slice(firstSpaceAfterAt + 1),
        subAnnotation: (relevantPart.slice(0, firstSpaceAfterAt) === 'param' ? {
            name: secondRelevantPart.slice(0, secondSpaceAfterAt),
            value: secondRelevantPart.slice(secondSpaceAfterAt + 1),
            subAnnotation: null
        } : null)
    })

    return annotations
}

const getAnnotations = (source: string, node: any): SolidityAnnotation[] => {
    let annotations: SolidityAnnotation[] = []
    const lines = source.slice(0, node.range[0]).split(/[\r\n]+/).reverse()
      
    let i = 0
    let stop = false

    while (i < lines.length && !stop) {
        const line = lines[i].trim()
        const atPosition = line.search(/@/)
        stop = !(line.length === 0 || (line.length > 3 && line.slice(0, 3) === '///' && atPosition !== -1))
        const relevantPart = line.slice(atPosition + 1)
        
        if (!stop && line.length !== 0) {
            annotations = annotations.concat(getAnnotationValue(relevantPart))
        }  
        i++ 

    }

    return annotations
}

export const parseContent = (fileContents): Contract[] => {
    const contracts = []
    fileContents.forEach(fileContent => {
        const nameSplit = fileContent.fileName.split('.')
        const fileType = nameSplit.length > 1 ? nameSplit[nameSplit.length - 1] : null
        let meta
        let source: string

        switch (fileType) {
            case 'sol':
                source = fileContent.content
                meta = null
                break

            case 'json':
                const jsonContent = JSON.parse(fileContent.content)
                source = jsonContent.source
                meta = jsonContent
                break

            default:
                console.log('Unknown file type')
                return contracts
        }

        const sourceUnit = parser.parse(source, {loc: true, range: true}) as any
        parser.visit(sourceUnit, {
            ContractDefinition: (node) => {

                const references = []
                parser.visit(node, {
                    UserDefinedTypeName: (typeNode) => {
                        references[(typeNode as any).namePath] = true
                    }
                })

                const contract: Contract = {
                    elementType: ElementType.Contract,
                    name: node.name,
                    baseContracts: (node as any).baseContracts.map(base => base.baseName.namePath),
                    enumerations: getEnums(node),
                    structs: getStructs(node),
                    stateVariables: getStateVariables(node),
                    functions: getFunctions(node, source),
                    annotations: getAnnotations(source, node),
                    deployedAt: meta && Object.keys(meta.networks).length > 0 ? meta.networks[Object.keys(meta.networks)[0]].address : null,
                    meta: meta,
                    modifiers: getModifiers(node),
                    events: getEvents(node),
                    kind: (node as any).kind,
                    heritageDissolved: false,
                    inheritedStateVariables: [],
                    inheritedFunctions: [],
                    inheritedEvents: [],
                    inheritedModifiers: [],
                    source: source,
                    inFile: fileContent.fileName,
                    references: Object.keys(references),
                    isAbstract: (node as any).subNodes
                        .filter(subNode => subNode.type && subNode.type === 'FunctionDefinition' && subNode.body === null).length > 0
                }
                // console.log('################')
                // console.log(node)
                // console.log(contract)

                contracts.push(contract)
            }
        })
    })

    const contractsInclHeritage = contracts.map((contract: Contract) =>  dissolveHeritage(contract, contracts))
    return contracts

}

export const pushFiles = async (fileList: FileList) => {

    

    const reader = new FileReader()
    const fileContentPromises =  Array(fileList.length).fill(null)
        .map(async (item, index) => ({
            content: await PromiseFileReader.readAsText(fileList[index]),
            fileName: fileList[index].name
        }))
    
    const fileContents = await Promise.all(fileContentPromises)

    return parseContent(fileContents)
    
}

// TODO:
// - inheritance error
