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

import * as axios from 'axios';

export const getContracts: (user: string, repo: string, cb: Function, subDirPath: string) => Promise<void> =
async (user: string, repo: string, cb: (list: any[], error?: Error) => void, subDirPath: string): Promise<void> => {  
    let fileList: any[];

    try {        
        fileList = await getFileList(`https://api.github.com/repos/${user}/${repo}`, [], subDirPath);
        Promise.all(fileList.map((file: any) => 
            (axios as any).get(`https://api.github.com/repos/${user}/${repo}/git/blobs/${file.sha}`)  
        )).then((list: any) => cb(
            list.map((content: any, index: number) => ({
                fileName: fileList[index].name,
                content: atob(content.data.content)
            }))
        )).catch((error: Error) => {
            
            cb([], new Error(`${error.message} while loading the GitHub repository.`));
        });
    } catch (e) {
        cb([], new Error(`${e.message} while loading the GitHub repository. Are you trying to access a private repository?`));
    }
    
};

export const getPietContainer: (user: string, repo: string, cb: Function, sha: string) => Promise<void> =
async (user: string, repo: string, cb: (file: any, name: string) => void, sha: string): Promise<void> => {  

    const file: any = await (axios as any).get(`https://api.github.com/repos/${user}/${repo}/git/blobs/${sha}`); 
    cb(
        JSON.parse(atob(file.data.content)),
        sha + '.piet.json'
    );
};

const getFileList: (githubUrl: string, fileList: any[], subDirPath?: string) => Promise<any[]> = 
async (githubUrl: string, fileList: any[], subDirPath?: string): Promise<any[]> => {

    const data: any = (await (axios as any).get(githubUrl + '/contents/' + (subDirPath ? subDirPath : ''))).data;

    for (let i = 0; i < data.length; i++) {
        const node: any = data[i];
        if (node.type === 'dir') {
            await getFileList(githubUrl, fileList, node.path);

        } else if (node.type === 'file') {
            const splitedName: string = node.name.split('.').reverse();
            
            if (splitedName.length > 0 && (splitedName[0] === 'sol' || splitedName[0] === 'json')) {
                fileList.push(node);
            }

        }
    }

  
    return fileList;
    
};