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

interface SingleValueBoxProps {
    lable: string;
    result: string;
    showMetaInformation: boolean;
}

export class SingleValueBox extends React.Component<SingleValueBoxProps, {} > {

    render(): JSX.Element {

        return <div className='col-sm'>
            <div className='card'>
                <div className='card-body'>
                {this.props.showMetaInformation && <span><span className='badge badge-secondary'>ValueBox</span>&nbsp;</span>}
                <p className='card-text ui-creation-value'>
                        <strong>{this.props.result}</strong>
                </p>
                <span className='text-muted'><small>{this.props.lable}</small></span>
                    
                    
                </div>
            </div>
        </div>;
    }
    
}