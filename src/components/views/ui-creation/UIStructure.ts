/**
 * 
 */

export type SetUIStructure = (uiStructure: UIStructure) => void;

export interface UICreationHandling {
    uiStructure: UIStructure;
    setUIStructure: SetUIStructure;
}

export interface UIStructure {
    contracts: Contract[];
    containers: Container[];
}

export interface Contract {
    address: string;
    abi: any[];
}

export enum ContainerType {
    ValueContainer
}

export interface Container {
    elements: Element[];
    
}

export enum ElementType {
    ValueBox
}

export interface Element {
    elementType: ElementType;
    data: any;
    
}