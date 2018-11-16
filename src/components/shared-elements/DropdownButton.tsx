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

export class DropdownButton extends React.Component<{}, {}> {

    render(): JSX.Element {
       
        return  <div className='dropdown'>
                    <button 
                        className='btn btn-secondary dropdown-toggle' 
                        type='button' 
                        id='dropdownMenuButton' 
                        data-toggle='dropdown' 
                        aria-haspopup='true' 
                        aria-expanded='false'
                    >
                        Dropdown button
                    </button>
                    <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                        <a className='dropdown-item' href='#'>Action</a>
                        <a className='dropdown-item' href='#'>Another action</a>
                        <a className='dropdown-item' href='#'>Something else here</a>
                    </div>
                </div>;

    }

}