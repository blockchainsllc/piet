/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as SolidityParser from 'solidity-parser-sc'

export namespace Utils {

    export const propEquals = (name, value) => object => object[name] === value

    export const propUnequal = (name, value) => object => object[name] !== value

    export const wrap = val => Array.isArray(val) ? val : [val]

    export const flatten = ast => {
        const children = wrap(ast.body || ast.expression || ast.left || ast.right || ast.literal || [])
        return [ast].concat(...children.map(flatten))
    }

}