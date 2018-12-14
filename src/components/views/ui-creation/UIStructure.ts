/**
 * 
 */

export type SetUIStructure = (uiStructure: UIStructure) => void;
export type AddRow = () => void;
export type AddElementToRow = (rowIndex: number, element: Element) => void;
export type AddElementToAction = (element: Element) => void;
export type AddEthAccount = (privateKey: string) => void;

export interface UICreationHandling {
    uiStructure: UIStructure;
    addRow: AddRow;
    addElementToRow: AddElementToRow;
    setUIStructure: SetUIStructure;
    addElementToAction: AddElementToAction;
    addEthAccount: AddEthAccount;
    ethAccount: string;
}

export interface UIStructure {
    contracts: Contract[];
    rows: Row[];
    actionElements: Element[]; 
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
    EventTable,
    ActionModal
}

export interface Element {
    elementType: ElementType;
    data: any;
    contractAddress: string;
    abi: any;
    functionName: string;
    
}