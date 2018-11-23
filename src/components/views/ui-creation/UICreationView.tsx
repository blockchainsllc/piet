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
import { Conversion, Convert } from '../../../solidity-handler/TypeConversion';
import Web3Type from '../../../types/web3';
import * as CsvParse from 'csv-parse';
import * as PromiseFileReader from 'promise-file-reader';
import SplitPane from 'react-split-pane';
import { Eth } from '../../../types/types';
import { UICreationHandling } from './UIStructure';

interface UICreationViewProps {
    web3: Web3Type;
    content: any;
    viewId: number;
    tabId: number;
    uiCreationHandling: UICreationHandling;
}

interface UICreationViewState {

}

export class UICreationView extends React.Component<UICreationViewProps, UICreationViewState> {

    constructor(props: UICreationViewProps) {
        super(props);

        this.state = {

        };

    }

    render(): JSX.Element {

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
        <div className='h-100 w-100 toolbar'>
            {/* <button 
                title='Zoom Out'
                className='btn btn-sm btn-outline-info'
                onClick={() => this.zoomOut()}
            >
                <i className='fa fa-minus' aria-hidden='true'></i>
            </button>
            &nbsp;
            <button 
                title='Zoom In'
                className='btn btn-sm btn-outline-info' 
                onClick={() => this.zoomIn()}
            >
                <i className='fa fa-plus' aria-hidden='true'></i>
            </button>
            &nbsp;
            &nbsp;
            &nbsp;
            <button 
                className={'btn btn-sm' + (this.state.viewType === ViewType.Inheritance ? ' btn-info' : ' btn-outline-info')}
                onClick={() => this.changeSubView(ViewType.Inheritance)}
            >
                Inheritance
            </button>
            &nbsp;
            <button 
                className={'btn btn-sm' + (this.state.viewType === ViewType.TypeResolution ? ' btn-info' : ' btn-outline-info')}
                onClick={() => this.changeSubView(ViewType.TypeResolution)}
            >
                References
            </button> */}
        </div>
        <SplitPane 
            className='scrollable hide-resizer empty-first-pane' 
            split='horizontal'
            defaultSize={1}
            allowResize={false}
        >
            <div>test</div>
            
        </SplitPane>
    </SplitPane>;
               
    }
    
}