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