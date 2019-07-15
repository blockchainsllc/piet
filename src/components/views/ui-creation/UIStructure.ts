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