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
import { EventTool } from '../ui-creation/InspectorTools/EventTool';
import { getEventAbi } from '../../../utils/AbiGenerator';
import { TabEntityType } from '../../View';
import * as axios from 'axios';
import { BlockchainConnection } from '../../../solidity-handler/BlockchainConnector';

interface CompilerMetaDataViewProps {
    blockchainConnection: BlockchainConnection;
    contractAddress: string;
    addTabEntity: Function;
}

interface CompilerMetaDataViewState {
    metaData: any;
}

function chainIdToName(id: string): string {
    switch (id) {
        case '1':
            return 'mainnet';
        case '3':
            return 'ropsten';
        case '4':
            return 'rinkeby';
        case '5':
            return 'goerli';
        case '42':
            return 'kovan';
        default:
            return null;
    }
}


export class CompilerMetaDataView extends React.Component<CompilerMetaDataViewProps, CompilerMetaDataViewState> {

    constructor(props: CompilerMetaDataViewProps) {
        super(props);
        this.state = {
            metaData: null
        };
        this.updateMetaData = this.updateMetaData.bind(this);
        this.showMetaData = this.showMetaData.bind(this);
    }

    componentDidMount(): void {
        this.updateMetaData(this.props.contractAddress);
    }

    componentWillReceiveProps(nextProps: CompilerMetaDataViewProps): void {
        if (this.props.contractAddress !== nextProps.contractAddress) {
            this.updateMetaData(nextProps.contractAddress);
        }
    }

    showMetaData(): void {
        this.props.addTabEntity(
            {
                active: true,
                contentType: TabEntityType.Json,
                removable: true,
                name: 'Metadata',
                content: this.state.metaData,
                icon: 'info-circle',
                isLoading: false
            
            },                      
            1, 
            true
        );
    }

    async updateMetaData(contractAddress: string): Promise<void> {
        if (contractAddress) {
            const chain = chainIdToName(this.props.blockchainConnection.netVersion);
            const address = this.props.blockchainConnection.web3.utils.toChecksumAddress(contractAddress);
            
            if (chain) {
                let data: any;
                const url = 'https://gateway.ipfs.io/ipfs/QmQvRyeZHnceAw8dTw3ytAVQZnqYeK61TvFwdnydnmCzY3/contract/'
                    + chain + '/' + address + '/metadata.json';
                try {
                    data = (await (axios as any).get(url)).data;
                    this.setState({
                        metaData: {
                            source: url,
                            metaData: data

                        }
                    });   
                } catch (e) {
                    console.log(e);
                }
            
                
            }
            
        }
   
    }

    render (): JSX.Element {

        return  <a  href='#' 
            className='
                selected-list-item
                list-group-item
                list-group-item-action
                flex-column
                align-items-start
            '

        >
        <strong>Metadata</strong>
        <div>
            <span className='input-output'>{this.state.metaData && this.state.metaData.metaData ? 
                this.state.metaData.metaData.language + ' ' + this.state.metaData.metaData.compiler.version 
                : 'No metadata found'
            }</span>
            {this.state.metaData && 
                <div className='text-right'>
                <button 
                    type='button'
                    className='function-operation-button btn btn-outline-primary btn-sm'
                    onClick={this.showMetaData}
                >
                    More
                </button>
                </div>
            }
        </div>
    </a>
    }
    
}