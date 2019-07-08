

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
import SplitPane from 'react-split-pane';
import * as ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';

interface DocGeneratorViewProps {
    content: string;
    viewId: number;
    tabId: number;

}

interface DocGeneratorViewState {
    showPreview: boolean;
}

export class DocGeneratorView extends React.Component<DocGeneratorViewProps, DocGeneratorViewState> {

    constructor(props: DocGeneratorViewProps) {
        super(props);
     
        this.state = {
            showPreview: false
        };
        this.togglePreview = this.togglePreview.bind(this);
        this.save = this.save.bind(this);
   
    }

    togglePreview(): void {
        this.setState((prevState: DocGeneratorViewState) => ({
            showPreview: !prevState.showPreview
        }));
    }

    save(): void {

        saveAs(new Blob([this.props.content], {type : 'text/plain'}), 'export' + Date.now() + '.md');

    }

    render(): JSX.Element {

        const markdown: string = this.props.content ? this.props.content : 'Select a contract to generate its documentation.';

        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
                    <div className='h-100 w-100 toolbar'>
                        <button 
                            className={'btn btn-sm btn' + (this.state.showPreview ? '' : '-outline') + '-info'} 
                            onClick={this.togglePreview}
                            title='Show preview'
                        >
                            Preview
                        </button>
                        &nbsp;&nbsp;&nbsp;
                        <button 
                            className={'btn btn-sm btn-outline-info'} 
                            onClick={this.save}
                            title='Download markdown file'

                        >
                            <i className='fas fa-download'></i>
                        </button>
                    </div>
                    <SplitPane 
                        className={'scrollable hide-resizer empty-first-pane' + (this.state.showPreview ? ' markdown-preview' : '')}
                        split='horizontal'
                        defaultSize={1}
                        allowResize={false}
                    >
                        <div></div>
                        <div className={'container-fluid'}>
                            <div className='row'>
                                <div className='col-12'>
                                    {
                                        this.state.showPreview ?
                                            <ReactMarkdown source={markdown} /> :
                                     
                                            <pre className='markdown-code'>
                                                {markdown}
                                            </pre>
                                       
                                    }
                                        
                                </div>
                            </div>
                        </div>
                    </SplitPane>
                </SplitPane>;
               
    }
    
}