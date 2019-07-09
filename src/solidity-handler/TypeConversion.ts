import { BlockchainConnection } from "./BlockchainConnector";

/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

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