/**
 * 
 */

export type SetUIStructure = (uiStructure: UIStructure) => void;
export type AddRow = () => void;
export type AddElementToRow = (rowIndex: number, element: Element) => void;

export interface UICreationHandling {
    uiStructure: UIStructure;
    addRow: AddRow;
    addElementToRow: AddElementToRow;
    setUIStructure: SetUIStructure;
}

export interface UIStructure {
    contracts: Contract[];
    rows: Row[];
    
}

export interface Contract {
    address: string;
    abi: any[];
}
export interface Row {
    elements: Element[];
    
}

export enum ElementType {
    ValueBox,
    EventTable
}

export interface Element {
    elementType: ElementType;
    data: any;
    contractAddress: string;
    abi: any;
    functionName: string;
    
}