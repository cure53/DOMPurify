(function(exports) {
    var rulesLookup = {
        0 : 'ArrayComma',
        1 : 'ArrayOpen',
        2 : 'ArrayClose',
        3 : 'AccessorOpen',
        4 : 'AccessorClose',
        5 : 'Addition',
        6 : 'AdditionAssignment',
        7 : 'AssignmentDivide',
        8 : 'AndAssignment',
        9 : 'BlockStatementCurlyOpen',
        10 : 'BlockStatementCurlyClose',
        11 : 'BitwiseNot',
        12 : 'BitwiseOr',
        13 : 'BitwiseAnd',
        14 : 'Break',
        15 : 'Case',
        16 : 'Default',
        17 : 'Delete',
        18 : 'Do',
        19 : 'DoStatementCurlyOpen',
        20 : 'DoStatementCurlyClose',
        21 : 'DivideOperator',
        22 : 'CatchStatement',
        23 : 'CatchStatementParenOpen',
        24 : 'CatchStatementParenClose',
        25 : 'CatchStatementIdentifier',
        26 : 'CatchStatementCurlyOpen',
        27 : 'CatchStatementCurlyClose',
        28 : 'Comma',
        29 : 'Continue',
        30 : 'EqualAssignment',
        31 : 'Equal',
        32 : 'Else',
        33 : 'ElseCurlyOpen',
        34 : 'ElseCurlyClose',
        35 : 'EndStatement',
        36 : 'False',
        37 : 'FinallyStatement',
        38 : 'FinallyStatementCurlyOpen',
        39 : 'FinallyStatementCurlyClose',
        40 : 'ForStatement',
        41 : 'ForStatementParenOpen',
        42 : 'ForStatementParenClose',
        43 : 'ForStatementCurlyOpen',
        44 : 'ForStatementCurlyClose',
        45 : 'ForSemi',
        46 : 'FunctionCallOpen',
        47 : 'FunctionCallClose',
        48 : 'FunctionArgumentIdentifier',
        49 : 'FunctionArgumentComma',
        50 : 'FunctionIdentifier',
        51 : 'FunctionParenOpen',
        52 : 'FunctionExpression',
        53 : 'FunctionExpressionIdentifier',
        54 : 'FunctionExpressionParenOpen',
        55 : 'FunctionExpressionArgumentIdentifier',
        56 : 'FunctionExpressionArgumentComma',
        57 : 'FunctionParenClose',
        58 : 'FunctionExpressionParenClose',
        59 : 'FunctionExpressionCurlyOpen',
        60 : 'FunctionStatement',
        61 : 'FunctionStatementCurlyOpen',
        62 : 'FunctionStatementCurlyClose',
        63 : 'FunctionExpressionCurlyClose',
        64 : 'GreaterThan',
        65 : 'GreaterThanEqual',
        66 : 'IdentifierDot',
        67 : 'Identifier',
        68 : 'IfStatement',
        69 : 'IfStatementParenOpen',
        70 : 'IfStatementParenClose',
        71 : 'IfStatementCurlyOpen',
        72 : 'IfStatementCurlyClose',
        73 : 'In',
        74 : 'Infinity',
        75 : 'InstanceOf',
        76 : 'LabelColon',
        77 : 'LessThan',
        78 : 'LessThanEqual',
        79 : 'LeftShift',
        80 : 'LeftShiftAssignment',
        81 : 'LogicalOr',
        82 : 'LogicalAnd',
        83 : 'NaN',
        84 : 'New',
        85 : 'Number',
        86 : 'Null',
        87 : 'NotEqual',
        88 : 'Not',
        89 : 'Nothing',
        90 : 'Minus',
        91 : 'MinusAssignment',
        92 : 'Modulus',
        93 : 'ModulusAssignment',
        94 : 'Multiply',
        95 : 'MultiplyAssignment',
        96 : 'ObjectLiteralCurlyOpen',
        97 : 'ObjectLiteralCurlyClose',
        98 : 'ObjectLiteralIdentifier',
        99 : 'ObjectLiteralColon',
        100 : 'ObjectLiteralComma',
        101 : 'ObjectLiteralIdentifierNumber',
        102 : 'ObjectLiteralIdentifierString',
        103 : 'OrAssignment',
        104 : 'ParenExpressionOpen',
        105 : 'ParenExpressionComma',
        106 : 'ParenExpressionClose',
        107 : 'PostfixIncrement',
        108 : 'PostfixDeincrement',
        109 : 'PrefixDeincrement',
        110 : 'PrefixIncrement',
        111 : 'Return',
        112 : 'RegExp',
        113 : 'RightShift',
        114 : 'RightShiftAssignment',
        115 : 'String',
        116 : 'StrictEqual',
        117 : 'StrictNotEqual',
        118 : 'SwitchStatement',
        119 : 'SwitchStatementParenOpen',
        120 : 'SwitchStatementParenClose',
        121 : 'SwitchStatementCurlyOpen',
        122 : 'SwitchStatementCurlyClose',
        123 : 'SwitchColon',
        124 : 'This',
        125 : 'TernaryQuestionMark',
        126 : 'TernaryColon',
        127 : 'TryStatement',
        128 : 'TryStatementCurlyOpen',
        129 : 'TryStatementCurlyClose',
        130 : 'True',
        131 : 'Throw',
        132 : 'TypeOf',
        133 : 'UnaryPlus',
        134 : 'UnaryMinus',
        135 : 'Undefined',
        136 : 'Var',
        137 : 'VarIdentifier',
        138 : 'VarComma',
        139 : 'Void',
        140 : 'WithStatement',
        141 : 'WithStatementParenOpen',
        142 : 'WithStatementParenClose',
        143 : 'WithStatementCurlyOpen',
        144 : 'WithStatementCurlyClose',
        145 : 'WhileStatement',
        146 : 'WhileStatementParenOpen',
        147 : 'WhileStatementParenClose',
        148 : 'WhileStatementCurlyOpen',
        149 : 'WhileStatementCurlyClose',
        150 : 'Xor',
        151 : 'XorAssignment',
        152 : 'ZeroRightShift',
        153 : 'ZeroRightShiftAssignment'
    }, rules = {
        0 : {//ArrayComma
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            2 : 1, //ArrayClose
            3 : 1, //AccessorOpen
            4 : 1, //AccessorClose
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            28 : 1, //Comma
            29 : 1, //Continue
            36 : 1, //False
            41 : 1, //ForStatementParenOpen
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            69 : 1, //IfStatementParenOpen
            74 : 1, //Infinity
            83 : 1, //NaN
            84 : 1, //New
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            99 : 1, //ObjectLiteralColon
            104 : 1, //ParenExpressionOpen
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            119 : 1, //SwitchStatementParenOpen
            124 : 1, //This
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            130 : 1, //True
            131 : 1, //Throw
            132 : 1, //TypeOf
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            146 : 1 //WhileStatementParenOpen

        },
        1 : {//ArrayOpen
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        2 : {//ArrayClose
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        3 : {//AccessorOpen
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        4 : {//AccessorClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        5 : {//Addition
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        6 : {//AdditionAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        7 : {//AssignmentDivide
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        8 : {//AndAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        9 : {//BlockStatementCurlyOpen
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        10 : {//BlockStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        11 : {//BitwiseNot
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        12 : {//BitwiseOr
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        13 : {//BitwiseAnd
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        14 : {//Break
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        15 : {//Case
            35 : 1, //EndStatement
            121 : 1, //SwitchStatementCurlyOpen
            123 : 1 //SwitchColon

        },
        16 : {//Default
            35 : 1, //EndStatement
            121 : 1, //SwitchStatementCurlyOpen
            123 : 1 //SwitchColon

        },
        17 : {//Delete
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        18 : {//Do
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        19 : {//DoStatementCurlyOpen
            18 : 1 //Do

        },
        20 : {//DoStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        21 : {//DivideOperator
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        22 : {//CatchStatement
            129 : 1 //TryStatementCurlyClose

        },
        23 : {//CatchStatementParenOpen
            22 : 1 //CatchStatement

        },
        24 : {//CatchStatementParenClose
            25 : 1 //CatchStatementIdentifier

        },
        25 : {//CatchStatementIdentifier
            23 : 1 //CatchStatementParenOpen

        },
        26 : {//CatchStatementCurlyOpen
            24 : 1 //CatchStatementParenClose

        },
        27 : {//CatchStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        28 : {//Comma
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        29 : {//Continue
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        30 : {//EqualAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        31 : {//Equal
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        32 : {//Else
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        33 : {//ElseCurlyOpen
            32 : 1 //Else

        },
        34 : {//ElseCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        35 : {//EndStatement
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        36 : {//False
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        37 : {//FinallyStatement
            27 : 1, //CatchStatementCurlyClose
            129 : 1 //TryStatementCurlyClose

        },
        38 : {//FinallyStatementCurlyOpen
            37 : 1 //FinallyStatement

        },
        39 : {//FinallyStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        40 : {//ForStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        41 : {//ForStatementParenOpen
            40 : 1 //ForStatement

        },
        42 : {//ForStatementParenClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            14 : 1, //Break
            29 : 1, //Continue
            36 : 1, //False
            45 : 1, //ForSemi
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        43 : {//ForStatementCurlyOpen
            42 : 1 //ForStatementParenClose

        },
        44 : {//ForStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        45 : {//ForSemi
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            41 : 1, //ForStatementParenOpen
            45 : 1, //ForSemi
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        46 : {//FunctionCallOpen
            4 : 1, //AccessorClose
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            106 : 1, //ParenExpressionClose
            124 : 1 //This

        },
        47 : {//FunctionCallClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            46 : 1, //FunctionCallOpen
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        48 : {//FunctionArgumentIdentifier
            49 : 1, //FunctionArgumentComma
            51 : 1 //FunctionParenOpen

        },
        49 : {//FunctionArgumentComma
            48 : 1 //FunctionArgumentIdentifier

        },
        50 : {//FunctionIdentifier
            60 : 1 //FunctionStatement

        },
        51 : {//FunctionParenOpen
            50 : 1 //FunctionIdentifier

        },
        52 : {//FunctionExpression
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            21 : 1, //DivideOperator
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            41 : 1, //ForStatementParenOpen
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            73 : 1, //In
            75 : 1, //InstanceOf
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            146 : 1, //WhileStatementParenOpen
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        53 : {//FunctionExpressionIdentifier
            52 : 1 //FunctionExpression

        },
        54 : {//FunctionExpressionParenOpen
            52 : 1, //FunctionExpression
            53 : 1 //FunctionExpressionIdentifier

        },
        55 : {//FunctionExpressionArgumentIdentifier
            54 : 1, //FunctionExpressionParenOpen
            56 : 1 //FunctionExpressionArgumentComma

        },
        56 : {//FunctionExpressionArgumentComma
            55 : 1 //FunctionExpressionArgumentIdentifier

        },
        57 : {//FunctionParenClose
            48 : 1, //FunctionArgumentIdentifier
            51 : 1 //FunctionParenOpen

        },
        58 : {//FunctionExpressionParenClose
            54 : 1, //FunctionExpressionParenOpen
            55 : 1 //FunctionExpressionArgumentIdentifier

        },
        59 : {//FunctionExpressionCurlyOpen
            58 : 1 //FunctionExpressionParenClose

        },
        60 : {//FunctionStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        61 : {//FunctionStatementCurlyOpen
            57 : 1 //FunctionParenClose

        },
        62 : {//FunctionStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        63 : {//FunctionExpressionCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        64 : {//GreaterThan
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        65 : {//GreaterThanEqual
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        66 : {//IdentifierDot
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        67 : {//Identifier
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            66 : 1, //IdentifierDot
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        68 : {//IfStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        69 : {//IfStatementParenOpen
            68 : 1 //IfStatement

        },
        70 : {//IfStatementParenClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        71 : {//IfStatementCurlyOpen
            70 : 1 //IfStatementParenClose

        },
        72 : {//IfStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        73 : {//In
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        74 : {//Infinity
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        75 : {//InstanceOf
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        76 : {//LabelColon
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        77 : {//LessThan
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        78 : {//LessThanEqual
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        79 : {//LeftShift
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        80 : {//LeftShiftAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        81 : {//LogicalOr
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        82 : {//LogicalAnd
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        83 : {//NaN
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        84 : {//New
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        85 : {//Number
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        86 : {//Null
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        87 : {//NotEqual
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        88 : {//Not
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        89 : {//Nothing

        },
        90 : {//Minus
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        91 : {//MinusAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        92 : {//Modulus
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        93 : {//ModulusAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        94 : {//Multiply
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        95 : {//MultiplyAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        96 : {//ObjectLiteralCurlyOpen
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            21 : 1, //DivideOperator
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            41 : 1, //ForStatementParenOpen
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            73 : 1, //In
            75 : 1, //InstanceOf
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            146 : 1, //WhileStatementParenOpen
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        97 : {//ObjectLiteralCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            96 : 1, //ObjectLiteralCurlyOpen
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        98 : {//ObjectLiteralIdentifier
            96 : 1, //ObjectLiteralCurlyOpen
            100 : 1 //ObjectLiteralComma

        },
        99 : {//ObjectLiteralColon
            98 : 1, //ObjectLiteralIdentifier
            101 : 1, //ObjectLiteralIdentifierNumber
            102 : 1 //ObjectLiteralIdentifierString

        },
        100 : {//ObjectLiteralComma
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        101 : {//ObjectLiteralIdentifierNumber
            96 : 1, //ObjectLiteralCurlyOpen
            100 : 1 //ObjectLiteralComma

        },
        102 : {//ObjectLiteralIdentifierString
            96 : 1, //ObjectLiteralCurlyOpen
            100 : 1 //ObjectLiteralComma

        },
        103 : {//OrAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        104 : {//ParenExpressionOpen
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        105 : {//ParenExpressionComma
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        106 : {//ParenExpressionClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        107 : {//PostfixIncrement
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        108 : {//PostfixDeincrement
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        109 : {//PrefixDeincrement
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        110 : {//PrefixIncrement
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        111 : {//Return
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        112 : {//RegExp
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        113 : {//RightShift
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        114 : {//RightShiftAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        115 : {//String
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        116 : {//StrictEqual
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        117 : {//StrictNotEqual
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        118 : {//SwitchStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        119 : {//SwitchStatementParenOpen
            118 : 1 //SwitchStatement

        },
        120 : {//SwitchStatementParenClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        121 : {//SwitchStatementCurlyOpen
            120 : 1 //SwitchStatementParenClose

        },
        122 : {//SwitchStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        123 : {//SwitchColon
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            16 : 1, //Default
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        124 : {//This
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        125 : {//TernaryQuestionMark
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        126 : {//TernaryColon
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        127 : {//TryStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        128 : {//TryStatementCurlyOpen
            127 : 1 //TryStatement

        },
        129 : {//TryStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        130 : {//True
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        131 : {//Throw
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            84 : 1, //New
            89 : 1, //Nothing
            99 : 1, //ObjectLiteralColon
            104 : 1, //ParenExpressionOpen
            111 : 1, //Return
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        132 : {//TypeOf
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        133 : {//UnaryPlus
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        134 : {//UnaryMinus
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        135 : {//Undefined
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            11 : 1, //BitwiseNot
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            88 : 1, //Not
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            109 : 1, //PrefixDeincrement
            110 : 1, //PrefixIncrement
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            133 : 1, //UnaryPlus
            134 : 1, //UnaryMinus
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        136 : {//Var
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            84 : 1, //New
            89 : 1, //Nothing
            99 : 1, //ObjectLiteralColon
            104 : 1, //ParenExpressionOpen
            111 : 1, //Return
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        137 : {//VarIdentifier
            136 : 1, //Var
            138 : 1 //VarComma

        },
        138 : {//VarComma
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        139 : {//Void
            0 : 1, //ArrayComma
            1 : 1, //ArrayOpen
            3 : 1, //AccessorOpen
            5 : 1, //Addition
            6 : 1, //AdditionAssignment
            7 : 1, //AssignmentDivide
            8 : 1, //AndAssignment
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            12 : 1, //BitwiseOr
            13 : 1, //BitwiseAnd
            14 : 1, //Break
            15 : 1, //Case
            17 : 1, //Delete
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            21 : 1, //DivideOperator
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            28 : 1, //Comma
            29 : 1, //Continue
            30 : 1, //EqualAssignment
            31 : 1, //Equal
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            41 : 1, //ForStatementParenOpen
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            45 : 1, //ForSemi
            46 : 1, //FunctionCallOpen
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            64 : 1, //GreaterThan
            65 : 1, //GreaterThanEqual
            69 : 1, //IfStatementParenOpen
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            73 : 1, //In
            75 : 1, //InstanceOf
            76 : 1, //LabelColon
            77 : 1, //LessThan
            78 : 1, //LessThanEqual
            79 : 1, //LeftShift
            80 : 1, //LeftShiftAssignment
            81 : 1, //LogicalOr
            82 : 1, //LogicalAnd
            84 : 1, //New
            87 : 1, //NotEqual
            89 : 1, //Nothing
            90 : 1, //Minus
            91 : 1, //MinusAssignment
            92 : 1, //Modulus
            93 : 1, //ModulusAssignment
            94 : 1, //Multiply
            95 : 1, //MultiplyAssignment
            99 : 1, //ObjectLiteralColon
            103 : 1, //OrAssignment
            104 : 1, //ParenExpressionOpen
            111 : 1, //Return
            113 : 1, //RightShift
            114 : 1, //RightShiftAssignment
            116 : 1, //StrictEqual
            117 : 1, //StrictNotEqual
            119 : 1, //SwitchStatementParenOpen
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            125 : 1, //TernaryQuestionMark
            126 : 1, //TernaryColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            131 : 1, //Throw
            132 : 1, //TypeOf
            138 : 1, //VarComma
            139 : 1, //Void
            141 : 1, //WithStatementParenOpen
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            146 : 1, //WhileStatementParenOpen
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1, //WhileStatementCurlyClose
            150 : 1, //Xor
            151 : 1, //XorAssignment
            152 : 1, //ZeroRightShift
            153 : 1 //ZeroRightShiftAssignment

        },
        140 : {//WithStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        141 : {//WithStatementParenOpen
            140 : 1 //WithStatement

        },
        142 : {//WithStatementParenClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        143 : {//WithStatementCurlyOpen
            142 : 1 //WithStatementParenClose

        },
        144 : {//WithStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        145 : {//WhileStatement
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            76 : 1, //LabelColon
            89 : 1, //Nothing
            111 : 1, //Return
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        146 : {//WhileStatementParenOpen
            145 : 1 //WhileStatement

        },
        147 : {//WhileStatementParenClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        148 : {//WhileStatementCurlyOpen
            147 : 1 //WhileStatementParenClose

        },
        149 : {//WhileStatementCurlyClose
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            9 : 1, //BlockStatementCurlyOpen
            10 : 1, //BlockStatementCurlyClose
            14 : 1, //Break
            18 : 1, //Do
            19 : 1, //DoStatementCurlyOpen
            20 : 1, //DoStatementCurlyClose
            26 : 1, //CatchStatementCurlyOpen
            27 : 1, //CatchStatementCurlyClose
            29 : 1, //Continue
            32 : 1, //Else
            33 : 1, //ElseCurlyOpen
            34 : 1, //ElseCurlyClose
            35 : 1, //EndStatement
            36 : 1, //False
            38 : 1, //FinallyStatementCurlyOpen
            39 : 1, //FinallyStatementCurlyClose
            42 : 1, //ForStatementParenClose
            43 : 1, //ForStatementCurlyOpen
            44 : 1, //ForStatementCurlyClose
            47 : 1, //FunctionCallClose
            59 : 1, //FunctionExpressionCurlyOpen
            61 : 1, //FunctionStatementCurlyOpen
            62 : 1, //FunctionStatementCurlyClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            70 : 1, //IfStatementParenClose
            71 : 1, //IfStatementCurlyOpen
            72 : 1, //IfStatementCurlyClose
            74 : 1, //Infinity
            76 : 1, //LabelColon
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            89 : 1, //Nothing
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            111 : 1, //Return
            112 : 1, //RegExp
            115 : 1, //String
            120 : 1, //SwitchStatementParenClose
            121 : 1, //SwitchStatementCurlyOpen
            122 : 1, //SwitchStatementCurlyClose
            123 : 1, //SwitchColon
            124 : 1, //This
            128 : 1, //TryStatementCurlyOpen
            129 : 1, //TryStatementCurlyClose
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1, //VarIdentifier
            142 : 1, //WithStatementParenClose
            143 : 1, //WithStatementCurlyOpen
            144 : 1, //WithStatementCurlyClose
            147 : 1, //WhileStatementParenClose
            148 : 1, //WhileStatementCurlyOpen
            149 : 1 //WhileStatementCurlyClose

        },
        150 : {//Xor
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        151 : {//XorAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        152 : {//ZeroRightShift
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            107 : 1, //PostfixIncrement
            108 : 1, //PostfixDeincrement
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        },
        153 : {//ZeroRightShiftAssignment
            2 : 1, //ArrayClose
            4 : 1, //AccessorClose
            36 : 1, //False
            47 : 1, //FunctionCallClose
            63 : 1, //FunctionExpressionCurlyClose
            67 : 1, //Identifier
            74 : 1, //Infinity
            83 : 1, //NaN
            85 : 1, //Number
            86 : 1, //Null
            97 : 1, //ObjectLiteralCurlyClose
            106 : 1, //ParenExpressionClose
            112 : 1, //RegExp
            115 : 1, //String
            124 : 1, //This
            130 : 1, //True
            135 : 1, //Undefined
            137 : 1 //VarIdentifier

        }
    };

    exports.version = "0.4.0";
    exports.parse = function() {
        var js = MentalJS();
    };
    MentalJS = function() {
        function Mental() {
            var that = this,scoping = '$', replaceScoping = new RegExp('[' + scoping + ']'),
                attributeWhitelist = /^(?:style|accesskey|align|alink|alt|bgcolor|border|cellpadding|cellspacing|class|color|cols|colspan|coords|dir|face|height|hspace|id|ismap|lang|marginheight|marginwidth|multiple|name|nohref|noresize|noshade|nowrap|ref|rel|rev|rows|rowspan|scrolling|size|shape|span|summary|tabindex|target|title|type|usemap|valign|value|vlink|vspace|width)$/i,
                attributeWhitelistList = 'accesskey|align|alink|alt|bgcolor|border|cellpadding|cellspacing|class|color|cols|colspan|coords|dir|face|height|hspace|id|ismap|lang|marginheight|marginwidth|multiple|name|nohref|noresize|noshade|nowrap|ref|rel|rev|rows|rowspan|scrolling|size|shape|span|summary|tabindex|target|title|type|usemap|valign|value|vlink|vspace|width'.split('|'),
                urlBasedAttributes = /^(?:href|src|action)$/i, urlBasedAttributesList = ['href', 'src', 'action'], allowedEvents = /^(?:onabort|onactivate|onafterprint|onafterupdate|onbeforeactivate|onbeforecopy|onbeforecut|onbeforedeactivate|onbeforeeditfocus|onbeforepaste|onbeforeprint|onbeforeunload|onbegin|onblur|onbounce|oncellchange|onchange|onclick|oncontextmenu|oncontrolselect|oncopy|oncut|ondataavailable|ondatasetchanged|ondatasetcomplete|ondblclick|ondeactivate|ondrag|ondragend|ondragleave|ondragenter|ondragover|ondragdrop|ondrop|onend|onerror|onerrorupdate|onexit|onfilterchange|onfinish|onfocus|onfocusin|onfocusout|onhelp|onkeydown|onkeypress|onkeyup|onlayoutcomplete|onload|onlosecapture|onmediacomplete|onmediaerror|onmousedown|onmouseenter|onmouseleave|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onmove|onmoveend|onmovestart|onoutofsync|onpaste|onpause|onprogress|onpropertychange|onreadystatechange|onrepeat|onreset|onresize|onresizeend|onresizestart|onresume|onreverse|onrowenter|onrowexit|onrowdelete|onrowinserted|onscroll|onseek|onselect|onselectionchange|onselectstart|onstart|onstop|onsynchrestored|onsubmit|ontimeerror|ontrackchange|onunload|onurlflip|seeksegmenttime|oncanplay|oncanplaythrough|ondragstart|ondurationchange|onemptied|onended|onloadeddata|onloadedmetadata|onloadstart|onmessage|onoffline|ononline|onplay|onplaying|onratechange|onsearch|onseeked|onseeking|onstalled|onstorage|onsuspend|ontimeupdate|onvolumechange|onwaiting|onwebkitanimationend|onwebkitanimationiteration|onwebkitanimationstart|onwebkittransitionend)$/i,
                allowedEventsList = 'onabort|onactivate|onafterprint|onafterupdate|onbeforeactivate|onbeforecopy|onbeforecut|onbeforedeactivate|onbeforeeditfocus|onbeforepaste|onbeforeprint|onbeforeunload|onbegin|onblur|onbounce|oncellchange|onchange|onclick|oncontextmenu|oncontrolselect|oncopy|oncut|ondataavailable|ondatasetchanged|ondatasetcomplete|ondblclick|ondeactivate|ondrag|ondragend|ondragleave|ondragenter|ondragover|ondragdrop|ondrop|onend|onerror|onerrorupdate|onexit|onfilterchange|onfinish|onfocus|onfocusin|onfocusout|onhelp|onkeydown|onkeypress|onkeyup|onlayoutcomplete|onload|onlosecapture|onmediacomplete|onmediaerror|onmousedown|onmouseenter|onmouseleave|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onmove|onmoveend|onmovestart|onoutofsync|onpaste|onpause|onprogress|onpropertychange|onreadystatechange|onrepeat|onreset|onresize|onresizeend|onresizestart|onresume|onreverse|onrowenter|onrowexit|onrowdelete|onrowinserted|onscroll|onseek|onselect|onselectionchange|onselectstart|onstart|onstop|onsynchrestored|onsubmit|ontimeerror|ontrackchange|onunload|onurlflip|seeksegmenttime|oncanplay|oncanplaythrough|ondragstart|ondurationchange|onemptied|onended|onloadeddata|onloadedmetadata|onloadstart|onmessage|onoffline|ononline|onplay|onplaying|onratechange|onsearch|onseeked|onseeking|onstalled|onstorage|onsuspend|ontimeupdate|onvolumechange|onwaiting|onwebkitanimationend|onwebkitanimationiteration|onwebkitanimationstart|onwebkittransitionend'.split('|'), allowedTagsRegEx = /^(?:a|b|h[1-6]|script|head|title|style|link|body|form|font|select|optgroup|option|input|textarea|button|label|fieldset|legend|ul|ol|dl|directory|menu|nav|li|div|p|heading|quote|pre|br|hr|img|image|map|area|table|code|caption|th|section|tr|td|tbody|iframe)$/i,
                allowedCSSProperties = ["azimuth", "background", "backgroundAttachment", "backgroundColor", "backgroundImage", "backgroundPosition", "backgroundRepeat", "border", "borderCollapse", "borderColor", "borderSpacing", "borderStyle", "borderTop", "borderRight", "borderBottom", "borderLeft", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderWidth", "bottom", "captionSide", "clear", "clip", "color", "content", "counterIncrement", "counterReset", "cue", "cueAfter", "cueBefore", "cursor", "direction", "display", "elevation", "emptyCells", "float", "font", "fontFamily", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontWeight", "height", "left", "letterSpacing", "lineHeight", "listStyle", "listStyleImage", "listStylePosition", "listStyleType", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "markerOffset", "marks", "maxHeight", "maxWidth", "minHeight", "minWidth", "orphans", "outline", "outlineColor", "outlineStyle", "outlineWidth", "overflow", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "page", "pageBreakAfter", "pageBreakBefore", "pageBreakInside", "pause", "pauseAfter", "pauseBefore", "pitch", "pitchRange", "playDuring", "position", "quotes", "richness", "right", "size", "speak", "speakHeader", "speakNumeral", "speakPunctuation", "speechRate", "stress", "tableLayout", "textAlign", "textDecoration", "textIndent", "textShadow", "textTransform", "top", "unicodeBidi", "verticalAlign", "visibility", "voiceFamily", "volume", "whiteSpace", "widows", "width", "wordSpacing", "zIndex"],
                setTimeoutIDS = {}, setIntervalIDS = {};
            this.init = init;
            function init(config) {
                M = {
                    O : function(obj) {
                        var keys = Object.keys(obj), key;
                        for (key in obj) {
                            if (!/.+[$]$/.test(key)) {
                                continue;
                            }
                            if (/^(?:toString|valueOf|constructor|hasOwnProperty)[$]$/.test(key)) {
                                Object.defineProperty(obj, key.replace(new RegExp(replaceScoping.source + '$', 'i'), ''), {
                                    configurable : true,
                                    enumerable : false,
                                    writable : true
                                });
                                Object.defineProperty(obj, key, {
                                    value : obj[key],
                                    enumerable : false,
                                    writable : true,
                                    configurable : true
                                });
                            } else {
                                if (key === 'length$') {
                                    Object.defineProperty(obj, key.replace(new RegExp(replaceScoping.source + '$', 'i'), ''), {
                                        configurable : true,
                                        enumerable : true,
                                        writable : true,
                                        value : obj[key]
                                    });
                                    Object.defineProperty(obj, key, {
                                        set : function(len) {
                                            this.length = len;
                                        },
                                        get : function() {
                                            return this.length;
                                        },
                                        enumerable : false,
                                        configurable : true
                                    });
                                    continue;
                                }
                                Object.defineProperty(obj, key.replace(new RegExp(replaceScoping.source + '$', 'i'), ''), {
                                    configurable : true,
                                    enumerable : true,
                                    writable : true
                                });
                                Object.defineProperty(obj, key, {
                                    value : obj[key],
                                    enumerable : false,
                                    writable : true,
                                    configurable : true
                                });
                            }
                        }
                        return obj;
                    },
                    P : function() {
                        var exp = arguments[arguments.length - 1];
                        if ( typeof exp === 'undefined') {
                            return null;
                        }
                        if ((/[^\d]/.test(exp) || exp === '')) {
                            return exp + scoping;
                        } else {
                            return +exp;
                        }
                    },
                    A : function(args) {
                        args = [].slice.call(args, 0);
                        args.callee$ = arguments.callee.caller;
                        return args;
                    }
                };
                function defineStyle(obj, property) {
                    Object.defineProperty(obj, property + '$', {
                        configurable : true,
                        get : function() {
                            return this[property];
                        },
                        set : function(value) {
                            this[property] = value;
                        }
                    });
                }

                function createSandboxedNode(node) {
                    for (var i = 0; i < allowedEventsList.length; i++) {
                        Object.defineProperty(node, allowedEventsList[i] + scoping, {
                            configurable : true,
                            get : function(attr) {
                                return function() {
                                    return this[attr];
                                }
                            }(allowedEventsList[i]),
                            set : function(attr) {
                                return function(val) {
                                    if ( typeof val === 'function') {
                                        return this[attr] = val;
                                    }
                                }
                            }(allowedEventsList[i])
                        });
                    }

                    for (var i = 0; i < attributeWhitelistList.length; i++) {
                        Object.defineProperty(node, attributeWhitelistList[i] + scoping, {
                            configurable : true,
                            get : function(attr) {
                                return function() {
                                    return this[attr];
                                }
                            }(attributeWhitelistList[i]),
                            set : function(attr) {
                                return function(val) {
                                    return this[attr] = val;
                                }
                            }(attributeWhitelistList[i])
                        });
                    }

                    for (var i = 0; i < urlBasedAttributesList.length; i++) {
                        Object.defineProperty(node, urlBasedAttributesList[i] + scoping, {
                            configurable : true,
                            get : function(attr) {
                                return function() {
                                    return this[attr];
                                }
                            }(urlBasedAttributesList[i]),
                            set : function(attr) {
                                var anchor = document.createElement('a');
                                return function(val) {
                                    anchor.href = val + '';
                                    if ((anchor.protocol === 'http:' || anchor.protocol === 'https:') && anchor.host.replace(/:\d+$/, '') === location.host.replace(/:\d+$/, '')) {
                                        return this[attr] = val;
                                    }
                                }
                            }(urlBasedAttributesList[i])
                        });
                    }

                    Object.defineProperties(node, {
                        'innerText$' : {
                            configurable : true,
                            get : function() {
                                return this.innerText;
                            },
                            set : function(innerText) {
                                this.innerText = innerText;
                            }
                        },
                        'innerHTML$' : {
                            configurable : true,
                            get : function() {
                                return this.innerHTML;
                            },
                            set : function(innerHTML) {
                                var clean = config.parseInnerHTML(innerHTML);
                                this.innerHTML = clean;
                                return this.innerHTML;
                            }
                        },
                        'textContent$' : {
                            configurable : true,
                            get : function() {
                                return this.textContent;
                            },
                            set : function(textContent) {
                                this.textContent = textContent;
                            }
                        },
                        'style$' : {
                            configurable : true,
                            get : function() {
                                var style = this.style, i;
                                for ( i = 0; i < allowedCSSProperties.length; i++) {
                                    defineStyle(style, allowedCSSProperties[i]);
                                }
                                //todo CSS parsing
                                Object.defineProperty(this.style, 'cssText$', {
                                    configurable : true,
                                    get : function() {
                                        return this.cssText;
                                    },
                                    set : function(val) {
                                        this.cssText = val;
                                    }
                                });

                                return style;
                            }
                        },
                        'appendChild$' : {
                            configurable : true,
                            writable : false,
                            value : function(node) {
                                var js, script, code;
                                if (this.tagName && this.tagName.toUpperCase() == 'SCRIPT') {
                                    while (this.firstChild) {
                                        this.removeChild(this.firstChild);
                                    }
                                    js = MentalJS();
                                    code = document.createTextNode(js.parse({
                                        options : {
                                            eval : false
                                        },
                                        code : node.textContent
                                    }));
                                    script = document.createElement('script');
                                    script.appendChild(code);
                                    return this.appendChild(script);
                                }
                                return this.appendChild(node);
                            }
                        },
                        'value$' : {
                            configurable : true,
                            set : function(val) {
                                this.value = val;
                            },
                            get : function() {
                                return this.value;
                            }
                        },
                        'ownerDocument$' : {
                            configurable : true,
                            get : function() {
                                return this.ownerDocument;
                            }
                        },
                        'nodeName$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.nodeName
                        },
                        'tagName$' : {
                            configurable : true,
                            get : function() {
                                return this.tagName;
                            }
                        },
                        'nodeType$' : {
                            configurable : true,
                            get : function() {
                                return this.nodeType;
                            }
                        },
                        'childNodes$' : {
                            configurable : true,
                            get : function() {
                                return this.childNodes;
                            }
                        },
                        'firstChild$' : {
                            configurable : true,
                            get : function() {
                                return this.firstChild;
                            }
                        },
                        'lastChild$' : {
                            configurable : true,
                            get : function() {
                                return this.lastChild;
                            }
                        },
                        'nextSibling$' : {
                            configurable : true,
                            get : function() {
                                return this.nextSibling;
                            }
                        },
                        'parentNode$' : {
                            configurable : true,
                            get : function() {
                                return this.parentNode;
                            }
                        },
                        'insertBefore$' : {
                            configurable : true,
                            writable : false,
                            value : function(newElement, referenceElement) {
                                var js, script, code;
                                if (this.tagName && this.tagName.toUpperCase() == 'SCRIPT') {
                                    while (this.firstChild) {
                                        this.removeChild(this.firstChild);
                                    }
                                    js = MentalJS();
                                    code = document.createTextNode(js.parse({
                                        options : {
                                            eval : false
                                        },
                                        code : newElement.textContent
                                    }));
                                    return this.insertBefore(code, referenceElement);
                                }
                                return this.insertBefore.apply(this, arguments);
                            }
                        },
                        'cloneNode$' : {
                            configurable : true,
                            writable : false,
                            value : function() {
                                return this.cloneNode.apply(this, arguments);
                            }
                        },
                        'removeChild$' : {
                            configurable : true,
                            writable : false,
                            value : function() {
                                return this.removeChild.apply(this, arguments);
                            }
                        },
                        'removeAttribute$' : {
                            configurable : true,
                            writable : false,
                            value : function(name) {
                                this.removeAttribute(name);
                            }
                        },
                        'getAttribute$' : {
                            configurable : true,
                            writable : false,
                            value : function(name) {
                                if (attributeWhitelist.test(name)) {
                                    return this.getAttribute(name);
                                }
                            }
                        },
                        'setAttribute$' : {
                            configurable : true,
                            writable : false,
                            value : function(name, value) {
                                var anchor;
                                if (attributeWhitelist.test(name)) {
                                    if (urlBasedAttributes.test(name)) {
                                        anchor = document.createElement('a');
                                        anchor.href = value;
                                        if ((anchor.protocol === 'http:' || anchor.protocol === 'https:') && anchor.host.replace(/:\d+$/, '') === location.host.replace(/:\d+$/, '')) {
                                            value = anchor.href + '';
                                        } else {
                                            value = '#';
                                        }
                                        anchor = null;
                                    }
                                    return this.setAttribute(name, value + '');
                                }
                            }
                        },
                        'getElementsByTagName$' : {
                            configurable : true,
                            writable : false,
                            value : function() {
                                return this.getElementsByTagName.apply(this, arguments);
                            }
                        }
                    });
                    return node;
                }

                function objWhitelist(obj, list, noprototype) {
                    list = list.split(',');
                    for (var i = 0; i < list.length; i++) {
                        var prop = list[i];
                        if (noprototype) {
                            Object.defineProperty(obj, prop + scoping, {
                                value : obj[prop],
                                configurable : true,
                                enumerable : false,
                                writable : false
                            });
                        } else {
                            Object.defineProperty(obj.prototype, prop + scoping, {
                                writable : false,
                                configurable : true,
                                enumerable : false,
                                value : obj.prototype[prop]
                            });
                        }
                    }
                    return obj;
                }

                function constWhitelist(obj, list, transObj) {
                    list = list.split(',');
                    for (var i = 0; i < list.length; i++) {
                        var prop = list[i];
                        if (transObj) {
                            Object.defineProperty(transObj, prop + scoping, {
                                value : obj[prop],
                                configurable : true,
                                enumerable : false,
                                writable : false
                            });
                        } else {
                            Object.defineProperty(obj, prop + scoping, {
                                value : obj[prop],
                                configurable : true,
                                enumerable : false,
                                writable : false
                            });
                        }
                    }
                }

                function FUNCTION() {
                    var args = arguments, converted, js = MentalJS(), i, funct, functArgs = [];
                    if (args.length > 1) {
                        funct = '(function anonymous(';
                        for ( i = 0; i < args.length - 1; i++) {
                            args[i] = args[i] + '';
                            args[i] = args[i].replace(/[^\w]/ig, function(c) {
                                if (c.charCodeAt(0) < 0x80) {
                                    return '';
                                }
                            });
                            functArgs.push(args[i]);
                        }
                        funct += functArgs.join(',');
                        funct += '){' + args[args.length - 1] + '})';
                        converted = js.parse(funct);
                    } else {
                        funct = '(function anonymous(){' + args[0] + '})';
                        converted = js.parse(funct);
                    }
                    if (config.functionCode) {
                        config.functionCode(converted);
                    }
                    return converted;
                }


                FUNCTION.constructor$ = FUNCTION;
                Function$ = FUNCTION;
                Boolean.constructor$ = Function$;
                Boolean.prototype.constructor$ = Boolean;
                Boolean$ = Boolean;
                Function.prototype.constructor$ = Function$;
                objWhitelist(Function, 'call,apply');
                objWhitelist(String, 'charAt,charCodeAt,concat,indexOf,lastIndexOf,localeCompare,match,replace,search,slice,split,substr,substring,toLocaleLowerCase,toLocaleString,toLocaleUpperCase,toLowerCase,toUpperCase');
                String = objWhitelist(String, 'fromCharCode', true);
                String.prototype.constructor$ = String;
                String.constructor$ = Function$;
                String$ = String;

                objWhitelist(Array, 'sort,join,pop,push,reverse,shift,slice,splice,unshift,concat');
                Array.prototype.constructor$ = Array;
                Array.constructor$ = Function$;
                Array$ = Array;
                objWhitelist(RegExp, 'compile,exec,test');
                RegExp.prototype.constructor$ = RegExp;
                Object.defineProperty(RegExp.prototype, 'source$', {
                    configurable : true,
                    get : function() {
                        return this.source
                    }
                });
                RegExp.lastMatch$ = RegExp.lastMatch;
                RegExp.lastParen$ = RegExp.lastParen;
                RegExp.leftContext$ = RegExp.leftContext;
                RegExp.constructor$ = Function$;
                RegExp$ = RegExp;
                objWhitelist(Number, 'toExponential,toFixed,toPrecision');
                constWhitelist(Number, 'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY');
                Number.constructor$ = Function$;
                Number.prototype.constructor$ = Number;
                Number$ = Number;
                objWhitelist(Date, 'getDate,getDay,getFullYear,getHours,getMilliseconds,getMinutes,getMonth,getSeconds,getTime,getTimezoneOffset,getUTCDate,getUTCDay,getUTCFullYear,getUTCHours,getUTCMilliseconds,getUTCMinutes,getUTCMonth,getUTCSeconds,getYear,setDate,setFullYear,setHours,setMilliseconds,setMinutes,setMonth,setSeconds,setTime,setUTCDate,setUTCFullYear,setUTCHours,setUTCMilliseconds,setUTCMinutes,setUTCMonth,setUTCSeconds,setYear,toDateString,toGMTString,toLocaleDateString,toLocaleString,toLocaleTimeString,toTimeString,toUTCString');
                Date.prototype.constructor$ = Date;
                Date.constructor$ = Function$;
                Date$ = Date;
                objWhitelist(Math, 'abs,acos,asin,atan,atan2,ceil,cos,exp,floor,log,max,min,pow,random,round,sin,sqrt,tan', true);
                constWhitelist(Math, 'E,LN10,LN2,LOG10E,LOG2E,PI,SQRT1_2,SQRT2');
                Math.constructor$ = Object;
                Math$ = Math;
                constWhitelist(window, 'decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,escape,isFinite,isNaN,parseFloat,parseInt,unescape', window);
                function CLEAR_INTERVAL(id) {
                    id = +id;
                    if ( typeof setIntervalIDS[id] === 'undefined') {
                        return null;
                    }
                    return clearInterval(id);
                }

                clearInterval$ = CLEAR_INTERVAL;
                var CLEAR_TIMEOUT = function(id) {
                    id = +id;
                    if ( typeof setTimeoutIDS[id] === 'undefined') {
                        return null;
                    }
                    return clearTimeout(id);
                };
                clearTimeout$ = CLEAR_TIMEOUT;
                var SET_TIMEOUT = function(func, time) {
                    time = +time;
                    if ( typeof func !== 'function') {
                        func = FUNCTION(func);
                    }
                    var id = +setTimeout(func, time);
                    setTimeoutIDS[id] = true;
                    return id;
                };
                setTimeout$ = SET_TIMEOUT;
                var SET_INTERVAL = function(func, time) {
                    time = +time;
                    if ( typeof func !== 'function') {
                        func = FUNCTION(func);
                    }
                    var id = +setInterval(func, time);
                    setIntervalIDS[id] = true;
                    return id;
                };
                setInterval$ = SET_INTERVAL;
                var ALERT = function(str) {
                    alert(str);
                };
                alert$ = ALERT;
                var EVAL = function(str) {
                    var js = MentalJS(), converted;
                    if ( typeof str !== 'function') {
                        return eval(js.parse({
                            options : {
                                eval : false
                            },
                            code : str,
                            converted : function(converted) {
                                if (config.evalCode) {
                                    config.evalCode(converted);
                                }
                            }
                        }));
                    } else {
                        if (config.evalCode) {
                            config.evalCode(str);
                        }
                        return eval(str);
                    }
                };
                eval$ = EVAL;
                Object.constructor$ = Function$;
                Object.defineProperty(Object.prototype, 'constructor$', {
                    configurable : true,
                    get : function() {
                        return this.constructor;
                    }
                });
                Object.prototype.hasOwnProperty$ = Object.prototype.hasOwnProperty;
                objWhitelist(Object, 'valueOf');
                objWhitelist(Object, 'toString');
                Object$ = Object;
                Object.defineProperty(Object.prototype, 'prototype$', {
                    configurable : true,
                    get : function() {
                        return this.prototype;
                    },
                    set : function(obj) {
                        this.prototype = obj;
                    }
                });
                Object.defineProperty(Object.prototype, 'length$', {
                    configurable : true,
                    get : function() {
                        return this.length;
                    },
                    set : function(len) {
                        this.length = len;
                    }
                });

                Object.preventExtensions(Object.prototype);
                Object.preventExtensions(Array.prototype);

                Object.defineProperties(window, {
                    'undefined$' : {
                        configurable : true,
                        writable : false,
                        value :
                        void 1
                    },
                    'document$' : {
                        configurable : true,
                        writable : false,
                        value : document
                    },
                    'Object$' : {
                        configurable : true,
                        writable : false,
                        value : Object
                    },
                    'eval$' : {
                        configurable : true,
                        writable : false,
                        value : EVAL
                    },
                    'alert$' : {
                        configurable : true,
                        writable : false,
                        value : ALERT
                    },
                    'setInterval$' : {
                        configurable : true,
                        writable : false,
                        value : SET_INTERVAL
                    },
                    'setTimeout$' : {
                        configurable : true,
                        writable : false,
                        value : SET_TIMEOUT
                    },
                    'clearInterval$' : {
                        configurable : true,
                        writable : false,
                        value : CLEAR_INTERVAL
                    },
                    'clearTimeout$' : {
                        configurable : true,
                        writable : false,
                        value : CLEAR_TIMEOUT
                    },
                    'Math$' : {
                        configurable : true,
                        writable : false,
                        value : Math
                    },
                    'Date$' : {
                        configurable : true,
                        writable : false,
                        value : Date
                    },
                    'Number$' : {
                        configurable : true,
                        writable : false,
                        value : Number
                    },
                    'RegExp$' : {
                        configurable : true,
                        writable : false,
                        value : RegExp
                    },
                    'Array$' : {
                        configurable : true,
                        writable : false,
                        value : Array
                    },
                    'String$' : {
                        configurable : true,
                        writable : false,
                        value : String
                    },
                    'Boolean$' : {
                        configurable : true,
                        writable : false,
                        value : Boolean
                    },
                    'Function$' : {
                        configurable : true,
                        writable : false,
                        value : FUNCTION
                    },
                    'decodeURI$' : {
                        configurable : true,
                        writable : false,
                        value : decodeURI
                    },
                    'decodeURIComponent$' : {
                        configurable : true,
                        writable : false,
                        value : decodeURIComponent
                    },
                    'encodeURI$' : {
                        configurable : true,
                        writable : false,
                        value : encodeURI
                    },
                    'encodeURIComponent$' : {
                        configurable : true,
                        writable : false,
                        value : encodeURIComponent
                    },
                    'escape$' : {
                        configurable : true,
                        writable : false,
                        value : escape
                    },
                    'isFinite$' : {
                        configurable : true,
                        writable : false,
                        value : isFinite
                    },
                    'isNaN$' : {
                        configurable : true,
                        writable : false,
                        value : isNaN
                    },
                    'parseFloat$' : {
                        configurable : true,
                        writable : false,
                        value : parseFloat
                    },
                    'parseInt$' : {
                        configurable : true,
                        writable : false,
                        value : parseInt
                    },
                    'unescape$' : {
                        configurable : true,
                        writable : false,
                        value : unescape
                    },
                    'location$' : {
                        configurable : true,
                        writable : false,
                        value : {}
                    },
                    'navigator$' : {
                        configurable : true,
                        writable : false,
                        value : {}
                    },
                    'removeEventListener$' : {
                        configurable : true,
                        writable : false,
                        value : function() {
                            return window.removeEventListener.apply(document, arguments);
                        }
                    },
                    'addEventListener$' : {
                        configurable : true,
                        writable : false,
                        value : function() {
                            if ( typeof arguments[1] !== 'function') {
                                error("Expected function in event listener");
                            }
                            return window.addEventListener.apply(window, arguments);
                        }
                    }
                });

                if (config.dom) {
                    Object.defineProperties(window.location$, {
                        'toString' : {
                            configurable : true,
                            value : function() {
                                return 'http://sandboxed';
                            }
                        },
                        'valueOf' : {
                            configurable : true,
                            value : function() {
                                return 'http://sandboxed';
                            }
                        },
                        'href$' : {
                            configurable : true,
                            get : function() {
                                return 'http://sandboxed';
                            }
                        },
                        'replace$' : {
                            configurable : true,
                            get : function() {
                                return function() {
                                };
                            }
                        },
                        'reload$' : {
                            configurable : true,
                            get : function() {
                                return function() {
                                }
                            }
                        },
                        'assign$' : {
                            configurable : true,
                            get : function() {
                                return function() {
                                }
                            }
                        },
                        'hash$' : {
                            configurable : true,
                            set : function(hash) {
                                location.hash = hash;
                            },
                            get : function() {
                                return location.hash
                            }
                        },
                        'host$' : {
                            configurable : true,
                            get : function() {
                                return 'sandboxed'
                            }
                        },
                        'hostname$' : {
                            configurable : true,
                            get : function() {
                                return 'sandboxed'
                            }
                        },
                        'pathname$' : {
                            configurable : true,
                            get : function() {
                                return '/'
                            }
                        },
                        'port$' : {
                            configurable : true,
                            get : function() {
                                return ''
                            }
                        },
                        'protocol$' : {
                            configurable : true,
                            get : function() {
                                return 'http:'
                            }
                        },
                        'search$' : {
                            configurable : true,
                            get : function() {
                                return ''
                            }
                        }
                    });
                    Object.defineProperties(window.navigator$, {
                        'appCodeName$' : {
                            configurable : true,
                            get : function() {
                                return navigator.appCodeName
                            }
                        },
                        'appName$' : {
                            configurable : true,
                            get : function() {
                                return navigator.appName
                            }
                        },
                        'appVersion$' : {
                            configurable : true,
                            get : function() {
                                return navigator.appVersion
                            }
                        },
                        'language$' : {
                            configurable : true,
                            get : function() {
                                return navigator.language
                            }
                        },
                        'onLine$' : {
                            configurable : true,
                            get : function() {
                                return navigator.onLine
                            }
                        },
                        'oscpu$' : {
                            configurable : true,
                            get : function() {
                                return navigator.oscpu
                            }
                        },
                        'platform$' : {
                            configurable : true,
                            get : function() {
                                return navigator.platform
                            }
                        },
                        'product$' : {
                            configurable : true,
                            get : function() {
                                return navigator.product
                            }
                        },
                        'productSub$' : {
                            configurable : true,
                            get : function() {
                                return navigator.productSub
                            }
                        },
                        'userAgent$' : {
                            configurable : true,
                            get : function() {
                                return navigator.userAgent
                            }
                        },
                        'vendor$' : {
                            configurable : true,
                            get : function() {
                                return navigator.vendor
                            }
                        },
                        'vendorSub$' : {
                            configurable : true,
                            get : function() {
                                return navigator.vendorSub
                            }
                        }
                    });
                    Object.defineProperties(document.documentElement, {
                        'nodeName$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.documentElement.nodeName
                        },
                        'contains$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.documentElement.contains.apply(document.documentElement, arguments)
                            }
                        },
                        'compareDocumentPosition$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.documentElement.compareDocumentPosition.apply(document.documentElement, arguments)
                            }
                        }
                    });
                    createSandboxedNode(Element.prototype);
                    createSandboxedNode(DocumentFragment.prototype);
                    Object.defineProperties(HTMLScriptElement.prototype, {
                        'innerText$' : {
                            configurable : true,
                            get : function() {
                                return this.innerText;
                            },
                            set : function() {
                            }
                        },
                        'textContent$' : {
                            configurable : true,
                            get : function() {
                                return this.textContent;
                            },
                            set : function() {
                            }
                        },
                        'text$' : {
                            configurable : true,
                            get : function() {
                                return this.text;
                            },
                            set : function() {
                            }
                        },
                        'innerHTML$' : {
                            configurable : true,
                            get : function() {
                                return this.innerHTML;
                            },
                            set : function() {
                            }
                        }
                    });
                    Object.defineProperties(HTMLStyleElement.prototype, {
                        'innerText$' : {
                            configurable : true,
                            get : function() {
                                return this.innerText;
                            },
                            set : function(innerText) {
                                this.innerText = innerText;
                            }
                        },
                        'textContent$' : {
                            configurable : true,
                            get : function() {
                                return this.textContent;
                            },
                            set : function(textContent) {
                                this.textContent = textContent;
                            }
                        },
                        'text$' : {
                            configurable : true,
                            get : function() {
                                return this.text;
                            },
                            set : function(text) {
                                this.text = text;
                            }
                        },
                        'innerHTML$' : {
                            configurable : true,
                            get : function() {
                                return this.innerHTML;
                            },
                            set : function() {
                            }
                        }
                    });

                    Object.defineProperties(document, {
                        'ownerDocument$' : {
                            configurable : true,
                            get : function() {
                                return document.ownerDocument;
                            }
                        },
                        'nodeName$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.nodeName
                        },
                        'nodeType$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.nodeType
                        },
                        'compatMode$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.compatMode
                        },
                        'head$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.head
                        },
                        'defaultView$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : window
                        },
                        'documentElement$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.documentElement
                        },
                        'readyState$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.readyState
                        },
                        'body$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.body
                        },
                        'createTextNode$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.createTextNode.apply(document, arguments)
                            }
                        },
                        'createDocumentFragment$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : document.createDocumentFragment
                        },
                        'getElementById$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.getElementById.apply(document, arguments)
                            }
                        },
                        'getElementsByTagName$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.getElementsByTagName.apply(document, arguments)
                            }
                        },
                        'querySelector$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.querySelector.apply(document, arguments)
                            }
                        },
                        'querySelectorAll$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.querySelectorAll.apply(document, arguments)
                            }
                        },
                        'createElement$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function(tag) {
                                if (!allowedTagsRegEx.test(tag)) {
                                    return false;
                                }
                                return document.createElement.call(document, tag);
                            }
                        },
                        'removeEventListener$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                return document.removeEventListener.apply(document, arguments);
                            }
                        },
                        'addEventListener$' : {
                            enumerable : false,
                            configurable : true,
                            writable : false,
                            value : function() {
                                if ( typeof arguments[1] != 'function') {
                                    error("Expected function in event listener")
                                }
                                return document.addEventListener.apply(document, arguments);
                            }
                        }
                    });

                    Object.freeze(Element.prototype);
                    Object.freeze(DocumentFragment.prototype);
                    Object.freeze(HTMLScriptElement.prototype);
                    Object.freeze(HTMLStyleElement.prototype);
                }
            };

            this.parse = function(obj) {
                if (!Object.defineProperty) {
                    error("MentalJS requires ES5. Please upgrade your browser.");
                }
                var parseTreeOutput = '', converted, pos = 0, chr, index, result;

                function error(str) {
                    var e = new Error();
                    throw {
                        msg : str + (e.stack ? ' - ' + e.stack : ''),
                        pos : pos,
                        chr : typeof chr === 'undefined' ? '(end)' : chr,
                        state : parseTreeOutput,
                        text : code.slice(pos - 10, pos + 10),
                        code : this.code
                    };
                }

                function execute(code) {
                    var result;
                    window['window' + scoping] = this;
                    result = eval(code);
                    if (that.result) {
                        that.result(result);
                    }
                    return result;
                }

                function rewrite(code) {
                    this.code = code;
                    var parentState, parentStates = {}, msg, state = 89, left = 0, output = '', outputLine = '', next, next2, next3, cached = -1, len = code.length, parseTree = that.parseTree, lookupSquare = 1, lookupCurly = 1, lookupParen = 1, ternaryCount = 0, isTernary = {}, caseCount = 0, isCase = {}, isVar = {}, isFor = {}, isForIn = {}, isIf = {}, isObjectLiteral = {}, lastState = 89, newLineFlag = 0, parseTreeFlag = !!that.parseTree, completeFlag = !!that.complete, convertedFlag = !!that.converted, foundKeyword = 0, commentSkip = 0;
                    function asi(useOutput) {
                        var parenIndex = lookupParen - 1, index1 = parseFloat('' + lookupSquare + lookupCurly + parenIndex), index2 = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        if (isFor[index1] && !isForIn[index1]) {
                            lastState = 45;
                            if (useOutput) {
                                output += ';';
                            } else {
                                outputLine += ';';
                            }
                            if (isFor[index1] > 2) {
                                error("Syntax error unexpected for semi ;");
                            }
                            isFor[index1]++;
                            isVar[index2] = 0;
                        } else {
                            if (useOutput) {
                                output += ';';
                            } else {
                                outputLine = ';' + outputLine;
                            }
                            lastState = 35;
                            left = 0;
                            isVar[index2] = 0;
                        }
                    };
                    function isValidVariable(c) {
                        return c === 170 || c === 181 || c === 186 || c > 191 && c < 215 || c > 215 && c < 247 || c > 247 && c < 706 || c > 709 && c < 722 || c > 735 && c < 741 || c === 748 || c === 750 || c > 879 && c < 885 || c > 885 && c < 888 || c > 889 && c < 894 || c === 902 || c > 903 && c < 907 || c === 908 || c > 909 && c < 930 || c > 930 && c < 1014 || c > 1014 && c < 1154 || c > 1161 && c < 1320 || c > 1328 && c < 1367 || c === 1369 || c > 1376 && c < 1416 || c > 1487 && c < 1515 || c > 1519 && c < 1523 || c > 1567 && c < 1611 || c > 1645 && c < 1648 || c > 1648 && c < 1748 || c === 1749 || c > 1764 && c < 1767 || c > 1773 && c < 1776 || c > 1785 && c < 1789 || c === 1791 || c === 1808 || c > 1809 && c < 1840 || c > 1868 && c < 1958 || c === 1969 || c > 1993 && c < 2027 || c > 2035 && c < 2038 || c === 2042 || c > 2047 && c < 2070 || c === 2074 || c === 2084 || c === 2088 || c > 2111 && c < 2137 || c === 2208 || c > 2209 && c < 2221 || c > 2307 && c < 2362 || c === 2365 || c === 2384 || c > 2391 && c < 2402 || c > 2416 && c < 2424 || c > 2424 && c < 2432 || c > 2436 && c < 2445 || c > 2446 && c < 2449 || c > 2450 && c < 2473 || c > 2473 && c < 2481 || c === 2482 || c > 2485 && c < 2490 || c === 2493 || c === 2510 || c > 2523 && c < 2526 || c > 2526 && c < 2530 || c > 2543 && c < 2546 || c > 2564 && c < 2571 || c > 2574 && c < 2577 || c > 2578 && c < 2601 || c > 2601 && c < 2609 || c > 2609 && c < 2612 || c > 2612 && c < 2615 || c > 2615 && c < 2618 || c > 2648 && c < 2653 || c === 2654 || c > 2673 && c < 2677 || c > 2692 && c < 2702 || c > 2702 && c < 2706 || c > 2706 && c < 2729 || c > 2729 && c < 2737 || c > 2737 && c < 2740 || c > 2740 && c < 2746 || c === 2749 || c === 2768 || c > 2783 && c < 2786 || c > 2820 && c < 2829 || c > 2830 && c < 2833 || c > 2834 && c < 2857 || c > 2857 && c < 2865 || c > 2865 && c < 2868 || c > 2868 && c < 2874 || c === 2877 || c > 2907 && c < 2910 || c > 2910 && c < 2914 || c === 2929 || c === 2947 || c > 2948 && c < 2955 || c > 2957 && c < 2961 || c > 2961 && c < 2966 || c > 2968 && c < 2971 || c === 2972 || c > 2973 && c < 2976 || c > 2978 && c < 2981 || c > 2983 && c < 2987 || c > 2989 && c < 3002 || c === 3024 || c > 3076 && c < 3085 || c > 3085 && c < 3089 || c > 3089 && c < 3113 || c > 3113 && c < 3124 || c > 3124 && c < 3130 || c === 3133 || c > 3159 && c < 3162 || c > 3167 && c < 3170 || c > 3204 && c < 3213 || c > 3213 && c < 3217 || c > 3217 && c < 3241 || c > 3241 && c < 3252 || c > 3252 && c < 3258 || c === 3261 || c === 3294 || c > 3295 && c < 3298 || c > 3312 && c < 3315 || c > 3332 && c < 3341 || c > 3341 && c < 3345 || c > 3345 && c < 3387 || c === 3389 || c === 3406 || c > 3423 && c < 3426 || c > 3449 && c < 3456 || c > 3460 && c < 3479 || c > 3481 && c < 3506 || c > 3506 && c < 3516 || c === 3517 || c > 3519 && c < 3527 || c > 3584 && c < 3633 || c > 3633 && c < 3636 || c > 3647 && c < 3655 || c > 3712 && c < 3715 || c === 3716 || c > 3718 && c < 3721 || c === 3722 || c === 3725 || c > 3731 && c < 3736 || c > 3736 && c < 3744 || c > 3744 && c < 3748 || c === 3749 || c === 3751 || c > 3753 && c < 3756 || c > 3756 && c < 3761 || c > 3761 && c < 3764 || c === 3773 || c > 3775 && c < 3781 || c === 3782 || c > 3803 && c < 3808 || c === 3840 || c > 3903 && c < 3912 || c > 3912 && c < 3949 || c > 3975 && c < 3981 || c > 4095 && c < 4139 || c === 4159 || c > 4175 && c < 4182 || c > 4185 && c < 4190 || c === 4193 || c > 4196 && c < 4199 || c > 4205 && c < 4209 || c > 4212 && c < 4226 || c === 4238 || c > 4255 && c < 4294 || c === 4295 || c === 4301 || c > 4303 && c < 4347 || c > 4347 && c < 4681 || c > 4681 && c < 4686 || c > 4687 && c < 4695 || c === 4696 || c > 4697 && c < 4702 || c > 4703 && c < 4745 || c > 4745 && c < 4750 || c > 4751 && c < 4785 || c > 4785 && c < 4790 || c > 4791 && c < 4799 || c === 4800 || c > 4801 && c < 4806 || c > 4807 && c < 4823 || c > 4823 && c < 4881 || c > 4881 && c < 4886 || c > 4887 && c < 4955 || c > 4991 && c < 5008 || c > 5023 && c < 5109 || c > 5120 && c < 5741 || c > 5742 && c < 5760 || c > 5760 && c < 5787 || c > 5791 && c < 5867 || c > 5869 && c < 5873 || c > 5887 && c < 5901 || c > 5901 && c < 5906 || c > 5919 && c < 5938 || c > 5951 && c < 5970 || c > 5983 && c < 5997 || c > 5997 && c < 6001 || c > 6015 && c < 6068 || c === 6103 || c === 6108 || c > 6175 && c < 6264 || c > 6271 && c < 6313 || c === 6314 || c > 6319 && c < 6390 || c > 6399 && c < 6429 || c > 6479 && c < 6510 || c > 6511 && c < 6517 || c > 6527 && c < 6572 || c > 6592 && c < 6600 || c > 6655 && c < 6679 || c > 6687 && c < 6741 || c === 6823 || c > 6916 && c < 6964 || c > 6980 && c < 6988 || c > 7042 && c < 7073 || c > 7085 && c < 7088 || c > 7097 && c < 7142 || c > 7167 && c < 7204 || c > 7244 && c < 7248 || c > 7257 && c < 7294 || c > 7400 && c < 7405 || c > 7405 && c < 7410 || c > 7412 && c < 7415 || c > 7423 && c < 7616 || c > 7679 && c < 7958 || c > 7959 && c < 7966 || c > 7967 && c < 8006 || c > 8007 && c < 8014 || c > 8015 && c < 8024 || c === 8025 || c === 8027 || c === 8029 || c > 8030 && c < 8062 || c > 8063 && c < 8117 || c > 8117 && c < 8125 || c === 8126 || c > 8129 && c < 8133 || c > 8133 && c < 8141 || c > 8143 && c < 8148 || c > 8149 && c < 8156 || c > 8159 && c < 8173 || c > 8177 && c < 8181 || c > 8181 && c < 8189 || c === 8305 || c === 8319 || c > 8335 && c < 8349 || c === 8450 || c === 8455 || c > 8457 && c < 8468 || c === 8469 || c > 8472 && c < 8478 || c === 8484 || c === 8486 || c === 8488 || c > 8489 && c < 8494 || c > 8494 && c < 8506 || c > 8507 && c < 8512 || c > 8516 && c < 8522 || c === 8526 || c > 8543 && c < 8585 || c > 11263 && c < 11311 || c > 11311 && c < 11359 || c > 11359 && c < 11493 || c > 11498 && c < 11503 || c > 11505 && c < 11508 || c > 11519 && c < 11558 || c === 11559 || c === 11565 || c > 11567 && c < 11624 || c === 11631 || c > 11647 && c < 11671 || c > 11679 && c < 11687 || c > 11687 && c < 11695 || c > 11695 && c < 11703 || c > 11703 && c < 11711 || c > 11711 && c < 11719 || c > 11719 && c < 11727 || c > 11727 && c < 11735 || c > 11735 && c < 11743 || c === 11823 || c > 12292 && c < 12296 || c > 12320 && c < 12330 || c > 12336 && c < 12342 || c > 12343 && c < 12349 || c > 12352 && c < 12439 || c > 12444 && c < 12448 || c > 12448 && c < 12539 || c > 12539 && c < 12544 || c > 12548 && c < 12590 || c > 12592 && c < 12687 || c > 12703 && c < 12731 || c > 12783 && c < 12800 || c > 13311 && c < 19894 || c > 19967 && c < 40909 || c > 40959 && c < 42125 || c > 42191 && c < 42238 || c > 42239 && c < 42509 || c > 42511 && c < 42528 || c > 42537 && c < 42540 || c > 42559 && c < 42607 || c > 42622 && c < 42648 || c > 42655 && c < 42736 || c > 42774 && c < 42784 || c > 42785 && c < 42889 || c > 42890 && c < 42895 || c > 42895 && c < 42900 || c > 42911 && c < 42923 || c > 42999 && c < 43010 || c > 43010 && c < 43014 || c > 43014 && c < 43019 || c > 43019 && c < 43043 || c > 43071 && c < 43124 || c > 43137 && c < 43188 || c > 43249 && c < 43256 || c === 43259 || c > 43273 && c < 43302 || c > 43311 && c < 43335 || c > 43359 && c < 43389 || c > 43395 && c < 43443 || c === 43471 || c > 43519 && c < 43561 || c > 43583 && c < 43587 || c > 43587 && c < 43596 || c > 43615 && c < 43639 || c === 43642 || c > 43647 && c < 43696 || c === 43697 || c > 43700 && c < 43703 || c > 43704 && c < 43710 || c === 43712 || c === 43714 || c > 43738 && c < 43742 || c > 43743 && c < 43755 || c > 43761 && c < 43765 || c > 43776 && c < 43783 || c > 43784 && c < 43791 || c > 43792 && c < 43799 || c > 43807 && c < 43815 || c > 43815 && c < 43823 || c > 43967 && c < 44003 || c > 44031 && c < 55204 || c > 55215 && c < 55239 || c > 55242 && c < 55292 || c > 63743 && c < 64110 || c > 64111 && c < 64218 || c > 64255 && c < 64263 || c > 64274 && c < 64280 || c === 64285 || c > 64286 && c < 64297 || c > 64297 && c < 64311 || c > 64311 && c < 64317 || c === 64318 || c > 64319 && c < 64322 || c > 64322 && c < 64325 || c > 64325 && c < 64434 || c > 64466 && c < 64830 || c > 64847 && c < 64912 || c > 64913 && c < 64968 || c > 65007 && c < 65020 || c > 65135 && c < 65141 || c > 65141 && c < 65277 || c > 65312 && c < 65339 || c > 65344 && c < 65371 || c > 65381 && c < 65471 || c > 65473 && c < 65480 || c > 65481 && c < 65488 || c > 65489 && c < 65496 || c > 65497 && c < 65501;
                    }

                    function isValidVariablePart(c) {
                        return c === 170 || c === 181 || c === 186 || c > 191 && c < 215 || c > 215 && c < 247 || c > 247 && c < 706 || c > 709 && c < 722 || c > 735 && c < 741 || c === 748 || c === 750 || c > 767 && c < 885 || c > 885 && c < 888 || c > 889 && c < 894 || c === 902 || c > 903 && c < 907 || c === 908 || c > 909 && c < 930 || c > 930 && c < 1014 || c > 1014 && c < 1154 || c > 1154 && c < 1160 || c > 1161 && c < 1320 || c > 1328 && c < 1367 || c === 1369 || c > 1376 && c < 1416 || c > 1424 && c < 1470 || c === 1471 || c > 1472 && c < 1475 || c > 1475 && c < 1478 || c === 1479 || c > 1487 && c < 1515 || c > 1519 && c < 1523 || c > 1551 && c < 1563 || c > 1567 && c < 1642 || c > 1645 && c < 1748 || c > 1748 && c < 1757 || c > 1758 && c < 1769 || c > 1769 && c < 1789 || c === 1791 || c > 1807 && c < 1867 || c > 1868 && c < 1970 || c > 1983 && c < 2038 || c === 2042 || c > 2047 && c < 2094 || c > 2111 && c < 2140 || c === 2208 || c > 2209 && c < 2221 || c > 2275 && c < 2303 || c > 2303 && c < 2404 || c > 2405 && c < 2416 || c > 2416 && c < 2424 || c > 2424 && c < 2432 || c > 2432 && c < 2436 || c > 2436 && c < 2445 || c > 2446 && c < 2449 || c > 2450 && c < 2473 || c > 2473 && c < 2481 || c === 2482 || c > 2485 && c < 2490 || c > 2491 && c < 2501 || c > 2502 && c < 2505 || c > 2506 && c < 2511 || c === 2519 || c > 2523 && c < 2526 || c > 2526 && c < 2532 || c > 2533 && c < 2546 || c > 2560 && c < 2564 || c > 2564 && c < 2571 || c > 2574 && c < 2577 || c > 2578 && c < 2601 || c > 2601 && c < 2609 || c > 2609 && c < 2612 || c > 2612 && c < 2615 || c > 2615 && c < 2618 || c === 2620 || c > 2621 && c < 2627 || c > 2630 && c < 2633 || c > 2634 && c < 2638 || c === 2641 || c > 2648 && c < 2653 || c === 2654 || c > 2661 && c < 2678 || c > 2688 && c < 2692 || c > 2692 && c < 2702 || c > 2702 && c < 2706 || c > 2706 && c < 2729 || c > 2729 && c < 2737 || c > 2737 && c < 2740 || c > 2740 && c < 2746 || c > 2747 && c < 2758 || c > 2758 && c < 2762 || c > 2762 && c < 2766 || c === 2768 || c > 2783 && c < 2788 || c > 2789 && c < 2800 || c > 2816 && c < 2820 || c > 2820 && c < 2829 || c > 2830 && c < 2833 || c > 2834 && c < 2857 || c > 2857 && c < 2865 || c > 2865 && c < 2868 || c > 2868 && c < 2874 || c > 2875 && c < 2885 || c > 2886 && c < 2889 || c > 2890 && c < 2894 || c > 2901 && c < 2904 || c > 2907 && c < 2910 || c > 2910 && c < 2916 || c > 2917 && c < 2928 || c === 2929 || c > 2945 && c < 2948 || c > 2948 && c < 2955 || c > 2957 && c < 2961 || c > 2961 && c < 2966 || c > 2968 && c < 2971 || c === 2972 || c > 2973 && c < 2976 || c > 2978 && c < 2981 || c > 2983 && c < 2987 || c > 2989 && c < 3002 || c > 3005 && c < 3011 || c > 3013 && c < 3017 || c > 3017 && c < 3022 || c === 3024 || c === 3031 || c > 3045 && c < 3056 || c > 3072 && c < 3076 || c > 3076 && c < 3085 || c > 3085 && c < 3089 || c > 3089 && c < 3113 || c > 3113 && c < 3124 || c > 3124 && c < 3130 || c > 3132 && c < 3141 || c > 3141 && c < 3145 || c > 3145 && c < 3150 || c > 3156 && c < 3159 || c > 3159 && c < 3162 || c > 3167 && c < 3172 || c > 3173 && c < 3184 || c > 3201 && c < 3204 || c > 3204 && c < 3213 || c > 3213 && c < 3217 || c > 3217 && c < 3241 || c > 3241 && c < 3252 || c > 3252 && c < 3258 || c > 3259 && c < 3269 || c > 3269 && c < 3273 || c > 3273 && c < 3278 || c > 3284 && c < 3287 || c === 3294 || c > 3295 && c < 3300 || c > 3301 && c < 3312 || c > 3312 && c < 3315 || c > 3329 && c < 3332 || c > 3332 && c < 3341 || c > 3341 && c < 3345 || c > 3345 && c < 3387 || c > 3388 && c < 3397 || c > 3397 && c < 3401 || c > 3401 && c < 3407 || c === 3415 || c > 3423 && c < 3428 || c > 3429 && c < 3440 || c > 3449 && c < 3456 || c > 3457 && c < 3460 || c > 3460 && c < 3479 || c > 3481 && c < 3506 || c > 3506 && c < 3516 || c === 3517 || c > 3519 && c < 3527 || c === 3530 || c > 3534 && c < 3541 || c === 3542 || c > 3543 && c < 3552 || c > 3569 && c < 3572 || c > 3584 && c < 3643 || c > 3647 && c < 3663 || c > 3663 && c < 3674 || c > 3712 && c < 3715 || c === 3716 || c > 3718 && c < 3721 || c === 3722 || c === 3725 || c > 3731 && c < 3736 || c > 3736 && c < 3744 || c > 3744 && c < 3748 || c === 3749 || c === 3751 || c > 3753 && c < 3756 || c > 3756 && c < 3770 || c > 3770 && c < 3774 || c > 3775 && c < 3781 || c === 3782 || c > 3783 && c < 3790 || c > 3791 && c < 3802 || c > 3803 && c < 3808 || c === 3840 || c > 3863 && c < 3866 || c > 3871 && c < 3882 || c === 3893 || c === 3895 || c === 3897 || c > 3901 && c < 3912 || c > 3912 && c < 3949 || c > 3952 && c < 3973 || c > 3973 && c < 3992 || c > 3992 && c < 4029 || c === 4038 || c > 4095 && c < 4170 || c > 4175 && c < 4254 || c > 4255 && c < 4294 || c === 4295 || c === 4301 || c > 4303 && c < 4347 || c > 4347 && c < 4681 || c > 4681 && c < 4686 || c > 4687 && c < 4695 || c === 4696 || c > 4697 && c < 4702 || c > 4703 && c < 4745 || c > 4745 && c < 4750 || c > 4751 && c < 4785 || c > 4785 && c < 4790 || c > 4791 && c < 4799 || c === 4800 || c > 4801 && c < 4806 || c > 4807 && c < 4823 || c > 4823 && c < 4881 || c > 4881 && c < 4886 || c > 4887 && c < 4955 || c > 4956 && c < 4960 || c > 4991 && c < 5008 || c > 5023 && c < 5109 || c > 5120 && c < 5741 || c > 5742 && c < 5760 || c > 5760 && c < 5787 || c > 5791 && c < 5867 || c > 5869 && c < 5873 || c > 5887 && c < 5901 || c > 5901 && c < 5909 || c > 5919 && c < 5941 || c > 5951 && c < 5972 || c > 5983 && c < 5997 || c > 5997 && c < 6001 || c > 6001 && c < 6004 || c > 6015 && c < 6100 || c === 6103 || c > 6107 && c < 6110 || c > 6111 && c < 6122 || c > 6154 && c < 6158 || c > 6159 && c < 6170 || c > 6175 && c < 6264 || c > 6271 && c < 6315 || c > 6319 && c < 6390 || c > 6399 && c < 6429 || c > 6431 && c < 6444 || c > 6447 && c < 6460 || c > 6469 && c < 6510 || c > 6511 && c < 6517 || c > 6527 && c < 6572 || c > 6575 && c < 6602 || c > 6607 && c < 6618 || c > 6655 && c < 6684 || c > 6687 && c < 6751 || c > 6751 && c < 6781 || c > 6782 && c < 6794 || c > 6799 && c < 6810 || c === 6823 || c > 6911 && c < 6988 || c > 6991 && c < 7002 || c > 7018 && c < 7028 || c > 7039 && c < 7156 || c > 7167 && c < 7224 || c > 7231 && c < 7242 || c > 7244 && c < 7294 || c > 7375 && c < 7379 || c > 7379 && c < 7415 || c > 7423 && c < 7655 || c > 7675 && c < 7958 || c > 7959 && c < 7966 || c > 7967 && c < 8006 || c > 8007 && c < 8014 || c > 8015 && c < 8024 || c === 8025 || c === 8027 || c === 8029 || c > 8030 && c < 8062 || c > 8063 && c < 8117 || c > 8117 && c < 8125 || c === 8126 || c > 8129 && c < 8133 || c > 8133 && c < 8141 || c > 8143 && c < 8148 || c > 8149 && c < 8156 || c > 8159 && c < 8173 || c > 8177 && c < 8181 || c > 8181 && c < 8189 || c > 8203 && c < 8206 || c > 8254 && c < 8257 || c === 8276 || c === 8305 || c === 8319 || c > 8335 && c < 8349 || c > 8399 && c < 8413 || c === 8417 || c > 8420 && c < 8433 || c === 8450 || c === 8455 || c > 8457 && c < 8468 || c === 8469 || c > 8472 && c < 8478 || c === 8484 || c === 8486 || c === 8488 || c > 8489 && c < 8494 || c > 8494 && c < 8506 || c > 8507 && c < 8512 || c > 8516 && c < 8522 || c === 8526 || c > 8543 && c < 8585 || c > 11263 && c < 11311 || c > 11311 && c < 11359 || c > 11359 && c < 11493 || c > 11498 && c < 11508 || c > 11519 && c < 11558 || c === 11559 || c === 11565 || c > 11567 && c < 11624 || c === 11631 || c > 11646 && c < 11671 || c > 11679 && c < 11687 || c > 11687 && c < 11695 || c > 11695 && c < 11703 || c > 11703 && c < 11711 || c > 11711 && c < 11719 || c > 11719 && c < 11727 || c > 11727 && c < 11735 || c > 11735 && c < 11743 || c > 11743 && c < 11776 || c === 11823 || c > 12292 && c < 12296 || c > 12320 && c < 12336 || c > 12336 && c < 12342 || c > 12343 && c < 12349 || c > 12352 && c < 12439 || c > 12440 && c < 12443 || c > 12444 && c < 12448 || c > 12448 && c < 12539 || c > 12539 && c < 12544 || c > 12548 && c < 12590 || c > 12592 && c < 12687 || c > 12703 && c < 12731 || c > 12783 && c < 12800 || c > 13311 && c < 19894 || c > 19967 && c < 40909 || c > 40959 && c < 42125 || c > 42191 && c < 42238 || c > 42239 && c < 42509 || c > 42511 && c < 42540 || c > 42559 && c < 42608 || c > 42611 && c < 42622 || c > 42622 && c < 42648 || c > 42654 && c < 42738 || c > 42774 && c < 42784 || c > 42785 && c < 42889 || c > 42890 && c < 42895 || c > 42895 && c < 42900 || c > 42911 && c < 42923 || c > 42999 && c < 43048 || c > 43071 && c < 43124 || c > 43135 && c < 43205 || c > 43215 && c < 43226 || c > 43231 && c < 43256 || c === 43259 || c > 43263 && c < 43310 || c > 43311 && c < 43348 || c > 43359 && c < 43389 || c > 43391 && c < 43457 || c > 43470 && c < 43482 || c > 43519 && c < 43575 || c > 43583 && c < 43598 || c > 43599 && c < 43610 || c > 43615 && c < 43639 || c > 43641 && c < 43644 || c > 43647 && c < 43715 || c > 43738 && c < 43742 || c > 43743 && c < 43760 || c > 43761 && c < 43767 || c > 43776 && c < 43783 || c > 43784 && c < 43791 || c > 43792 && c < 43799 || c > 43807 && c < 43815 || c > 43815 && c < 43823 || c > 43967 && c < 44011 || c > 44011 && c < 44014 || c > 44015 && c < 44026 || c > 44031 && c < 55204 || c > 55215 && c < 55239 || c > 55242 && c < 55292 || c > 63743 && c < 64110 || c > 64111 && c < 64218 || c > 64255 && c < 64263 || c > 64274 && c < 64280 || c > 64284 && c < 64297 || c > 64297 && c < 64311 || c > 64311 && c < 64317 || c === 64318 || c > 64319 && c < 64322 || c > 64322 && c < 64325 || c > 64325 && c < 64434 || c > 64466 && c < 64830 || c > 64847 && c < 64912 || c > 64913 && c < 64968 || c > 65007 && c < 65020 || c > 65023 && c < 65040 || c > 65055 && c < 65063 || c > 65074 && c < 65077 || c > 65100 && c < 65104 || c > 65135 && c < 65141 || c > 65141 && c < 65277 || c > 65295 && c < 65306 || c > 65312 && c < 65339 || c === 65343 || c > 65344 && c < 65371 || c > 65381 && c < 65471 || c > 65473 && c < 65480 || c > 65481 && c < 65488 || c > 65489 && c < 65496 || c > 65497 && c < 65501;
                    }

                    function unicodeEscape(first) {
                        pos++;
                        var chr1 = code.charCodeAt(pos), chr2 = code.charAt(pos + 1), chr3 = code.charAt(pos + 2), chr4 = code.charAt(pos + 3), chr5 = code.charAt(pos + 4), hex;
                        if (chr1 !== 0x75) {
                            error("Invalid unicode escape. Expected u.");
                        }
                        hex = +('0x' + chr2 + chr3 + chr4 + chr5);
                        if ((hex === hex && hex !== hex) || /[^a-f0-9]/i.test(''+chr2+chr3+chr4+chr5)) {
                            error("Invalid unicode escape. Expected valid hex sequence.");
                        }
                        if (first) {
                            if (hex > 0x60 && hex < 0x7b) {
                            } else if (hex > 0x40 && hex < 0x5b) {
                            } else if (hex === 0x5f || hex === 0x24) {
                            } else if (!isValidVariable(hex)) {
                                error('illegal unicode escape');
                            }
                        } else {
                            if (hex > 0x60 && hex < 0x7b) {
                            } else if (hex > 0x2f && hex < 0x3a) {
                            } else if (hex > 0x40 && hex < 0x5b) {
                            } else if (hex === 0x5f || hex === 0x24) {
                            } else if (!isValidVariablePart(hex)) {
                                error('illegal unicode escape');
                            }
                        }
                        pos += 5;
                        if (first) {
                            if (pos < len) {
                                outputLine += '\\u' + chr2 + chr3 + chr4 + chr5;
                                nonKeyword();
                                return false;
                            } else {
                                outputLine += '\\u' + chr2 + chr3 + chr4 + chr5 + '$';
                                identifierStates();
                                identifierAsi();
                            }
                        } else {
                            outputLine += '\\u' + chr2 + chr3 + chr4 + chr5;
                        }
                    }

                    function keyword(iLen) {
                        state = -1;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        left = 0;
                        switch(iLen) {
                        case 2:
                            if (outputLine === 'do') {
                                state = 18;
                                outputLine += ' ';
                            } else if (outputLine === 'in') {
                                state = 73;
                                outputLine = ' ' + outputLine + ' ';
                                if (isFor[index]) {
                                    isForIn[index] = 1;
                                }
                            } else if (outputLine === 'if') {
                                state = 68;
                                if (lastState === 32) {
                                    outputLine = ' ' + outputLine;
                                }
                                isIf[index] = 1;
                            }
                            break;
                        case 3:
                            if (outputLine === 'var') {
                                if (!rules[136][lastState]) {
                                    asi();
                                }
                                state = 136;
                                outputLine += ' ';
                                isVar[index] = 1;
                            } else if (outputLine === 'new') {
                                state = 84;
                                outputLine += ' ';
                            } else if (outputLine === 'NaN') {
                                state = 83;
                                left = 1;
                            } else if (outputLine === 'for') {
                                state = 40;
                                outputLine += ' ';
                                isFor[index] = 1;
                            } else if (outputLine === 'try') {
                                state = 127;
                            }
                            break;
                        case 4:
                            if (outputLine === 'else') {
                                if (!isIf[index]) {
                                    error("Syntax error unexpected else");
                                }
                                state = 32;
                                outputLine += ' ';
                            } else if (outputLine === 'this') {
                                state = 124;
                                left = 1;
                            } else if (outputLine === 'void') {
                                state = 139;
                                outputLine += ' ';
                            } else if (outputLine === 'case') {
                                state = 15;
                                outputLine += ' ';
                                isCase[index] = 1;
                                caseCount++;
                            } else if (outputLine === 'null') {
                                state = 86;
                                left = 1;
                            } else if (outputLine === 'true') {
                                state = 130;
                                left = 1;
                            } else if (outputLine === 'with') {
                                state = 140;
                            }
                            break;
                        case 5:
                            if (outputLine === 'throw') {
                                state = 131;
                                outputLine += ' ';
                            } else if (outputLine === 'break') {
                                state = 14;
                                outputLine += ' ';
                            } else if (outputLine === 'false') {
                                state = 36;
                                left = 1;
                            } else if (outputLine === 'catch') {
                                state = 22;
                            } else if (outputLine === 'while') {
                                state = 145;
                            }
                            break;
                        case 6:
                            if (outputLine === 'delete') {
                                state = 17;
                                outputLine += ' ';
                            } else if (outputLine === 'return') {
                                state = 111;
                                outputLine += ' ';
                            } else if (outputLine === 'typeof') {
                                state = 132;
                                outputLine += ' ';
                            } else if (outputLine === 'switch') {
                                state = 118;
                            }
                            break;
                        case 7:
                            if (outputLine === 'default') {
                                state = 16;
                            } else if (outputLine === 'finally') {
                                state = 37;
                            }
                            break;
                        default:
                            if (outputLine === 'function') {
                                if (rules[52][lastState]) {
                                    state = 52;
                                } else if (rules[60][lastState]) {
                                    state = 60;
                                } else {
                                    if (!rules[67][lastState] && newLineFlag) {
                                        asi();
                                        state = 60;
                                    } else {
                                        error('Unexpected function. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                                    }
                                }
                            } else if (outputLine === 'Infinity') {
                                state = 74;
                                left = 1;
                            } else if (outputLine === 'continue') {
                                state = 29;
                                outputLine += ' ';
                            } else if (outputLine === 'instanceof') {
                                state = 75;
                                left = 1;
                                outputLine = ' ' + outputLine + ' ';
                            }
                            break;
                        }
                        if (state > -1) {
                            return true;
                        } else {
                            return false;
                        }
                    }

                    function identifierAsi() {
                        if (!rules[state][lastState] && newLineFlag) {
                            if (left) {
                                asi(true);
                                left = 1;
                            } else {
                                asi(true);
                            }
                        }
                    }

                    function identifier() {
                        var iLen, notKeyword = false;
                        while (pos < len) {
                            chr = code.charCodeAt(pos);
                            if (chr > 0x60 && chr < 0x7b) {
                            } else if (chr > 0x40 && chr < 0x5b) {
                            } else if (chr > 0x2f && chr < 0x3a) {
                                nonKeyword();
                                return false;
                            } else if (chr === 0x5f || chr === 0x24) {
                                nonKeyword();
                                return false;
                            } else if (chr === 0x5c) {
                                unicodeEscape();
                                nonKeyword();
                                return false;
                            } else {
                                break;
                            }
                            outputLine += code.charAt(pos++);
                        }
                        iLen = outputLine.length;
                        if (iLen === 1 || iLen > 10) {
                            outputLine = outputLine + scoping;
                            identifierStates();
                            return false;
                        } else {
                            if (!keyword(iLen)) {
                                outputLine = outputLine + scoping;
                                identifierStates();
                                return false;
                            }
                        }
                        identifierAsi();
                    }

                    function identifierStates() {
                        if (rules[50][lastState]) {
                            state = 50;
                            outputLine = ' ' + outputLine;
                        } else if (rules[25][lastState]) {
                            state = 25;
                        } else if (rules[98][lastState]) {
                            state = 98;
                        } else if (rules[53][lastState]) {
                            state = 53;
                            outputLine = ' ' + outputLine;
                        } else if (rules[48][lastState]) {
                            state = 48;
                        } else if (rules[55][lastState]) {
                            state = 55;
                        } else if (rules[137][lastState]) {
                            state = 137;
                            left = 1;
                        } else if (rules[67][lastState]) {
                            state = 67;
                            left = 1;
                        } else {
                            if (!rules[67][lastState] && newLineFlag) {
                                asi(true);
                            }
                            state = 67;
                            left = 1;
                        }
                    }

                    function nonKeyword() {
                        while (pos < len) {
                            chr = code.charCodeAt(pos);
                            if (chr > 0x60 && chr < 0x7b) {
                            } else if (chr > 0x2f && chr < 0x3a) {
                            } else if (chr > 0x40 && chr < 0x5b) {
                            } else if (chr === 0x5f || chr === 0x24) {
                            } else if (chr === 0x5c) {
                                unicodeEscape();
                                continue;
                            } else if (chr > 0x80) {
                                if (!isValidVariablePart(chr)) {
                                    break;
                                }
                            } else {
                                break;
                            }
                            outputLine += code.charAt(pos++);
                        }
                        outputLine = outputLine + scoping;
                        identifierStates();
                        identifierAsi();
                    }

                    function newLine() {
                        newLineFlag = 1;
                        pos++;
                        if (lastState === 14 || lastState === 29 || lastState === 111) {
                            asi(true);
                        }
                    }

                    function semicolon() {
                        var parentState = parentStates[index], parenIndex = lookupParen - 1, index2 = parseFloat('' + lookupSquare + lookupCurly + parenIndex);
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen)
                        if (isFor[index2] && !isForIn[index2]) {
                            state = 45;
                            outputLine += ';';
                            if (isFor[index2] > 2) {
                                error("Syntax error unexpected for semi ;");
                            }
                            isFor[index2]++;
                            isVar[index] = 0;
                        } else {
                            state = 35;
                            if (lastState !== 35) {
                                outputLine += ';';
                            }
                            isVar[index] = 0;
                        }
                        pos++;
                        left = 0;
                    }

                    function plus() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (next === 0x2b && left) {
                            state = 107;
                            outputLine += '++';
                            pos += 2;
                            left = 1;
                        } else if (next === 0x2b && !left) {
                            state = 110;
                            outputLine += '++';
                            pos += 2;
                            left = 0;
                        } else if (next === 0x3d) {
                            state = 6;
                            outputLine += '+=';
                            pos += 2;
                            left = 0;
                        } else if (next !== 0x3d && next !== 0x2b && left) {
                            state = 5;
                            outputLine += ' + ';
                            pos++;
                            cached = next;
                            left = 0;
                        } else if (next !== 0x3d && next !== 0x2b && !left) {
                            state = 133;
                            outputLine += '+';
                            pos++;
                            cached = next;
                            left = 0;
                        } else {
                            error('Unexpected + Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                    }

                    function nonStandardComment() {
                        while (pos < len) {
                            chr = code.charCodeAt(pos++);
                            if (chr === 10 || chr === 13 || chr === 8232 || chr == 8233) {
                                break;
                            }
                        }
                        cached = -1;
                        newLineFlag = 1;
                        commentSkip = 1;
                    }

                    function singleComment() {
                        pos += 2;
                        while (pos < len) {
                            chr = code.charCodeAt(pos++);
                            if (chr === 10 || chr === 13 || chr === 8232 || chr == 8233) {
                                break;
                            }
                        }
                        cached = -1;
                        newLineFlag = 1;
                    }

                    function multiComment() {
                        pos += 2;
                        pos = code.indexOf('*/', pos);
                        if (pos >= 0) {
                            pos += 2;
                        } else {
                            error('Unterminated comment');
                        }
                        cached = -1;
                    }

                    function regex() {
                        var states = {
                            escaping : 0,
                            complete : 0,
                            open : 0,
                            square : 0,
                            flags : {}
                        };
                        cached = -1;
                        state = 112;
                        left = 1;
                        states.open = 1;
                        outputLine += '/';
                        pos++;
                        while (pos < len) {
                            if (cached >= 0) {
                                chr = cached;
                            } else {
                                chr = code.charCodeAt(pos);
                            }
                            next = code.charCodeAt(pos + 1);
                            cached = -1;
                            if (chr === 0x2f && !states.escaping && !states.square) {
                                states.open = 0;
                                if (next !== 0x69 && next !== 0x6d && next !== 0x67) {
                                    states.complete = 1;
                                }
                            } else if (chr === 0x2f && !states.escaping && states.square) {
                                outputLine += '\\';
                            } else if (chr === 0x28 && !states.escaping && states.square) {
                                outputLine += '\\';
                            } else if (chr === 0x29 && !states.escaping && states.square) {
                                outputLine += '\\';
                            } else if (chr === 0x5b && !states.escaping && states.square) {
                                outputLine += '\\';
                            } else if (chr === 0x5b && !states.escaping && !states.square) {
                                next2 = code.charCodeAt(pos + 2);
                                if (next === 0x5d || (next === 0x5e && next2 === 0x5d)) {
                                    error("Empty character class not allowed.");
                                }
                                states.square = 1;
                            } else if (chr === 0x5c && !states.escaping) {
                                states.escaping = 1;
                            } else if (chr === 0x5c && states.escaping) {
                                states.escaping = 0;
                            } else if (chr === 0x5d && !states.escaping) {
                                states.square = 0;
                            } else if (chr === 10 || chr === 13 || chr === 8232 || chr == 8233) {
                                error("Unterminated regex literal");
                            } else if (states.escaping) {
                                states.escaping = 0;
                            } else if (!states.open && next !== 0x69 && next !== 0x6d && next !== 0x67) {
                                if (!states.open && (chr === 0x69 || chr === 0x6d || chr === 0x67) && states.flags[chr]) {
                                    error("Duplicate regex flag");
                                }
                                states.complete = 1;
                            } else if (!states.open && (chr === 0x69 || chr === 0x6d || chr === 0x67) && !states.flags[chr]) {
                                states.flags[chr] = 1;
                            }
                            outputLine += code.charAt(pos++);
                            cached = next;
                            if (states.complete) {
                                break;
                            }
                        }
                        if (states.open) {
                            error("Unterminated regex literal");
                        }
                    }

                    function numberOrHex() {
                        function number() {
                            while (pos < len) {
                                chr = code.charCodeAt(pos);
                                if (chr >= 0x31 && chr <= 0x39) {
                                    if (states.e) {
                                        states.e = 2;
                                    }
                                    if (states.e2) {
                                        states.e2 = 2;
                                    }
                                } else if (chr === 0x30) {
                                    if (states.zeroFirst && !states.dot) {
                                        pos++;
                                        continue;
                                    }
                                    if (states.e) {
                                        states.e = 2;
                                    }
                                    if (states.e2) {
                                        states.e2 = 2;
                                    }
                                } else if (chr === 0x65 || chr === 0x45) {
                                    if (states.e) {
                                        break;
                                    } else {
                                        states.e = 1;
                                    }
                                } else if (chr === 0x2b || chr === 0x2d) {
                                    if (states.e === 1 && !states.e2) {
                                        states.e = 2;
                                        states.e2 = 1;
                                    } else {
                                        cached = chr;
                                        break;
                                    }
                                } else if (chr === 0x2e) {
                                    if (states.dot || states.e || (states.zeroFirst && states.output.length != 1)) {
                                        break;
                                    }
                                    states.dot = 1;
                                } else {
                                    cached = chr;
                                    break;
                                }
                                states.output = states.output + code.charAt(pos);
                                pos++;
                            }
                            if (states.zeroFirst && !states.output.length) {
                                states.output = '0';
                            } else if (states.dotFirst) {
                                if (states.output.length === 1) {
                                    error('Expected digit');
                                }
                                states.output = '0' + states.output;
                            } else if (states.e === 1 || states.e2 === 1) {
                                error('Expected exponent');
                            }
                            outputLine += states.output;
                        }

                        function hex() {
                            var states = {
                                output : '0x'
                            };
                            pos++;
                            while (pos < len) {
                                chr = code.charCodeAt(pos);
                                if (chr > 0x2f && chr < 0x3a) {
                                } else if (chr > 0x60 && chr < 0x67) {
                                } else if (chr > 0x40 && chr < 0x47) {
                                } else {
                                    break;
                                }
                                states.output = states.output + code.charAt(pos);
                                pos++;
                            }
                            if (states.output.length == 2) {
                                error('Missing hex digits.');
                            }
                            outputLine += states.output;
                        }

                        var states = {
                            dot : 0,
                            e : 0,
                            e2 : 0,
                            complete : 0,
                            output : '',
                            zeroFirst : 0,
                            dotFirst : 0
                        };
                        if (rules[101][lastState]) {
                            state = 101;
                        } else if (rules[85][lastState]) {
                            left = 1;
                            state = 85;
                        } else {
                            if (!rules[85][lastState] && newLineFlag) {
                                asi();
                                left = 1;
                                state = 85;
                            }
                        }

                        if (chr === 0x2e) {
                            states.output = '.';
                            states.dot = 1;
                            states.dotFirst = 1;
                        } else if (chr === 0x30) {
                            states.zeroFirst = 1;
                            states.output += '' + code.charAt(pos);
                        } else {
                            states.output = code.charAt(pos);
                        }
                        if (pos < len) {
                            pos++;
                            chr = code.charCodeAt(pos);
                        }
                        if ((chr === 0x78 || chr === 0x58) && pos < len) {
                            hex();
                        } else {
                            number();
                        }
                    }

                    function divide() {
                        left = 0;
                        cached = -1;
                        if (next === 0x3d) {
                            state = 7;
                            pos += 2;
                            outputLine += '/=';
                        } else {
                            state = 21;
                            pos++;
                            outputLine += ' / ';
                            cached = next;
                        }
                    }

                    function arrayOrAccessorOpen() {
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        if (!left) {
                            state = 1;
                        } else {
                            state = 3;
                        }
                        outputLine += '[';
                        if (state === 3) {
                            outputLine += 'M.P(';
                        }
                        parentStates[index] = state;
                        left = 0;
                        pos++;
                        lookupSquare++;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentStates[index] = state;
                    }

                    function arrayOrAccessorClose() {
                        lookupSquare--;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        var parentState = parentStates[index];
                        if (parentState === 1) {
                            state = 2;
                            left = 1;
                        } else if (parentState === 3) {
                            state = 4;
                            left = 1;
                            outputLine += ')';
                        } else {
                            error('Unexpected ]. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        outputLine += ']';
                        left = 1;
                        pos++;
                        parentStates[index] = null;
                    }

                    function parenOpen() {
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        if (lastState === 50) {
                            state = 51;
                        } else if (lastState === 40) {
                            state = 41;
                        } else if (rules[46][lastState]) {
                            state = 46;
                        } else if (lastState === 68) {
                            state = 69;
                        } else if (lastState === 22) {
                            state = 23;
                        } else if (lastState === 145) {
                            state = 146;
                        } else if (lastState === 118) {
                            state = 119;
                        } else if (lastState === 140) {
                            state = 141;
                        } else if (lastState === 53) {
                            state = 54;
                        } else if (lastState === 52) {
                            state = 54;
                        } else if (rules[104][lastState]) {
                            state = 104;
                        } else {
                            if (!rules[67][lastState] && newLineFlag) {
                                asi();
                                state = 104;
                            } else {
                                error('Unexpected (. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                            }
                        }
                        outputLine += '(';
                        pos++;
                        parentStates[index] = state;
                        left = 0;
                        lookupParen++;
                    }

                    function parenClose() {
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        isVar[index] = null;
                        lookupParen--;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentState = parentStates[index];
                        if (rules[57][lastState]) {
                            state = 57;
                        } else if (parentState === 46) {
                            state = 47;
                            left = 1;
                        } else if (parentState === 41) {
                            state = 42;
                            left = 0;
                            isFor[index] = 0;
                            isForIn[index] = 0;
                        } else if (parentState === 119) {
                            state = 120;
                            left = 0;
                        } else if (parentState === 23) {
                            state = 24;
                            left = 0;
                        } else if (parentState === 146) {
                            state = 147;
                            left = 0;
                        } else if (parentState === 141) {
                            state = 142;
                            left = 0;
                        } else if (parentState === 69) {
                            state = 70;
                            left = 0;
                        } else if (rules[58][lastState]) {
                            state = 58;
                        } else if (parentState === 104) {
                            state = 106;
                            left = 1;
                        } else {
                            error('Unexpected ). Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        outputLine += ')';
                        pos++;
                        parentStates[index] = null;
                    }

                    function curlyOpen() {
                        var curlyIndex = lookupCurly + 1, index = parseFloat('' + lookupSquare + curlyIndex + lookupParen);
                        if (lastState === 57) {
                            state = 61;
                        } else if (lastState === 18) {
                            state = 19;
                        } else if (lastState === 32) {
                            state = 33;
                        } else if (lastState === 147) {
                            state = 148;
                        } else if (lastState === 24) {
                            state = 26;
                        } else if (lastState === 42) {
                            state = 43;
                        } else if (lastState === 142) {
                            state = 143;
                        } else if (lastState === 127) {
                            state = 128;
                        } else if (lastState === 120) {
                            state = 121;
                        } else if (lastState === 70) {
                            state = 71;
                        } else if (lastState === 37) {
                            state = 38;
                        } else if (lastState === 58) {
                            state = 59;
                        } else if (rules[96][lastState]) {
                            state = 96;
                            parentStates[index] = state;
                            outputLine += 'M.O(';
                        } else if (rules[9][lastState]) {
                            state = 9;
                        } else {
                            if (!rules[67][lastState] && newLineFlag) {
                                asi();
                                if (lastState === 45) {
                                    state = 96;
                                    parentStates[index] = state;
                                    outputLine += 'M.O(';
                                } else {
                                    state = 9;
                                }
                            } else {
                                error('Unexpected {. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                            }
                        }
                        outputLine += '{';
                        if (state === 61 || state === 59) {
                            outputLine += 'var arguments$=M.A(arguments);';
                        }
                        pos++;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentStates[index] = state;
                        left = 0;
                        lookupCurly++;
                    }

                    function curlyClose() {
                        var curlyIndex;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        isVar[index] = null;
                        lookupCurly--;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentState = parentStates[index];
                        outputLine += '}';
                        if (parentState === 61) {
                            state = 62;
                            left = 0;
                        } else if (parentState === 33) {
                            state = 34;
                            left = 0;
                        } else if (parentState === 96) {
                            state = 97;
                            left = 1;
                            curlyIndex = lookupCurly + 1;
                            index = parseFloat('' + lookupSquare + curlyIndex + lookupParen);
                            isObjectLiteral[index] = 0;
                            outputLine += ')';
                        } else if (parentState === 43) {
                            state = 44;
                            left = 0;
                        } else if (parentState === 148) {
                            state = 149;
                            left = 0;
                        } else if (parentState === 26) {
                            state = 27;
                            left = 0;
                        } else if (parentState === 38) {
                            state = 39;
                            left = 0;
                        } else if (parentState === 143) {
                            state = 144;
                            left = 0;
                        } else if (parentState === 128) {
                            state = 129;
                        } else if (parentState === 19) {
                            state = 20;
                        } else if (parentState === 121) {
                            state = 122;
                            left = 0;
                        } else if (parentState === 18) {
                            state = 19;
                            left = 0;
                            expect = 0;
                        } else if (parentState === 71) {
                            state = 72;
                            left = 0;
                        } else if (parentState === 59) {
                            state = 63;
                            left = 1;
                        } else if (parentState === 9) {
                            state = 10;
                            left = 0;
                        } else {
                            error('Unexpected }. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentStates[index] = null;
                        pos++;
                    }

                    function ternaryOpen() {
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        state = 125;
                        outputLine += '?';
                        left = 0;
                        pos++;
                        if (isTernary[index]) {
                            isTernary[index]++;
                        } else {
                            isTernary[index] = 1;
                        }
                        ternaryCount++;
                    }

                    function comma() {
                        var parentState;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentState = parentStates[index];
                        if (lastState === 48) {
                            state = 49;
                        } else if (parentState === 1 || lastState === 1) {
                            state = 0;
                        } else if (lastState === 55) {
                            state = 56;
                        } else if (parentState === 104) {
                            state = 105;
                        } else if (isObjectLiteral[index]) {
                            state = 100;
                        } else if (isVar[index]) {
                            state = 138;
                        } else if (isTernary[index]) {
                            error("Syntax error expected :");
                        } else {
                            state = 28;
                        }
                        outputLine += ',';
                        pos++;
                        left = 0;
                    }

                    function period() {
                        if (left) {
                            state = 66;
                        } else {
                            error('Unexpected . Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        outputLine += '.';
                        pos++;
                        left = 0;
                    }

                    function colon() {
                        var parentState;
                        index = parseFloat('' + lookupSquare + lookupCurly + lookupParen);
                        parentState = parentStates[index];
                        if (isTernary[index]) {
                            state = 126;
                            isTernary[index]--;
                            ternaryCount--;
                        } else if (rules[99][lastState]) {
                            state = 99;
                            isObjectLiteral[index] = 1;
                        } else if (isCase[index] || lastState === 16) {
                            state = 123;
                            if (lastState === 15) {
                                error("Syntax error");
                            }
                            if (lastState !== 16) {
                                isCase[index] = 0;
                                caseCount--;
                            }
                        } else if (!parentState) {
                            state = 76;
                        } else {
                            error('Unexpected : Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        outputLine += ':';
                        pos++;
                        left = 0;
                    }

                    function string() {
                        var states;
                        if (lastState === 96 || lastState === 100) {
                            state = 102;
                            left = 0;
                        } else {
                            state = 115;
                            left = 1;
                        }
                        states = {
                            escaping : 0,
                            complete : 0
                        };
                        states[chr] = 1;
                        outputLine += code.charAt(pos);
                        pos++;
                        while (pos < len) {
                            chr = code.charCodeAt(pos);
                            if (chr === 0x27 && !states.escaping && states[0x27]) {
                                states.complete = 1;
                            } else if (chr === 0x22 && !states.escaping && states[0x22]) {
                                states.complete = 1;
                            } else if (states.escaping && (chr === 10 || chr === 13 || chr === 8232 || chr == 8233)) {
                                pos++;
                                states.escaping = 0;
                                continue;
                            } else if (chr === 0x5c && !states.escaping) {
                                states.escaping = 1;
                                pos++;
                                continue;
                            } else if (chr === 0x5c && states.escaping) {
                                states.escaping = 0;
                                outputLine += '\\';
                            } else if ((chr === 10 || chr === 13 || chr === 8232 || chr == 8233) && !states.escaping) {
                                error("Unterminated string literal");
                            } else if (states.escaping) {
                                outputLine += '\\';
                                states.escaping = 0;
                            }
                            if (states.complete && state === 102) {
                                outputLine += scoping;
                            }
                            outputLine += code.charAt(pos);
                            pos++;
                            if (states.complete) {
                                break;
                            }
                        }
                        if (!states.complete) {
                            error("Unterminated string literal");
                        }
                    }

                    function exclamation() {
                        cached = -1;
                        next = code.charCodeAt(pos + 1);
                        next2 = code.charCodeAt(pos + 2);
                        if (next !== 0x3d && !left) {
                            state = 88;
                            outputLine += ' ! ';
                            pos++;
                            cached = next;
                        } else if (next === 0x3d && next2 !== 0x3d) {
                            state = 87;
                            outputLine += '!=';
                            pos += 2;
                            cached = next2;
                        } else if (next === 0x3d && next2 === 0x3d) {
                            state = 117;
                            outputLine += '!==';
                            pos += 3;
                        } else {
                            error('Unexpected !. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function tilde() {
                        if (!left) {
                            state = 11;
                            outputLine += '~';
                            pos++;
                        } else {
                            error('Unexpected ~ Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function pipe() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (next === 0x7c) {
                            state = 81;
                            outputLine += '||';
                            pos += 2;
                        } else if (next === 0x3d) {
                            state = 103;
                            outputLine += '|=';
                            pos += 2;
                        } else if (next !== 0x7c && next !== 0x3d) {
                            state = 12;
                            outputLine += ' | ';
                            pos++;
                            cached = next;
                        } else {
                            error('Unexpected | Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function caret() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (next === 0x3d) {
                            state = 151;
                            outputLine += '^=';
                            pos += 2;
                        } else if (next !== 0x3d) {
                            state = 150;
                            outputLine += ' ^ ';
                            pos++;
                            cached = next;
                        } else {
                            error('Unexpected ^. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function percent() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (next === 0x3d) {
                            state = 93;
                            outputLine += '%=';
                            pos += 2;
                        } else if (next !== 0x3d) {
                            state = 92;
                            outputLine += ' % ';
                            pos++;
                            cached = next;
                        } else {
                            error('Unexpected % Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function ampersand() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (next === 0x26) {
                            state = 82;
                            outputLine += '&&';
                            pos += 2;
                        } else if (next === 0x3d) {
                            state = 8;
                            outputLine += '&=';
                            pos += 2;
                        } else if (next !== 0x26 && next !== 0x3d) {
                            state = 13;
                            outputLine += ' & ';
                            pos++;
                            cached = next;
                        } else {
                            error('Unexpected & Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function equal() {
                        next = code.charCodeAt(pos + 1);
                        next2 = code.charCodeAt(pos + 2);
                        cached = -1;
                        if (next !== 0x3d) {
                            state = 30;
                            outputLine += ' = ';
                            pos++;
                            cached = next;
                        } else if (next === 0x3d && next2 !== 0x3d) {
                            state = 31;
                            outputLine += '==';
                            pos += 2;
                            cached = next2;
                        } else if (next === 0x3d && next2 === 0x3d) {
                            state = 116;
                            outputLine += '===';
                            pos += 3;
                        } else {
                            error('Unexpected = Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function greaterThan() {
                        next = code.charCodeAt(pos + 1);
                        next2 = code.charCodeAt(pos + 2);
                        next3 = code.charCodeAt(pos + 3);
                        cached = -1;
                        if (next === 0x3e && next2 === 0x3e && next3 === 0x3d) {
                            state = 153;
                            outputLine += '>>>=';
                            pos += 4;
                        } else if (next === 0x3e && next2 === 0x3e) {
                            state = 152;
                            outputLine += '>>>';
                            pos += 3;
                            cached = next3;
                        } else if (next === 0x3e && next2 === 0x3d) {
                            state = 114;
                            outputLine += '>>=';
                            pos += 3;
                            cached = next3;
                        } else if (next === 0x3e) {
                            state = 113;
                            outputLine += '>>';
                            pos += 2;
                            cached = next2;
                        } else if (next !== 0x3d) {
                            state = 64;
                            outputLine += ' > ';
                            pos++;
                            cached = next;
                        } else if (next === 0x3d) {
                            state = 65;
                            outputLine += '>=';
                            pos += 2;
                            cached = next2;
                        } else {
                            error('Unexpected > Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function lessThan() {
                        next = code.charCodeAt(pos + 1);
                        next2 = code.charCodeAt(pos + 2);
                        if (next === 0x21 && next2 === 0x2d) {
                            next3 = code.charCodeAt(pos + 3);
                            if (next3 === 0x2d) {
                                pos += 4;
                                return nonStandardComment();
                            }
                        }
                        cached = -1;
                        if (next === 0x3c && next2 === 0x3d) {
                            state = 80;
                            outputLine += '<<=';
                            pos += 3;
                        } else if (next === 0x3c) {
                            state = 79;
                            outputLine += '<<';
                            pos += 2;
                            cached = next2;
                        } else if (next !== 0x3d) {
                            state = 77;
                            outputLine += ' < ';
                            pos++;
                            cached = next;
                        } else if (next === 0x3d) {
                            state = 78;
                            outputLine += '<=';
                            pos += 2;
                            cached = next2;
                        } else {
                            error('Unexpected < Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function asterix() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (next !== 0x3d) {
                            state = 94;
                            outputLine += ' * ';
                            pos++;
                            cached = next;
                        } else if (next === 0x3d) {
                            state = 95;
                            outputLine += '*=';
                            pos += 2;
                        } else {
                            error('Unexpected * Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        left = 0;
                    }

                    function minus() {
                        next = code.charCodeAt(pos + 1);
                        cached = -1;
                        if (!left) {
                            next2 = code.charCodeAt(pos + 2);
                            if (next === 0x2d && next2 === 0x3e) {
                                pos += 3;
                                return nonStandardComment();
                            }
                        }
                        if (next === 0x2d && left) {
                            state = 108;
                            outputLine += '--';
                            pos += 2;
                            left = 1;
                        } else if (next === 0x2d && !left) {
                            state = 109;
                            outputLine += '--';
                            pos += 2;
                            left = 0;
                        } else if (next === 0x3d) {
                            state = 91;
                            outputLine += '-=';
                            pos += 2;
                            left = 0;
                        } else if (next !== 0x3d && next !== 0x2d && left) {
                            state = 90;
                            outputLine += ' - ';
                            pos++;
                            cached = next;
                            left = 0;
                        } else if (next !== 0x3d && next !== 0x2d && !left) {
                            state = 134;
                            outputLine += '-';
                            pos++;
                            cached = next;
                            left = 0;
                        } else {
                            error('Unexpected - Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                    }

                    function space() {
                        pos++;
                    }

                    function checkRules() {
                        if (state === 89) {
                            error("No state defined for char:" + String.fromCharCode(chr) + ', left: ' + left + ', last state: ' + rulesLookup[lastState] + ',output:' + output);
                        }
                        if (!rules[state]) {
                            error("State does not exist in the rules:" + rulesLookup[state]);
                        }
                        if (!rules[state][lastState] && newLineFlag) {
                            asi();
                        }
                        if (!rules[state][lastState]) {
                            error("Unexpected " + rulesLookup[state] + '. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                        }
                        if (parseTreeFlag) {
                            parseTreeOutput = parseTreeOutput + '<' + rulesLookup[state] + '>' + outputLine + '</' + rulesLookup[state] + '>';
                        }
                        lastState = state;
                        newLineFlag = 0;
                        if (lookupSquare === 1 && lookupCurly === 1 && lookupParen === 1) {
                            parentStates = {};
                        }
                    }

                    while (pos < len) {
                        state = 89;
                        if (cached >= 0) {
                            chr = cached;
                        } else {
                            chr = code.charCodeAt(pos);
                        }
                        cached = -1;
                        if (chr === 9 || chr === 11 || chr === 12 || chr === 32) {
                            space();
                            continue;
                        } else if (chr === 10 || chr === 13) {
                            newLine();
                            continue;
                        } else if (chr === 0x3b) {
                            semicolon();
                        } else if (chr > 0x60 && chr < 0x7b) {
                            identifier();
                        } else if (chr === 0x24) {
                            nonKeyword();
                        } else if (chr > 0x2f && chr < 0x3a) {
                            numberOrHex();
                        } else if (chr === 0x2f) {
                            next = code.charCodeAt(pos + 1);
                            if (!left && next !== 0x2a && next !== 0x2f && lastState !== 137) {
                                regex();
                            } else if (next === 0x2f) {
                                singleComment();
                                continue;
                            } else if (next === 0x2a) {
                                multiComment();
                                continue;
                            } else if ((lastState === 137 || left) && next !== 0x2f) {
                                divide();
                            } else {
                                error('Unexpected /. Cannot follow ' + rulesLookup[lastState] + '.Output:' + output);
                            }
                        } else if (chr === 0x2b) {
                            plus();
                        } else if (chr === 0x5b) {
                            arrayOrAccessorOpen();
                        } else if (chr === 0x5d) {
                            arrayOrAccessorClose();
                        } else if (chr === 0x28) {
                            parenOpen();
                        } else if (chr === 0x29) {
                            parenClose();
                        } else if (chr === 0x7b) {
                            curlyOpen();
                        } else if (chr === 0x7d) {
                            curlyClose();
                        } else if (chr === 0x3f) {
                            ternaryOpen();
                        } else if (chr === 0x2c) {
                            comma();
                        } else if (chr === 0x2e && left) {
                            period();
                        } else if (chr === 0x3a) {
                            colon();
                        } else if (chr === 0x27) {
                            string();
                        } else if (chr === 0x22) {
                            string();
                        } else if (chr === 0x21) {
                            exclamation();
                        } else if (chr === 0x7e) {
                            tilde();
                        } else if (chr === 0x7c) {
                            pipe();
                        } else if (chr === 0x5e) {
                            caret();
                        } else if (chr === 0x25) {
                            percent();
                        } else if (chr === 0x26) {
                            ampersand();
                        } else if (chr === 0x3d) {
                            equal();
                        } else if (chr === 0x3e) {
                            greaterThan();
                        } else if (chr === 0x3c) {
                            lessThan();
                        } else if (chr === 0x2a) {
                            asterix();
                        } else if (chr === 0x2d) {
                            minus();
                        } else if (chr === 0x5f) {
                            nonKeyword();
                        } else if (chr === 0x5c) {
                            unicodeEscape(1);
                        } else if (chr > 0x40 && chr < 0x5b) {
                            if (chr === 0x49 || chr === 0x4e || chr === 0x49) {
                                identifier();
                            } else {
                                nonKeyword();
                            }
                        } else if (!left && chr === 0x2e) {
                            numberOrHex();
                        } else if (chr > 159) {
                            if (chr === 160 || chr === 5760 || chr === 6158 || chr === 8192 || chr === 8193 || chr === 8194 || chr === 8195 || chr === 8196 || chr === 8197 || chr === 8198 || chr === 8199 || chr === 8200 || chr === 8201 || chr === 8202 || chr === 8239 || chr === 8287 || chr === 12288) {
                                space();
                                continue;
                            } else if (chr === 8232 || chr == 8233) {
                                newLine();
                                continue;
                            } else {
                                nonKeyword();
                            }
                        }
                        if (commentSkip) {
                            commentSkip = 0;
                            continue;
                        }
                        checkRules();
                        output += outputLine;
                        outputLine = '';
                    }

                    if (lastState === 70) {
                        error("Syntax error");
                    }

                    if (lookupSquare > 1) {
                        error("Syntax error unmatched [");
                    } else if (lookupCurly > 1) {
                        error("Syntax error unmatched {");
                    } else if (lookupParen > 1) {
                        error("Syntax error unmatched (");
                    } else if (caseCount > 1) {
                        error("Syntax error unmatched case");
                    }

                    if (!rules[35][lastState]) {
                        error('Unexpected EOF. ' + rulesLookup[lastState] + ' cannot follow EOF.');
                    }

                    if (completeFlag) {
                        that.complete();
                    }
                    if (parseTreeFlag) {
                        that.parseTree(parseTreeOutput);
                    }
                    if (convertedFlag) {
                        that.converted(output);
                    }
                    return output;
                };

                this.options = {
                    eval : true
                };
                if ( typeof obj === 'string') {
                    return execute(rewrite(obj));
                }
                if (obj.options) {
                    this.options = obj.options;
                }
                if (obj.converted) {
                    this.converted = obj.converted;
                }
                if (obj.result) {
                    this.result = obj.result;
                }
                if (obj.complete) {
                    this.complete = obj.complete;
                }
                if (obj.parseTree) {
                    this.parseTree = obj.parseTree;
                }
                converted = rewrite(obj.code);
                if (this.options.eval) {
                    return execute(converted);
                } else {
                    return converted;
                }
            };
        };
        return new Mental;
    };
})( typeof exports === "undefined" ? (window.mentaljs = {}) : exports);
