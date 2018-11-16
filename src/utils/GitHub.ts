/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as axios from 'axios';

export const getContracts: (githubUrl: string, cb, subDirPath: string) => Promise<void> =
async (githubUrl: string, cb: (list: any[]) => void, subDirPath: string): Promise<void> => {
  
    const fileList: any[] = await getFileList(githubUrl, [], subDirPath);
    Promise.all(fileList.map((file: any) => (axios as any).get(file.url)))
        .then((list: any) => cb(
            list.map((content: any, index: number) => ({
                fileName: fileList[index].name,
                content: content.data
            }))
        ));
    
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
            
            if (splitedName.length > 0 && splitedName[0] === 'sol') {
                fileList.push({
                    name: node.name,
                    url: node.download_url
                });
            }
 
        }
    }
  
    return fileList;
    
};