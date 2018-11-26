
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

interface NavBarProps {

    showMetaInformation: boolean;
}
export class NavBar extends React.Component<NavBarProps, {} > {

    render(): JSX.Element {

        return <nav className='navbar sticky-top navbar-dark bg-primary ui-creation-'>
            <a className='navbar-brand' href='#'>
                {this.props.showMetaInformation && <span><span className='badge badge-light'>NavBar</span>&nbsp;</span>}
                New UI
            </a>
        </nav>;
    }
    
}