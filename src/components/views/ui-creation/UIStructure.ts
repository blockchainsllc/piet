/**  
 *   This file is part of Piet.
 *
 *   Copyright (C) 2019  Heiko Burkhardt <heiko@slock.it>, Slock.it GmbH
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   Permissions of this strong copyleft license are conditioned on
 *   making available complete source code of licensed works and 
 *   modifications, which include larger works using a licensed work,
 *   under the same license. Copyright and license notices must be
 *   preserved. Contributors provide an express grant of patent rights.
 *   
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
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