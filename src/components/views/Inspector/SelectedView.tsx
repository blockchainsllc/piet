/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
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
}

export class SelectedView extends React.Component<SelectedViewProps, {}> {
  
    render(): JSX.Element {

        if (!this.props.selectedElement) {
            return null;
        }

        let view: JSX.Element;
        switch (this.props.selectedElement.elementType) {
            case Sol.ElementType.Contract:
                view = <ContractView 
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
                view = null;

        }
        
        return  <div className='h-100'>

                    {view}

                </div>;
    }
    
}