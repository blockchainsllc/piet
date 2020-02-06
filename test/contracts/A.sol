contract A {
  
    struct Test {
        uint256 number;
        bool isTest;
    }
    
    mapping(bool => mapping (address => mapping(uint => mapping(address => Test)))) public nestedMapping;
    
    Test[] public aTestArray;
    
    uint256 public simple; 

    
    mapping(uint => Test[]) public arrayMapping;
    
    constructor() public {
        
        simple = 123;
        
        nestedMapping[true][address(0)][2][address(0)].number = 99;
        nestedMapping[true][address(0)][2][address(0)].isTest = true;
        
        aTestArray.push(Test({
            number: 67,
            isTest: true
        }));

        arrayMapping[1].push(Test({
            number: 67,
            isTest: true
        }));
    }
    

}