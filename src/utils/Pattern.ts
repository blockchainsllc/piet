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

export interface Reference {
    refType: string;
    description: string;
    url?: string;
}
export interface SourceCode {
    fileName: string;
    content: string;

}

export interface DeploymentData {
    data: string;
    gasLimit: string;
    contractName: string;
    constructorArguments: (string | boolean | number)[];
}

export interface Pattern {
    id: string;
    title: string;
    abstract: string;
    problem: string;
    forces: string;
    solution: string;
    sourceCodes: SourceCode[];
    discussion: string;
    references: Reference[];
    curratedComments: string[];
    tags: string[];
    deploymentData: DeploymentData[];
}

type PatternToMarkdown = (pattern: Pattern, showTitle: boolean) => string;
export const patternToMarkdown: PatternToMarkdown = (pattern: Pattern, showTitle: boolean): string => {
    let output: string =  showTitle ? '# ' + pattern.title : '';

    if (pattern.abstract) {
        output += '\n## Abstract\n';
        output += pattern.abstract;
    }

    if (pattern.problem) {
        output += '\n## Problem\n';
        output += pattern.problem;
    }

    if (pattern.solution) {
        output += '\n## Solution\n';
        output += pattern.solution;
    }
    
    if (pattern.references.length > 0) {
        output += '\n## References\n';
        output += pattern.references
            .map((reference: Reference) => '\n* ' + reference.refType + ' - [' + reference.description + '](' + reference.url + ')')
            .reduce((prev: string, current: string) => prev + current);
    } 

    return output;

};

export const examplePattern: Pattern[] = [
    {
        id: 'p0',
        title: 'State Machine',
        abstract: 'Contracts often act as a state machine, which means that they have certain stages in which they behave differently or in which different functions can be called. A function call often ends a stage and transitions the contract into the next stage (especially if the contract models interaction). It is also common that some stages are automatically reached at a certain point in time.',
        problem: 'Often the state of a contract or an entity is representent by many different variables increases complexity and decreases readability.',
        forces: 'Forces',
        solution: 'The state should be encoded as an enumeration, e.g: \n```\nenum Stages {\n    AcceptingBlindedBids,\n    RevealBids,\n    AnotherStage,\n    AreWeDoneYet,\n    Finished\n}\n```\nModifier should be used to enforce that certain functions are only callable in a specific state, e.g. `atStage(Stages.RevealBids)`.',
        sourceCodes: [{
            fileName: 'StateMachine.sol',
            content: 'pragma solidity >=0.4.22 <0.7.0;\r\n\r\ncontract StateMachine {\r\n    enum Stages {\r\n        AcceptingBlindedBids,\r\n        RevealBids,\r\n        AnotherStage,\r\n        AreWeDoneYet,\r\n        Finished\r\n    }\r\n\r\n    \/\/ This is the current stage.\r\n    Stages public stage = Stages.AcceptingBlindedBids;\r\n\r\n    uint public creationTime = now;\r\n\r\n    modifier atStage(Stages _stage) {\r\n        require(\r\n            stage == _stage,\r\n            \"Function cannot be called at this time.\"\r\n        );\r\n        _;\r\n    }\r\n\r\n    function nextStage() internal {\r\n        stage = Stages(uint(stage) + 1);\r\n    }\r\n\r\n    \/\/ Perform timed transitions. Be sure to mention\r\n    \/\/ this modifier first, otherwise the guards\r\n    \/\/ will not take the new stage into account.\r\n    modifier timedTransitions() {\r\n        if (stage == Stages.AcceptingBlindedBids &&\r\n                    now >= creationTime + 10 days)\r\n            nextStage();\r\n        if (stage == Stages.RevealBids &&\r\n                now >= creationTime + 12 days)\r\n            nextStage();\r\n        \/\/ The other stages transition by transaction\r\n        _;\r\n    }\r\n\r\n    \/\/ Order of the modifiers matters here!\r\n    function bid()\r\n        public\r\n        payable\r\n        timedTransitions\r\n        atStage(Stages.AcceptingBlindedBids)\r\n    {\r\n        \/\/ We will not implement that here\r\n    }\r\n\r\n    function reveal()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.RevealBids)\r\n    {\r\n    }\r\n\r\n    \/\/ This modifier goes to the next stage\r\n    \/\/ after the function is done.\r\n    modifier transitionNext()\r\n    {\r\n        _;\r\n        nextStage();\r\n    }\r\n\r\n    function g()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.AnotherStage)\r\n        transitionNext\r\n    {\r\n    }\r\n\r\n    function h()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.AreWeDoneYet)\r\n        transitionNext\r\n    {\r\n    }\r\n\r\n    function i()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.Finished)\r\n    {\r\n    }\r\n}'
        }],
        deploymentData: [{
            data: '0x608060405260008060006101000a81548160ff0219169083600481111561002257fe5b02179055504260015534801561003757600080fd5b5061076d806100476000396000f3fe6080604052600436106100705760003560e01c8063c040e6b81161004e578063c040e6b8146100ad578063d8270dce146100e6578063e2179b8e14610111578063e5aa3d581461012857610070565b80631998aeef14610075578063a475b5dd1461007f578063b8c9d36514610096575b600080fd5b61007d61013f565b005b34801561008b57600080fd5b50610094610252565b005b3480156100a257600080fd5b506100ab610365565b005b3480156100b957600080fd5b506100c2610480565b604051808260048111156100d257fe5b60ff16815260200191505060405180910390f35b3480156100f257600080fd5b506100fb610492565b6040518082815260200191505060405180910390f35b34801561011d57600080fd5b50610126610498565b005b34801561013457600080fd5b5061013d6105b3565b005b6000600481111561014c57fe5b6000809054906101000a900460ff16600481111561016657fe5b14801561017a5750620d2f00600154014210155b15610188576101876106c6565b5b6001600481111561019557fe5b6000809054906101000a900460ff1660048111156101af57fe5b1480156101c35750620fd200600154014210155b156101d1576101d06106c6565b5b60008060048111156101df57fe5b6000809054906101000a900460ff1660048111156101f957fe5b1461024f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806107126027913960400191505060405180910390fd5b50565b6000600481111561025f57fe5b6000809054906101000a900460ff16600481111561027957fe5b14801561028d5750620d2f00600154014210155b1561029b5761029a6106c6565b5b600160048111156102a857fe5b6000809054906101000a900460ff1660048111156102c257fe5b1480156102d65750620fd200600154014210155b156102e4576102e36106c6565b5b60018060048111156102f257fe5b6000809054906101000a900460ff16600481111561030c57fe5b14610362576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806107126027913960400191505060405180910390fd5b50565b6000600481111561037257fe5b6000809054906101000a900460ff16600481111561038c57fe5b1480156103a05750620d2f00600154014210155b156103ae576103ad6106c6565b5b600160048111156103bb57fe5b6000809054906101000a900460ff1660048111156103d557fe5b1480156103e95750620fd200600154014210155b156103f7576103f66106c6565b5b600380600481111561040557fe5b6000809054906101000a900460ff16600481111561041f57fe5b14610475576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806107126027913960400191505060405180910390fd5b61047d6106c6565b50565b6000809054906101000a900460ff1681565b60015481565b600060048111156104a557fe5b6000809054906101000a900460ff1660048111156104bf57fe5b1480156104d35750620d2f00600154014210155b156104e1576104e06106c6565b5b600160048111156104ee57fe5b6000809054906101000a900460ff16600481111561050857fe5b14801561051c5750620fd200600154014210155b1561052a576105296106c6565b5b600280600481111561053857fe5b6000809054906101000a900460ff16600481111561055257fe5b146105a8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806107126027913960400191505060405180910390fd5b6105b06106c6565b50565b600060048111156105c057fe5b6000809054906101000a900460ff1660048111156105da57fe5b1480156105ee5750620d2f00600154014210155b156105fc576105fb6106c6565b5b6001600481111561060957fe5b6000809054906101000a900460ff16600481111561062357fe5b1480156106375750620fd200600154014210155b15610645576106446106c6565b5b600480600481111561065357fe5b6000809054906101000a900460ff16600481111561066d57fe5b146106c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806107126027913960400191505060405180910390fd5b50565b60016000809054906101000a900460ff1660048111156106e257fe5b0160048111156106ee57fe5b6000806101000a81548160ff0219169083600481111561070a57fe5b021790555056fe46756e6374696f6e2063616e6e6f742062652063616c6c656420617420746869732074696d652ea265627a7a7231582013718cf669e0af9ff4224caaf61b5028a9dc2fe3676b243599329d664536a35964736f6c634300050b0032',
            constructorArguments: [],
            gasLimit: '1000000',
            contractName: 'StateMachine'
        }],
        discussion: 'The discussion',
        references: [{
            refType: 'Primaray source',
            description: 'solidity.readthedocs.io',
            url: 'https://solidity.readthedocs.io/en/v0.5.11/common-patterns.html#state-machine'
        }],
        curratedComments: ['A currated comment'],
        tags: ['Ethereum', 'Solidity']
    },
    {
        id: 'p1',
        title: 'Test State Machine 2',
        abstract: 'Contracts often act as a state machine, which means that they have certain stages in which they behave differently or in which different functions can be called. A function call often ends a stage and transitions the contract into the next stage (especially if the contract models interaction). It is also common that some stages are automatically reached at a certain point in time.',
        problem: 'Often the state of a contract or an entity is representent by many different variables increases complexity and decreases readability.',
        forces: 'Forces',
        solution: 'The state should be encoded as an enumeration, e.g: \n```\nenum Stages {\n    AcceptingBlindedBids,\n    RevealBids,\n    AnotherStage,\n    AreWeDoneYet,\n    Finished\n}\n```\nModifier should be used to enforce that certain functions are only callable in a specific state, e.g. `atStage(Stages.RevealBids)`.',
        sourceCodes: [{
            fileName: 'StateMachine.sol',
            content: 'pragma solidity >=0.4.22 <0.7.0;\r\n\r\ncontract StateMachine {\r\n    enum Stages {\r\n        AcceptingBlindedBids,\r\n        RevealBids,\r\n        AnotherStage,\r\n        AreWeDoneYet,\r\n        Finished\r\n    }\r\n\r\n    \/\/ This is the current stage.\r\n    Stages public stage = Stages.AcceptingBlindedBids;\r\n\r\n    uint public creationTime = now;\r\n\r\n    modifier atStage(Stages _stage) {\r\n        require(\r\n            stage == _stage,\r\n            \"Function cannot be called at this time.\"\r\n        );\r\n        _;\r\n    }\r\n\r\n    function nextStage() internal {\r\n        stage = Stages(uint(stage) + 1);\r\n    }\r\n\r\n    \/\/ Perform timed transitions. Be sure to mention\r\n    \/\/ this modifier first, otherwise the guards\r\n    \/\/ will not take the new stage into account.\r\n    modifier timedTransitions() {\r\n        if (stage == Stages.AcceptingBlindedBids &&\r\n                    now >= creationTime + 10 days)\r\n            nextStage();\r\n        if (stage == Stages.RevealBids &&\r\n                now >= creationTime + 12 days)\r\n            nextStage();\r\n        \/\/ The other stages transition by transaction\r\n        _;\r\n    }\r\n\r\n    \/\/ Order of the modifiers matters here!\r\n    function bid()\r\n        public\r\n        payable\r\n        timedTransitions\r\n        atStage(Stages.AcceptingBlindedBids)\r\n    {\r\n        \/\/ We will not implement that here\r\n    }\r\n\r\n    function reveal()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.RevealBids)\r\n    {\r\n    }\r\n\r\n    \/\/ This modifier goes to the next stage\r\n    \/\/ after the function is done.\r\n    modifier transitionNext()\r\n    {\r\n        _;\r\n        nextStage();\r\n    }\r\n\r\n    function g()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.AnotherStage)\r\n        transitionNext\r\n    {\r\n    }\r\n\r\n    function h()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.AreWeDoneYet)\r\n        transitionNext\r\n    {\r\n    }\r\n\r\n    function i()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.Finished)\r\n    {\r\n    }\r\n}'
        },
        {
            fileName: 'StateMachineB.sol',
            content: 'pragma solidity >=0.4.22 <0.7.0;\r\n\r\ncontract StateMachineB {\r\n    enum Stages {\r\n        AcceptingBlindedBids,\r\n        RevealBids,\r\n        AnotherStage,\r\n        AreWeDoneYet,\r\n        Finished\r\n    }\r\n\r\n    \/\/ This is the current stage.\r\n    Stages public stage = Stages.AcceptingBlindedBids;\r\n\r\n    uint public creationTime = now;\r\n\r\n    modifier atStage(Stages _stage) {\r\n        require(\r\n            stage == _stage,\r\n            \"Function cannot be called at this time.\"\r\n        );\r\n        _;\r\n    }\r\n\r\n    function nextStage() internal {\r\n        stage = Stages(uint(stage) + 1);\r\n    }\r\n\r\n    \/\/ Perform timed transitions. Be sure to mention\r\n    \/\/ this modifier first, otherwise the guards\r\n    \/\/ will not take the new stage into account.\r\n    modifier timedTransitions() {\r\n        if (stage == Stages.AcceptingBlindedBids &&\r\n                    now >= creationTime + 10 days)\r\n            nextStage();\r\n        if (stage == Stages.RevealBids &&\r\n                now >= creationTime + 12 days)\r\n            nextStage();\r\n        \/\/ The other stages transition by transaction\r\n        _;\r\n    }\r\n\r\n    \/\/ Order of the modifiers matters here!\r\n    function bid()\r\n        public\r\n        payable\r\n        timedTransitions\r\n        atStage(Stages.AcceptingBlindedBids)\r\n    {\r\n        \/\/ We will not implement that here\r\n    }\r\n\r\n    function reveal()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.RevealBids)\r\n    {\r\n    }\r\n\r\n    \/\/ This modifier goes to the next stage\r\n    \/\/ after the function is done.\r\n    modifier transitionNext()\r\n    {\r\n        _;\r\n        nextStage();\r\n    }\r\n\r\n    function g()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.AnotherStage)\r\n        transitionNext\r\n    {\r\n    }\r\n\r\n    function h()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.AreWeDoneYet)\r\n        transitionNext\r\n    {\r\n    }\r\n\r\n    function i()\r\n        public\r\n        timedTransitions\r\n        atStage(Stages.Finished)\r\n    {\r\n    }\r\n}'
        }],
        discussion: 'The discussion',
        references: [{
            refType: 'Primaray source',
            description: 'solidity.readthedocs.io',
            url: 'https://solidity.readthedocs.io/en/v0.5.11/common-patterns.html#state-machine'
        }],
        curratedComments: ['A currated comment'],
        tags: ['Ethereum', 'Solidity', 'Test'],
        deploymentData: []
    },
    {
        id: 'p2',
        title: 'Test State Machine 3',
        abstract: 'Contracts often act as a state machine, which means that they have certain stages in which they behave differently or in which different functions can be called. A function call often ends a stage and transitions the contract into the next stage (especially if the contract models interaction). It is also common that some stages are automatically reached at a certain point in time.',
        problem: 'Often the state of a contract or an entity is representent by many different variables increases complexity and decreases readability.',
        forces: 'Forces',
        solution: 'The state should be encoded as an enumeration, e.g: \n```\nenum Stages {\n    AcceptingBlindedBids,\n    RevealBids,\n    AnotherStage,\n    AreWeDoneYet,\n    Finished\n}\n```\nModifier should be used to enforce that certain functions are only callable in a specific state, e.g. `atStage(Stages.RevealBids)`.',
        sourceCodes: [],
        discussion: 'The discussion',
        references: [{
            refType: 'Primaray source',
            description: 'solidity.readthedocs.io',
            url: 'https://solidity.readthedocs.io/en/v0.5.11/common-patterns.html#state-machine'
        }],
        curratedComments: ['A currated comment'],
        tags: ['Ethereum', 'Solidity', 'Test'],
        deploymentData: []
    },
    {
        id: "100",
        
        title: "Smart Contract Versioning",
        
        problem: "Smart Contract is not able to be modified once it's migrated, but how to fix bugs without whole system shutdown?",
        
        forces: '',
        solution: "Register the contract address in smart contract and clients refer it. Manager of the contract overwrites address after smart contract is upgraded.",
        
        sourceCodes: [{
            fileName: 'Versioning.sol',
            content: "pragma solidity 0.5.11;\r\n\r\n\/\/\/\r\n\/\/\/\r\n\/\/\/\r\ncontract ContractRegistory {\r\n\r\nstruct Contract {\r\naddress owner;\r\naddress contractAddress;\r\nstring version;\r\n}\r\n\r\nmapping (string => Contract) registory; \/\/ (Contract Name => Contract information)\r\n\r\nevent ContractUpgraded(address owner, string contractName, address oldAddress, address newAddress, string version);\r\n\r\nfunction register(\r\nstring memory contractName,\r\naddress contractAddress,\r\nstring memory version\r\n)\r\npublic\r\n{\r\nContract memory c = registory[contractName];\r\nif (c.owner == address(0x0)) { \/\/ new\r\nc = Contract(msg.sender, contractAddress, version);\r\n} else { \/\/ update.\r\nrequire(c.owner == msg.sender, \"Sender must be same as contract owner.\");\r\n\r\naddress oldAddress = c.contractAddress;\r\nc.contractAddress = contractAddress;\r\nc.version = version;\r\nemit ContractUpgraded(c.owner, contractName, oldAddress, contractAddress, version);\r\n}\r\nregistory[contractName] = c;\r\n}\r\n\r\nfunction getContractAddress(\r\nstring memory contractName\r\n)\r\npublic\r\nview\r\nreturns (address contractAddress, string memory version)\r\n{\r\nContract memory c = registory[contractName];\r\nreturn (c.contractAddress, c.version);\r\n}\r\n\r\n}"
        }],
        
        abstract: "Since Smart Contract cannot be modified once it's deployed on the network, there's no way to upgrade a contract even if fatal bugs are found in it. \n However, in our real world, bugs especially related to money transaction can never be abandoned.\n Here one of the patterns how to upgrade the contract - clients get latest contract address from smart contract registory, and always use the address.\n",
        discussion: 'The discussion',
        // "preceding_patterns": [""],
        
        // "following_patterns": [""],
        
        references: [],
        curratedComments: ['A currated comment'],
        tags: ['Ethereum', 'Solidity', 'Test'],
        deploymentData: []
        
        }
];

export const swc = {
    "SWC-100": {
      "markdown": "# Title \nFunction Default Visibility\n\n## Relationships \n[CWE-710: Improper Adherence to Coding Standards](https://cwe.mitre.org/data/definitions/710.html)\n\n## Description \n\nFunctions that do not have a function visibility type specified are `public` by default. This can lead to a vulnerability if a developer forgot to set the visibility and a malicious user is able to make unauthorized or unintended state changes.     \n\n## Remediation\n\nFunctions can be specified as being `external`, `public`, `internal` or `private`. It is recommended to make a conscious decision on which visibility type is appropriate for a function. This can dramatically reduce the attack surface of a contract system. \n\n## References \n- [Ethereum Smart Contract Best Practices - Explicitly mark visibility in functions and state variables](https://consensys.github.io/smart-contract-best-practices/recommendations/#explicitly-mark-visibility-in-functions-and-state-variables)\n- [SigmaPrime - Visibility](https://github.com/sigp/solidity-security-blog#visibility)\n\n",
      "content": {
        "Title": "Function Default Visibility",
        "Relationships": "[CWE-710: Improper Adherence to Coding Standards](https://cwe.mitre.org/data/definitions/710.html)",
        "Description": "Functions that do not have a function visibility type specified are `public` by default. This can lead to a vulnerability if a developer forgot to set the visibility and a malicious user is able to make unauthorized or unintended state changes.",
        "Remediation": "Functions can be specified as being `external`, `public`, `internal` or `private`. It is recommended to make a conscious decision on which visibility type is appropriate for a function. This can dramatically reduce the attack surface of a contract system."
      }
    },
    "SWC-101": {
      "markdown": "# Title \nInteger Overflow and Underflow\n\n## Relationships\n[CWE-682: Incorrect Calculation](https://cwe.mitre.org/data/definitions/682.html) \n\n## Description \n\nAn overflow/underflow happens when an arithmetic operation reaches the maximum or minimum size of a type. For instance if a number is stored in the uint8 type, it means that the number is stored in a 8 bits unsigned number ranging from 0 to 2^8-1. In computer programming, an integer overflow occurs when an arithmetic operation attempts to create a numeric value that is outside of the range that can be represented with a given number of bits – either larger than the maximum or lower than the minimum representable value.\n\n## Remediation\n\nIt is recommended to use vetted safe math libraries for arithmetic operations consistently throughout the smart contract system.\n\n## References \n- [Ethereum Smart Contract Best Practices - Integer Overflow and Underflow](https://consensys.github.io/smart-contract-best-practices/known_attacks/#integer-overflow-and-underflow)\n",
      "content": {
        "Title": "Integer Overflow and Underflow",
        "Relationships": "[CWE-682: Incorrect Calculation](https://cwe.mitre.org/data/definitions/682.html)",
        "Description": "An overflow/underflow happens when an arithmetic operation reaches the maximum or minimum size of a type. For instance if a number is stored in the uint8 type, it means that the number is stored in a 8 bits unsigned number ranging from 0 to 2^8-1. In computer programming, an integer overflow occurs when an arithmetic operation attempts to create a numeric value that is outside of the range that can be represented with a given number of bits – either larger than the maximum or lower than the minimum representable value.",
        "Remediation": "It is recommended to use vetted safe math libraries for arithmetic operations consistently throughout the smart contract system."
      }
    },
    "SWC-102": {
      "markdown": "# Title \nOutdated Compiler Version\n\n## Relationships\n[CWE-937: Using Components with Known Vulnerabilities](http://cwe.mitre.org/data/definitions/937.html)\n\n## Description \n\nUsing an outdated compiler version can be problematic especially if there are publicly disclosed bugs and issues that affect the current compiler version.\n\n## Remediation\n\nIt is recommended to use a recent version of the Solidity compiler.  \n\n## References \n- [Solidity Release Notes](https://github.com/ethereum/solidity/releases)\n- [Etherscan Solidity Bug Info](https://etherscan.io/solcbuginfo)\n",
      "content": {
        "Title": "Outdated Compiler Version",
        "Relationships": "[CWE-937: Using Components with Known Vulnerabilities](http://cwe.mitre.org/data/definitions/937.html)",
        "Description": "Using an outdated compiler version can be problematic especially if there are publicly disclosed bugs and issues that affect the current compiler version.",
        "Remediation": "It is recommended to use a recent version of the Solidity compiler."
      }
    },
    "SWC-103": {
      "markdown": "# Title \nFloating Pragma \n\n## Relationships\n[CWE-664: Improper Control of a Resource Through its Lifetime](https://cwe.mitre.org/data/definitions/664.html)\n\n## Description \n\nContracts should be deployed with the same compiler version and flags that they have been tested with thoroughly. Locking the pragma helps to ensure that contracts do not accidentally get deployed using, for example, an outdated compiler version that might introduce bugs that affect the contract system negatively.\n\n## Remediation\n\nLock the pragma version and also consider known bugs (https://github.com/ethereum/solidity/releases) for the compiler version that is chosen. \n\nPragma statements can be allowed to float when a contract is intended for consumption by other developers, as in the case with contracts in a library or EthPM package. Otherwise, the developer would need to manually update the pragma in order to compile locally.\n\n## References \n- [Ethereum Smart Contract Best Practices - Lock pragmas to specific compiler version](https://consensys.github.io/smart-contract-best-practices/recommendations/#lock-pragmas-to-specific-compiler-version)\n\n\n",
      "content": {
        "Title": "Floating Pragma",
        "Relationships": "[CWE-664: Improper Control of a Resource Through its Lifetime](https://cwe.mitre.org/data/definitions/664.html)",
        "Description": "Contracts should be deployed with the same compiler version and flags that they have been tested with thoroughly. Locking the pragma helps to ensure that contracts do not accidentally get deployed using, for example, an outdated compiler version that might introduce bugs that affect the contract system negatively.",
        "Remediation": "Lock the pragma version and also consider known bugs (https://github.com/ethereum/solidity/releases) for the compiler version that is chosen. \n\n\nPragma statements can be allowed to float when a contract is intended for consumption by other developers, as in the case with contracts in a library or EthPM package. Otherwise, the developer would need to manually update the pragma in order to compile locally."
      }
    },
    "SWC-104": {
      "markdown": "# Title \nUnchecked Call Return Value\n\n## Relationships\n[CWE-252: Unchecked Return Value](https://cwe.mitre.org/data/definitions/252.html)\n\n## Description \n\nThe return value of a message call is not checked. Execution will resume even if the called contract throws an exception. If the call fails accidentally or an attacker forces the call to fail, this may cause unexpected behaviour in the subsequent program logic.\n\n## Remediation\n\nIf you choose to use low-level call methods, make sure to handle the possibility that the call will fail by checking the return value.\n\n## References \n- [Ethereum Smart Contract Best Practices - Handle errors in external calls](https://consensys.github.io/smart-contract-best-practices/recommendations/#handle-errors-in-external-calls)\n",
      "content": {
        "Title": "Unchecked Call Return Value",
        "Relationships": "[CWE-252: Unchecked Return Value](https://cwe.mitre.org/data/definitions/252.html)",
        "Description": "The return value of a message call is not checked. Execution will resume even if the called contract throws an exception. If the call fails accidentally or an attacker forces the call to fail, this may cause unexpected behaviour in the subsequent program logic.",
        "Remediation": "If you choose to use low-level call methods, make sure to handle the possibility that the call will fail by checking the return value."
      }
    },
    "SWC-105": {
      "markdown": "# Title \nUnprotected Ether Withdrawal\n\n## Relationships\n[CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)\n\n## Description \n\nDue to missing or insufficient access controls, malicious parties can withdraw some or all Ether from the contract account.\n\nThis bug is sometimes caused by unintentionally exposing initialization functions. By wrongly naming a function intended to be a constructor, the constructor code ends up in the runtime byte code and can be called by anyone to re-initialize the contract.\n\n## Remediation\n\nImplement controls so withdrawals can only be triggered by authorized parties or according to the specs of the smart contract system.\n\n## References \n\n- [Rubixi smart contract](https://etherscan.io/address/0xe82719202e5965Cf5D9B6673B7503a3b92DE20be#code)\n",
      "content": {
        "Title": "Unprotected Ether Withdrawal",
        "Relationships": "[CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)",
        "Description": "Due to missing or insufficient access controls, malicious parties can withdraw some or all Ether from the contract account.\n\n\nThis bug is sometimes caused by unintentionally exposing initialization functions. By wrongly naming a function intended to be a constructor, the constructor code ends up in the runtime byte code and can be called by anyone to re-initialize the contract.",
        "Remediation": "Implement controls so withdrawals can only be triggered by authorized parties or according to the specs of the smart contract system."
      }
    },
    "SWC-106": {
      "markdown": "# Title \nUnprotected SELFDESTRUCT Instruction\n\n## Relationships\n[CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)\n\n## Description \n\nDue to missing or insufficient access controls, malicious parties can self-destruct the contract.\n\n## Remediation\n\nConsider removing the self-destruct functionality unless it is absolutely required. If there is a valid use-case, it is recommended to implement a multisig scheme so that multiple parties must approve the self-destruct action.\n\n## References \n- [Parity \"I accidentally killed it\" bug](https://www.parity.io/a-postmortem-on-the-parity-multi-sig-library-self-destruct/)\n",
      "content": {
        "Title": "Unprotected SELFDESTRUCT Instruction",
        "Relationships": "[CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)",
        "Description": "Due to missing or insufficient access controls, malicious parties can self-destruct the contract.",
        "Remediation": "Consider removing the self-destruct functionality unless it is absolutely required. If there is a valid use-case, it is recommended to implement a multisig scheme so that multiple parties must approve the self-destruct action."
      }
    },
    "SWC-107": {
      "markdown": "# Title \nReentrancy\n\n## Relationships\n[CWE-841: Improper Enforcement of Behavioral Workflow](https://cwe.mitre.org/data/definitions/841.html)\n\n## Description\n\nOne of the major dangers of calling external contracts is that they can take over the control flow. In the reentrancy attack (a.k.a. recursive call attack), a malicious contract calls back into the calling contract before the first invocation of the function is finished. This may cause the different invocations of the function to interact in undesirable ways.\n\n## Remediation\n\nThe best practices to avoid Reentrancy weaknesses are: \n\n- Use `transfer()` instead of `contract.call()` to transfer Ether to untrusted addresses. \n- When using low-level calls, make sure all internal state changes are performed before the call is executed.\n\n## References \n\n- [Ethereum Smart Contract Best Practices - Reentrancy](https://consensys.github.io/smart-contract-best-practices/known_attacks/#reentrancy)\n",
      "content": {
        "Title": "Reentrancy",
        "Relationships": "[CWE-841: Improper Enforcement of Behavioral Workflow](https://cwe.mitre.org/data/definitions/841.html)",
        "Description": "One of the major dangers of calling external contracts is that they can take over the control flow. In the reentrancy attack (a.k.a. recursive call attack), a malicious contract calls back into the calling contract before the first invocation of the function is finished. This may cause the different invocations of the function to interact in undesirable ways.",
        "Remediation": "The best practices to avoid Reentrancy weaknesses are: \n\n\n- Use `transfer()` instead of `contract.call()` to transfer Ether to untrusted addresses. \n- When using low-level calls, make sure all internal state changes are performed before the call is executed."
      }
    },
    "SWC-108": {
      "markdown": "# Title \nState Variable Default Visibility \n\n## Relationships\n[CWE-710: Improper Adherence to Coding Standards](https://cwe.mitre.org/data/definitions/710.html)\n\n## Description \n\nLabeling the visibility explicitly makes it easier to catch incorrect assumptions about who can access the variable.\n\n## Remediation\n\nVariables can be specified as being `public`, `internal` or `private`. Explicitly define visibility for all state variables.\n\n## References \n- [Ethereum Smart Contract Best Practices - Explicitly mark visibility in functions and state variables](https://consensys.github.io/smart-contract-best-practices/recommendations/#explicitly-mark-visibility-in-functions-and-state-variables)\n",
      "content": {
        "Title": "State Variable Default Visibility",
        "Relationships": "[CWE-710: Improper Adherence to Coding Standards](https://cwe.mitre.org/data/definitions/710.html)",
        "Description": "Labeling the visibility explicitly makes it easier to catch incorrect assumptions about who can access the variable.",
        "Remediation": "Variables can be specified as being `public`, `internal` or `private`. Explicitly define visibility for all state variables."
      }
    },
    "SWC-109": {
      "markdown": "# Title\nUninitialized Storage Pointer\n\n## Relationships\n[CWE-824: Access of Uninitialized Pointer](https://cwe.mitre.org/data/definitions/824.html)\n\n## Description\nUninitialized local storage variables can point to unexpected storage locations in the contract, which can lead to intentional or unintentional vulnerabilities.\n\n## Remediation\nCheck if the contract requires a storage object as in many situations this is actually not the case. If a local variable is sufficient mark the storage location of the variable explicitly with the `memory` attribute. If a storage variable is needed then initialise is upon declaration and additionally specific the storage location `storage`.\n\n**Note**: As of compiler version 0.5.0 and higher this issue has been systematically resolved as contracts with uninitialised storage pointers do no longer compile. \n\n## References\n- [SigmaPrime - Unintialised Storage Pointers](https://github.com/sigp/solidity-security-blog#unintialised-storage-pointers-1)\n",
      "content": {
        "Title": "Uninitialized Storage Pointer",
        "Relationships": "[CWE-824: Access of Uninitialized Pointer](https://cwe.mitre.org/data/definitions/824.html)",
        "Description": "Uninitialized local storage variables can point to unexpected storage locations in the contract, which can lead to intentional or unintentional vulnerabilities.",
        "Remediation": "Check if the contract requires a storage object as in many situations this is actually not the case. If a local variable is sufficient mark the storage location of the variable explicitly with the `memory` attribute. If a storage variable is needed then initialise is upon declaration and additionally specific the storage location `storage`.\n\n\n**Note**: As of compiler version 0.5.0 and higher this issue has been systematically resolved as contracts with uninitialised storage pointers do no longer compile."
      }
    },
    "SWC-110": {
      "markdown": "# Title \nAssert Violation\n\n## Relationships\n\n[CWE-670: Always-Incorrect Control Flow Implementation](https://cwe.mitre.org/data/definitions/670.html)\n\n## Description \n\nThe Solidity `assert()` function is meant to assert invariants. Properly functioning code should *never* reach a failing assert statement. A reachable assertion can mean one of two things:\n\n1. A bug exists in the contract that allows it to enter an invalid state;\n2. The `assert` statement is used incorrectly, e.g. to validate inputs.\n\n## Remediation\n\nConsider whether the condition checked in the `assert()` is actually an invariant. If not, replace the `assert()` statement with a `require()` statement.\n\nIf the exception is indeed caused by unexpected behaviour of the code, fix the underlying bug(s) that allow the assertion to be violated.\n\n## References\n\n- [The use of revert(), assert(), and require() in Solidity, and the new REVERT opcode in the EVM](https://media.consensys.net/when-to-use-revert-assert-and-require-in-solidity-61fb2c0e5a57)\n",
      "content": {
        "Title": "Assert Violation",
        "Relationships": "[CWE-670: Always-Incorrect Control Flow Implementation](https://cwe.mitre.org/data/definitions/670.html)",
        "Description": "The Solidity `assert()` function is meant to assert invariants. Properly functioning code should *never* reach a failing assert statement. A reachable assertion can mean one of two things:\n\n\n1. A bug exists in the contract that allows it to enter an invalid state;\n1. The `assert` statement is used incorrectly, e.g. to validate inputs.",
        "Remediation": "Consider whether the condition checked in the `assert()` is actually an invariant. If not, replace the `assert()` statement with a `require()` statement.\n\n\nIf the exception is indeed caused by unexpected behaviour of the code, fix the underlying bug(s) that allow the assertion to be violated."
      }
    },
    "SWC-111": {
      "markdown": "# Title\nUse of Deprecated Solidity Functions\n\n## Relationships\n[CWE-477: Use of Obsolete Function](https://cwe.mitre.org/data/definitions/477.html)\n\n## Description\n\nSeveral functions and operators in Solidity are deprecated. Using them leads to reduced code quality. With new major versions of the Solidity compiler, deprecated functions and operators may result in side effects and compile errors.\n\n## Remediation\n\nSolidity provides alternatives to the deprecated constructions. Most of them are aliases, thus replacing old constructions will not break current behavior. For example, `sha3` can be replaced with `keccak256`.\n\n| Deprecated              | Alternative             |\n|-------------------------|-------------------------|\n| `suicide(address)`      | `selfdestruct(address)` |\n| `block.blockhash(uint)` | `blockhash(uint)`       |\n| `sha3(...)`             | `keccak256(...)`        |\n| `callcode(...)`         | `delegatecall(...)`     |\n| `throw`                 | `revert()`              |\n| `msg.gas`               | `gasleft`               |\n| `constant`              | `view`                  |\n| `var`                   | corresponding type name |\n\n## References\n\n* [List of global variables and functions, as of Solidity 0.4.25](https://solidity.readthedocs.io/en/v0.4.25/miscellaneous.html#global-variables)\n* [Error handling: Assert, Require, Revert and Exceptions](https://solidity.readthedocs.io/en/v0.4.25/control-structures.html#error-handling-assert-require-revert-and-exceptions)\n* [View functions](https://solidity.readthedocs.io/en/v0.4.25/contracts.html#view-functions)\n* [Untyped declaration is deprecated as of Solidity 0.4.20](https://github.com/ethereum/solidity/releases/tag/v0.4.20)\n* [Solidity compiler changelog](https://github.com/ethereum/solidity/releases)\n",
      "content": {
        "Title": "Use of Deprecated Solidity Functions",
        "Relationships": "[CWE-477: Use of Obsolete Function](https://cwe.mitre.org/data/definitions/477.html)",
        "Description": "Several functions and operators in Solidity are deprecated. Using them leads to reduced code quality. With new major versions of the Solidity compiler, deprecated functions and operators may result in side effects and compile errors.",
        "Remediation": "Solidity provides alternatives to the deprecated constructions. Most of them are aliases, thus replacing old constructions will not break current behavior. For example, `sha3` can be replaced with `keccak256`.\n\n\n| Deprecated | Alternative | \n|: ---------:| ---------:| \n| `suicide(address)` | `selfdestruct(address)` | \n| `block.blockhash(uint)` | `blockhash(uint)` | \n| `sha3(...)` | `keccak256(...)` | \n| `callcode(...)` | `delegatecall(...)` | \n| `throw` | `revert()` | \n| `msg.gas` | `gasleft` | \n| `constant` | `view` | \n| `var` | corresponding type name |"
      }
    },
    "SWC-112": {
      "markdown": "# Title \nDelegatecall to Untrusted Callee\n\n## Relationships\n[CWE-829: Inclusion of Functionality from Untrusted Control Sphere](https://cwe.mitre.org/data/definitions/829.html)\n\n## Description \n\nThere exists a special variant of a message call, named `delegatecall` which is identical to a message call apart from the fact that the code at the target address is executed in the context of the calling contract and `msg.sender` and `msg.value` do not change their values. This allows a smart contract to dynamically load code from a different address at runtime. Storage, current address and balance still refer to the calling contract.\n\nCalling into untrusted contracts is very dangerous, as the code at the target address can change any storage values of the caller and has full control over the caller's balance.\n\n## Remediation\n\nUse `delegatecall` with caution and make sure to never call into untrusted contracts. If the target address is derived from user input ensure to check it against a whitelist of trusted contracts.\n\n## References\n\n- [Solidity Documentation - Delegatecall / Callcode and Libraries](https://solidity.readthedocs.io/en/latest/introduction-to-smart-contracts.html#delegatecall-callcode-and-libraries)\n- [How to Secure Your Smart Contracts: 6 Solidity Vulnerabilities and how to avoid them (Part 1) - Delegate Call](https://medium.com/loom-network/how-to-secure-your-smart-contracts-6-solidity-vulnerabilities-and-how-to-avoid-them-part-1-c33048d4d17d)\n- [Solidity Security: Comprehensive list of known attack vectors and common anti-patterns - Delegatecall](https://blog.sigmaprime.io/solidity-security.html#delegatecall)\n",
      "content": {
        "Title": "Delegatecall to Untrusted Callee",
        "Relationships": "[CWE-829: Inclusion of Functionality from Untrusted Control Sphere](https://cwe.mitre.org/data/definitions/829.html)",
        "Description": "There exists a special variant of a message call, named `delegatecall` which is identical to a message call apart from the fact that the code at the target address is executed in the context of the calling contract and `msg.sender` and `msg.value` do not change their values. This allows a smart contract to dynamically load code from a different address at runtime. Storage, current address and balance still refer to the calling contract.\n\n\nCalling into untrusted contracts is very dangerous, as the code at the target address can change any storage values of the caller and has full control over the caller's balance.",
        "Remediation": "Use `delegatecall` with caution and make sure to never call into untrusted contracts. If the target address is derived from user input ensure to check it against a whitelist of trusted contracts."
      }
    },
    "SWC-113": {
      "markdown": "# Title \n\nDoS with Failed Call \n\n## Relationships\n\n[CWE-703: Improper Check or Handling of Exceptional Conditions](https://cwe.mitre.org/data/definitions/703.html)\n\n## Description \n\nExternal calls can fail accidentally or deliberately, which can cause a DoS condition in the contract. To minimize the damage caused by such failures, it is better to isolate each external call into its own transaction that can be initiated by the recipient of the call. This is especially relevant for payments, where it is better to let users withdraw funds rather than push funds to them automatically (this also reduces the chance of problems with the gas limit).\n\n## Remediation\n\nIt is recommended to follow call best practices:\n\n- Avoid combining multiple calls in a single transaction, especially when calls are executed as part of a loop\n- Always assume that external calls can fail\n- Implement the contract logic to handle failed calls\n\n## References\n\n- [ConsenSys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/recommendations/#favor-pull-over-push-for-external-calls)\n",
      "content": {
        "Title": "DoS with Failed Call",
        "Relationships": "[CWE-703: Improper Check or Handling of Exceptional Conditions](https://cwe.mitre.org/data/definitions/703.html)",
        "Description": "External calls can fail accidentally or deliberately, which can cause a DoS condition in the contract. To minimize the damage caused by such failures, it is better to isolate each external call into its own transaction that can be initiated by the recipient of the call. This is especially relevant for payments, where it is better to let users withdraw funds rather than push funds to them automatically (this also reduces the chance of problems with the gas limit).",
        "Remediation": "It is recommended to follow call best practices:\n\n\n- Avoid combining multiple calls in a single transaction, especially when calls are executed as part of a loop\n- Always assume that external calls can fail\n- Implement the contract logic to handle failed calls"
      }
    },
    "SWC-114": {
      "markdown": "# Title\nTransaction Order Dependence\n\n## Relationships\n[CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')](https://cwe.mitre.org/data/definitions/362.html)\n\n## Description\nThe Ethereum network processes transactions in blocks with new blocks getting confirmed around every 17 seconds. The miners look at transactions they have received and select which transactions to include in a block, based who has paid a high enough gas price to be included. Additionally, when transactions are sent to the Ethereum network they are forwarded to each node for processing. Thus, a person who is running an Ethereum node can tell which transactions are going to occur before they are finalized.A race condition vulnerability occurs when code depends on the order of the transactions submitted to it.\n\nThe simplest example of a race condition is when a smart contract give a reward for submitting information. Say a contract will give out 1 token to the first person who solves a math problem. Alice solves the problem and submits the answer to the network with a standard gas price. Eve runs an Ethereum node and can see the answer to the math problem in the transaction that Alice submitted to the network. So Eve submits the answer to the network with a much higher gas price and thus it gets processed and committed before Alice's transaction. Eve receives one token and Alice gets nothing, even though it was Alice who worked to solve the problem. A common way this occurs in practice is when a contract rewards people for calling out bad behavior in a protocol by giving a bad actor's deposit to the person who proved they were misbehaving.\n\nThe race condition that happens the most on the network today is the race condition in the ERC20 token standard. The ERC20 token standard includes a function called 'approve' which allows an address to approve another address to spend tokens on their behalf. Assume that Alice has approved Eve to spend n of her tokens, then Alice decides to change Eve's approval to m tokens. Alice submits a function call to approve with the value n for Eve. Eve runs a Ethereum node so knows that Alice is going to change her approval to m. Eve then submits a tranferFrom request sending n of Alice's tokens to herself, but gives it a much higher gas price than Alice's transaction. The transferFrom executes first so gives Eve n tokens and sets Eve's approval to zero. Then Alice's transaction executes and sets Eve's approval to m. Eve then sends those m tokens to herself as well. Thus Eve gets n + m tokens even thought she should have gotten at most max(n,m).\n\n## Remediation\nA possible way to remedy for race conditions in submission of information in exchange for a reward is called a commit reveal hash scheme. Instead of submitting the answer the party who has the answer submits hash(salt, address, answer) [salt being some number of their choosing] the contract stores this hash and the sender's address. To claim the reward the sender then submits a transaction with the salt, and answer. The contract hashes (salt, msg.sender, answer) and checks the hash produced against the stored hash, if the hash matches the contract releases the reward.\n\nThe best fix for the ERC20 race condition is to add a field to the inputs of approve which is the expected current value and to have approve revert if Eve's current allowance is not what Alice indicated she was expecting. However this means that your contract no longer conforms to the ERC20 standard. If it important to your project to have the contract conform to ERC20, you can add a safe approve function. From the user perspective it is possible to mediate the ERC20 race condition by setting approvals to zero before changing them.\n\n## References\n[General Article on Race Conditions](https://medium.com/coinmonks/solidity-transaction-ordering-attacks-1193a014884e)\n[ERC20 Race Condition](https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit#)\n",
      "content": {
        "Title": "Transaction Order Dependence",
        "Relationships": "[CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')](https://cwe.mitre.org/data/definitions/362.html)",
        "Description": "The Ethereum network processes transactions in blocks with new blocks getting confirmed around every 17 seconds. The miners look at transactions they have received and select which transactions to include in a block, based who has paid a high enough gas price to be included. Additionally, when transactions are sent to the Ethereum network they are forwarded to each node for processing. Thus, a person who is running an Ethereum node can tell which transactions are going to occur before they are finalized.A race condition vulnerability occurs when code depends on the order of the transactions submitted to it.\n\n\nThe simplest example of a race condition is when a smart contract give a reward for submitting information. Say a contract will give out 1 token to the first person who solves a math problem. Alice solves the problem and submits the answer to the network with a standard gas price. Eve runs an Ethereum node and can see the answer to the math problem in the transaction that Alice submitted to the network. So Eve submits the answer to the network with a much higher gas price and thus it gets processed and committed before Alice's transaction. Eve receives one token and Alice gets nothing, even though it was Alice who worked to solve the problem. A common way this occurs in practice is when a contract rewards people for calling out bad behavior in a protocol by giving a bad actor's deposit to the person who proved they were misbehaving.\n\n\nThe race condition that happens the most on the network today is the race condition in the ERC20 token standard. The ERC20 token standard includes a function called 'approve' which allows an address to approve another address to spend tokens on their behalf. Assume that Alice has approved Eve to spend n of her tokens, then Alice decides to change Eve's approval to m tokens. Alice submits a function call to approve with the value n for Eve. Eve runs a Ethereum node so knows that Alice is going to change her approval to m. Eve then submits a tranferFrom request sending n of Alice's tokens to herself, but gives it a much higher gas price than Alice's transaction. The transferFrom executes first so gives Eve n tokens and sets Eve's approval to zero. Then Alice's transaction executes and sets Eve's approval to m. Eve then sends those m tokens to herself as well. Thus Eve gets n + m tokens even thought she should have gotten at most max(n,m).",
        "Remediation": "A possible way to remedy for race conditions in submission of information in exchange for a reward is called a commit reveal hash scheme. Instead of submitting the answer the party who has the answer submits hash(salt, address, answer) [salt being some number of their choosing] the contract stores this hash and the sender's address. To claim the reward the sender then submits a transaction with the salt, and answer. The contract hashes (salt, msg.sender, answer) and checks the hash produced against the stored hash, if the hash matches the contract releases the reward.\n\n\nThe best fix for the ERC20 race condition is to add a field to the inputs of approve which is the expected current value and to have approve revert if Eve's current allowance is not what Alice indicated she was expecting. However this means that your contract no longer conforms to the ERC20 standard. If it important to your project to have the contract conform to ERC20, you can add a safe approve function. From the user perspective it is possible to mediate the ERC20 race condition by setting approvals to zero before changing them."
      }
    },
    "SWC-115": {
      "markdown": "# Title \nAuthorization through tx.origin\n\n## Relationships\n[CWE-477: Use of Obsolete Function](https://cwe.mitre.org/data/definitions/477.html)\n\n## Description \n`tx.origin` is a global variable in Solidity which returns the address of the account that sent the transaction. Using the variable for authorization could make a contract vulnerable if an authorized account calls into a malicious contract. A call could be made to the vulnerable contract that passes the authorization check since `tx.origin` returns the original sender of the transaction which in this case is the authorized account.\n\n## Remediation\n\n`tx.origin` should not be used for authorization. Use `msg.sender` instead.\n\n## References\n- [Solidity Documentation - tx.origin](https://solidity.readthedocs.io/en/develop/security-considerations.html#tx-origin)\n- [Ethereum Smart Contract Best Practices - Avoid using tx.origin](https://consensys.github.io/smart-contract-best-practices/recommendations/#avoid-using-txorigin)\n- [SigmaPrime - Visibility](https://github.com/sigp/solidity-security-blog#tx-origin)\n",
      "content": {
        "Title": "Authorization through tx.origin",
        "Relationships": "[CWE-477: Use of Obsolete Function](https://cwe.mitre.org/data/definitions/477.html)",
        "Description": "`tx.origin` is a global variable in Solidity which returns the address of the account that sent the transaction. Using the variable for authorization could make a contract vulnerable if an authorized account calls into a malicious contract. A call could be made to the vulnerable contract that passes the authorization check since `tx.origin` returns the original sender of the transaction which in this case is the authorized account.",
        "Remediation": "`tx.origin` should not be used for authorization. Use `msg.sender` instead."
      }
    },
    "SWC-116": {
      "markdown": "# Title \nTimestamp Dependence\n\n## Relationships\n[CWE-829: Inclusion of Functionality from Untrusted Control Sphere](https://cwe.mitre.org/data/definitions/829.html)\n\n## Description \n\nContracts often need access to the current timestamp to trigger time-dependent events. As Ethereum is decentralized, nodes can synchronize time only to some degree. Moreover, malicious miners can alter the timestamp of their blocks, especially if they can gain advantages by doing so. However, miners can't set timestamp smaller than the previous one (otherwise the block will be rejected), nor can they set the timestamp too far ahead in the future. Taking all of the above into consideration, developers can't rely on the preciseness of the provided timestamp.\n\n## Remediation\n\nDevelopers should write smart contracts with the notion that block timestamp and real timestamp may vary up to half a minute. Alternatively, they can use block number or external source of timestamp via oracles.\n\n## References\n\n* [Safety: Timestamp dependence](https://github.com/ethereum/wiki/wiki/Safety#timestamp-dependence)\n* [Ethereum Smart Contract Best Practices - Timestamp Dependence](https://consensys.github.io/smart-contract-best-practices/recommendations/#timestamp-dependence)\n* [How do Ethereum mining nodes maintain a time consistent with the network?](https://ethereum.stackexchange.com/questions/5924/how-do-ethereum-mining-nodes-maintain-a-time-consistent-with-the-network/5926#5926)\n* [Solidity: Timestamp dependency, is it possible to do safely?](https://ethereum.stackexchange.com/questions/15047/solidity-timestamp-dependency-is-it-possible-to-do-safely)\n",
      "content": {
        "Title": "Timestamp Dependence",
        "Relationships": "[CWE-829: Inclusion of Functionality from Untrusted Control Sphere](https://cwe.mitre.org/data/definitions/829.html)",
        "Description": "Contracts often need access to the current timestamp to trigger time-dependent events. As Ethereum is decentralized, nodes can synchronize time only to some degree. Moreover, malicious miners can alter the timestamp of their blocks, especially if they can gain advantages by doing so. However, miners can't set timestamp smaller than the previous one (otherwise the block will be rejected), nor can they set the timestamp too far ahead in the future. Taking all of the above into consideration, developers can't rely on the preciseness of the provided timestamp.",
        "Remediation": "Developers should write smart contracts with the notion that block timestamp and real timestamp may vary up to half a minute. Alternatively, they can use block number or external source of timestamp via oracles."
      }
    },
    "SWC-117": {
      "markdown": "# Title\nSignature Malleability\n\n## Relationships\n[CWE-347: Improper Verification of Cryptographic Signature](https://cwe.mitre.org/data/definitions/347.html)\n\n## Description\n\nThe implementation of a cryptographic signature system in Ethereum contracts often assumes that the signature is unique, but signatures can be altered without the possession of the private key and still be valid. The EVM specification defines several so-called ‘precompiled’ contracts one of them being `ecrecover` which executes the elliptic curve public key recovery. A malicious user can slightly modify the three values _v_, _r_ and _s_ to create other valid signatures. A system that performs signature verification on contract level might be susceptible to attacks if the signature is part of the signed message hash. Valid signatures could be created by a malicious user to replay previously signed messages.  \n\n## Remediation\n\nA signature should never be included into a signed message hash to check if previously messages have been processed by the contract. \n\n## References\n[Bitcoin Transaction Malleability](https://eklitzke.org/bitcoin-transaction-malleability)\n[CTF - Challenge](https://ropsten.etherscan.io/address/0x0daabce0a1261b582e0d949ebca9dff4c22c88ef#code)\n",
      "content": {
        "Title": "Signature Malleability",
        "Relationships": "[CWE-347: Improper Verification of Cryptographic Signature](https://cwe.mitre.org/data/definitions/347.html)",
        "Description": "The implementation of a cryptographic signature system in Ethereum contracts often assumes that the signature is unique, but signatures can be altered without the possession of the private key and still be valid. The EVM specification defines several so-called ‘precompiled’ contracts one of them being `ecrecover` which executes the elliptic curve public key recovery. A malicious user can slightly modify the three values _v_, _r_ and _s_ to create other valid signatures. A system that performs signature verification on contract level might be susceptible to attacks if the signature is part of the signed message hash. Valid signatures could be created by a malicious user to replay previously signed messages.",
        "Remediation": "A signature should never be included into a signed message hash to check if previously messages have been processed by the contract."
      }
    },
    "SWC-118": {
      "markdown": "# Title \nIncorrect Constructor Name \n\n## Relationships\n[CWE-665: Improper Initialization](http://cwe.mitre.org/data/definitions/665.html)\n\n## Description \nConstructors are special functions that are called only once during the contract creation. They often perform critical, privileged actions such as setting the owner of the contract. Before Solidity version 0.4.22, the only way of defining a constructor was to create a function with the same name as the contract class containing it. A function meant to become a constructor becomes a normal, callable function if its name doesn't exactly match the contract name.\nThis behavior sometimes leads to security issues, in particular when smart contract code is re-used with a different name but the name of the constructor function is not changed accordingly. \n\n## Remediation\n\nSolidity version 0.4.22 introduces a new `constructor` keyword that make a constructor definitions clearer. It is therefore recommended to upgrade the contract to a recent version of the Solidity compiler and change to the new constructor declaration. \n\n## References\n\n- [SigmaPrime - Constructors with Care](https://blog.sigmaprime.io/solidity-security.html#constructors)\n",
      "content": {
        "Title": "Incorrect Constructor Name",
        "Relationships": "[CWE-665: Improper Initialization](http://cwe.mitre.org/data/definitions/665.html)",
        "Description": "Constructors are special functions that are called only once during the contract creation. They often perform critical, privileged actions such as setting the owner of the contract. Before Solidity version 0.4.22, the only way of defining a constructor was to create a function with the same name as the contract class containing it. A function meant to become a constructor becomes a normal, callable function if its name doesn't exactly match the contract name.\nThis behavior sometimes leads to security issues, in particular when smart contract code is re-used with a different name but the name of the constructor function is not changed accordingly.",
        "Remediation": "Solidity version 0.4.22 introduces a new `constructor` keyword that make a constructor definitions clearer. It is therefore recommended to upgrade the contract to a recent version of the Solidity compiler and change to the new constructor declaration."
      }
    },
    "SWC-119": {
      "markdown": "# Title \nShadowing State Variables\n\n## Relationships\n[CWE-710: Improper Adherence to Coding Standards](http://cwe.mitre.org/data/definitions/710.html)\n\n## Description \n\nSolidity allows for ambiguous naming of state variables when inheritance is used. Contract `A` with a variable `x` could inherit contract `B` that also has a state variable `x` defined. This would result in two separate versions of `x`, one of them being accessed from contract `A` and the other one from contract `B`. In more complex contract systems this condition could go unnoticed and subsequently lead to security issues. \n\nShadowing state variables can also occur within a single contract when there are multiple definitions on the contract and function level. \n\n## Remediation\n\nReview storage variable layouts for your contract systems carefully and remove any ambiguities. Always check for compiler warnings as they can flag the issue within a single contract.\n\n## References\n- [Issue on Solidity's Github - Shadowing of inherited state variables should be an error (override keyword)](https://github.com/ethereum/solidity/issues/2563)\n- [Issue on Solidity's Github - Warn about shadowing state variables](https://github.com/ethereum/solidity/issues/973)\n",
      "content": {
        "Title": "Shadowing State Variables",
        "Relationships": "[CWE-710: Improper Adherence to Coding Standards](http://cwe.mitre.org/data/definitions/710.html)",
        "Description": "Solidity allows for ambiguous naming of state variables when inheritance is used. Contract `A` with a variable `x` could inherit contract `B` that also has a state variable `x` defined. This would result in two separate versions of `x`, one of them being accessed from contract `A` and the other one from contract `B`. In more complex contract systems this condition could go unnoticed and subsequently lead to security issues. \n\n\nShadowing state variables can also occur within a single contract when there are multiple definitions on the contract and function level.",
        "Remediation": "Review storage variable layouts for your contract systems carefully and remove any ambiguities. Always check for compiler warnings as they can flag the issue within a single contract."
      }
    },
    "SWC-120": {
      "markdown": "# Title \nWeak Sources of Randomness from Chain Attributes\n\n## Relationships\n[CWE-330: Use of Insufficiently Random Values](https://cwe.mitre.org/data/definitions/330.html)\n\n## Description \n\nAbility to generate random numbers is very helpful in all kinds of applications. One obvious example is gambling DApps, where pseudo-random number generator is used to pick the winner. However, creating a strong enough source of randomness in Ethereum is very challenging. For example, use of `block.timestamp` is insecure, as a miner can choose to provide any timestamp within a few seconds and still get his block accepted by others. Use of `blockhash`, `block.difficulty` and other fields is also insecure, as they're controlled by the miner. If the stakes are high, the miner can mine lots of blocks in a short time by renting hardware, pick the block that has required block hash for him to win, and drop all others.\n\n## Remediation\n\n* Using [commitment scheme](https://en.wikipedia.org/wiki/Commitment_scheme), e.g. [RANDAO](https://github.com/randao/randao).\n* Using external sources of randomness via oracles, e.g. [Oraclize](http://www.oraclize.it/). Note that this approach requires trusting in oracle, thus it may be reasonable to use multiple oracles.\n* Using Bitcoin block hashes, as they are more expensive to mine.\n\n## References\n\n* [How can I securely generate a random number in my smart contract?](https://ethereum.stackexchange.com/questions/191/how-can-i-securely-generate-a-random-number-in-my-smart-contract)\n* [When can BLOCKHASH be safely used for a random number? When would it be unsafe?](https://ethereum.stackexchange.com/questions/419/when-can-blockhash-be-safely-used-for-a-random-number-when-would-it-be-unsafe)\n* [The Run smart contract](https://etherscan.io/address/0xcac337492149bdb66b088bf5914bedfbf78ccc18)\n",
      "content": {
        "Title": "Weak Sources of Randomness from Chain Attributes",
        "Relationships": "[CWE-330: Use of Insufficiently Random Values](https://cwe.mitre.org/data/definitions/330.html)",
        "Description": "Ability to generate random numbers is very helpful in all kinds of applications. One obvious example is gambling DApps, where pseudo-random number generator is used to pick the winner. However, creating a strong enough source of randomness in Ethereum is very challenging. For example, use of `block.timestamp` is insecure, as a miner can choose to provide any timestamp within a few seconds and still get his block accepted by others. Use of `blockhash`, `block.difficulty` and other fields is also insecure, as they're controlled by the miner. If the stakes are high, the miner can mine lots of blocks in a short time by renting hardware, pick the block that has required block hash for him to win, and drop all others.",
        "Remediation": "- Using [commitment scheme](https://en.wikipedia.org/wiki/Commitment_scheme), e.g. [RANDAO](https://github.com/randao/randao).\n- Using external sources of randomness via oracles, e.g. [Oraclize](http://www.oraclize.it/). Note that this approach requires trusting in oracle, thus it may be reasonable to use multiple oracles.\n- Using Bitcoin block hashes, as they are more expensive to mine."
      }
    },
    "SWC-121": {
      "markdown": "# Title \nMissing Protection against Signature Replay Attacks\n\n## Relationships\n[CWE-347: Improper Verification of Cryptographic Signature](https://cwe.mitre.org/data/definitions/347.html)\n\n## Description \n\nIt is sometimes necessary to perform signature verification in smart contracts to achieve better usability or to save gas cost. A secure implementation needs to protect against Signature Replay Attacks by for example keeping track of all processed message hashes and only allowing new message hashes to be processed. A malicious user could attack a contract without such a control and get message hash that was sent by another user processed multiple times. \n\n\n## Remediation\n\nIn order to protect against signature replay attacks consider the following recommendations:\n\n- Store every message hash that has been processed by the smart contract. When new messages are received check against the already existing ones and only proceed with the business logic if it's a new message hash. \n- Include the address of the contract that processes the message. This ensures that the message can only be used in a single contract. \n- Under no circumstances generate the message hash including the signature. The `ecrecover` function is susceptible to signature malleability (see also SWC-117).\n\n## References\n\n- [Medium - Replay Attack Vulnerability in Ethereum Smart Contracts Introduced by transferProxy()](https://medium.com/cypher-core/replay-attack-vulnerability-in-ethereum-smart-contracts-introduced-by-transferproxy-124bf3694e25)\n\n",
      "content": {
        "Title": "Missing Protection against Signature Replay Attacks",
        "Relationships": "[CWE-347: Improper Verification of Cryptographic Signature](https://cwe.mitre.org/data/definitions/347.html)",
        "Description": "It is sometimes necessary to perform signature verification in smart contracts to achieve better usability or to save gas cost. A secure implementation needs to protect against Signature Replay Attacks by for example keeping track of all processed message hashes and only allowing new message hashes to be processed. A malicious user could attack a contract without such a control and get message hash that was sent by another user processed multiple times.",
        "Remediation": "In order to protect against signature replay attacks consider the following recommendations:\n\n\n- Store every message hash that has been processed by the smart contract. When new messages are received check against the already existing ones and only proceed with the business logic if it's a new message hash. \n- Include the address of the contract that processes the message. This ensures that the message can only be used in a single contract. \n- Under no circumstances generate the message hash including the signature. The `ecrecover` function is susceptible to signature malleability (see also SWC-117)."
      }
    },
    "SWC-122": {
      "markdown": "# Title \nLack of Proper Signature Verification \n\n## Relationships\n[CWE-345: Insufficient Verification of Data Authenticity](https://cwe.mitre.org/data/definitions/345.html)\n\n## Description \n\nIt is a common pattern for smart contract systems to allow users to sign messages off-chain instead of directly requesting users to do an on-chain transaction because of the flexibility and increased transferability that this provides. Smart contract systems that process signed messages have to implement their own logic to recover the authenticity from the signed messages before they process them further. A limitation for such systems is that smart contracts can not directly interact with them because they can not sign messages. Some signature verification implementations attempt to solve this problem by assuming the validity of a signed message based on other methods that do not have this limitation. An example of such a method is to rely on `msg.sender` and assume that if a signed message originated from the sender address then it has also been created by the sender address. This can lead to vulnerabilities especially in scenarios where proxies can be used to relay transactions.\n\n## Remediation\n\nIt is not recommended to use alternate verification schemes that do not require proper signature verification through `ecrecover()`. \n\n## References\n\n- [Consensys Diligence 0x Audit Report - Insecure signature validator](https://github.com/ConsenSys/0x_audit_report_2018-07-23#32-mixinsignaturevalidator-insecure-signature-validator-signaturetypecaller)\n",
      "content": {
        "Title": "Lack of Proper Signature Verification",
        "Relationships": "[CWE-345: Insufficient Verification of Data Authenticity](https://cwe.mitre.org/data/definitions/345.html)",
        "Description": "It is a common pattern for smart contract systems to allow users to sign messages off-chain instead of directly requesting users to do an on-chain transaction because of the flexibility and increased transferability that this provides. Smart contract systems that process signed messages have to implement their own logic to recover the authenticity from the signed messages before they process them further. A limitation for such systems is that smart contracts can not directly interact with them because they can not sign messages. Some signature verification implementations attempt to solve this problem by assuming the validity of a signed message based on other methods that do not have this limitation. An example of such a method is to rely on `msg.sender` and assume that if a signed message originated from the sender address then it has also been created by the sender address. This can lead to vulnerabilities especially in scenarios where proxies can be used to relay transactions.",
        "Remediation": "It is not recommended to use alternate verification schemes that do not require proper signature verification through `ecrecover()`."
      }
    },
    "SWC-123": {
      "markdown": "# Title\nRequirement Violation\n\n## Relationships\n\n[CWE-573: Improper Following of Specification by Caller](https://cwe.mitre.org/data/definitions/573.html)\n\n## Description\n\nThe Solidity `require()` construct is meant to validate external inputs of a function. In most cases, such external inputs are provided by callers, but they may also be returned by callees. In the former case, we refer to them as precondition violations. Violations of a requirement can indicate one of two possible issues:\n\n1. A bug exists in the contract that provided the external input.\n2. The condition used to express the requirement is too strong.\n\n## Remediation\n\nIf the required logical condition is too strong, it should be weakened to allow all valid external inputs.\n\nOtherwise, the bug must be in the contract that provided the external input and one should consider fixing its code by making sure no invalid inputs are provided.\n\n## References\n\n- [The use of revert(), assert(), and require() in Solidity, and the new REVERT opcode in the EVM](https://media.consensys.net/when-to-use-revert-assert-and-require-in-solidity-61fb2c0e5a57)\n",
      "content": {
        "Title": "Requirement Violation",
        "Relationships": "[CWE-573: Improper Following of Specification by Caller](https://cwe.mitre.org/data/definitions/573.html)",
        "Description": "The Solidity `require()` construct is meant to validate external inputs of a function. In most cases, such external inputs are provided by callers, but they may also be returned by callees. In the former case, we refer to them as precondition violations. Violations of a requirement can indicate one of two possible issues:\n\n\n1. A bug exists in the contract that provided the external input.\n1. The condition used to express the requirement is too strong.",
        "Remediation": "If the required logical condition is too strong, it should be weakened to allow all valid external inputs.\n\n\nOtherwise, the bug must be in the contract that provided the external input and one should consider fixing its code by making sure no invalid inputs are provided."
      }
    },
    "SWC-124": {
      "markdown": "# Title\r\nWrite to Arbitrary Storage Location\r\n\r\n## Relationships\r\n\r\n[CWE-123: Write-what-where Condition](https://cwe.mitre.org/data/definitions/123.html)\r\n\r\n## Description\r\n\r\nA smart contract's data (e.g., storing the owner of the contract) is persistently stored\r\nat some storage location (i.e., a key or address) on the EVM level. The contract is\r\nresponsible for ensuring that only authorized user or contract accounts may write to\r\nsensitive storage locations. If an attacker is able to write to arbitrary storage\r\nlocations of a contract, the authorization checks may easily be circumvented. This can\r\nallow an attacker to corrupt the storage; for instance, by overwriting a field that stores\r\nthe address of the contract owner.\r\n\r\n## Remediation\r\n\r\nAs a general advice, given that all data structures share the same storage (address)\r\nspace, one should make sure that writes to one data structure cannot inadvertently\r\noverwrite entries of another data structure.\r\n\r\n## References\r\n\r\n- [Entry to Underhanded Solidity Coding Contest 2017 (honorable mention)](https://github.com/Arachnid/uscc/tree/master/submissions-2017/doughoyte)\r\n",
      "content": {
        "Title": "Write to Arbitrary Storage Location",
        "Relationships": "[CWE-123: Write-what-where Condition](https://cwe.mitre.org/data/definitions/123.html)",
        "Description": "A smart contract's data (e.g., storing the owner of the contract) is persistently stored\nat some storage location (i.e., a key or address) on the EVM level. The contract is\nresponsible for ensuring that only authorized user or contract accounts may write to\nsensitive storage locations. If an attacker is able to write to arbitrary storage\nlocations of a contract, the authorization checks may easily be circumvented. This can\nallow an attacker to corrupt the storage; for instance, by overwriting a field that stores\nthe address of the contract owner.",
        "Remediation": "As a general advice, given that all data structures share the same storage (address)\nspace, one should make sure that writes to one data structure cannot inadvertently\noverwrite entries of another data structure."
      }
    },
    "SWC-125": {
      "markdown": "# Title \nIncorrect Inheritance Order\n\n## Relationships\n[CWE-696: Incorrect Behavior Order](https://cwe.mitre.org/data/definitions/696.html)\n\n## Description \nSolidity supports multiple inheritance, meaning that one contract can inherit several contracts. Multiple inheritance introduces ambiguity called [Diamond Problem](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem): if two or more base contracts define the same function, which one should be called in the child contract? Solidity deals with this ambiguity by using reverse [C3 Linearization](https://en.wikipedia.org/wiki/C3_linearization), which sets a priority between base contracts.\n\nThat way, base contracts have different priorities, so the order of inheritance matters. Neglecting inheritance order can lead to unexpected behavior.\n\n## Remediation\nWhen inheriting multiple contracts, especially if they have identical functions, a developer should carefully specify inheritance in the correct order. The rule of thumb is to inherit contracts from more /general/ to more /specific/.\n\n## References \n* [Smart Contract Best Practices - Multiple Inheritance Caution](https://consensys.github.io/smart-contract-best-practices/recommendations/#multiple-inheritance-caution)\n* [Solidity docs - Multiple Inheritance and Linearization](https://solidity.readthedocs.io/en/v0.4.25/contracts.html#multiple-inheritance-and-linearization)\n* [Solidity anti-patterns: Fun with inheritance DAG abuse](https://pdaian.com/blog/solidity-anti-patterns-fun-with-inheritance-dag-abuse)\n",
      "content": {
        "Title": "Incorrect Inheritance Order",
        "Relationships": "[CWE-696: Incorrect Behavior Order](https://cwe.mitre.org/data/definitions/696.html)",
        "Description": "Solidity supports multiple inheritance, meaning that one contract can inherit several contracts. Multiple inheritance introduces ambiguity called [Diamond Problem](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem): if two or more base contracts define the same function, which one should be called in the child contract? Solidity deals with this ambiguity by using reverse [C3 Linearization](https://en.wikipedia.org/wiki/C3_linearization), which sets a priority between base contracts.\n\n\nThat way, base contracts have different priorities, so the order of inheritance matters. Neglecting inheritance order can lead to unexpected behavior.",
        "Remediation": "When inheriting multiple contracts, especially if they have identical functions, a developer should carefully specify inheritance in the correct order. The rule of thumb is to inherit contracts from more /general/ to more /specific/."
      }
    },
    "SWC-127": {
      "markdown": "# Title \nArbitrary Jump with Function Type Variable\n\n## Relationships\n[CWE-695: Use of Low-Level Functionality](https://cwe.mitre.org/data/definitions/695.html)\n\n## Description \nSolidity supports function types. That is, a variable of function type can be assigned with a reference to a function with a matching signature. The function saved to such variable can be called just like a regular function.\n\nThe problem arises when a user has the ability to arbitrarily change the function type variable and thus execute random code instructions. As Solidity doesn't support pointer arithmetics, it's impossible to change such variable to an arbitrary value. However, if the developer uses assembly instructions, such as `mstore` or assign operator, in the worst case scenario an attacker is able to point a function type variable to any code instruction, violating required validations and required state changes.\n\n## Remediation\nThe use of assembly should be minimal. A developer should not allow a user to assign arbitrary values to function type variables.\n\n## References \n* [Solidity CTF](https://medium.com/authio/solidity-ctf-part-2-safe-execution-ad6ded20e042)\n* [Solidity docs - Solidity Assembly](https://solidity.readthedocs.io/en/v0.4.25/assembly.html)\n* [Solidity docs - Function Types](https://solidity.readthedocs.io/en/v0.4.25/types.html#function-types)\n",
      "content": {
        "Title": "Arbitrary Jump with Function Type Variable",
        "Relationships": "[CWE-695: Use of Low-Level Functionality](https://cwe.mitre.org/data/definitions/695.html)",
        "Description": "Solidity supports function types. That is, a variable of function type can be assigned with a reference to a function with a matching signature. The function saved to such variable can be called just like a regular function.\n\n\nThe problem arises when a user has the ability to arbitrarily change the function type variable and thus execute random code instructions. As Solidity doesn't support pointer arithmetics, it's impossible to change such variable to an arbitrary value. However, if the developer uses assembly instructions, such as `mstore` or assign operator, in the worst case scenario an attacker is able to point a function type variable to any code instruction, violating required validations and required state changes.",
        "Remediation": "The use of assembly should be minimal. A developer should not allow a user to assign arbitrary values to function type variables."
      }
    },
    "SWC-128": {
      "markdown": "# Title\nDoS With Block Gas Limit\n\n## Relationships\n[CWE-400: Uncontrolled Resource Consumption](https://cwe.mitre.org/data/definitions/400.html)\n\n## Description\n\nWhen smart contracts are deployed or functions inside them are called, the execution of these actions always requires a certain amount of gas, based of how much computation is needed to complete them. The Ethereum network specifies a block gas limit and the sum of all transactions included in a block can not exceed the threshold. \n\nProgramming patterns that are harmless in centralized applications can lead to Denial of Service conditions in smart contracts when the cost of executing a function exceeds the block gas limit. Modifying an array of unknown size, that increases in size over time, can lead to such a Denial of Service condition.\n\n## Remediation\n\nCaution is advised when you expect to have large arrays that grow over time. Actions that require looping across the entire data structure should be avoided.  \n\nIf you absolutely must loop over an array of unknown size, then you should plan for it to potentially take multiple blocks, and therefore require multiple transactions.\n\n## References\n* [Ethereum Design Rationale](https://github.com/ethereum/wiki/wiki/Design-Rationale#gas-and-fees)\n* [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)\n* [Clear Large Array Without Blowing Gas Limit](https://ethereum.stackexchange.com/questions/3373/how-to-clear-large-arrays-without-blowing-the-gas-limit)\n* [GovernMental jackpot payout DoS Gas](https://www.reddit.com/r/ethereum/comments/4ghzhv/governmentals_1100_eth_jackpot_payout_is_stuck/)\n\n",
      "content": {
        "Title": "DoS With Block Gas Limit",
        "Relationships": "[CWE-400: Uncontrolled Resource Consumption](https://cwe.mitre.org/data/definitions/400.html)",
        "Description": "When smart contracts are deployed or functions inside them are called, the execution of these actions always requires a certain amount of gas, based of how much computation is needed to complete them. The Ethereum network specifies a block gas limit and the sum of all transactions included in a block can not exceed the threshold. \n\n\nProgramming patterns that are harmless in centralized applications can lead to Denial of Service conditions in smart contracts when the cost of executing a function exceeds the block gas limit. Modifying an array of unknown size, that increases in size over time, can lead to such a Denial of Service condition.",
        "Remediation": "Caution is advised when you expect to have large arrays that grow over time. Actions that require looping across the entire data structure should be avoided.  \n\n\nIf you absolutely must loop over an array of unknown size, then you should plan for it to potentially take multiple blocks, and therefore require multiple transactions."
      }
    },
    "SWC-129": {
      "markdown": "# Title\nTypographical Error\n\n## Relationships\n[CWE-480: Use of Incorrect Operator](https://cwe.mitre.org/data/definitions/480.html)\n\n## Description\nA typographical error can occur for example when the intent of a defined operation is to sum a number to a variable (+=) but it has accidentally been defined in a wrong way (=+), introducing a typo which happens to be a valid operator. Instead of calculating the sum it initializes the variable again. \n\nThe unary + operator is deprecated in new solidity compiler versions.\n\n## Remediation\nThe weakness can be avoided by performing pre-condition checks on any math operation or using a vetted library for arithmetic calculations such as SafeMath developed by OpenZeppelin.\n\n## References\n* [HackerGold Bug Analysis](https://blog.zeppelin.solutions/hackergold-bug-analysis-68d893cad738)\n* [SafeMath by OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol)\n* [Disallow Unary plus](https://github.com/ethereum/solidity/issues/1760)\n",
      "content": {
        "Title": "Typographical Error",
        "Relationships": "[CWE-480: Use of Incorrect Operator](https://cwe.mitre.org/data/definitions/480.html)",
        "Description": "A typographical error can occur for example when the intent of a defined operation is to sum a number to a variable (+=) but it has accidentally been defined in a wrong way (=+), introducing a typo which happens to be a valid operator. Instead of calculating the sum it initializes the variable again. \n\n\nThe unary + operator is deprecated in new solidity compiler versions.",
        "Remediation": "The weakness can be avoided by performing pre-condition checks on any math operation or using a vetted library for arithmetic calculations such as SafeMath developed by OpenZeppelin."
      }
    },
    "SWC-130": {
      "markdown": "# Title\nRight-To-Left-Override control character (U+202E)\n\n## Relationships\n[CWE-451: User Interface (UI) Misrepresentation of Critical Information](http://cwe.mitre.org/data/definitions/451.html)\n\n## Description\nMalicious actors can use the Right-To-Left-Override unicode character to force RTL text rendering and confuse users as to the real intent of a contract. \n\n## Remediation\nThere are very few legitimate uses of the U+202E character. It should not appear in the source code of a smart contract.\n\n## References\n* [Outsmarting Smart Contracts](https://youtu.be/P_Mtd5Fc_3E?t=1813)",
      "content": {
        "Title": "Right-To-Left-Override control character (U+202E)",
        "Relationships": "[CWE-451: User Interface (UI) Misrepresentation of Critical Information](http://cwe.mitre.org/data/definitions/451.html)",
        "Description": "Malicious actors can use the Right-To-Left-Override unicode character to force RTL text rendering and confuse users as to the real intent of a contract.",
        "Remediation": "There are very few legitimate uses of the U+202E character. It should not appear in the source code of a smart contract."
      }
    },
    "SWC-131": {
      "markdown": "# Title\nPresence of unused variables\n\n## Relationships\n[CWE-1164: Irrelevant Code](https://cwe.mitre.org/data/definitions/1164.html)\n\n## Description\n Unused variables are allowed in Solidity and they do not pose a direct security issue. It is best practice though to avoid them as they can:\n\n* cause an increase in computations (and unnecessary gas consumption)\n* indicate bugs or malformed data structures and they are generally a sign of poor code quality\n* cause code noise and decrease readability of the code\n\n## Remediation\nRemove all unused variables from the code base. \n\n## References\n* [Unused local variables warnings discussion](https://github.com/ethereum/solidity/issues/718)\n* [Shadowing of inherited state variables discussion](https://github.com/ethereum/solidity/issues/2563)\n",
      "content": {
        "Title": "Presence of unused variables",
        "Relationships": "[CWE-1164: Irrelevant Code](https://cwe.mitre.org/data/definitions/1164.html)",
        "Description": "Unused variables are allowed in Solidity and they do not pose a direct security issue. It is best practice though to avoid them as they can:\n\n\n- cause an increase in computations (and unnecessary gas consumption)\n- indicate bugs or malformed data structures and they are generally a sign of poor code quality\n- cause code noise and decrease readability of the code",
        "Remediation": "Remove all unused variables from the code base."
      }
    },
    "SWC-132": {
      "markdown": "# Title\nUnexpected Ether balance\n\n## Relationships\n[CWE-667: Improper Locking](https://cwe.mitre.org/data/definitions/667.html)\n\n## Description\nContracts can behave erroneously when they strictly assume a specific Ether balance. It is always possible to forcibly send ether to a contract (without triggering its fallback function), using selfdestruct, or by mining to the account. In the worst case scenario this could lead to DOS conditions that might render the contract unusable. \n\n## Remediation\nAvoid strict equality checks for the Ether balance in a contract.\n\n## References\n* [Consensys Best Practices: Forcibly Sending Ether](https://consensys.github.io/smart-contract-best-practices/known_attacks/#forcibly-sending-ether-to-a-contract)\n* [Sigmaprime: Unexpected Ether](https://blog.sigmaprime.io/solidity-security.html#ether)\n* [Gridlock (a smart contract bug)](https://medium.com/@nmcl/gridlock-a-smart-contract-bug-73b8310608a9)\n",
      "content": {
        "Title": "Unexpected Ether balance",
        "Relationships": "[CWE-667: Improper Locking](https://cwe.mitre.org/data/definitions/667.html)",
        "Description": "Contracts can behave erroneously when they strictly assume a specific Ether balance. It is always possible to forcibly send ether to a contract (without triggering its fallback function), using selfdestruct, or by mining to the account. In the worst case scenario this could lead to DOS conditions that might render the contract unusable.",
        "Remediation": "Avoid strict equality checks for the Ether balance in a contract."
      }
    }
}

export const getPattern = () => {
    const pattern = [...examplePattern];

    for (const key of Object.keys(swc)) {
        const swcEntry = swc[key];
        pattern.push({
            id: key,
            title: swcEntry.content.Title,
            problem: swcEntry.content.Description,
            forces: '',
            solution: swcEntry.content.Remediation,
            sourceCodes: [],
            abstract: "",
            discussion: '',
            references: [{
                refType: 'Primaray source',
                description: 'swcregistry.io',
                url: 'https://swcregistry.io/'
            }],
            curratedComments: ['A currated comment'],
            tags: ['Ethereum', 'Security'],
            deploymentData: []

        });
    }
    return pattern;
};