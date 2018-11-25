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
}

export class SingleValueBox extends React.Component<SingleValueBoxProps, {} > {

    render(): JSX.Element {

        return <div className='col-sm'>
            <div className='card'>
                <div className='card-body'>
                <span className='text-muted'><small>{this.props.lable}</small></span>
                    <p className='card-text'>
                        <strong>{this.props.result}</strong>
                    </p>
                    
                </div>
            </div>
        </div>;
    }
    
}