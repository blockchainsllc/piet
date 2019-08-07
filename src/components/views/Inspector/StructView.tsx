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

interface StructViewProps {
    selectedStruct: Sol.ContractStruct;
 
}

export class StructView extends React.Component<StructViewProps, {}> {
 
    render(): JSX.Element {

        const struct: Sol.ContractStruct = this.props.selectedStruct;
        const structFields: JSX.Element[] = struct.fields.map((stateVariable: Sol.ContractStateVariable) => 
            <div className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                key={struct.name + stateVariable.name}>
           
                    <strong>
                        <span className='member-name'>
                            {stateVariable.name}
                        </span>
                    </strong>
                    <small>&nbsp;{stateVariable.solidityType.name}</small>
                
            </div>
        );

        return  <div className='card selected-card h-100'>

                    <div className='card-body selected-card struct-card'>
                        <div className='text-center'>
                            <h5 className='parent-headline inspector-view-headline'>{this.props.selectedStruct.parentName}.</h5>
                            <h3 className='short-name-headline inspector-view-headline'>{this.props.selectedStruct.shortName}</h3>
                            <h6 className='card-subtitle mb-2 contract-subtitle'>
                                <span className='badge badge-dark'>Struct</span>
                            </h6>
                
                        </div>
                        <br />
                  
                        <div className='list-group'>{structFields}</div>
                        
                    </div>
                </div>;   
  
    }
    
}