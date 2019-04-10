/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as PromiseFileReader from 'promise-file-reader';
import * as parser from 'solidity-parser-antlr';

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
    name: string;
    elementType: ElementType;
}

export interface Contract  extends NodeElement {
    
    baseContracts: string[];
    enumerations: ContractEnumeration[];
    structs: ContractStruct[];
    stateVariables: ContractStateVariable[];
    inheritedStateVariables: ContractStateVariable[];
    functions: ContractFunction[];
    inheritedFunctions: ContractFunction[];
    annotations: SolidityAnnotation[];
    deployedAt: string;
    meta: any;
    modifiers: ContractModifier[];
    inheritedModifiers: ContractModifier[];
    events: ContractEvent[];
    inheritedEvents: ContractEvent[];
    heritageDissolved: boolean;
    source: string;
    inFile: string;
    kind: string;
    references: string[];
    isAbstract: boolean;

}

export interface ContractEvent {
    name: string;
    params: ContractFunctionParam[];
}

export interface ContractModifier {
    name: string;
    params: ContractFunctionParam[];
}

export interface ContractEnumeration extends NodeElement {
    name: string;
    shortName: string;
    parentName: string;
    entries: EnumEntry[];
}

export interface ContractStruct extends NodeElement {
    name: string;
    shortName: string;
    parentName: string;
    fields: ContractStateVariable[];
}

export interface ContractFunction {
    name: string;
    params: ContractFunctionParam[];
    returnParams: ContractFunctionParam[];
    description: string;
    modifiers: string[];
    source: string;
    start: number;
    end: number;
    annotations: SolidityAnnotation[];
}

export interface ContractStateVariable {
    name: string;
    solidityType: SolidityType;
    visibility: string;
    getter: ContractFunction;
}

export interface ContractFunctionParam {
    name: string;
    solidityType: SolidityType;
    isStorage: boolean;
    isIndexed: boolean;
    description: string;
}

export interface EnumEntry {
    name: string;
    index: number;
}

export interface Mapping {
    key: SolidityType;
    value: SolidityType;
}

export interface SolidityType {
    name: string;
    pureName?: string;
    mapping?: Mapping; 
    isArray: boolean;
    userDefined: boolean;
    references: string[];
}

export interface SolidityAnnotation {
    name: string;
    value: string;
    subAnnotation: SolidityAnnotation;
}

export const isCallAble: (contractFunction: ContractFunction) => boolean = (contractFunction: ContractFunction): boolean => {
    return contractFunction.modifiers.find((modifier: string) =>
        (modifier === 'constant' || modifier === 'view' || modifier === 'pure')
    ) !== undefined;
};

const getType: (node: any, references: string[]) => SolidityType = (node: any, references: string[]): SolidityType  => {
    switch (node.type) {
        case 'ElementaryTypeName': 
            return {
                name: node.name,
                userDefined: false,
                references: references,
                isArray: false
            };
        case 'UserDefinedTypeName': 
            return {
                name: node.namePath,
                userDefined: true,
                references: references.concat(node.namePath),
                isArray: false
            };
           
        case 'ArrayTypeName': 
            const theType: SolidityType = getType(node.baseTypeName, references);
            return {
                name: theType.name + '[]',
                pureName: theType.name,
                userDefined: theType.userDefined,
                references: references,
                isArray: true
            };

        case 'Mapping': 
            const keyType: SolidityType = getType(node.keyType, references);
            const valueType: SolidityType = getType(node.valueType, references);
            return {
                name: '(' + keyType.name + ' => ' + valueType.name + ')',
                mapping: {
                    key: keyType,
                    value: valueType
                },
                userDefined: valueType.userDefined,
                references: references,
                isArray: false
            };
        default:
            throw Error('Unknown Solidity type.');
    }
};

const getEnums: (node: any) => ContractEnumeration[] = (node: any): ContractEnumeration[] => {
    return node.subNodes
        .filter((subNode: any) => subNode.type && subNode.type === 'EnumDefinition')
        .map((subNode: any) => ({
            name: node.name + '.' + subNode.name,
            shortName: subNode.name,
            parentName: node.name,
            elementType: ElementType.Enum,
            entries: subNode.members
                .filter((enumSubNode: any) => subNode.type && enumSubNode.type === 'EnumValue')
                .map((enumSubNode: any, index: number)  => ({
                    name: enumSubNode.name,
                    index: index
                }))
        }));
};

const getStructs: (node: any) => ContractStruct[] = (node: any): ContractStruct[] => {
    return node.subNodes
        .filter((subNode: any) => subNode.type && subNode.type === 'StructDefinition')
        .map((subNode: any) => ({
            name: node.name + '.' + subNode.name,
            shortName: subNode.name,
            parentName: node.name,
            elementType: ElementType.Struct,
            fields: subNode.members
                .filter((structSubNode: any) => structSubNode.type && structSubNode.type === 'VariableDeclaration')
                .map((structSubNode: any) => ({
                    name: structSubNode.name,
                    solidityType: getType(structSubNode.typeName, []),
                    visibility: null
                }))
        }));
};

const getVariable: (variablesList: any) => ContractFunctionParam = (variablesList: any): ContractFunctionParam => {
    return variablesList
        .filter((subNode: any) => subNode.type && subNode.type === 'VariableDeclaration')
        .map((subNode: any) => ({
            name: subNode.name,
            solidityType: getType(subNode.typeName, []),
            isIndexed: subNode.isIndexed ? true : false,
            visibility: null
        }));
};

const getEvents: (node: any) => ContractEvent[] = (node: any): ContractEvent[] => {
    return node.subNodes
        .filter((subNode: any) => subNode.type && subNode.type === 'EventDefinition')
        .map((subNode: any) => ({
            name: subNode.name,
            params: subNode.parameters.parameters && subNode.parameters.parameters.length > 0 ?
                getVariable(subNode.parameters.parameters) : []
        }));
};

const getModifiers: (node: any) => ContractModifier[] = (node: any): ContractModifier[] => {
    return node.subNodes
        .filter((subNode: any) => subNode.type && subNode.type === 'ModifierDefinition')
        .map((subNode: any) => ({
            name: subNode.name,
            params: subNode.parameters.parameters && subNode.parameters.parameters.length > 0 ?
                getParameters(subNode.parameters) : []
        }));
};

const getFunctions: (node: any, source: string) => ContractFunction[] = (node: any, source: string): ContractFunction[] => {
    return node.subNodes
        .filter((subNode: any) => subNode.type && subNode.type === 'FunctionDefinition')
        .map((subNode: any) => {

            const annotations: SolidityAnnotation[] = getAnnotations(source, subNode);

            return {
                name: subNode.name === null && subNode.isConstructor ? 'constructor' : subNode.name ,
                params: subNode.parameters ? getParameters(subNode.parameters, annotations) : [],
                returnParams: subNode.returnParameters ? getParameters(subNode.returnParameters) : [],
                description: annotations
                    .filter((annotation: SolidityAnnotation) => annotation.name === 'notice')
                    .map((annotation: SolidityAnnotation) => annotation.value)
                    .reduce((previous: string, current: string, index: number) => previous + (index !== 0 ? '\n' : '') + current, ''),
                modifiers: subNode.modifiers.map((modifier: any) => modifier.name).concat([subNode.visibility, subNode.stateMutability]),
                source: source.slice(subNode.range[0], subNode.range[1] + 1),
                start: subNode.loc.start,
                end: subNode.loc.end,
                annotations: annotations
            };
        });
};

const getParameters: (parameterList: any, annotations?: SolidityAnnotation[]) => ContractFunctionParam = 
    (parameterList: any, annotations?: SolidityAnnotation[]): ContractFunctionParam => {
        return parameterList.parameters
            .filter((subNode: any) => subNode.type && subNode.type === 'Parameter')
            .map((subNode: any) => {

                const foundAnnotation: SolidityAnnotation = annotations ? annotations
                    .find((annotation: SolidityAnnotation) => 
                        annotation.name === 'param' && annotation.subAnnotation.name === subNode.name) 
                    : null;
                
                return {
                    name: subNode.name,
                    solidityType: getType(subNode.typeName, []),
                    isStorage: subNode.storageLocation !== null,
                    isIndexed: subNode.isIndexed ? true : false,
                    description: foundAnnotation ? foundAnnotation.subAnnotation.value : ''
                };
            });
    };

const getStateVariables: (node: any) => ContractStateVariable[] = (node: any): ContractStateVariable[] => {
    const varibales: any[] = node.subNodes
        .filter((subNode: any) => subNode.type && subNode.variables && subNode.type === 'StateVariableDeclaration')
        .map((subNode: any) => subNode.variables[0]);

    return varibales.map((variable: any) => {
        
        let params: ContractFunctionParam[] = [];
        let returnParams: ContractFunctionParam[] = [];

        switch (variable.typeName.type) {
            case 'Mapping':
                params = [{
                    name: variable.typeName.name,
                    solidityType: getType(variable.typeName, []),
                    isStorage: false,
                    isIndexed: false,
                    description: null
                }];
                returnParams = [{
                    name: variable.typeName.name,
                    solidityType: params[0].solidityType.mapping.value,
                    isStorage: false,
                    isIndexed: false,
                    description: null
                }];
                params[0].solidityType = params[0].solidityType.mapping.key;
                
                break; 
            case 'ArrayTypeName':
                params = [{
                    name: variable.typeName.name,
                    solidityType: {
                        isArray: false,
                        name: 'uint256',
                        references: [],
                        userDefined: false
                    },
                    isStorage: false,
                    isIndexed: false,
                    description: null
                }];
                returnParams = [{
                    name: variable.typeName.name,
                    solidityType: getType(variable.typeName, []),
                    isStorage: false,
                    isIndexed: false,
                    description: null
                }];
                returnParams[0].solidityType.name = returnParams[0].solidityType.pureName;
                returnParams[0].solidityType.isArray = false;
                break; 
            default:
                returnParams = [{
                    name: variable.typeName.name,
                    solidityType: getType(variable.typeName, []),
                    isStorage: false,
                    isIndexed: false,
                    description: null
                }];
                
        }

        const getter: ContractFunction = {
            annotations: null,
            description: null,
            end: null,
            modifiers: variable.visibility === 'public' ? ['view', 'public'] : [],
            name: variable.name,
            params: params,
            returnParams: returnParams,
            source: null,
            start: null
        };

        return {
            name: variable.name,
            solidityType: getType(variable.typeName, []),
            visibility: variable.visibility,
            getter
        };
    });
};

const contractMemberCopy: (contract: Contract, generalContract: Contract) => Contract = 
    (contract: Contract, generalContract: Contract): Contract => {
        contract.inheritedFunctions = contract.inheritedFunctions
            .concat(generalContract.functions
                .concat(generalContract.inheritedFunctions)
                .filter((generalF: ContractFunction) => 
                    !contract.inheritedFunctions.find((f: ContractFunction) => generalF.name === f.name)
                    && !contract.functions.find((f: ContractFunction) => generalF.name === f.name)
                    && generalContract.name !== generalF.name
                )
            );
        
        contract.inheritedModifiers = contract.inheritedModifiers
            .concat(generalContract.modifiers
                .concat(generalContract.inheritedModifiers)
                .filter((generalF: ContractFunction) => 
                    !contract.inheritedModifiers.find((f: ContractFunction) => generalF.name === f.name)
                    && !contract.modifiers.find((f: ContractFunction) => generalF.name === f.name)
                )
            );
        
        contract.inheritedStateVariables = contract.inheritedStateVariables
            .concat(generalContract.stateVariables
                .concat(generalContract.inheritedStateVariables)
                .filter((general: ContractStateVariable) => 
                    !contract.stateVariables.find((f: ContractStateVariable) => general.name === f.name)
                    && !contract.inheritedStateVariables.find((f: ContractStateVariable) => general.name === f.name)
                )
            );
        
        contract.inheritedEvents = contract.inheritedEvents
            .concat(generalContract.events
                .concat(generalContract.inheritedEvents)
                .filter((general: ContractEvent) => 
                    !contract.events.find((f: ContractEvent) => general.name === f.name)
                    && !contract.inheritedEvents.find((f: ContractEvent) => general.name === f.name)
                )
            );
        
        return contract;

    };

const dissolveHeritage: (contract: Contract, contracts: Contract[]) => 
    Contract = (contract: Contract, contracts: Contract[]): Contract => { 

        if (contract.heritageDissolved || contract.baseContracts.length === 0) {
            contract.heritageDissolved = true;
            return contract;
        } else {

            let contractToReturn: Contract = contract;

            contract.baseContracts.forEach((contractName: string) => {
                let generalContract: Contract = contracts.find((c: Contract) => c.name === contractName);

                if (generalContract) {
                    generalContract = dissolveHeritage(generalContract, contracts);
                    // TODO: fix
                    contractToReturn = contractMemberCopy(contract, generalContract); 
    
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
                    };
                    contracts.push(contractToReturn);
                }         

            });
            return contractToReturn;
        }

    };

const getAnnotationValue: (relevantPart: string) => SolidityAnnotation[] = (relevantPart: string): SolidityAnnotation[] => {
    const annotations: SolidityAnnotation[] = [];
    const firstSpaceAfterAt: number = relevantPart.search(/\s/);
    const secondSpaceAfterAt: number = relevantPart.slice(firstSpaceAfterAt + 1).search(/\s/);
    const secondRelevantPart: string = relevantPart.slice(firstSpaceAfterAt + 1);
    annotations.push({
        name: relevantPart.slice(0, firstSpaceAfterAt),
        value: relevantPart.slice(firstSpaceAfterAt + 1),
        subAnnotation: (relevantPart.slice(0, firstSpaceAfterAt) === 'param' ? {
            name: secondRelevantPart.slice(0, secondSpaceAfterAt),
            value: secondRelevantPart.slice(secondSpaceAfterAt + 1),
            subAnnotation: null
        } : null)
    });

    return annotations;
};

const getAnnotations: (source: string, node: any) => SolidityAnnotation[] = (source: string, node: any): SolidityAnnotation[] => {
    let annotations: SolidityAnnotation[] = [];
    const lines: string[] = source.slice(0, node.range[0]).split(/[\r\n]+/).reverse();
      
    let i: number = 0;
    let stop: boolean = false;

    while (i < lines.length && !stop) {
        const line: string = lines[i].trim();
        const atPosition: number = line.search(/@/);
        stop = !(line.length === 0 || (line.length > 3 && line.slice(0, 3) === '///' && atPosition !== -1));
        const relevantPart: string = line.slice(atPosition + 1);
        
        if (!stop && line.length !== 0) {
            annotations = annotations.concat(getAnnotationValue(relevantPart));
        }  
        i++; 

    }

    return annotations;
};

export const parseContent: (fileContents: any) => Contract[] = (fileContents: any): Contract[] => {
    const contracts: Contract[] = [];
    fileContents.forEach((fileContent: any) => {
        const nameSplit: string = fileContent.fileName.split('.');
        const fileType: string = nameSplit.length > 1 ? nameSplit[nameSplit.length - 1] : null;
        let meta: any;
        let source: string;

        switch (fileType) {
            case 'sol':
                source = fileContent.content;
                meta = null;
                break;

            case 'json':
                const jsonContent: any = JSON.parse(fileContent.content);
                source = jsonContent.source;
                meta = jsonContent;
                break;

            default:
                console.log('Unknown file type');
                return contracts;
        }

        const sourceUnit: any = parser.parse(source, {loc: true, range: true});
        parser.visit(sourceUnit, {
            ContractDefinition: (node: any): void => {

                const references: boolean[] = [];
                parser.visit(node, {
                    UserDefinedTypeName: (typeNode: any): any => {
                        references[(typeNode as any).namePath] = true;
                    }
                });

                const contract: Contract = {
                    elementType: ElementType.Contract,
                    name: node.name,
                    baseContracts: (node as any).baseContracts.map((base: any)  => base.baseName.namePath),
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
                        .filter((subNode: any) => subNode.type && subNode.type === 'FunctionDefinition' && subNode.body === null).length > 0
                };
                // console.log('################')
                // console.log(node)
                //console.log(contract)

                contracts.push(contract);

                // const soliumConf = {
                //     "extends": "solium:recommended",
                //     "plugins": [],
                //     "rules": {
 
                //     }
                // };
                // console.log(solium.lint(contract.source, soliumConf))

            }
        });
    });

    const contractsInclHeritage: Contract[] = contracts.map((contract: Contract) =>  dissolveHeritage(contract, contracts));
    return contracts;

};

export const pushFiles: (fileList: FileList) => Promise<Contract[]> = async (fileList: FileList): Promise<Contract[]> => {

    const reader: FileReader = new FileReader();
    const fileContentPromises: any[] =  Array(fileList.length).fill(null)
        .map(async (item: any, index: number) => ({
            content: await PromiseFileReader.readAsText(fileList[index]),
            fileName: fileList[index].name
        }));
    
    const fileContents: any = await Promise.all(fileContentPromises);

    return parseContent(fileContents);
    
};

// TODO:
// - inheritance error
