// tslint:disable-next-line:missing-jsdoc
import * as Sol from '../solidity-handler/SolidityHandler';
type GenerateMarkdownDoc = (nodeElement: Sol.NodeElement) => string;

export const generateMarkdownDoc: GenerateMarkdownDoc = (nodeElement: Sol.NodeElement): string => {
    const contract: Sol.Contract = nodeElement.elementType === Sol.ElementType.Contract ? nodeElement as Sol.Contract : null;
    if (contract) {
        let output: string = '# ' + contract.name + '\n';
        console.log(contract)

        output += contract.annotations
            .filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'title')
            .map((annotation: Sol.SolidityAnnotation) => '*' + annotation.value.trim() + '*\n')
            .reduce((prev: string, current: string) => (prev + current), '');
        
        output += contract.functions.concat(contract.inheritedFunctions)
            .map((contractFunction: Sol.ContractFunction) => 
                '## ' + (contractFunction.name ? contractFunction.name : 'FALLBACK')  + '\n' +
                contractFunction.annotations
                    .filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'notice')
                    .map((annotation: Sol.SolidityAnnotation) => '*' + annotation.value.trim() + '*\n')
                    .reduce((prev: string, current: string) => (prev + current), '') +
                (contractFunction.annotations.filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'dev')
                    .length > 0 ? '\n**Development notice:**\n' : '') +

                contractFunction.annotations
                    .filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'dev')
                    .map((annotation: Sol.SolidityAnnotation) => '*' + annotation.value.trim() + '*\n\n')
                    .reduce((prev: string, current: string) => (prev + current), '') +
                (contractFunction.params.length > 0 ? '\n**Parameters:**\n' : '') +
                contractFunction.params
                    .map((param: Sol.ContractFunctionParam) => { 
                        const paramAnnotation: Sol.SolidityAnnotation = contractFunction.annotations
                            .find((functionAnnotation: Sol.SolidityAnnotation) =>  
                                functionAnnotation.name === 'param' &&  functionAnnotation.subAnnotation.name === param.name
                            );
                        return '* ' + (param.name ? param.name + ' `' + param.solidityType.name + '`' : '`' + param.solidityType.name + '`')
                            + (paramAnnotation ? ': *' + paramAnnotation.subAnnotation.value.trim() : '') + '*\n';
                    }).reduce((prev: string, current: string) => (prev + current), '') +
                (contractFunction.params.length > 0 ? '\n' : '') +
                (contractFunction.returnParams.length > 0 ? '**Return Parameters:**\n' : '') +
                contractFunction.returnParams
                    .map((param: Sol.ContractFunctionParam) => 
                    '* ' + (param.name ? param.name + ' `' + param.solidityType.name + '`' : '`' + param.solidityType.name + '`') + '\n'
                ).reduce((prev: string, current: string) => (prev + current), '')
            
            ).reduce((prev: string, current: string) => prev + current);

        return output;
    } else {
        return null;
    }
    
};