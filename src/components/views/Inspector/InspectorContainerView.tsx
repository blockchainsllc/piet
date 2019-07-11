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
import { SelectedView } from './SelectedView';
import SplitPane from 'react-split-pane';
import { TabEntity, TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';
import { BlockchainConnection, ConnectionType, checkBlockchainConnection, getWeiBalance } from '../../../solidity-handler/BlockchainConnector';
import { timingSafeEqual } from 'crypto';

interface InspectorContainerViewProps {
    blockchainConnection: BlockchainConnection;
    markCode: Function;
    changeContractAddress: Function;
    addTabEntity: Function;
    selectedElement: Sol.NodeElement;
    contracts: Sol.Contract[];
    getEvents: Function;
    selectedTabTypeForView: TabEntityType[];
    uiCreationHandling: UICreationHandling;
}

interface InspectorContainerViewState {
    testMode: boolean;
    editContractAddress: boolean;
    showInheritedMembers: boolean;
    weiBalance: string;

}

export class InspectorContainerView extends React.Component<InspectorContainerViewProps, InspectorContainerViewState> {

    constructor(props: InspectorContainerViewProps) {
        super(props);
        this.state = {
            testMode: false,
            showInheritedMembers: false,
            weiBalance: null,
            editContractAddress: false
        };

        this.toogleTestMode = this.toogleTestMode.bind(this);
        this.toogleShowInheritedMembers = this.toogleShowInheritedMembers.bind(this);
        this.toogleEditContractAddress = this.toogleEditContractAddress.bind(this);

        this.submitNewContractAddress = this.submitNewContractAddress.bind(this);
    }

    componentDidMount(): void {
       this.init(this.props);
    }

    componentWillReceiveProps(props: InspectorContainerViewProps): void {
        this.init(this.props);
    }

    async init(props: InspectorContainerViewProps): Promise<void> {

        if (
            props.selectedElement &&
            props.selectedElement.elementType === Sol.ElementType.Contract && 
            (props.selectedElement as Sol.Contract).deployedAt 
        ) {
            const weiBalance: string = checkBlockchainConnection(props.blockchainConnection) ?
                await getWeiBalance(this.props.blockchainConnection, (props.selectedElement as Sol.Contract).deployedAt) :
                null;
            this.setState({
                testMode: checkBlockchainConnection(this.props.blockchainConnection),
                weiBalance
            });
        } else {
            this.setState({
                weiBalance: null
            });
        }
    }

    toogleTestMode (): void {
        this.setState((prevState: InspectorContainerViewState) => ({testMode: !prevState.testMode}));
    }

    toogleShowInheritedMembers (): void {
        this.setState((prevState: InspectorContainerViewState) => ({showInheritedMembers: !prevState.showInheritedMembers}));
    }

    toogleEditContractAddress (): void {
        this.setState((prevState: InspectorContainerViewState) => ({editContractAddress: !prevState.editContractAddress}));
    }

    submitNewContractAddress(newContractAddress: string, contractName: string): void {
        this.setState({editContractAddress: false});
        this.props.changeContractAddress(newContractAddress, contractName);
        
    }

    getInspectorClass(): string {
        if (this.props.selectedElement) {
            switch (this.props.selectedElement.elementType) {
                case Sol.ElementType.Contract:
                    return 'contract-inspector';
                
                case Sol.ElementType.Struct:
                    return 'struct-inspector';
    
                case Sol.ElementType.Enum:
                    return 'enum-inspector';
    
                default:
                    return 'default-background';
            }
        }
        
    }

    render(): JSX.Element {
        return  <SplitPane 
                    className={'scrollable hide-resizer default-inspecor ' + this.getInspectorClass()}
                    split='horizontal'  
                    defaultSize={40} 
                    allowResize={false} 
                >
                    <div className='h-100 w-100 toolbar'>
                        <button 
                            title={this.state.showInheritedMembers ? 'Hide Inherited Members' : 'Show Inherited Members' } 
                            className={'btn btn-sm btn' + (this.state.showInheritedMembers ? '' : '-outline') + '-info'}
                            onClick={() => this.toogleShowInheritedMembers()}
                        >
                            <i className='fas fa-sitemap'></i>
                        </button>
                        &nbsp;
                        <button 
                            title={this.state.testMode ? 'Deactivate Ineractive Mode' : 'Activate Ineractive Mode' } 
                            className={'btn btn-sm btn' + (this.state.testMode ? '' : '-outline') + '-info'}
                            onClick={() => this.toogleTestMode()}
                        >
                            <i className='fas fa-handshake'></i>
                        </button>
                        &nbsp;
                        <a 
                            title={this.state.editContractAddress ? 'Submit New Contract Address' : 'Edit Contract Address' } 
                            href='#meta'
                            className={'btn btn-sm btn' + (this.state.editContractAddress ? '' : '-outline') + '-info'}
                            onClick={() => this.toogleEditContractAddress()}
                        >
                            <i className='fas fa-edit'></i>
                        </a>
                    </div>
                    <SplitPane 
                        className='scrollable hide-resizer empty-first-pane' 
                        split='horizontal'  
                        defaultSize={1} 
                        allowResize={false} 
                    >
                        <div></div>
                        <SelectedView 
                            uiCreationHandling={this.props.uiCreationHandling}
                            selectedTabTypeForView={this.props.selectedTabTypeForView}
                            toggleInheritance={this.toogleShowInheritedMembers}
                            contracts={this.props.contracts}
                            testMode={this.state.testMode} 
                            blockchainConnection={this.props.blockchainConnection}
                            markCode={this.props.markCode}
                            showInheritedMembers={this.state.showInheritedMembers}
                            selectedElement={this.props.selectedElement}
                            addTabEntity={this.props.addTabEntity} 
                            editContractAddress={this.state.editContractAddress}
                            changeContractAddress={this.submitNewContractAddress}
                            getEvents={this.props.getEvents}
                            weiBalance={this.state.weiBalance}
                        />
                    </SplitPane>
                </SplitPane>;

    }
    
}