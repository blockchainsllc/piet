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

import * as React from 'react';
import * as Sol from '../../../solidity-handler/SolidityHandler';
import { SelectedView } from './SelectedView';
import SplitPane from 'react-split-pane';
import { TabEntityType } from '../../View';
import { UICreationHandling } from '../ui-creation/UIStructure';
import { BlockchainConnection, checkBlockchainConnection, getWeiBalance } from '../../../solidity-handler/BlockchainConnector';
import { ContractCodeBox } from '../CodeBox/ContractCodeBox';


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
    codeBoxIsShown: boolean;

}

export class InspectorContainerView extends React.Component<InspectorContainerViewProps, InspectorContainerViewState> {

    constructor(props: InspectorContainerViewProps) {
        super(props);
        this.state = {
            testMode: false,
            showInheritedMembers: false,
            weiBalance: null,
            editContractAddress: false,
            codeBoxIsShown: false
        };

        this.toogleTestMode = this.toogleTestMode.bind(this);
        this.toogleShowInheritedMembers = this.toogleShowInheritedMembers.bind(this);
        this.toogleEditContractAddress = this.toogleEditContractAddress.bind(this);
        this.submitNewContractAddress = this.submitNewContractAddress.bind(this);
        this.showDocumentation = this.showDocumentation.bind(this);
        this.showCodeBox = this.showCodeBox.bind(this);

    }

    showDocumentation(): void {
        this.props.addTabEntity(
            {
                active: true,
                contentType: TabEntityType.DocGenerator,
                name: 'Documentation',
                content: null,
                icon: 'book-open',
                removable: true
            }, 
            1,
            false
        );
    }

    showCodeBox(show: boolean): void {
        this.setState({codeBoxIsShown: show});
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
                    const contract: Sol.Contract = (this.props.selectedElement as Sol.Contract);
                    return  contract.isAbstract  ? 'abstract-contract-inspector' : 'contract-inspector';
                
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
                        { this.props.selectedElement && this.props.selectedElement.elementType === Sol.ElementType.Contract &&
                            <ContractCodeBox 
                                blockchainConnection={this.props.blockchainConnection}
                                codeBoxIsShown={this.state.codeBoxIsShown}
                                showContractCodeBox={this.showCodeBox}
                                contract={this.props.selectedElement as Sol.Contract}
                            />
                        }
                        
                        <div className='d-flex w-100 justify-content-between full-block'>
                            <div>
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
                                <button 
                                    title={'Generate Documentation' } 
                                    className={'btn btn-sm btn-outline-info'}
                                    onClick={this.showDocumentation}
                                >
                                    <i className='fas fa-book-open'></i>
                                </button>
                                &nbsp;
                                <button 
                                    title={'Show Contract Code'} 
                                    className={'btn btn-sm btn-outline-info'}
                                    onClick={() => this.showCodeBox(true)}
                                    data-toggle='modal' 
                                    data-target={'.contractCodeModal'}
                                >
                                    <i className='fas fa-file-code'></i>
                                </button>
                            </div>
                        
                            <a 
                                title={this.state.editContractAddress ? 'Submit New Contract Address' : 'Edit Contract Address' } 
                                href='#meta'
                                className={'btn btn-sm btn' + (this.state.editContractAddress ? '' : '-outline') + '-info'}
                                onClick={() => this.toogleEditContractAddress()}
                            >
                                <i className='fas fa-edit'></i> Instance Address
                            </a>
                        </div>
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