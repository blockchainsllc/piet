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
import Web3Type from '../../../types/web3';
import { SelectedView } from './SelectedView';
import SplitPane from 'react-split-pane';
import { TabEntity, TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';

interface InspectorContainerViewProps {
    web3: Web3Type;
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

}

export class InspectorContainerView extends React.Component<InspectorContainerViewProps, InspectorContainerViewState> {

    constructor(props: InspectorContainerViewProps) {
        super(props);
        this.state = {
            testMode: false,
            showInheritedMembers: false,
    
            editContractAddress: false
        };

        this.toogleTestMode = this.toogleTestMode.bind(this);
        this.toogleShowInheritedMembers = this.toogleShowInheritedMembers.bind(this);
        this.toogleEditContractAddress = this.toogleEditContractAddress.bind(this);

        this.submitNewContractAddress = this.submitNewContractAddress.bind(this);
    }

    componentDidMount(): void {
        if (this.props.selectedElement && this.props.selectedElement.elementType === Sol.ElementType.Contract
            && (this.props.selectedElement as Sol.Contract).deployedAt) {
            this.setState({
                testMode: true
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

    render(): JSX.Element {
        return   <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
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
                            web3={this.props.web3}
                            markCode={this.props.markCode}
                            showInheritedMembers={this.state.showInheritedMembers}
                            selectedElement={this.props.selectedElement}
                            addTabEntity={this.props.addTabEntity} 
                            editContractAddress={this.state.editContractAddress}
                            changeContractAddress={this.submitNewContractAddress}
                            getEvents={this.props.getEvents}
                        />
                    </SplitPane>
                </SplitPane>;

    }
    
}