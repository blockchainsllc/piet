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

import * as React from 'react';
import * as Sol from '../../../solidity-handler/SolidityHandler';
import { ContractView } from './ContractView';
import { EnumView } from './EnumView';
import { StructView } from './StructView';
import { TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';
import { BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';

interface SelectedViewProps {
    selectedElement: Sol.NodeElement;
    testMode: boolean;
    toggleInheritance: Function; 
    blockchainConnection: BlockchainConnection;
    showInheritedMembers: boolean;
    addTabEntity: Function;
    markCode: Function;
    editContractAddress: boolean;
    changeContractAddress: Function;
    getEvents: Function;
    contracts: Sol.Contract[];
    selectedTabTypeForView: TabEntityType[];
    uiCreationHandling: UICreationHandling;
    weiBalance: string;
    toogleEditContractAddress: Function;
}

export class SelectedView extends React.Component<SelectedViewProps, {}> {
  
    render(): JSX.Element {
        let view: JSX.Element;

        if (!this.props.selectedElement) {
            view = <small className='text-center text-muted inspector-info'>
                Click on the name of an element in the graph view. 
            </small>;
        } else {
            switch (this.props.selectedElement.elementType) {
                case Sol.ElementType.Contract:
                    view = <ContractView 
                                toogleEditContractAddress={this.props.toogleEditContractAddress}
                                uiCreationHandling={this.props.uiCreationHandling}
                                selectedTabTypeForView={this.props.selectedTabTypeForView}
                                toggleInheritance={this.props.toggleInheritance}
                                contracts={this.props.contracts}
                                addTabEntity={this.props.addTabEntity}
                                markCode={this.props.markCode}
                                testMode={this.props.testMode} 
                                blockchainConnection={this.props.blockchainConnection}
                                showInheritedMembers={this.props.showInheritedMembers} 
                                selectedContract={this.props.selectedElement as Sol.Contract} 
                                editContractAddress={this.props.editContractAddress}
                                changeContractAddress={this.props.changeContractAddress}
                                getEvents={this.props.getEvents}
                                weiBalance={this.props.weiBalance}
                            />;
                    break;
                case Sol.ElementType.Enum:
                    view = <EnumView selectedEnum={this.props.selectedElement as Sol.ContractEnumeration} />;
                    break;
                case Sol.ElementType.Struct:
                    view = <StructView selectedStruct={this.props.selectedElement as Sol.ContractStruct} />;
                    break;
                default:
                    view = <small className='text-center text-muted inspector-info'>
                        Unsupported element type. 
                    </small> ;
    
            }
        }


        
        return  <div className='h-100'>

                    {view}

                </div>;
    }
    
}