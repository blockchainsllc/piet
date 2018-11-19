/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import Web3Type from '../types/web3';

export enum Conversion {
    NoConversion,
    UTF8ToBytes32
}

export const Convert: (conversion: Conversion, input: any, web3: Web3Type) => any = 
    (conversion: Conversion, input: any, web3: Web3Type): any => {
        switch (conversion) {
            case Conversion.UTF8ToBytes32:
                return web3.utils.fromUtf8(input);
            case Conversion.NoConversion:
            default:
                return input;
        }
    };