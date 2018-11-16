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