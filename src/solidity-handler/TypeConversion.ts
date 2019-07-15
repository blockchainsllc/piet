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

import { BlockchainConnection } from "./BlockchainConnector";

export enum Conversion {
    NoConversion,
    UTF8ToBytes32
}

type Convert = (conversion: Conversion, input: any,  blockchainConnection: BlockchainConnection) => any;

export const convert: Convert = (conversion: Conversion, input: any,  blockchainConnection: BlockchainConnection): any => {
        switch (conversion) {
            case Conversion.UTF8ToBytes32:
                return blockchainConnection.web3.utils.fromUtf8(input);
            case Conversion.NoConversion:
            default:
                return input;
        }
    };