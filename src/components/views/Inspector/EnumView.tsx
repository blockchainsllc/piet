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

interface EnumViewProps {
    selectedEnum: Sol.ContractEnumeration;
}

export class EnumView extends React.Component<EnumViewProps, {}> {

    render(): JSX.Element {

        const enumFields: JSX.Element[] = this.props.selectedEnum.entries.map((enumEntry: Sol.EnumEntry, index: number) => 
            <div className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                key={this.props.selectedEnum.name + enumEntry.name}>
                    {index}:&nbsp;
                    <strong>
                        <span className='member-name'>
                            {enumEntry.name}
                        </span>
                    </strong>
                    
            </div>
        );

        return  <div className='card selected-card h-100'>

                    <div className='card-body selected-card enum-card'>
                        <div className='text-center'>
                            <h5 className='parent-headline inspector-view-headline'>{this.props.selectedEnum.parentName}.</h5>
                            <h3 className='short-name-headline inspector-view-headline'>{this.props.selectedEnum.shortName}</h3>
                            <h6 className='card-subtitle mb-2 contract-subtitle'>
                                <span className='badge badge-dark'>Enumeration</span>
                            </h6>
                
                        </div>
                        <br />
                  
                        <div className='list-group'>{enumFields}</div>
                        
                    </div>
                </div>;   
  
    }
    
}