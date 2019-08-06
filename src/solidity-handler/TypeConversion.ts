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