/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react'
import * as Sol from '../../../solidity-handler/SolidityHandler'


interface StructViewProps {
    selectedStruct: Sol.ContractStruct,
 
}

export class StructView extends React.Component<StructViewProps, {}> {
 
    render() {

        const struct = this.props.selectedStruct
        const structFields = struct.fields.map((stateVariable: Sol.ContractStateVariable) => 
            <div className='selected-list-item list-group-item list-group-item-action flex-column align-items-start'
                key={struct.name + stateVariable.name}>
           
                    <strong>
                        <span className='member-name'>
                            {stateVariable.name}
                        </span>
                    </strong>
                    <small>&nbsp;{stateVariable.solidityType.name}</small>
                
            </div>
        )

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
                </div>   
  
    }
    
}