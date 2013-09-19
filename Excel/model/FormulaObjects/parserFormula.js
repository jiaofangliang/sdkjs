﻿/** @enum */
var cElementType = {
    number:0,
    string:1,
    bool:2,
    error:3,
    empty:4,
    cellsRange:5,
    cell:6,
    date:7,
    func:8,
    operator:9,
    name:10,
    array:11
};
/** @enum */
var cErrorType = {
    division_by_zero:0,
    not_available:1,
    wrong_name:2,
    null_value:3,
    not_numeric:4,
    bad_reference:5,
    wrong_value_type:6,
    unsupported_function:7,
    getting_data:8
};
var cExcelSignificantDigits = 15;//количество цифр в числе после запятой
var cExcelMaxExponent = 308, cExcelMinExponent = -308;
var cExcelDateTimeDigits = 8;//количество цифр после запятой в числах отвечающих за время специализация $18.17.4.2

var c_Date1904Const = 24107; //разница в днях между 01.01.1970 и 01.01.1904 годами
var c_Date1900Const = 25568; //разница в днях между 01.01.1970 и 01.01.1900 годами
var c_DateCorrectConst = c_Date1900Const;
var c_sPerDay = 86400;
var c_msPerDay = c_sPerDay * 1000;

function extend( Child, Parent ) {
    var F = function () {
    };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

Date.prototype.isLeapYear = function () {
    var y = this.getFullYear();
    return y % 4 == 0 && y % 100 != 0 || y % 400 == 0;
};

Date.prototype.getDaysInMonth = function () {
//    return arguments.callee[this.isLeapYear() ? 'L' : 'R'][this.getMonth()];
    return this.isLeapYear() ?
        this.getDaysInMonth.L[this.getMonth()] :
        this.getDaysInMonth.R[this.getMonth()]
};

// durations of months for the regular year
Date.prototype.getDaysInMonth.R = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// durations of months for the leap year
Date.prototype.getDaysInMonth.L = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

Date.prototype.getExcelDate = function () {
    return Math.floor( ( this.getTime() / 1000 - this.getTimezoneOffset() * 60 ) / c_sPerDay + ( c_DateCorrectConst + (g_bDate1904 ? 0 : 1) ) )
}

Date.prototype.getDateFromExcel = function ( val ) {
    if ( !g_bDate1904 ) {
        if ( val < 60 )
            return new Date( (val - c_DateCorrectConst) * c_msPerDay );
        else if ( val == 60 )
            return new Date( (val - c_DateCorrectConst - 1) * c_msPerDay );
        else
            return new Date( (val - c_DateCorrectConst - 1) * c_msPerDay );
    }
    else
        return new Date( (val - c_DateCorrectConst) * c_msPerDay );
}

Date.prototype.addYears = function ( counts ) {
    this.setYear( this.getFullYear() + counts );
}

Date.prototype.addMonths = function ( counts ) {
    this.setMonth( this.getMonth() + counts );
}

Date.prototype.addDays = function ( counts ) {
    this.setDate( this.getDate() + counts );
}

Math.sinh = function ( arg ) {
    return (this.pow( this.E, arg ) - this.pow( this.E, -arg )) / 2;
}

Math.cosh = function ( arg ) {
    return (this.pow( this.E, arg ) + this.pow( this.E, -arg )) / 2;
}

Math.tanh = function ( arg ) {
    return this.sinh( arg ) / this.cosh( arg );
}

Math.asinh = function ( arg ) {
    return this.log( arg + this.sqrt( arg * arg + 1 ) );
}

Math.acosh = function ( arg ) {
    return this.log( arg + this.sqrt( arg + 1 ) * this.sqrt( arg - 1 ) )
}

Math.atanh = function ( arg ) {
    return 0.5 * this.log( (1 + arg) / (1 - arg) );
}

Math.fact = function ( n ) {
    var res = 1;
    n = Math.floor( n );
    if ( n < 0 ) return Number.NaN;
    else if ( n > 170 ) return Number.Infinity;
    while ( n != 0 ) {
        res *= n--
    }
    ;
    return res;
}

Math.ln = function( x ){
    return Math.log( x ) / Math.log( Math.E );
}

Math.binomCoeff = function ( n, k ) {
    return this.fact( n ) / (this.fact( k ) * this.fact( n - k ));
}

Math.permut = function ( n, k ) {
    return this.fact( n ) / this.fact( n - k );
}
var _func = [];//для велосипеда а-ля перегрузка функций.
_func[cElementType.number] = [];
_func[cElementType.string] = [];
_func[cElementType.bool] = [];
_func[cElementType.error] = [];
_func[cElementType.cellsRange] = [];
_func[cElementType.empty] = [];
_func[cElementType.array] = [];


_func[cElementType.number][cElementType.number] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( arg0.getValue() > arg1.getValue() );
        case ">=":
            return new cBool( arg0.getValue() >= arg1.getValue() );
        case "<":
            return new cBool( arg0.getValue() < arg1.getValue() );
        case "<=":
            return new cBool( arg0.getValue() <= arg1.getValue() );
        case "=":
            return new cBool( arg0.getValue() == arg1.getValue() );
        case "<>":
            return new cBool( arg0.getValue() != arg1.getValue() );
        case "-":
            return new cNumber( arg0.getValue() - arg1.getValue() );
        case "+":
            return new cNumber( arg0.getValue() + arg1.getValue() );
        case "/":
            if ( arg1.getValue() != 0 )
                return new cNumber( arg0.getValue() / arg1.getValue() );
            else
                return new cError( cErrorType.division_by_zero );
        case "*":
            return new cNumber( arg0.getValue() * arg1.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.number][cElementType.string] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case ">=":
            return new cBool( false );
        case "<":
        case "<=":
            return new cBool( true );
        case "=":
            return new cBool( false );
        case "<>":
            return new cBool( true );
        case "-":
        case "+":
        case "/":
        case "*":
            return new cError( cErrorType.wrong_value_type );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.number][cElementType.bool] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case ">=":
            return new cBool( false );
        case "<":
        case "<=":
            return new cBool( true );
        case "=":
            return new cBool( false );
        case "<>":
            return new cBool( true );
        case "-":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            return new cNumber( arg0.getValue() - _arg.getValue() );
        case "+":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            return new cNumber( arg0.getValue() + _arg.getValue() );
        case "/":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            if ( _arg.getValue() != 0 )
                return new cNumber( arg0.getValue() / _arg.getValue() );
            else
                return new cError( cErrorType.division_by_zero );
        case "*":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            return new cNumber( arg0.getValue() * _arg.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.number][cElementType.error] = function ( arg0, arg1, what ) {
    return arg1;
};

_func[cElementType.number][cElementType.empty] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( arg0.getValue() > 0 );
        case ">=":
            return new cBool( arg0.getValue() >= 0 );
        case "<":
            return new cBool( arg0.getValue() < 0 );
        case "<=":
            return new cBool( arg0.getValue() <= 0 );
        case "=":
            return new cBool( arg0.getValue() == 0 );
        case "<>":
            return new cBool( arg0.getValue() != 0 );
        case "-":
            return new cNumber( arg0.getValue() - 0 );
        case "+":
            return new cNumber( arg0.getValue() + 0 );
        case "/":
            return new cError( cErrorType.division_by_zero );
        case "*":
            return new cNumber( 0 );
    }
    return new cError( cErrorType.wrong_value_type );
};


_func[cElementType.string][cElementType.number] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case ">=":
            return new cBool( true );
        case "<":
        case "<=":
        case "=":
            return new cBool( false );
        case "<>":
            return new cBool( true );
        case "-":
        case "+":
        case "/":
        case "*":
            return new cError( cErrorType.wrong_value_type );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.string][cElementType.string] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( arg0.getValue() > arg1.getValue() );
        case ">=":
            return new cBool( arg0.getValue() >= arg1.getValue() );
        case "<":
            return new cBool( arg0.getValue() < arg1.getValue() );
        case "<=":
            return new cBool( arg0.getValue() <= arg1.getValue() );
        case "=":
            return new cBool( arg0.getValue() === arg1.getValue() );
        case "<>":
            return new cBool( arg0.getValue() !== arg1.getValue() );
        case "-":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() - _arg1.getValue() );
        case "+":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() + _arg1.getValue() );
        case "/":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            if ( _arg1.getValue() != 0 )
                return new cNumber( _arg0.getValue() / _arg1.getValue() );
            return new cError( cErrorType.division_by_zero );
        case "*":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() * _arg1.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.string][cElementType.bool] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case ">=":
            return new cBool( false );
        case "<":
        case "<=":
            return new cBool( true );
        case "=":
            return new cBool( false );
        case "<>":
            return new cBool( false );
        case "-":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() - _arg1.getValue() );
        case "+":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() + _arg1.getValue() );
        case "/":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            if ( _arg1.getValue() != 0 )
                return new cNumber( _arg0.getValue() / _arg1.getValue() );
            return new cError( cErrorType.division_by_zero );
        case "*":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg0 instanceof cError )    return _arg0;
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() * _arg1.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.string][cElementType.error] = function ( arg0, arg1, what ) {
    return arg1;
};

_func[cElementType.string][cElementType.empty] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( arg0.getValue().length != 0 );
        case ">=":
            return new cBool( arg0.getValue().length >= 0 );
        case "<":
            return new cBool( false );
        case "<=":
            return new cBool( arg0.getValue().length <= 0 );
        case "=":
            return new cBool( arg0.getValue().length === 0 );
        case "<>":
            return new cBool( arg0.getValue().length != 0 );
        case "-":
        case "+":
        case "/":
        case "*":
            return new cError( cErrorType.wrong_value_type );
    }
    return new cError( cErrorType.wrong_value_type );
};


_func[cElementType.bool][cElementType.number] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case ">=":
            return new cBool( true );
        case "<":
        case "<=":
            return new cBool( false );
        case "=":
            return new cBool( true );
        case "<>":
            return new cBool( false );
        case "-":
            var _arg = arg0.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            return new cNumber( _arg.getValue() - arg1.getValue() );
        case "+":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            return new cNumber( _arg.getValue() + arg1.getValue() );
        case "/":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            if ( arg1.getValue() != 0 )
                return new cNumber( _arg.getValue() / arg1.getValue() );
            else
                return new cError( cErrorType.division_by_zero );
        case "*":
            var _arg = arg1.tocNumber();
            if ( _arg instanceof cError )    return _arg;
            return new cNumber( _arg.getValue() * arg1.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.bool][cElementType.string] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case ">=":
            return new cBool( true );
        case "<":
        case "<=":
            return new cBool( false );
        case "=":
            return new cBool( true );
        case "<>":
            return new cBool( true );
        case "-":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() - _arg1.getValue() );
        case "+":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() + _arg1.getValue() );
        case "/":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg1 instanceof cError )    return _arg1;
            if ( _arg1.getValue() != 0 )
                return new cNumber( _arg0.getValue() / _arg1.getValue() );
            return new cError( cErrorType.division_by_zero );
        case "*":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            if ( _arg1 instanceof cError )    return _arg1;
            return new cNumber( _arg0.getValue() * _arg1.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.bool][cElementType.bool] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return    new cBool( arg0.value > arg1.value );
        case ">=":
            return    new cBool( arg0.value >= arg1.value );
        case "<":
            return    new cBool( arg0.value < arg1.value );
        case "<=":
            return    new cBool( arg0.value <= arg1.value );
        case "=":
            return    new cBool( arg0.value === arg1.value );
        case "<>":
            return    new cBool( arg0.value !== arg1.value );
        case "-":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            return new cNumber( _arg0.getValue() - _arg1.getValue() );
        case "+":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            return new cNumber( _arg0.getValue() + _arg1.getValue() );
        case "/":
            if ( !arg1.value )
                return new cError( cErrorType.division_by_zero );
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            return new cNumber( _arg0.getValue() / _arg1.getValue() );
        case "*":
            var _arg0 = arg0.tocNumber(),
                _arg1 = arg1.tocNumber();
            return new cNumber( _arg0.getValue() * _arg1.getValue() );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.bool][cElementType.error] = function ( arg0, arg1, what ) {
    return arg1;
};

_func[cElementType.bool][cElementType.empty] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( arg0.value > false );
        case ">=":
            return new cBool( arg0.value >= false );
        case "<":
            return new cBool( arg0.value < false );
        case "<=":
            return new cBool( arg0.value <= false );
        case "=":
            return new cBool( arg0.value === false );
        case "<>":
            return new cBool( arg0.value !== false );
        case "-":
            return new cNumber( arg0.value ? 1.0 : 0.0 - 0 );
        case "+":
            return new cNumber( arg0.value ? 1.0 : 0.0 + 0 );
        case "/":
            return new cError( cErrorType.division_by_zero );
        case "*":
            return new cNumber( 0 );
    }
    return new cError( cErrorType.wrong_value_type );
};


_func[cElementType.error][cElementType.number] = _func[cElementType.error][cElementType.string] =
    _func[cElementType.error][cElementType.bool] = _func[cElementType.error][cElementType.error] =
        _func[cElementType.error][cElementType.empty] = function ( arg0, arg1, what ) {
            return arg0;
        };


_func[cElementType.empty][cElementType.number] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( 0 > arg1.getValue() );
        case ">=":
            return new cBool( 0 >= arg1.getValue() );
        case "<":
            return new cBool( 0 < arg1.getValue() );
        case "<=":
            return new cBool( 0 <= arg1.getValue() );
        case "=":
            return new cBool( 0 == arg1.getValue() );
        case "<>":
            return new cBool( 0 != arg1.getValue() );
        case "-":
            return new cNumber( 0 - arg1.getValue() );
        case "+":
            return new cNumber( 0 + arg1.getValue() );
        case "/":
            if ( arg1.getValue() == 0 )
                return new cError( cErrorType.not_numeric );
            return new cNumber( 0 );
        case "*":
            return new cNumber( 0 );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.empty][cElementType.string] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( 0 > arg1.getValue().length );
        case ">=":
            return new cBool( 0 >= arg1.getValue().length );
        case "<":
            return new cBool( 0 < arg1.getValue().length );
        case "<=":
            return new cBool( 0 <= arg1.getValue().length );
        case "=":
            return new cBool( 0 === arg1.getValue().length );
        case "<>":
            return new cBool( 0 != arg1.getValue().length );
        case "-":
        case "+":
        case "/":
        case "*":
            return new cError( cErrorType.wrong_value_type );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.empty][cElementType.bool] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
            return new cBool( false > arg1.value );
        case ">=":
            return new cBool( false >= arg1.value );
        case "<":
            return new cBool( false < arg1.value );
        case "<=":
            return new cBool( false <= arg1.value );
        case "=":
            return new cBool( arg1.value === false );
        case "<>":
            return new cBool( arg1.value !== false );
        case "-":
            return new cNumber( 0 - arg1.value ? 1.0 : 0.0 );
        case "+":
            return new cNumber( arg1.value ? 1.0 : 0.0 );
        case "/":
            if ( arg1.value )
                return new cNumber( 0 );
            return new cError( cErrorType.not_numeric );
        case "*":
            return new cNumber( 0 );
    }
    return new cError( cErrorType.wrong_value_type );
};

_func[cElementType.empty][cElementType.error] = function ( arg0, arg1, what ) {
    return arg1;
};

_func[cElementType.empty][cElementType.empty] = function ( arg0, arg1, what ) {
    switch ( what ) {
        case ">":
        case "<":
        case "<>":
            return new cBool( false );
        case ">=":
        case "<=":
        case "=":
            return new cBool( true );
        case "-":
        case "+":
            return new cNumber( 0 );
        case "/":
            return new cError( cErrorType.not_numeric );
        case "*":
            return new cNumber( 0 );
    }
    return new cError( cErrorType.wrong_value_type );
};


_func[cElementType.cellsRange][cElementType.number] = _func[cElementType.cellsRange][cElementType.string] =
    _func[cElementType.cellsRange][cElementType.bool] = _func[cElementType.cellsRange][cElementType.error] =
        _func[cElementType.cellsRange][cElementType.array] = _func[cElementType.cellsRange][cElementType.empty] = function ( arg0, arg1, what, cellAddress ) {
            var cross = arg0.cross( cellAddress );
            return _func[cross.type][arg1.type]( cross, arg1, what )
        };


_func[cElementType.number][cElementType.cellsRange] = _func[cElementType.string][cElementType.cellsRange] =
    _func[cElementType.bool][cElementType.cellsRange] = _func[cElementType.error][cElementType.cellsRange] =
        _func[cElementType.array][cElementType.cellsRange] = _func[cElementType.empty][cElementType.cellsRange] = function ( arg0, arg1, what, cellAddress ) {
            var cross = arg1.cross( cellAddress );
            return _func[arg0.type][cross.type]( arg0, cross, what )
        };


_func[cElementType.cellsRange][cElementType.cellsRange] = function ( arg0, arg1, what, cellAddress ) {
    var cross1 = arg0.cross( cellAddress ),
        cross2 = arg1.cross( cellAddress );
    return _func[cross1.type][cross2.type]( cross1, cross2, what )
};

_func[cElementType.array][cElementType.array] = function ( arg0, arg1, what, cellAddress ) {
    if ( arg0.getRowCount() != arg1.getRowCount() || arg0.getCountElementInRow() != arg1.getCountElementInRow() )return new cError( cErrorType.wrong_value_type );
    var retArr = new cArray(), _arg0, _arg1;
    for ( var iRow = 0; iRow < arg0.getRowCount(); iRow++, iRow < arg0.getRowCount() ? retArr.addRow() : true ) {
        for ( var iCol = 0; iCol < arg0.getCountElementInRow(); iCol++ ) {
            _arg0 = arg0.getElementRowCol( iRow, iCol );
            _arg1 = arg1.getElementRowCol( iRow, iCol );
            retArr.addElement( _func[_arg0.type][_arg1.type]( _arg0, _arg1, what ) );
        }
    }
    return retArr;
};

_func[cElementType.array][cElementType.number] = _func[cElementType.array][cElementType.string] =
    _func[cElementType.array][cElementType.bool] = _func[cElementType.array][cElementType.error] =
        _func[cElementType.array][cElementType.empty] = function ( arg0, arg1, what, cellAddress ) {
            var res = new cArray();
            arg0.foreach( function ( elem, r, c ) {
                if ( !res.array[r] ) res.addRow();
                res.addElement( _func[elem.type][arg1.type]( elem, arg1, what ) );
            } )
            return res;
        };


_func[cElementType.number][cElementType.array] = _func[cElementType.string][cElementType.array] =
    _func[cElementType.bool][cElementType.array] = _func[cElementType.error][cElementType.array] =
        _func[cElementType.empty][cElementType.array] = function ( arg0, arg1, what, cellAddress ) {
            var res = new cArray();
            arg1.foreach( function ( elem, r, c ) {
                if ( !res.array[r] ) res.addRow();
                res.addElement( _func[arg0.type][elem.type]( arg0, elem, what ) );
            } );
            return res;
        };


_func.binarySearch = function ( sElem, arrTagert, regExp ) {
    var first = 0, /* Номер первого элемента в массиве */
        last = arrTagert.length - 1, /* Номер элемента в массиве, СЛЕДУЮЩЕГО ЗА последним */
    /* Если просматриваемый участок непустой, first<last */
        mid, x;

    var arrTagertOneType = [], isString = false;

    for ( var i = 0; i < arrTagert.length; i++ ) {
        if ( (arrTagert[i] instanceof cString || sElem instanceof cString) && !isString ) {
            i = 0;
            isString = true;
            sElem = new cString( sElem.value.toLowerCase() );
        }
        if ( isString ) {
            arrTagertOneType[i] = new cString( arrTagert[i].getValue().toLowerCase() );
        }
        else {
            arrTagertOneType[i] = arrTagert[i].tocNumber();
        }
    }

    if ( arrTagert.length == 0 ) {
        return -1;
        /* массив пуст */
    }
    else if ( arrTagert[0].value > sElem.value ) {
        return -2;
    }
    else if ( arrTagert[arrTagert.length - 1].value < sElem.value ) {
        return arrTagert.length - 1;
    }

    while ( first < last ) {
        mid = Math.floor( first + (last - first) / 2 );
        if ( sElem.value <= arrTagert[mid].value || ( regExp && regExp.test( arrTagert[mid].value ) ) ) {
            last = mid;
        }
        else {
            first = mid + 1;
        }
    }

    /* Если условный оператор if(n==0) и т.д. в начале опущен - значит, тут раскомментировать!    */
    if ( /* last<n &&*/ arrTagert[last].value == sElem.value ) {
        return last;
        /* Искомый элемент найден. last - искомый индекс */
    }
    else {
        return last - 1;
        /* Искомый элемент не найден. Но если вам вдруг надо его вставить со сдвигом, то его место - last.    */
    }

};

//функция для определения к какому типу относится значение val.
function checkTypeCell( val ) {
    if ( val == "" )
        return new cEmpty();
    else if ( parserHelp.isNumber( val, 0 ) )
        return new cNumber( parserHelp.operand_str );
    else if ( parserHelp.isString( val, 0 ) )
        return new cString( parserHelp.operand_str );
    else if ( parserHelp.isBoolean( val, 0 ) )
        return new cBool( parserHelp.operand_str );
    else if ( parserHelp.isError( val, 0 ) )
        return new cError( parserHelp.operand_str );
    else return new cString( val );
}
/*--------------------------------------------------------------------------*/
/*Base classes for operators & functions */
/** @constructor */
function cBaseOperator( name, priority, argumentCount ) {
    this.name = name ? name : "";
    this.priority = priority ? priority : 10;
    this.type = cElementType.operator;
    this.isRightAssociative = false;
    this.argumentsCurrent = argumentCount ? argumentCount : 2;
    this.value = null;
    this.formatType = {
        def:-1, //подразумевается формат первой ячейки входящей в формулу.
        noneFormat:-2
    };
    this.numFormat = this.formatType.noneFormat;
}
cBaseOperator.prototype = {
    constructor:cBaseOperator,
    getArguments:function () {
        return this.argumentsCurrent;
    },
    toString:function () {
        return this.name;
    },
    Calculate:function () {
        return null;
    },
    Assemble:function ( arg ) {
        var str = "";
        if ( this.argumentsCurrent == 2 )
            str = arg[0] + "" + this.name + "" + arg[1];
        else str = this.name + "" + arg[0];
        return new cString( str );
    }
}

/** @constructor */
function cBaseFunction( name ) {
    this.name = name;
    this.type = cElementType.func;
    this.value = null;
    this.argumentsMin = 0;
    this.argumentsCurrent = 0;
    this.argumentsMax = 255;
    this.formatType = {
        def:-1, //подразумевается формат первой ячейки входящей в формулу.
        noneFormat:-2
    };
    this.numFormat = this.formatType.def;
}
cBaseFunction.prototype = {
    constructor:cBaseFunction,
    Calculate:function () {
        return this.value = new cError( cErrorType.wrong_name )
    },
    setArgumentsMin:function ( count ) {
        this.argumentsMin = count;
    },
    setArgumentsMax:function ( count ) {
        this.argumentsMax = count;
    },
    DecrementArguments:function () {
        --this.argumentsCurrent;
    },
    IncrementArguments:function () {
        ++this.argumentsCurrent;
    },
    setName:function ( name ) {
        this.name = name;
    },
    setArgumentsCount:function ( count ) {
        this.argumentsCurrent = count;
    },
    getArguments:function () {
        return this.argumentsCurrent;
    },
    getMaxArguments:function () {
        return this.argumentsMax;
    },
    getMinArguments:function () {
        return this.argumentsMin;
    },
    Assemble:function ( arg ) {
        var str = "";
        for ( var i = 0; i < arg.length; i++ ) {
            str += arg[i].toString();
            if ( i != arg.length - 1 )
                str += ",";
        }
        return new cString( this.name + "(" + str + ")" );
    },
    toString:function () {
        return this.name
    },
    setCA:function ( arg, ca, numFormat ) {
        this.value = arg;
        if ( ca )this.value.ca = true;
        if ( numFormat !== null && numFormat !== undefined )this.value.numFormat = numFormat;
        return this.value;
    },
    setFormat:function ( f ) {
        this.numFormat = f;
    }
}

/** @constructor */
function cBaseType( val ) {
    this.needRecalc = false;
    this.numFormat = null;
    this.type = null;
    this.value = val;
    this.ca = false;
    this.node = undefined;
}
cBaseType.prototype = {
    constructor:cBaseType,
    tryConvert:function () {
        return this;
    },
    getValue:function () {
        return this.value;
    },
    toString:function () {
        return this.value.toString();
    },
    setNode:function(node){this.node = node;}
}

/* cFormulaOperators is container for holding all ECMA-376 operators, see chapter $18.17.2.2 in "ECMA-376, Second Edition, Part 1 - Fundamentals And Markup Language Reference" */
var cFormulaOperators = {
    '(':function () {
        var r = {};
        r.name = "(";
        r.type = cElementType.operator;
        r.argumentsCurrent = 1;
        r.DecrementArguments = function () {
            --this.argumentsCurrent;
        }
        r.IncrementArguments = function () {
            ++this.argumentsCurrent;
        }
        r.toString = function () {
            return this.name;
        }
        r.getArguments = function () {
            return this.argumentsCurrent;
        }
        r.Assemble = function ( arg ) {
            return new cString( "(" + arg + ")" );
        }
        return r;
    },
    ')':function () {
        var r = {};
        r.name = ')';
        r.type = cElementType.operator;
        r.toString = function () {
            return ')';
        }
        return r;
    },
    '{':function () {
        var r = {};
        r.name = '{';
        r.toString = function () {
            return this.name;
        }
        return r;
    },
    '}':function () {
        var r = {};
        r.name = '}';
        r.toString = function () {
            return this.name;
        }
        return r;
    },
    /* 50 is highest priority */
    'un_minus':function () {
        var r = new cBaseOperator( 'un_minus'/**name operator*/, 50/**priority of operator*/, 1/**count arguments*/ );
        r.Calculate = function ( arg ) {    //calculate operator
            var arg0 = arg[0];
            if ( arg0 instanceof cArea ) {
                arg0 = arg0.cross( arguments[1].first );
            }
            else if ( arg0 instanceof cArray ) {
                arg0.foreach(
                    function ( arrElem, r, c ) {
                        arrElem = arrElem.tocNumber();
                        arg0.array[r][c] = arrElem instanceof cError ? arrElem : new cNumber( -arrElem.getValue() );
                    }
                )
                return this.value = arg0;
            }
            arg0 = arg0.tocNumber();
            return this.value = arg0 instanceof cError ? arg0 : new cNumber( -arg0.getValue() )
        },
            r.toString = function () {        // toString function
                return '-';
            }
        r.Assemble = function ( arg ) {
            return new cString( "-" + arg[0] );
        }
        r.isRightAssociative = true;
        return r;
    },
    'un_plus':function () {
        var r = new cBaseOperator( 'un_plus', 50, 1 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0];
            if ( arg0 instanceof cArea ) {
                arg0 = arg0.cross( arguments[1].first );
            }
            arg0 = arg[0].tryConvert();
            return this.value = arg0;
        }
        r.toString = function () {
            return '+';
        }
        r.isRightAssociative = true;
        r.Assemble = function ( arg ) {
            return new cString( "+" + arg[0] );
        }
        return r;
    },
    '%':function () {
        var r = new cBaseOperator( '%', 45, 1 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0];
            if ( arg0 instanceof cArea ) {
                arg0 = arg0.cross( arguments[1].first );
            }
            else if ( arg0 instanceof cArray ) {
                arg0.foreach(
                    function ( arrElem, r, c ) {
                        arrElem = arrElem.tocNumber();
                        arg0.array[r][c] = arrElem instanceof cError ? arrElem : new cNumber( arrElem.getValue() / 100 );
                    }
                )
                return this.value = arg0;
            }
            arg0 = arg0.tocNumber();
            this.value = arg0 instanceof cError ? arg0 : new cNumber( arg0.getValue() / 100 );
            this.value.numFormat = 9;
            return this.value;
        }
        r.isRightAssociative = true;
        r.Assemble = function ( arg ) {
            return new cString( arg[0] + this.name );
        }
        return r;
    },
    '^':function () {
        var r = new cBaseOperator( '^', 40 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0], arg1 = arg[1];
            if ( arg0 instanceof cArea ) {
                arg0 = arg0.cross( arguments[1].first );
            }
            arg0 = arg0.tocNumber();
            if ( arg1 instanceof cArea ) {
                arg1 = arg1.cross( arguments[1].first );
            }
            arg1 = arg1.tocNumber();
            if ( arg0 instanceof cError ) return this.value = arg0;
            if ( arg1 instanceof cError ) return this.value = arg1;

            var _v = Math.pow( arg0.getValue(), arg1.getValue() );
            if ( isNaN( _v ) )
                return this.value = new cError( cErrorType.not_numeric );
            else if ( _v === Number.POSITIVE_INFINITY )
                return this.value = new cError( cErrorType.division_by_zero );
            return this.value = new cNumber( _v );
        }
        return r;
    },
    '*':function () {
        var r = new cBaseOperator( '*', 30 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "*", arguments[1].first );
        }
        return r;
    },
    '/':function () {
        var r = new cBaseOperator( '/', 30 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "/", arguments[1].first );
        }
        return r;
    },
    '+':function () {
        var r = new cBaseOperator( '+', 20 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "+", arguments[1].first );
        }
        return r;
    },
    '-':function () {
        var r = new cBaseOperator( '-', 20 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "-", arguments[1].first );
        }
        return r;
    },
    '&':function () {//concat str
        var r = new cBaseOperator( '&', 15 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0], arg1 = arg[1];
            if ( arg0 instanceof cArea ) {
                arg0 = arg0.cross( arguments[1].first );
            }
            arg0 = arg0.tocString();
            if ( arg1 instanceof cArea ) {
                arg1 = arg1.cross( arguments[1].first );
            }
            arg1 = arg1.tocString();

            return this.value = arg0 instanceof cError ? arg0 :
                arg1 instanceof cError ? arg1 :
                    new cString( arg0.toString().concat( arg1.toString() ) )
        }
        return r;
    },
    '=':function () {// equals
        var r = new cBaseOperator( '=', 10 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "=", arguments[1].first );
        }
        return r;
    },
    '<>':function () {
        var r = new cBaseOperator( '<>', 10 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "<>", arguments[1].first );
        }
        return r;
    },
    '<':function () {
        var r = new cBaseOperator( '<', 10 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "<", arguments[1].first );
        }
        return r;
    },
    '<=':function () {
        var r = new cBaseOperator( '<=', 10 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, "<=", arguments[1].first );
        };
        return r;
    },
    '>':function () {
        var r = new cBaseOperator( '>', 10 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, ">", arguments[1].first );
        };
        return r;
    },
    '>=':function () {
        var r = new cBaseOperator( '>=', 10 );
        r.Calculate = function ( arg ) {
            var arg0 = arg[0].tryConvert(), arg1 = arg[1].tryConvert();
            return this.value = _func[arg0.type][arg1.type]( arg0, arg1, ">=", arguments[1].first );
        };
        return r;
    }
    /* 10 is lowest priopity */
};

/* cFormulaFunction is container for holding all ECMA-376 function, see chapter $18.17.7 in "ECMA-376, Second Edition, Part 1 - Fundamentals And Markup Language Reference" */
/*
 Каждая формула представляет собой копию функции cBaseFunction.
 Для реализации очередной функции необходимо указать количество (минимальное и максимальное) принимаемых аргументов. Берем в спецификации.
 Также необходино написать реализацию методов Calculate и getInfo(возвращает название функции и вид/количетво аргументов).
 В методе Calculate необходимо отслеживать тип принимаемых аргументов. Для примера, если мы обращаемся к ячейке A1, в которой лежит 123, то этот аргумент будет числом. Если же там лежит "123", то это уже строка. Для более подробной информации смотреть спецификацию.
 Метод getInfo является обязательным, ибо через этот метод в интерфейс передается информация о реализованных функциях.
 */
var cFormulaFunction = {};

function getFormulasInfo() {
    var list = [], a, b;
    for ( var type in cFormulaFunction ) {
        b = new Asc.asc_CFormulaGroup( cFormulaFunction[type]["groupName"] );
        for ( var f in cFormulaFunction[type] ) {
            if ( f != "groupName" ) {
                a = cFormulaFunction[type][f]();
                if ( a.getInfo )
                    b.asc_addFormulaElement( new Asc.asc_CFormula( a.getInfo() ) );
                delete a;
            }
        }
        list.push( b )
    }
    return list;
}
/*--------------------------------------------------------------------------*/
/*Basic types of an elements used into formulas*/
/** @constructor */
function cNumber( val ) {
    cNumber.superclass.constructor.call( this, val );
    this.type = cElementType.number;
    this.value = parseFloat( val );
    if( !isNaN( this.value ) && Math.abs(this.value)!=Infinity )
        return this;
   else
        return new cError( cErrorType.not_numeric );
}
extend( cNumber, cBaseType );
cNumber.prototype.getValue = function () {
    return this.value.toFixed( cExcelSignificantDigits ) - 0;
};
cNumber.prototype.tocString = function () {
    return new cString( "" + this.value );
};
cNumber.prototype.tocNumber = function () {
    return this;
};
cNumber.prototype.tocBool = function () {
    return new cBool( this.value != 0 );
};

/** @constructor */
function cString( val ) {
    cString.superclass.constructor.call( this, val );
    this.type = cElementType.string;
}
extend( cString, cBaseType );
cString.prototype.tocNumber = function () {
    if ( this.value == "" )
        return new cEmpty();

    var m = this.value;
    if ( this.value[0] == '"' && this.value[this.value.length - 1] == '"' )
        m = this.value.substring( 1, this.value.length - 1 );
    if ( !parseNum( m ) )
        return new cError( cErrorType.wrong_value_type );
    else {
        var _numberValue = parseFloat( m );
        if ( !isNaN( _numberValue ) )
            return new cNumber( _numberValue );
    }
};
cString.prototype.tocBool = function () {
    if ( parserHelp.isBoolean( this.value, 0 ) ) {
        if ( parserHelp.operand_str == "TRUE" )
            return new cBool( true );
        else
            return new cBool( false );
    }
    else
        return this;
};
cString.prototype.tocString = function () {
    return this;
};

/** @constructor */
function cBool( val ) {
    cBool.superclass.constructor.call( this, val );
    this.type = cElementType.bool;
    var that = this;
    switch ( val.toString().toUpperCase() ) {
        case "TRUE":
            this.value = true;
            break;
        case "FALSE":
            this.value = false;
            break;
    }
}
extend( cBool, cBaseType );
cBool.prototype.toString = function () {
    return this.value.toString().toUpperCase();
};
cBool.prototype.getValue = function () {
    return this.toString();
};
cBool.prototype.tocNumber = function () {
    return new cNumber( this.value ? 1.0 : 0.0 );
};
cBool.prototype.tocString = function () {
    return new cString( this.value ? "TRUE" : "FALSE" );
};
cBool.prototype.tocBool = function () {
    return this;
};
cBool.prototype.toBool = function () {
    return this.value;
};

/** @constructor */
function cError( val ) {
    cError.superclass.constructor.call( this, val );
    this.type = cElementType.error;
    this.errorType = -1;

    if ( isNaN( parseInt( val ) ) ) {
        switch ( val ) {
            case "#VALUE!":
                this.errorType = cErrorType.wrong_value_type;
                break;
            case "#NULL!":
                this.errorType = cErrorType.null_value;
                break;
            case "#DIV/0!":
                this.errorType = cErrorType.division_by_zero;
                break;
            case "#REF!":
                this.errorType = cErrorType.bad_reference;
                break;
            case "#NAME?":
                this.errorType = cErrorType.wrong_name;
                break;
            case "#NUM!":
                this.errorType = cErrorType.not_numeric;
                break;
            case "#N/A":
                this.errorType = cErrorType.not_available;
                break;
            case "#UNSUPPORTED_FUNCTION!":
                this.errorType = cErrorType.unsupported_function;
                break;
            case "#GETTING_DATA":
                this.errorType = cErrorType.getting_data;
                break;
        }
        return this;
    }
    switch ( val ) {
        case cErrorType.null_value:
            this.value = "#NULL!";
            this.errorType = cErrorType.null_value;
            break;
        case cErrorType.division_by_zero:
            this.value = "#DIV/0!";
            this.errorType = cErrorType.division_by_zero;
            break;
        case cErrorType.wrong_value_type:
            this.value = "#VALUE!";
            this.errorType = cErrorType.wrong_value_type;
            break;
        case cErrorType.bad_reference:
            this.value = "#REF!";
            this.errorType = cErrorType.bad_reference;
            break;
        case cErrorType.wrong_name:
            this.value = "#NAME?";
            this.errorType = cErrorType.wrong_name;
            break;
        case cErrorType.not_numeric:
            this.value = "#NUM!";
            this.errorType = cErrorType.not_numeric;
            break;
        case cErrorType.not_available:
            this.value = "#N/A";
            this.errorType = cErrorType.not_available;
            break;
        case cErrorType.unsupported_function:
            this.value = "#UNSUPPORTED_FUNCTION!";
            this.errorType = cErrorType.unsupported_function;
            break;
        case cErrorType.getting_data:
            this.value = "#GETTING_DATA";
            this.errorType = cErrorType.getting_data;
            break;
    }
}
extend( cError, cBaseType );
cError.prototype.tocNumber = cError.prototype.tocString = cError.prototype.tocBool = cError.prototype.tocEmpty = function () {
    return this;
};

/** @constructor */
function cArea( val, _ws ) {/*Area means "A1:E5" for example*/
    cArea.superclass.constructor.call( this, val );
    this.ws = _ws;
    this.wb = _ws.workbook;
    this._cells = val;
    this.isAbsolute = false;
    this.type = cElementType.cellsRange;
    // this.range = this.wb.getWorksheetById(this.ws).getRange2(val);
    // this._valid = this.range ? true : false;
}
extend( cArea, cBaseType );
cArea.prototype.getWsId = function () {
    return this.ws.Id;
};
cArea.prototype.getValue = function () {
    var _val = [], r = this.getRange();
    if ( !r ) {
        _val.push( new cError( cErrorType.bad_reference ) )
    }
    else
        r._foreachNoEmpty( function ( _cell ) {
            switch ( _cell.getType() ) {
                case CellValueType.Number:
                    _cell.getValueWithoutFormat() == "" ? _val.push( new cEmpty() ) : _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                    break;
                case CellValueType.Bool:
                    _val.push( new cBool( _cell.getValueWithoutFormat() ) );
                    break;
                case CellValueType.Error:
                    _val.push( new cError( _cell.getValueWithoutFormat() ) );
                    break;
                case CellValueType.String:
                    _val.push( new cString( _cell.getValueWithoutFormat() ) );
                    break;
                default:
                    if ( _cell.getValueWithoutFormat() && _cell.getValueWithoutFormat() != "" ) {
                        _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                    }
                    else
                        _val.push( checkTypeCell( "" + _cell.getValueWithoutFormat() ) );
            }
        } );
    return _val;
};
cArea.prototype.getValue2 = function ( cell ) {
    var _val = [], r = this.getRange();
    if ( !r ) {
        _val.push( new cError( cErrorType.bad_reference ) )
    }
    else
        r._foreachNoEmpty( function ( _cell ) {
            if ( cell.getID() == _cell.getName() )
                switch ( _cell.getType() ) {
                    case CellValueType.Number:
                        _cell.getValueWithoutFormat() == "" ? _val.push( new cEmpty() ) : _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                        break;
                    case CellValueType.Bool:
                        _val.push( new cBool( _cell.getValueWithoutFormat() ) );
                        break;
                    case CellValueType.Error:
                        _val.push( new cError( _cell.getValueWithoutFormat() ) );
                        break;
                    case CellValueType.String:
                        _val.push( new cString( _cell.getValueWithoutFormat() ) );
                        break;
                    default:
                        if ( _cell.getValueWithoutFormat() && _cell.getValueWithoutFormat() != "" ) {
                            _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                        }
                        else
                            _val.push( checkTypeCell( "" + _cell.getValueWithoutFormat() ) );
                }
        } );
    return _val[0];
};
cArea.prototype.getRange = function () {
    return this.ws.getRange2( this._cells );
};
cArea.prototype.tocNumber = function () {
    return this.getValue()[0].tocNumber();
};
cArea.prototype.tocString = function () {
    return this.getValue()[0].tocString();
};
cArea.prototype.tocBool = function () {
    return this.getValue()[0].tocBool();
};
cArea.prototype.toString = function () {
    return this._cells;
};
cArea.prototype.setRange = function ( cell ) {
    this._cells = this.value = cell;
    this.range = this.ws.getRange2( cell );
    this._valid = this.range ? true : false;
};
cArea.prototype.getWS = function () {
    return this.ws;
};
cArea.prototype.getBBox = function () {
    return this.getRange().getBBox();
};
cArea.prototype.cross = function ( arg ) {
    var r = this.getRange();
    if ( !r )
        return new cError( cErrorType.wrong_name );
    var cross = r.cross( arg );
    if ( cross ) {
        if ( cross.r != undefined ) {
            return this.getValue2( new CellAddress( cross.r, this.getBBox().c1 ) )
        }
        else if ( cross.c != undefined ) {
            return this.getValue2( new CellAddress( this.getBBox().r1, cross.c ) )
        }
        else
            return new cError( cErrorType.wrong_value_type );
    }
    else
        return new cError( cErrorType.wrong_value_type );
};
cArea.prototype.isValid = function () {
    var r = this.getRange();
    if ( !r )
        return false;
    return true;
};
cArea.prototype.countCells = function () {
    var r = this.getRange(), bbox = r.bbox,
        count = (Math.abs( bbox.c1 - bbox.c2 ) + 1) * (Math.abs( bbox.r1 - bbox.r2 ) + 1);
    r._foreachNoEmpty( function ( _cell ) {
        count--;
    } )
    return new cNumber( count );
};
cArea.prototype.foreach = function ( action ) {
    var r = this.getRange();
    if ( r ) {
        r._foreach2( action )
    }
}
cArea.prototype.foreach2 = function ( action ) {
    var r = this.getRange();
    if ( r ) {
        r._foreach2( function ( _cell ) {
            var val;
            switch ( _cell.getType() ) {
                case CellValueType.Number:
                    _cell.getValueWithoutFormat() == "" ? val = new cEmpty() : val = new cNumber( _cell.getValueWithoutFormat() )
                    break;
                case CellValueType.Bool:
                    val = new cBool( _cell.getValueWithoutFormat() );
                    break;
                case CellValueType.Error:
                    val = new cError( _cell.getValueWithoutFormat() );
                    break;
                case CellValueType.String:
                    val = new cString( _cell.getValueWithoutFormat() );
                    break;
                default:
                    if ( _cell.getValueWithoutFormat() && _cell.getValueWithoutFormat() != "" ) {
                        val = new cNumber( _cell.getValueWithoutFormat() )
                    }
                    else
                        val = checkTypeCell( "" + _cell.getValueWithoutFormat() );
            }
            action(val);
        } );
    }
}
cArea.prototype.getMatrix = function () {
    var arr = [],
        r = this.getRange();
    r._foreach2( function ( cell, i, j, r1, c1 ) {
        if ( !arr[i - r1] )
            arr[i - r1] = [];
        if ( cell ) {
            switch ( cell.getType() ) {
                case CellValueType.Number:
                    arr[i - r1][j - c1] = cell.getValueWithoutFormat() == "" ? new cEmpty() : new cNumber( cell.getValueWithoutFormat() )
                    break;
                case CellValueType.Bool:
                    arr[i - r1][j - c1] = new cBool( cell.getValueWithoutFormat() );
                    break;
                case CellValueType.Error:
                    arr[i - r1][j - c1] = new cError( cell.getValueWithoutFormat() );
                    break;
                case CellValueType.String:
                    arr[i - r1][j - c1] = new cString( cell.getValueWithoutFormat() );
                    break;
                default:
                    if ( cell.getValueWithoutFormat() && cell.getValueWithoutFormat() != "" ) {
                        arr[i - r1][j - c1] = new cNumber( cell.getValueWithoutFormat() )
                    }
                    else
                        arr[i - r1][j - c1] = checkTypeCell( "" + cell.getValueWithoutFormat() );
            }
        }
        else
            arr[i - r1][j - c1] = new cEmpty();
    } )
    return arr;
}

/** @constructor */
function cRef( val, _ws ) {/*Ref means A1 for example*/
    cRef.superclass.constructor.call( this, val );
    this._cells = val;
    this.ws = _ws;
    this.wb = _ws.workbook;
    this.isAbsolute = false;
    this.type = cElementType.cell;
    this.range = _ws.getRange2( val );
    this._valid = new CellAddress( val.replace( /\$/g, "" ) ).isValid();
}
extend( cRef, cBaseType );
cRef.prototype.getWsId = function () {
    return this.ws.Id;
};
cRef.prototype.getValue = function () {
    if ( !this._valid ) {
        return new cError( cErrorType.bad_reference )
    }
    switch ( this.range.getType() ) {
        case CellValueType.Number:
        {
            var v = this.range.getValueWithoutFormat();
            if ( v == "" )
                return new cEmpty( "" + v )
            else
                return new cNumber( "" + v );
        }
        case CellValueType.String:
            return new cString( "" + this.range.getValueWithoutFormat() );
        case CellValueType.Bool:
            return new cBool( "" + this.range.getValueWithoutFormat() )
        case CellValueType.Error:
            return new cError( "" + this.range.getValueWithoutFormat() )
        default:
            var _val = "" + this.range.getValueWithoutFormat();
            if ( _val == "" || _val == null )
                return new cEmpty();
            else if ( parserHelp.isNumber( _val ) )
                return new cNumber( parserHelp.operand_str )
            else if ( parserHelp.isBoolean( _val ) )
                return new cBool( parserHelp.operand_str )
            else if ( parserHelp.isError( _val ) )
                return new cError( parserHelp.operand_str )
            else return new cString( _val );
    }
};
cRef.prototype.tocNumber = function () {
    return this.getValue().tocNumber();
};
cRef.prototype.tocString = function () {
    return this.getValue().tocString();
    /* new cString(""+this.range.getValueWithFormat()); */
};
cRef.prototype.tocBool = function () {
    return this.getValue().tocBool();
};
cRef.prototype.tryConvert = function () {
    return this.getValue();
};
cRef.prototype.toString = function () {
    return this._cells;
};
cRef.prototype.getRange = function () {
    return this.range;
};
cRef.prototype.getWS = function () {
    return this.ws;
};
cRef.prototype.isValid = function () {
    return this._valid;
};

/** @constructor */
function cArea3D( val, _wsFrom, _wsTo, wb ) {/*Area3D means "Sheat1!A1:E5" for example*/
    cArea3D.superclass.constructor.call( this, val );
    this._wb = wb;
    this._cells = val;
    this.isAbsolute = false;
    this.type = cElementType.cellsRange;
    this.wsFrom = this._wb.getWorksheetByName( _wsFrom ).getId();
    this.wsTo = this._wb.getWorksheetByName( _wsTo ).getId();
}
extend( cArea3D, cBaseType );
cArea3D.prototype.wsRange = function () {
    var r = [];
    if ( !this.wsTo ) this.wsTo = this.wsFrom;
    var wsF = this._wb.getWorksheetById( this.wsFrom ).getIndex(), wsL = this._wb.getWorksheetById( this.wsTo ).getIndex(), r = [];
    for ( var i = wsF; i <= wsL; i++ ) {
        r.push( this._wb.getWorksheet( i ) );
    }
    return r;
};
cArea3D.prototype.range = function ( wsRange ) {
    if ( !wsRange ) return [null];
    var r = [];
    for ( var i = 0; i < wsRange.length; i++ ) {
        if ( !wsRange[i] )
            r.push( null );
        else
            r.push( wsRange[i].getRange2( this._cells ) );
    }
    return r;
};
cArea3D.prototype.getRange = function () {
    return this.range( this.wsRange() );
};
cArea3D.prototype.getValue = function () {
    var _wsA = this.wsRange();
    var _val = [];
    if ( _wsA.length < 1 ) {
        _val.push( new cError( cErrorType.bad_reference ) );
        return _val;
    }
    for ( var i = 0; i < _wsA.length; i++ ) {
        if ( !_wsA[i] ) {
            _val.push( new cError( cErrorType.bad_reference ) );
            return _val;
        }

    }
    var _r = this.range( _wsA );
    for ( var i = 0; i < _r.length; i++ ) {
        if ( !_r[i] ) {
            _val.push( new cError( cErrorType.bad_reference ) );
            return _val;
        }
        _r[i]._foreachNoEmpty( function ( _cell ) {
            switch ( _cell.getType() ) {
                case CellValueType.Number:
                    _cell.getValueWithoutFormat() == "" ? _val.push( new cEmpty() ) : _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                    break;
                case CellValueType.Bool:
                    _val.push( new cBool( _cell.getValueWithoutFormat() ) );
                    break;
                case CellValueType.Error:
                    _val.push( new cError( _cell.getValueWithoutFormat() ) );
                    break;
                case CellValueType.String:
                    _val.push( new cString( _cell.getValueWithoutFormat() ) );
                    break;
                default:
                    if ( _cell.getValueWithoutFormat() && _cell.getValueWithoutFormat() != "" ) {
                        _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                    }
                    else
                        _val.push( checkTypeCell( "" + _cell.getValueWithoutFormat() ) );
            }
        } )
    }
    return _val;
};
cArea3D.prototype.getValue2 = function ( cell ) {
    var _wsA = this.wsRange();
    var _val = [];
    if ( _wsA.length < 1 ) {
        _val.push( new cError( cErrorType.bad_reference ) );
        return _val;
    }
    for ( var i = 0; i < _wsA.length; i++ ) {
        if ( !_wsA[i] ) {
            _val.push( new cError( cErrorType.bad_reference ) );
            return _val;
        }

    }
    var _r = this.range( _wsA );
    if ( !_r[0] ) {
        _val.push( new cError( cErrorType.bad_reference ) );
        return _val;
    }
    _r[0]._foreachNoEmpty( function ( _cell ) {
        if ( cell.getID() == _cell.getName() )
            switch ( _cell.getType() ) {
                case CellValueType.Number:
                    _cell.getValueWithoutFormat() == "" ? _val.push( new cEmpty() ) : _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                    break;
                case CellValueType.Bool:
                    _val.push( new cBool( _cell.getValueWithoutFormat() ) );
                    break;
                case CellValueType.Error:
                    _val.push( new cError( _cell.getValueWithoutFormat() ) );
                    break;
                case CellValueType.String:
                    _val.push( new cString( _cell.getValueWithoutFormat() ) );
                    break;
                default:
                    if ( _cell.getValueWithoutFormat() && _cell.getValueWithoutFormat() != "" ) {
                        _val.push( new cNumber( _cell.getValueWithoutFormat() ) )
                    }
                    else
                        _val.push( checkTypeCell( "" + _cell.getValueWithoutFormat() ) );
            }
    } )
    return _val[0];
};
cArea3D.prototype.changeSheet = function ( lastName, newName ) {
    if ( this.wsFrom == this._wb.getWorksheetByName( lastName ).getId() && this.wsTo == this._wb.getWorksheetByName( lastName ).getId() ) {
        this.wsFrom = this.wsTo = this._wb.getWorksheetByName( newName ).getId();
    }
    else if ( this.wsFrom == this._wb.getWorksheetByName( lastName ).getId() ) {
        this.wsFrom = this._wb.getWorksheetByName( newName ).getId();
    }
    else if ( this.wsTo == this._wb.getWorksheetByName( lastName ).getId() ) {
        this.wsTo = this._wb.getWorksheetByName( newName ).getId();
    }
};
cArea3D.prototype.moveSheet = function ( tempW ) {
    if ( this.wsFrom == this.wsTo ) {
        return;
    }
    else if ( this.wsFrom == tempW.wFId ) {
        var newWsFromIndex = this._wb.getWorksheetById( this.wsFrom ).getIndex(),
            wsToIndex = this._wb.getWorksheetById( this.wsTo ).getIndex();
        if ( newWsFromIndex > wsToIndex ) {
            this.wsFrom = this._wb.getWorksheet( tempW.wFI ).getId();
        }
    }
    else if ( this.wsTo == tempW.wFId ) {
        var newWsToIndex = this._wb.getWorksheetById( this.wsTo ).getIndex(),
            wsFromIndex = this._wb.getWorksheetById( this.wsFrom ).getIndex();
        if ( newWsToIndex < wsFromIndex ) {
            this.wsTo = this._wb.getWorksheet( tempW.wFI ).getId();
        }
    }
};
cArea3D.prototype.toString = function () {
    var wsFrom = this._wb.getWorksheetById( this.wsFrom ).getName();
    var wsTo = this._wb.getWorksheetById( this.wsTo ).getName();
    if ( !rx_test_ws_name.test( wsFrom ) || !rx_test_ws_name.test( wsTo ) ) {
        wsFrom = wsFrom.replace( /'/g, "''" );
        wsTo = wsTo.replace( /'/g, "''" )
        return "'" + (wsFrom != wsTo ?
            wsFrom + ":" + wsTo :
            wsFrom)
            + "'!" + this._cells;
    }
    return (wsFrom != wsTo ?
        wsFrom + ":" + wsTo :
        wsFrom)
        + "!" + this._cells;
};
cArea3D.prototype.tocNumber = function () {
    return this.getValue()[0].tocNumber();
};
cArea3D.prototype.tocString = function () {
    return this.getValue()[0].tocString();
};
cArea3D.prototype.tocBool = function () {
    return this.getValue()[0].tocBool();
};
cArea3D.prototype.getWS = function () {
    return this.wsRange()[0];
};
cArea3D.prototype.cross = function ( arg ) {
    if ( this.wsFrom != this.wsTo )
        return new cError( cErrorType.wrong_value_type );
    var r = this.getRange();
    if ( !r )
        return new cError( cErrorType.wrong_name );
    var cross = r[0].cross( arg );
    if ( cross ) {
        if ( cross.r != undefined ) {
            return this.getValue2( new CellAddress( cross.r, this.getBBox().c1 ) )
        }
        else if ( cross.c != undefined ) {
            return this.getValue2( new CellAddress( this.getBBox().r1, cross.c ) )
        }
        else
            return new cError( cErrorType.wrong_value_type );
    }
    else
        return new cError( cErrorType.wrong_value_type );
};
cArea3D.prototype.getBBox = function () {
    return this.getRange()[0].getBBox();
};
cArea3D.prototype.isValid = function () {
    var r = this.getRange();
    for ( var i = 0; i < r.length; i++ ) {
        if ( !r[i] )
            return false;
    }
    return true;
};
cArea3D.prototype.countCells = function () {
    var _wsA = this.wsRange();
    var _val = [];
    if ( _wsA.length < 1 ) {
        _val.push( new cError( cErrorType.bad_reference ) );
        return _val;
    }
    for ( var i = 0; i < _wsA.length; i++ ) {
        if ( !_wsA[i] ) {
            _val.push( new cError( cErrorType.bad_reference ) );
            return _val;
        }

    }
    var _r = this.range( _wsA ),
        bbox = _r[0].bbox,
        count = (Math.abs( bbox.c1 - bbox.c2 ) + 1) * (Math.abs( bbox.r1 - bbox.r2 ) + 1);
    count = _r.length * count;
    for ( var i = 0; i < _r.length; i++ ) {
        _r[i]._foreachNoEmpty( function ( _cell ) {

            if ( _cell.getType() == CellValueType.Number && _cell.getValueWithoutFormat() == "" )
                return null;

            count--;
        } )
    }
    return new cNumber( count );
};
cArea3D.prototype.getMatrix = function () {
    var arr = [],
        r = this.getRange();
    for ( var k = 0; k < r.length; k++ ) {
        arr[k] = [];
        r[k]._foreach2( function ( cell, i, j, r1, c1 ) {
            if ( !arr[k][i - r1] )
                arr[k][i - r1] = [];
            if ( cell ) {
                switch ( cell.getType() ) {
                    case CellValueType.Number:
                        arr[k][i - r1][j - c1] = cell.getValueWithoutFormat() == "" ? new cEmpty() : new cNumber( cell.getValueWithoutFormat() )
                        break;
                    case CellValueType.Bool:
                        arr[k][i - r1][j - c1] = new cBool( cell.getValueWithoutFormat() );
                        break;
                    case CellValueType.Error:
                        arr[k][i - r1][j - c1] = new cError( cell.getValueWithoutFormat() );
                        break;
                    case CellValueType.String:
                        arr[k][i - r1][j - c1] = new cString( cell.getValueWithoutFormat() );
                        break;
                    default:
                        if ( cell.getValueWithoutFormat() && cell.getValueWithoutFormat() != "" ) {
                            arr[k][i - r1][j - c1] = new cNumber( cell.getValueWithoutFormat() )
                        }
                        else
                            arr[k][i - r1][j - c1] = checkTypeCell( "" + cell.getValueWithoutFormat() );
                }
            }
            else
                arr[k][i - r1][j - c1] = new cEmpty();
        } )
    }
    return arr;
}
cArea3D.prototype.foreach2 = function ( action ) {
    var _wsA = this.wsRange();
    if ( _wsA.length >= 1 ) {
        var _r = this.range( _wsA );
        for ( var i = 0; i < _r.length; i++ ) {
            if ( _r[i] )
                _r[i]._foreach2( function ( _cell ) {
                    var val;
                    switch ( _cell.getType() ) {
                        case CellValueType.Number:
                            _cell.getValueWithoutFormat() == "" ? val = new cEmpty() : val = new cNumber( _cell.getValueWithoutFormat() )
                            break;
                        case CellValueType.Bool:
                            val = new cBool( _cell.getValueWithoutFormat() );
                            break;
                        case CellValueType.Error:
                            val = new cError( _cell.getValueWithoutFormat() );
                            break;
                        case CellValueType.String:
                            val = new cString( _cell.getValueWithoutFormat() );
                            break;
                        default:
                            if ( _cell.getValueWithoutFormat() && _cell.getValueWithoutFormat() != "" ) {
                                val = new cNumber( _cell.getValueWithoutFormat() )
                            }
                            else
                                val = checkTypeCell( "" + _cell.getValueWithoutFormat() );
                    }
                    action(val);
                } );
        }
    }
}

/** @constructor */
function cRef3D( val, _wsFrom, wb ) {/*Ref means Sheat1!A1 for example*/
    cRef3D.superclass.constructor.call( this, val );
    this._wb = wb;
    this._cells = val;
    this.isAbsolute = false;
    this.type = cElementType.cell;
    this.ws = this._wb.getWorksheetByName( _wsFrom );
}
extend( cRef3D, cBaseType );
cRef3D.prototype.getWsId = function () {
    return this.ws.Id;
};
cRef3D.prototype.getRange = function () {
    if ( this.ws )
        return this.ws.getRange2( this._cells );
    else
        return null;
};
cRef3D.prototype.isValid = function () {
    if ( this.getRange() )
        return true;
    else return false;
};
cRef3D.prototype.getValue = function () {
    var _r = this.getRange();
    if ( !_r ) {
        return new cError( cErrorType.bad_reference );
    }
    switch ( _r.getType() ) {
        case CellValueType.Number:
        {
            var v = _r.getValueWithoutFormat();
            if ( v == "" )
                return new cEmpty( "" + v );
            else
                return new cNumber( "" + v );
        }
        case CellValueType.String:
            return new cString( "" + _r.getValueWithoutFormat() );
        case CellValueType.Bool:
            return new cBool( "" + _r.getValueWithoutFormat() )
        case CellValueType.Error:
            return new cError( "" + _r.getValueWithoutFormat() )
        default:
            var _val = "" + _r.getValueWithoutFormat();
            if ( _val == "" || _val == null )
                return new cEmpty();
            else if ( parserHelp.isNumber( _val ) )
                return new cNumber( parserHelp.operand_str )
            else if ( parserHelp.isBoolean( _val ) )
                return new cBool( parserHelp.operand_str )
            else if ( parserHelp.isError( _val ) )
                return new cError( parserHelp.operand_str )
            else return new cString( _val );
    }
};
cRef3D.prototype.tocBool = function () {
    return this.getValue().tocBool();
};
cRef3D.prototype.tocNumber = function () {
    return this.getValue().tocNumber();
};
cRef3D.prototype.tocString = function () {
    return this.getValue().tocString();
};
cRef3D.prototype.tryConvert = function () {
    return this.getValue();
};
cRef3D.prototype.changeSheet = function ( lastName, newName ) {
    if ( this.ws.getName() == lastName ) {
        this.ws = this._wb.getWorksheetByName( newName );
    }
};
cRef3D.prototype.toString = function () {
    var wsName = this.ws.getName();
    if ( !rx_test_ws_name.test( wsName ) ) {
        return "'" + wsName.replace( /'/g, "''" ) + "'" + "!" + this._cells;
    }
    else {
        return wsName + "!" + this._cells;
    }
};
cRef3D.prototype.getWS = function () {
    return this.ws;
};

/** @constructor */
function cEmpty() {
    cEmpty.superclass.constructor.call( this, "" );
    this.type = cElementType.empty;
}
extend( cEmpty, cBaseType );
cEmpty.prototype.tocNumber = function () {
    return new cNumber( 0 );
};
cEmpty.prototype.tocBool = function () {
    return new cBool( false );
};
cEmpty.prototype.tocString = function () {
    return new cString( "" );
};
cEmpty.prototype.toString = function () {
    return "";
};

/** @constructor */
function cName( val, wb ) {
    cName.superclass.constructor.call( this, val );
    this.wb = wb;
    this.type = cElementType.name;
}
extend( cName, cBaseType );
cName.prototype.toRef = function ( wsID ) {
    var _3DRefTmp,
        ref = this.wb.getDefinesNames( this.value, wsID ).Ref;
    if ( (_3DRefTmp = parserHelp.is3DRef( ref, 0 ))[0] ) {
        var _wsFrom, _wsTo;
        _wsFrom = _3DRefTmp[1];
        _wsTo = ( (_3DRefTmp[2] !== null) && (_3DRefTmp[2] !== undefined) ) ? _3DRefTmp[2] : _wsFrom;
        if ( parserHelp.isArea( ref, ref.indexOf( "!" ) + 1 ) ) {
            if( _wsFrom == _wsTo )
                return new cArea( parserHelp.operand_str, this.wb.getWorksheetByName(_wsFrom) );
            else
                return new cArea3D( parserHelp.operand_str, _wsFrom, _wsTo, this.wb );
        }
        else if ( parserHelp.isRef( ref, ref.indexOf( "!" ) + 1 ) ) {
            return new cRef3D( parserHelp.operand_str, _wsFrom, this.wb );
        }
    }
    return new cError( "#REF!" );
};

/** @constructor */
function cArray() {
    cArray.superclass.constructor.call( this );
    this.array = [];
    this.rowCount = 0;
    this.countElementInRow = [];
    this.countElement = 0;
    this.type = cElementType.array;
}
extend( cArray, cBaseType );
cArray.prototype.addRow = function () {
    this.array[this.array.length] = [];
    this.countElementInRow[this.rowCount++] = 0;
};
cArray.prototype.addElement = function ( element ) {
    if ( this.array.length == 0 ) {
        this.addRow();
    }
    var arr = this.array,
        subArr = arr[this.rowCount - 1];
    subArr[subArr.length] = element;
    this.countElementInRow[this.rowCount - 1]++;
    this.countElement++;
};
cArray.prototype.getRow = function ( rowIndex ) {
    if ( rowIndex < 0 || rowIndex > this.array.length - 1 )
        return null;
    return this.array[rowIndex];
};
cArray.prototype.getCol = function ( colIndex ) {
    var col = [];
    for ( var i = 0; i < this.rowCount; i++ ) {
        col.push( this.array[i][colIndex] )
    }
    return col;
};
cArray.prototype.getElementRowCol = function ( row, col ) {
    if ( row > this.rowCount || col > this.getCountElementInRow() )
        return new cError( cErrorType.not_available );
    return this.array[row][col];
};
cArray.prototype.getElement = function ( index ) {
    for ( var i = 0; i < this.rowCount; i++ ) {
        if ( index > this.countElementInRow[i].length )
            index -= this.countElementInRow[i].length;
        else
            return this.array[i][index];
    }
    return null;
};
cArray.prototype.foreach = function ( action ) {
    if ( typeof (action) != 'function' ) {
        return true;
    }
    for ( var ir = 0; ir < this.rowCount; ir++ ) {
        for ( var ic = 0; ic < this.countElementInRow[ir]; ic++ ) {
            if ( action.call( this, this.array[ir][ic], ir, ic ) )
                return true;
        }
    }
    return undefined;
};
cArray.prototype.getCountElement = function () {
    return this.countElement;
};
cArray.prototype.getCountElementInRow = function () {
    return this.countElementInRow[0];
};
cArray.prototype.getRowCount = function () {
    return this.rowCount;
};
cArray.prototype.tocNumber = function () {
    var retArr = new cArray();
    for ( var ir = 0; ir < this.rowCount; ir++, retArr.addRow() ) {
        for ( var ic = 0; ic < this.countElementInRow[ir]; ic++ ) {
            retArr.addElement( this.array[ir][ic].tocNumber() );
        }
        if ( ir == this.rowCount - 1 )
            break;
    }
    return retArr;
};
cArray.prototype.tocString = function () {
    var retArr = new cArray();
    for ( var ir = 0; ir < this.rowCount; ir++, retArr.addRow() ) {
        for ( var ic = 0; ic < this.countElementInRow[ir]; ic++ ) {
            retArr.addElement( this.array[ir][ic].tocString() );
        }
        if ( ir == this.rowCount - 1 )
            break;
    }
    return retArr;
};
cArray.prototype.tocBool = function () {
    var retArr = new cArray();
    for ( var ir = 0; ir < this.rowCount; ir++, retArr.addRow() ) {
        for ( var ic = 0; ic < this.countElementInRow[ir]; ic++ ) {
            retArr.addElement( this.array[ir][ic].tocBool() );
        }
        if ( ir == this.rowCount - 1 )
            break;
    }
    return retArr;
};
cArray.prototype.toString = function () {
    var ret = "";
    for ( var ir = 0; ir < this.rowCount; ir++, ret += ";" ) {
        for ( var ic = 0; ic < this.countElementInRow[ir]; ic++, ret += "," ) {
            if ( this.array[ir][ic] instanceof cString ) {
                ret += '"' + this.array[ir][ic].toString() + '"';
            }
            else
                ret += this.array[ir][ic].toString() + "";
        }
        if ( ret[ret.length - 1] == "," )
            ret = ret.substring( 0, ret.length - 1 )
    }
    if ( ret[ret.length - 1] == ";" )
        ret = ret.substring( 0, ret.length - 1 );
    return "{" + ret + "}";
};
cArray.prototype.isValidArray = function () {
    if( this.countElement < 1 )
    return false;
    for ( var i = 0; i < this.rowCount - 1; i++ ) {
        if ( this.countElementInRow[i] - this.countElementInRow[i + 1] == 0 )
            continue;
        else
            return false;
    }
    return true;
};
cArray.prototype.getMatrix = function () {
    return this.array;
}
cArray.prototype.fillFromArray = function ( arr ) {
    this.array = arr;
    this.rowCount = arr.length;
    for ( var i = 0; i < arr.length; i++ ) {
        this.countElementInRow[i] = arr[i].length;
        this.countElement += arr[i].length;
    }
}
/** класс отвечающий за парсинг строки с формулой, подсчета формулы, перестройки формулы при манипуляции с ячейкой*/
/** @constructor */
function parserFormula( formula, _cellId, _ws ) {
    var that = this;
    this.is3D = false;
    this.cellId = _cellId;
    this.cellAddress = new CellAddress( this.cellId );
    this.ws = _ws;
    this.wb = this.ws.workbook
    this.value = null;
    this.pCurrPos = 0;
    this.elemArr = [];
    this.outStack = [];
    this.operand_str = null;
    this.error = [];
    this.Formula = formula;
    this.undoParser = {formula:null,outStack:[]};
}
parserFormula.prototype = {

    /** @type parserFormula */
    constructor:parserFormula,

    setFormula:function ( formula ) {
        this.Formula = formula;
        this.value = null;
        this.pCurrPos = 0;
        this.elemArr = [];
        this.outStack = [];
        this.operand_str = null;

    },

    setCellId:function ( cellId ) {
        this.cellId = cellId;
        this.cellAddress = new CellAddress( cellId );
    },

    parse:function () {

        if ( this.isParsed )
            return this.isParsed;
        /*
         Парсер формулы реализует алгоритм перевода инфиксной формы записи выражения в постфиксную или Обратную Польскую Нотацию. Что упрощает вычисление результата формулы.
         При разборе формулы важен порядок проверки очередной части выражения на принадлежность тому или иному типу.
         */
        var operand_expected = true;
        while ( this.pCurrPos < this.Formula.length ) {
            /* Operators*/
            if ( parserHelp.isOperator.call( this, this.Formula, this.pCurrPos )/*  || isNextPtg(this.formula,this.pCurrPos) */ ) {
                var found_operator = null;

                if ( operand_expected ) {
                    if ( this.operand_str == "-" ) {
                        operand_expected = true;
                        found_operator = cFormulaOperators['un_minus']();
                    }
                    else if ( this.operand_str == "+" ) {
                        operand_expected = true;
                        found_operator = cFormulaOperators['un_plus']();
                    }
                    else {
                        this.error.push( c_oAscError.ID.FrmlWrongOperator );
                        this.outStack = [];
                        this.elemArr = [];
                        return false;
                    }
                }
                else if ( !operand_expected ) {
                    if ( this.operand_str == "-" ) {
                        operand_expected = true;
                        found_operator = cFormulaOperators['-']();
                    }
                    else if ( this.operand_str == "+" ) {
                        operand_expected = true;
                        found_operator = cFormulaOperators['+']();
                    }
                    else if ( this.operand_str == "%" ) {
                        operand_expected = false;
                        found_operator = cFormulaOperators['%']();
                    }
                    else {
                        if ( this.operand_str in cFormulaOperators ) {
                            found_operator = cFormulaOperators[this.operand_str]();
                            operand_expected = true;
                        }
                        else {
                            this.error.push( c_oAscError.ID.FrmlWrongOperator );
                            this.outStack = [];
                            this.elemArr = [];
                            return false;
                        }
                    }
                }
                else {
                    this.error.push( c_oAscError.ID.FrmlWrongOperator );
                    this.outStack = [];
                    this.elemArr = [];
                    return false;
                }

                while ( this.elemArr.length != 0 && (
                    found_operator.isRightAssociative ?
                        ( found_operator.priority < this.elemArr[this.elemArr.length - 1].priority ) :
                        ( found_operator.priority <= this.elemArr[this.elemArr.length - 1].priority )
                    )
                    ) {
                    this.outStack.push( this.elemArr.pop() );
                }
                this.elemArr.push( found_operator );
            }

            /* Left & Right Parentheses */
            else if ( parserHelp.isLeftParentheses.call( this, this.Formula, this.pCurrPos ) ) {
                operand_expected = true;
                this.elemArr.push( cFormulaOperators[this.operand_str]() );
            }

            else if ( parserHelp.isRightParentheses.call( this, this.Formula, this.pCurrPos ) ) {
                var wasLeftParentheses = false;
                var top_elem = null;
                if ( this.elemArr.length != 0 && ( (top_elem = this.elemArr[this.elemArr.length - 1]).name == "(" ) && operand_expected ) {
                    if ( top_elem.getArguments() > 1 ) {
                        this.outStack.push( new cEmpty() );
                    }
                    else {
                        top_elem.DecrementArguments();
                    }
                }
                else {
                    while ( this.elemArr.length != 0 && !((top_elem = this.elemArr[this.elemArr.length - 1]).name == "(" ) ) {
                        if ( top_elem.name in cFormulaOperators && operand_expected ) {
                            this.error.push( c_oAscError.ID.FrmlOperandExpected );
                            this.outStack = [];
                            this.elemArr = [];
                            return false;
                        }
                        this.outStack.push( this.elemArr.pop() );
                    }
                }
                if ( this.elemArr.length == 0 || top_elem == null/* && !wasLeftParentheses */ ) {
                    this.outStack = [];
                    this.elemArr = [];
                    this.error.push( c_oAscError.ID.FrmlWrongCountParentheses );
                    return false;
                }

                var p = top_elem, func;
                this.elemArr.pop();
                if ( this.elemArr.length != 0 && ( func = this.elemArr[this.elemArr.length - 1] ).type == cElementType.func ) {
                    p = this.elemArr.pop();
                    if ( top_elem.getArguments() > func.getMaxArguments() ) {
                        this.outStack = [];
                        this.elemArr = [];
                        this.error.push( c_oAscError.ID.FrmlWrongMaxArgument );
                        return false;
                    }
                    else {
                        if ( top_elem.getArguments() >= func.getMinArguments() ) {
                            func.setArgumentsCount( top_elem.getArguments() );
                        }
                        else {
                            this.outStack = [];
                            this.elemArr = [];
                            this.error.push( c_oAscError.ID.FrmlWrongCountArgument );
                            return false;
                        }
                    }
                }
                else {
                    // for (int i = 0; i < left_p.ParametersNum - 1; ++i)
                    // {
                    // ptgs_list.AddFirst(new PtgUnion()); // чета нужно добавить для Union.....
                    // }
                }
                this.outStack.push( p );
                operand_expected = false;
            }

            /*Comma & arguments union*/
            else if ( parserHelp.isComma.call( this, this.Formula, this.pCurrPos ) ) {
                /* if( operand_expected ){
                 this.error.push(c_oAscError.ID.FrmlAnotherParsingError);
                 this.outStack = [];
                 this.elemArr = [];
                 return false;
                 } */
                var wasLeftParentheses = false;
                var stackLength = this.elemArr.length;
                var top_elem = null;
                if ( this.elemArr.length != 0 && this.elemArr[stackLength - 1].name == "(" && operand_expected ) {
                    this.outStack.push( new cEmpty() );
                    top_elem = this.elemArr[stackLength - 1];
                    wasLeftParentheses = true;
                }
                else {
                    while ( stackLength != 0 ) {
                        top_elem = this.elemArr[stackLength - 1];
                        if ( top_elem.name == "(" ) {
                            wasLeftParentheses = true;
                            break;
                        }
                        else {
                            this.outStack.push( this.elemArr.pop() );
                            stackLength = this.elemArr.length;
                        }
                    }
                }
                if ( !wasLeftParentheses ) {
                    this.error.push( c_oAscError.ID.FrmlWrongCountParentheses );
                    this.outStack = [];
                    this.elemArr = [];
                    return false;
                }
                top_elem.IncrementArguments();
                operand_expected = true;
            }

            /* Array */
            else if ( parserHelp.isArray.call( this, this.Formula, this.pCurrPos ) ) {
                var pH = new parserHelper(), tO = {pCurrPos:0, Formula:this.operand_str};
                var pos = 0, arr = new cArray();
                while ( tO.pCurrPos < tO.Formula.length ) {

                    if ( pH.isComma.call( tO, tO.Formula, tO.pCurrPos ) ) {
                        if ( tO.operand_str == ";" ) {
                            arr.addRow();
                        }
                    }
                    else if ( pH.isBoolean.call( tO, tO.Formula, tO.pCurrPos ) ) {
                        arr.addElement( new cBool( tO.operand_str ) );
                    }
                    else if ( pH.isString.call( tO, tO.Formula, tO.pCurrPos ) ) {
                        arr.addElement( new cString( tO.operand_str ) );
                    }
                    else if ( pH.isError.call( tO, tO.Formula, tO.pCurrPos ) ) {
                        arr.addElement( new cError( tO.operand_str ) );
                    }
                    else if ( pH.isNumber.call( tO, tO.Formula, tO.pCurrPos ) ) {
                        arr.addElement( new cNumber( parseFloat( tO.operand_str ) ) );
                    }
                }
                if ( !arr.isValidArray() ) {
                    this.outStack = [];
                    this.elemArr = [];
                    this.error.push( c_oAscError.ID.FrmlAnotherParsingError );
                    return false;
                }
                this.outStack.push( arr );
                operand_expected = false;
            }
            /* Operands*/
            else {
                var found_operand = null, _3DRefTmp = null;

                if ( !operand_expected ) {
                    this.error.push( c_oAscError.ID.FrmlWrongOperator );
                    this.outStack = [];
                    this.elemArr = [];
                    return false;
                }

                /* Booleans */
                if ( parserHelp.isBoolean.call( this, this.Formula, this.pCurrPos ) ) {
                    found_operand = new cBool( this.operand_str );
                }

                /* Strings */
                else if ( parserHelp.isString.call( this, this.Formula, this.pCurrPos ) ) {
                    found_operand = new cString( this.operand_str );
                }

                /* Errors */
                else if ( parserHelp.isError.call( this, this.Formula, this.pCurrPos ) ) {
                    found_operand = new cError( this.operand_str );
                }

                /* Referens to 3D area: Sheet1:Sheet3!A1:B3, Sheet1:Sheet3!B3, Sheet1!B3*/
                else if ( (_3DRefTmp = parserHelp.is3DRef.call( this, this.Formula, this.pCurrPos ))[0] ) {
                    this.is3D = true;
                    var _wsFrom = _3DRefTmp[1],
                        _wsTo = ( (_3DRefTmp[2] !== null) && (_3DRefTmp[2] !== undefined) ) ? _3DRefTmp[2] : _wsFrom;
                    if ( !(this.wb.getWorksheetByName( _wsFrom ) && this.wb.getWorksheetByName( _wsTo )) ) {
                        this.error.push( c_oAscError.ID.FrmlAnotherParsingError );
                        this.outStack = [];
                        this.elemArr = [];
                        return false;
                    }
                    if ( parserHelp.isArea.call( this, this.Formula, this.pCurrPos ) ) {
                        found_operand = new cArea3D( this.operand_str.toUpperCase(), _wsFrom, _wsTo, this.wb );
                        if ( this.operand_str.indexOf( "$" ) > -1 )
                            found_operand.isAbsolute = true;
                    }
                    else if ( parserHelp.isRef.call( this, this.Formula, this.pCurrPos ) ) {
                        if ( _wsTo != _wsFrom ) {
                            found_operand = new cArea3D( this.operand_str.toUpperCase(), _wsFrom, _wsTo, this.wb );
                        }
                        else {
                            found_operand = new cRef3D( this.operand_str.toUpperCase(), _wsFrom, this.wb );
                        }
                        if ( this.operand_str.indexOf( "$" ) > -1 )
                            found_operand.isAbsolute = true;
                    }
                }
                /* Referens to DefinesNames */
                else if ( parserHelp.isName.call( this, this.Formula, this.pCurrPos, this.wb )[0] ) { // Shall be placed strongly before Area and Ref
                    found_operand = new cName( this.operand_str, this.wb );
                }
                /* Referens to cells area A1:A10 */
                else if ( parserHelp.isArea.call( this, this.Formula, this.pCurrPos ) ) {
                    found_operand = new cArea( this.operand_str.toUpperCase(), this.ws );
                    if ( this.operand_str.indexOf( "$" ) > -1 )
                        found_operand.isAbsolute = true;
                }
                /* Referens to cell A4 */
                else if ( parserHelp.isRef.call( this, this.Formula, this.pCurrPos, true ) ) {
                    found_operand = new cRef( this.operand_str.toUpperCase(), this.ws );
                    if ( this.operand_str.indexOf( "$" ) > -1 )
                        found_operand.isAbsolute = true;
                }

                /* Numbers*/
                else if ( parserHelp.isNumber.call( this, this.Formula, this.pCurrPos ) ) {
                    if ( this.operand_str != "." ) {
                        found_operand = new cNumber( parseFloat( this.operand_str ) );
                    }
                    else {
                        this.error.push( c_oAscError.ID.FrmlAnotherParsingError );
                        this.outStack = [];
                        this.elemArr = [];
                        return false;
                    }
                }

                /* Function*/
                else if ( parserHelp.isFunc.call( this, this.Formula, this.pCurrPos ) ) {

                    var found_operator = null;
                    if ( this.operand_str.toUpperCase() in cFormulaFunction.Mathematic )//mathematic
                        found_operator = cFormulaFunction.Mathematic[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Logical )//logical
                        found_operator = cFormulaFunction.Logical[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Information )//information
                        found_operator = cFormulaFunction.Information[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Statistical )//statistical
                        found_operator = cFormulaFunction.Statistical[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.TextAndData )//text and data
                        found_operator = cFormulaFunction.TextAndData[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Cube )//cube
                        found_operator = cFormulaFunction.Cube[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Database )//Database
                        found_operator = cFormulaFunction.Database[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.DateAndTime )//Date and time
                        found_operator = cFormulaFunction.DateAndTime[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Engineering )//Engineering
                        found_operator = cFormulaFunction.Engineering[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.Financial )//Financial
                        found_operator = cFormulaFunction.Financial[this.operand_str.toUpperCase()]();

                    else if ( this.operand_str.toUpperCase() in cFormulaFunction.LookupAndReference )//Lookup and reference
                        found_operator = cFormulaFunction.LookupAndReference[this.operand_str.toUpperCase()]();

                    if ( found_operator != null && found_operator != undefined )
                        this.elemArr.push( found_operator );
                    else {
                        this.error.push( c_oAscError.ID.FrmlWrongFunctionName );
                        this.outStack = [];
                        this.elemArr = [];
                        return false;
                    }
                    operand_expected = false;
                    continue;
                }

                if ( found_operand != null && found_operand != undefined ) {
                    this.outStack.push( found_operand );
                    operand_expected = false;
                }
                else {
                    this.error.push( c_oAscError.ID.FrmlAnotherParsingError );
                    this.outStack = [];
                    this.elemArr = [];
                    return false;
                }
            }

        }
        if ( operand_expected ) {
            this.outStack = [];
            this.elemArr = [];
            this.error.push( c_oAscError.ID.FrmlOperandExpected );
            return false;
        }
        var parentCount = 0, operand;
        while ( this.elemArr.length != 0 ) {
            operand = this.elemArr.pop()
            if ( operand.name == "(" || operand.name == ")" ) {
                this.outStack = [];
                this.elemArr = [];
                this.error.push( c_oAscError.ID.FrmlWrongCountParentheses );
                return false;
            }
            else
                this.outStack.push( operand );
        }
        if ( this.outStack.length != 0 )
            return this.isParsed = true;
        else
            return this.isParsed = false;
    },

    calculate:function () {
        if ( this.outStack.length < 1 ) {
            return this.value = new cError( cErrorType.wrong_name );
        }
        var elemArr = [], stack = [], _tmp, numFormat = -1;
        for ( var i = 0; i < this.outStack.length; i++ ) {
            _tmp = this.outStack[i];
            if ( _tmp instanceof cName ) {
                _tmp = _tmp.toRef( this.ws.getId() );
            }
            stack[i] = _tmp;
        }
        var currentElement = null;
        while ( stack.length != 0 ) {
            currentElement = stack.shift();
            if ( currentElement.name == "(" ) {
                continue;
            }
            if ( currentElement.type == cElementType.operator || currentElement.type == cElementType.func ) {
                if ( elemArr.length < currentElement.getArguments() ) {
                    elemArr = [];
                    return this.value = new cError( cErrorType.unsupported_function );
                }
                else {
                    var arg = [];
                    for ( var ind = 0; ind < currentElement.getArguments(); ind++ ) {
                        arg.unshift( elemArr.pop() );
                    }
                    _tmp = currentElement.Calculate( arg, this.ws.getCell( this.cellAddress ) );
                    if ( _tmp.numFormat !== undefined && _tmp.numFormat !== null ) {
                        numFormat = _tmp.numFormat; //> numFormat ? _tmp.numFormat : numFormat;
                    }
                    else if ( numFormat < 0 || currentElement.numFormat < currentElement.formatType.def ) {
                        numFormat = currentElement.numFormat;
                    }
                    elemArr.push( _tmp );
                }
            }
            else {
                elemArr.push( currentElement );
            }
        }
        this.value = elemArr.pop();
        this.value.numFormat = numFormat;
        return this.value;
    },

    /* Метод возвращает все ссылки на ячейки которые учавствуют в формуле*/
    getRef:function () {
        var aOutRef = [];
        for ( var i = 0; i < this.outStack.length; i++ ) {
            var ref = this.outStack[i];
            if ( ref instanceof cName ) {
                ref = ref.toRef( this.ws.getId() );
                if ( ref instanceof cError )
                    continue;
            }

            if ( ref instanceof cRef || ref instanceof cRef3D || ref instanceof cArea ) {
                aOutRef.push( {wsId:ref.ws.getWsId(), cell:ref._cells} );
                continue;
            }
            else if ( ref instanceof cArea3D ) {
                var wsR = ref.wsRange();
                for ( var j = 0; j < wsR.length; j++ )
                    aOutRef.push( {wsId:wsR[a].Id, cell:ref._cells} );
            }
        }
        return aOutRef;
    },

    /* Для обратной сборки функции иногда необходимо поменять ссылки на ячейки */
    changeOffset:function ( offset ) {//offset = {offsetCol:intNumber, offsetRow:intNumber}
        for ( var i = 0; i < this.outStack.length; i++ ) {
            if ( this.outStack[i] instanceof cRef || this.outStack[i] instanceof cRef3D || this.outStack[i] instanceof cArea ) {

                var r = this.outStack[i].getRange();
                if ( !r ) break;

                if ( this.outStack[i].isAbsolute ) {
                    this._changeOffsetHelper( this.outStack[i], offset );
                }
                else {
                    var a, b;
                    if ( this.outStack[i] instanceof cArea && (r.isColumn() && offset.offsetRow != 0 || r.isRow() && offset.offsetCol != 0) ) {
                        continue;
                    }
                    r.setOffset( offset );
                    if ( r.isColumn() ) {
                        a = r.first.getColLetter();
                        b = r.last.getColLetter();
                    }
                    else if ( r.isRow() ) {
                        a = r.first.getRow();
                        b = r.last.getRow();
                    }
                    else {
                        a = r.first.getID(),
                            b = r.last.getID();
                    }


                    if ( a != b || this.outStack[i] instanceof cArea )
                        this.outStack[i].value = this.outStack[i]._cells = a + ":" + b;
                    else this.outStack[i].value = this.outStack[i]._cells = a;
                }
                continue;
            }
            if ( this.outStack[i] instanceof cArea3D ) {
                var r = this.outStack[i]._cells.indexOf( ":" ) > -1 ? (new cArea( this.outStack[i]._cells, this.ws )) : (new cRef( this.outStack[i]._cells, this.ws ));
                var _r = r.getRange();

                if ( !_r ) break;

                if ( this.outStack[i].isAbsolute ) {
                    this._changeOffsetHelper( r, offset );
                }
                else {
                    _r.setOffset( offset );
                    var a = _r.first.getID(),
                        b = _r.last.getID();
                    if ( a != b )
                        r.value = r._cells = a + ":" + b;
                    else r.value = r._cells = a;
                }
                this.outStack[i]._cells = r._cells;
            }
        }
        return this;
    },

    /*
     Для изменения ссылок на конкретную ячейку.
     offset - на сколько сдвигаем ячейку (offset = {offsetCol:intNumber, offsetRow:intNumber})
     cellId - какую ячейку сдвигаем
     */
    shiftCells:function ( offset, oBBox, node, wsId, toDelete ) {

        this.undoParser.formula = this.Formula
        for( var i = 0; i < this.outStack.length; i++ ) {
            this.undoParser.outStack[i] = this.outStack[i];
        }

        for ( var i = 0; i < this.outStack.length; i++ ) {
            if ( this.outStack[i] instanceof cRef ) {
                if ( this.ws.Id != wsId ) {
                    continue;
                }
                if ( toDelete ) {
                    this.outStack[i] = new cError( cErrorType.bad_reference )
                    continue;
                }
                if ( node.cellId == this.outStack[i].node.cellId/*_cells.replace( /\$/ig, "" )*/ ) {
                    if ( this.outStack[i].isAbsolute ) {
                        this._changeOffsetHelper( this.outStack[i], offset );
                    }
                    else {
                        var r = this.outStack[i].getRange();
                        r.setOffset( offset );
                        var a = r.first.getID(),
                            b = r.last.getID();
                        if ( a != b )
                            this.outStack[i].value = this.outStack[i]._cells = a + ":" + b;
                        else this.outStack[i].value = this.outStack[i]._cells = a;
                        node.newCellId = this.outStack[i].value;
                    }
                }
            }
            else if ( this.outStack[i] instanceof cRef3D ) {
                if ( node.nodeId == this.outStack[i].node.nodeId /*_cells.replace( /\$/ig, "" ) && this.outStack[i].ws == node.sheetId*/ ) {

                    if ( toDelete ) {
                        this.outStack[i] = new cError( cErrorType.bad_reference )
                        continue;
                    }

                    if ( this.outStack[i].isAbsolute ) {
                        this._changeOffsetHelper( this.outStack[i], offset );
                    }
                    else {
                        var r = this.outStack[i].getRange();
                        r.setOffset( offset );
                        var a = r.first.getID(),
                            b = r.last.getID();
                        if ( a != b )
                            this.outStack[i].value = this.outStack[i]._cells = a + ":" + b;
                        else this.outStack[i].value = this.outStack[i]._cells = a;
                        node.newCellId = this.outStack[i].value;
                    }
                }
            }
            else if ( this.outStack[i] instanceof cArea3D ) {

                if ( this.outStack[i].wsFrom.Id == this.outStack[i].wsTo.Id == node.sheetId && node.cellId == this.outStack[i]._cells.replace( /\$/ig, "" ) ) {

                    if ( this.outStack[i].isAbsolute ) {
                        this._changeOffsetHelper( this.outStack[i], offset );
                    }
                    else {
                        var r = this.outStack[i].getRange();
                        r[0].setOffset( offset );
                        this.outStack[i].value = this.outStack[i]._cells = r[0].getName();
                        node.newCellId = this.outStack[i].value;
                    }

                }
            }
            else if ( this.outStack[i] instanceof cArea ) {

                if ( this.ws.Id != wsId ) {
                    continue;
                }

                if ( toDelete ) {
                    this.outStack[i] = new cError( cErrorType.bad_reference )
                    continue;
                }

                if ( node.cellId == this.outStack[i].node.cellId /*_cells.replace( /\$/ig, "" )*/ ) {

                    if ( this.outStack[i].isAbsolute ) {
                        this._changeOffsetHelper( this.outStack[i], offset );
                    }
                    else {
                        var r = this.outStack[i].getRange();
                        r.setOffset( offset );
                        this.outStack[i].value = this.outStack[i]._cells = r.getName();
                    }
                    node.newCellId = this.outStack[i].value;
                }

            }
        }
    },

    stretchArea:function ( offset, oBBox, node, wsId ) {
        for ( var i = 0; i < this.outStack.length; i++ ) {
            if ( this.outStack[i] instanceof cArea ) {
                if ( this.outStack[i]._cells.replace( /\$/ig, "" ) == node.cellId || this.outStack[i]._cells.replace( /\$/ig, "" ) == node.newCellId ) {
                    if ( this.outStack[i].isAbsolute ) {
                        this._changeOffsetHelper( this.outStack[i], offset );
                    }
                    else {
                        var r = this.outStack[i].getRange();
                        r.setOffsetLast( offset );
                        var a = r.first.getID(),
                            b = r.last.getID();
                        if ( a != b )
                            this.outStack[i].value = this.outStack[i]._cells = a + ":" + b;
                        else this.outStack[i].value = this.outStack[i]._cells = a;
                        node.newCellId = this.outStack[i].value;
                    }
                }
            }
        }
    },

    /* При переименовывании листа необходимо поменять название листа в соответствующих ссылках */
    changeSheet:function ( lastName, newName ) {
        if ( this.is3D )
            for ( var i = 0; i < this.outStack.length; i++ ) {
                if ( this.outStack[i] instanceof cRef3D && this.outStack[i].ws.getName() == lastName ) {
                    this.outStack[i].changeSheet( lastName, newName );
                }
                if ( this.outStack[i] instanceof cArea3D ) {
                    this.outStack[i].changeSheet( lastName, newName );
                }
            }
        return this;
    },

    /* Сборка функции в инфиксную форму */
    assemble:function () {/*При сборке формул вида A1+A2+A3 формула получает вид (A1+A2)+A3. Добавить проверку приоритета операций.*/
        var str = "";
        var elemArr = [];
        var stack = [];
        for ( var i = 0; i < this.outStack.length; i++ )
            stack[i] = this.outStack[i];
        var currentElement = null;
        while ( stack.length != 0 ) {
            currentElement = stack.shift();
            if ( currentElement.type == cElementType.operator || currentElement.type == cElementType.func ) {
                var arg = [];
                for ( var ind = 0; ind < currentElement.getArguments(); ind++ ) {
                    arg.unshift( elemArr.pop() );
                }
                elemArr.push( currentElement.Assemble( arg ) );
            }
            else {
                if ( currentElement instanceof cString )
                    currentElement = new cString( "\"" + currentElement.toString() + "\"" );
                elemArr.push( currentElement );
            }
        }
        return elemArr.pop().toString();
    },

    _changeOffsetHelper:function ( ref, offset ) {
        var m = ref._cells.match( /\$/g );
        if ( m.length == 1 ) {//для cRef, cRef3D, cArea. $A2, A$2, Sheet1!$A2, Sheet1!A$2, $A2:C4, A$2:C4, A2:$C4, A2:C$4.
            if ( !(ref instanceof cArea) ) {
                if ( ref._cells.indexOf( "$" ) == 0 ) {
                    r = ref.getRange();
                    r.setOffset( {offsetCol:0, offsetRow:offset.offsetRow} );
                    ref.value = ref._cells = "$" + r.first.getID();
                }
                else {
                    r = ref.getRange();
                    r.setOffset( {offsetCol:offset.offsetCol, offsetRow:0} );
                    ref.value = ref._cells = r.first.getColLetter() + "$" + r.first.getRow();
                }
            }
            else {
                var r = ref.getRange();
                var c = ref._cells.split( ":" );// так как ссылка вида A1:A4, делим на первую и последнюю ячейку.
                // проверяем в какой ячеейке находится абсолютная ссылка.
                if ( c[0].indexOf( "$" ) > -1 ) {// если в первой ячейке
                    if ( c[0].indexOf( "$" ) == 0 ) {// абсолютна ли ссылка на столбец...
                        r.first.moveRow( offset.offsetRow );
                        r.last.moveCol( offset.offsetCol );
                        r.last.moveRow( offset.offsetRow );
                        ref.setRange( "$" + r.first.getColLetter() + r.first.getRow() + ":" + r.last.getColLetter() + r.last.getRow() );
                    }
                    else {// ... или абсолютна ссылка на строку
                        r.first.moveCol( offset.offsetCol );
                        r.last.moveCol( offset.offsetCol );
                        r.last.moveRow( offset.offsetRow );
                        ref.setRange( r.first.getColLetter() + "$" + r.first.getRow() + ":" + r.last.getColLetter() + r.last.getRow() );
                    }
                }
                else {// если в последней ячейке
                    if ( c[1].indexOf( "$" ) == 0 ) {// абсолютна ли ссылка на столбец...
                        r.first.moveCol( offset.offsetCol );
                        r.first.moveRow( offset.offsetRow );
                        r.last.moveRow( offset.offsetRow );
                        ref.setRange( r.first.getColLetter() + r.first.getRow() + ":" + "$" + r.last.getColLetter() + r.last.getRow() );
                    }
                    else {// ... или абсолютна ссылка на строку
                        r.first.moveCol( offset.offsetCol );
                        r.first.moveRow( offset.offsetRow );
                        r.last.moveCol( offset.offsetCol );
                        ref.setRange( r.first.getColLetter() + r.first.getRow() + ":" + r.last.getColLetter() + "$" + r.last.getRow() );
                    }
                }
            }
        }
        else if ( m.length == 2 ) {//для cArea. $A$2:C4, A2:$C$4, $A2:$C4, $A2:C$4, A$2:$C4, A$2:C$4.
            if ( ref instanceof cArea ) {
                var r = ref.getRange();
                var c = ref._cells.split( ":" );
                if ( c[1].indexOf( "$" ) < 0 ) {
                    r.last.moveCol( offset.offsetCol );
                    r.last.moveRow( offset.offsetRow );
                    ref.setRange( "$" + r.first.getColLetter() + "$" + r.first.getRow() + ":" + r.last.getColLetter() + r.last.getRow() );
                }
                else if ( c[0].indexOf( "$" ) < 0 ) {
                    r.first.moveCol( offset.offsetCol );
                    r.first.moveRow( offset.offsetRow );
                    ref.setRange( r.first.getColLetter() + r.first.getRow() + ":" + "$" + r.last.getColLetter() + "$" + r.last.getRow() );
                }
                else {
                    if ( c[0].indexOf( "$" ) == 0 && c[1].indexOf( "$" ) == 0 ) {
                        r.first.moveRow( offset.offsetRow );
                        r.last.moveRow( offset.offsetRow );
                        ref.setRange( "$" + r.first.getColLetter() + r.first.getRow() + ":" + "$" + r.last.getColLetter() + r.last.getRow() );
                    }
                    else if ( c[0].indexOf( "$" ) == 0 && c[1].indexOf( "$" ) > 0 ) {
                        r.first.moveRow( offset.offsetRow );
                        r.last.moveCol( offset.offsetCol );
                        ref.setRange( "$" + r.first.getColLetter() + r.first.getRow() + ":" + r.last.getColLetter() + "$" + r.last.getRow() );
                    }
                    else if ( c[0].indexOf( "$" ) > 0 && c[1].indexOf( "$" ) == 0 ) {
                        r.first.moveCol( offset.offsetCol );
                        r.last.moveRow( offset.offsetRow );
                        ref.setRange( r.first.getColLetter() + "$" + r.first.getRow() + ":" + "$" + r.last.getColLetter() + r.last.getRow() );
                    }
                    else {
                        r.first.moveCol( offset.offsetCol );
                        r.last.moveCol( offset.offsetCol );
                        ref.setRange( r.first.getColLetter() + "$" + r.first.getRow() + ":" + r.last.getColLetter() + "$" + r.last.getRow() );
                    }
                }
            }
        }
        else if ( m.length == 3 ) {//для cArea. $A$2:$C4, $A$2:C$4, $A2:$C$4, A$2:$C$4,
            if ( ref instanceof cArea ) {
                var r = ref.getRange();
                var c = ref._cells.split( ":" );
                if ( c[0].match( /\$/g ).length == 2 && c[1].indexOf( "$" ) == 0 ) {
                    r.last.moveRow( offset.offsetRow );
                    ref.setRange( "$" + r.first.getColLetter() + "$" + r.first.getRow() + ":" + "$" + r.last.getColLetter() + r.last.getRow() );
                }
                else if ( c[0].match( /\$/g ).length == 2 && c[1].indexOf( "$" ) > 0 ) {
                    r.last.moveCol( offset.offsetCol );
                    ref.setRange( "$" + r.first.getColLetter() + "$" + r.first.getRow() + ":" + r.last.getColLetter() + "$" + r.last.getRow() );
                }
                else if ( c[1].match( /\$/g ).length == 2 && c[0].indexOf( "$" ) == 0 ) {
                    r.first.moveRow( offset.offsetRow );
                    ref.setRange( "$" + r.first.getColLetter() + r.first.getRow() + ":" + "$" + r.last.getColLetter() + "$" + r.last.getRow() );
                }
                else if ( c[1].match( /\$/g ).length == 2 && c[0].indexOf( "$" ) > 0 ) {
                    r.first.moveCol( offset.offsetCol );
                    ref.setRange( r.first.getColLetter() + "$" + r.first.getRow() + ":" + "$" + r.last.getColLetter() + "$" + r.last.getRow() );
                }
            }
        }
    },

    moveSheet:function ( tempW ) {
        for ( var i = 0; i < this.outStack.length; i++ ) {
            if ( this.outStack[i] instanceof cArea3D ) {
                this.outStack[i].moveSheet( tempW );
            }
        }
        return this;
    },

    buildDependencies:function () {

        var node = new Vertex( this.ws.Id, this.cellId, this.wb );

        this.wb.dependencyFormulas.addNode2( node );
        this.wb.dependencyFormulas.addN( this.ws.Id, this.cellId );

        for ( var i = 0; i < this.outStack.length; i++ ) {
            var ref = this.outStack[i];
            if ( ref instanceof cName ) {
                ref = ref.toRef( this.ws.getId() );
                if ( ref instanceof cError )
                    continue;
            }

            if ( (ref instanceof cRef || ref instanceof cRef3D || ref instanceof cArea) && ref.isValid() ) {
                var nFrom = new Vertex( this.ws.Id, this.cellId.replace( /\$/g, "" ), this.wb ),
                    nTo = new Vertex( ref.getWsId(), ref._cells.replace( /\$/g, "" ), this.wb );
                ref.setNode(nTo);

//                this.wb.dependencyFormulas.addEdge( this.ws.Id, this.cellId.replace( /\$/g, "" ), ref.getWsId(), ref._cells.replace( /\$/g, "" ) );
                this.wb.dependencyFormulas.addEdge2( nFrom, nTo );
            }
            else if ( ref instanceof cArea3D && ref.isValid() ) {
                var wsR = ref.wsRange();
                for ( var j = 0; j < wsR.length; j++ )
                    this.wb.dependencyFormulas.addEdge( this.ws.Id, this.cellId.replace( /\$/g, "" ), wsR[j].Id, ref._cells.replace( /\$/g, "" ) );
            }
        }
    }

}

function parseNum( str ) {
    if ( str.indexOf( "x" ) > -1 )//исключаем запись числа в 16-ричной форме из числа.
        return false;
    return !isNaN( str );
}

function searchRegExp(str, flags){
    var vFS = str
        .replace( /(\\)/g, "\\" )
        .replace( /(\^)/g, "\\^" )
        .replace( /(\()/g, "\\(" )
        .replace( /(\))/g, "\\)" )
        .replace( /(\+)/g, "\\+" )
        .replace( /(\[)/g, "\\[" )
        .replace( /(\])/g, "\\]" )
        .replace( /(\{)/g, "\\{" )
        .replace( /(\})/g, "\\}" )
        .replace( /(\$)/g, "\\$" )
        .replace( /(~)?\*/g, function ( $0, $1 ) {
            return $1 ? $0 : '(.*)';
        } )
        .replace( /(~)?\?/g, function ( $0, $1 ) {
            return $1 ? $0 : '.';
        } )
        .replace( /(~\*)/g, "\\*" ).replace( /(~\?)/g, "\\?" );

    return new RegExp( vFS + "$", flags ? flags : "i" );
}

function phi( x ) {
    return  0.39894228040143268 * Math.exp( -(x * x) / 2.0 );
}

function taylor( pPolynom, nMax, x ) {
    var nVal = pPolynom[nMax];
    for ( var i = nMax - 1; i >= 0; i-- ) {
        nVal = pPolynom[i] + (nVal * x);
    }
    return nVal;
}

function gauss( x ) {
    var t0 =
            [ 0.39894228040143268, -0.06649038006690545, 0.00997355701003582,
                -0.00118732821548045, 0.00011543468761616, -0.00000944465625950,
                0.00000066596935163, -0.00000004122667415, 0.00000000227352982,
                0.00000000011301172, 0.00000000000511243, -0.00000000000021218 ],
        t2 =
            [ 0.47724986805182079, 0.05399096651318805, -0.05399096651318805,
                0.02699548325659403, -0.00449924720943234, -0.00224962360471617,
                0.00134977416282970, -0.00011783742691370, -0.00011515930357476,
                0.00003704737285544, 0.00000282690796889, -0.00000354513195524,
                0.00000037669563126, 0.00000019202407921, -0.00000005226908590,
                -0.00000000491799345, 0.00000000366377919, -0.00000000015981997,
                -0.00000000017381238, 0.00000000002624031, 0.00000000000560919,
                -0.00000000000172127, -0.00000000000008634, 0.00000000000007894 ],
        t4 =
            [ 0.49996832875816688, 0.00013383022576489, -0.00026766045152977,
                0.00033457556441221, -0.00028996548915725, 0.00018178605666397,
                -0.00008252863922168, 0.00002551802519049, -0.00000391665839292,
                -0.00000074018205222, 0.00000064422023359, -0.00000017370155340,
                0.00000000909595465, 0.00000000944943118, -0.00000000329957075,
                0.00000000029492075, 0.00000000011874477, -0.00000000004420396,
                0.00000000000361422, 0.00000000000143638, -0.00000000000045848 ];
    var asympt = [ -1.0, 1.0, -3.0, 15.0, -105.0 ],
        xabs = Math.abs( x ),
        xshort = Math.floor( xabs ),
        nval = 0.0;
    if ( xshort == 0 )
        nval = taylor( t0, 11, (xabs * xabs) ) * xabs;
    else if ( (xshort >= 1) && (xshort <= 2) )
        nval = taylor( t2, 23, (xabs - 2.0) );
    else if ( (xshort >= 3) && (xshort <= 4) )
        nval = taylor( t4, 20, (xabs - 4.0) );
    else
        nval = 0.5 + phi( xabs ) * taylor( asympt, 4, 1.0 / (xabs * xabs) ) / xabs;
    if ( x < 0.0 )
        return -nval;
    else
        return nval;
}

function gaussinv( x ) {
    var q, t, z;

    q = x - 0.5;

    if ( Math.abs( q ) <= .425 ) {
        t = 0.180625 - q * q;
        z =
            q *
                (
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            t * 2509.0809287301226727 + 33430.575583588128105
                                            )
                                            * t + 67265.770927008700853
                                        )
                                        * t + 45921.953931549871457
                                    )
                                    * t + 13731.693765509461125
                                )
                                * t + 1971.5909503065514427
                            )
                            * t + 133.14166789178437745
                        )
                        * t + 3.387132872796366608
                    )
                /
                (
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            t * 5226.495278852854561 + 28729.085735721942674
                                            )
                                            * t + 39307.89580009271061
                                        )
                                        * t + 21213.794301586595867
                                    )
                                    * t + 5394.1960214247511077
                                )
                                * t + 687.1870074920579083
                            )
                            * t + 42.313330701600911252
                        )
                        * t + 1.0
                    );
    }
    else {
        if ( q > 0 )
            t = 1 - x;
        else
            t = x;

        t = Math.sqrt( -Math.log( t ) );

        if ( t <= 5.0 ) {
            t += -1.6;
            z =
                (
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            t * 7.7454501427834140764e-4 + 0.0227238449892691845833
                                            )
                                            * t + 0.24178072517745061177
                                        )
                                        * t + 1.27045825245236838258
                                    )
                                    * t + 3.64784832476320460504
                                )
                                * t + 5.7694972214606914055
                            )
                            * t + 4.6303378461565452959
                        )
                        * t + 1.42343711074968357734
                    )
                    /
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            (
                                                t * 1.05075007164441684324e-9 + 5.475938084995344946e-4
                                                )
                                                * t + 0.0151986665636164571966
                                            )
                                            * t + 0.14810397642748007459
                                        )
                                        * t + 0.68976733498510000455
                                    )
                                    * t + 1.6763848301838038494
                                )
                                * t + 2.05319162663775882187
                            )
                            * t + 1.0
                        );
        }
        else {
            t += -5.0;
            z =
                (
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            t * 2.01033439929228813265e-7 + 2.71155556874348757815e-5
                                            )
                                            * t + 0.0012426609473880784386
                                        )
                                        * t + 0.026532189526576123093
                                    )
                                    * t + 0.29656057182850489123
                                )
                                * t + 1.7848265399172913358
                            )
                            * t + 5.4637849111641143699
                        )
                        * t + 6.6579046435011037772
                    )
                    /
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            (
                                                t * 2.04426310338993978564e-15 + 1.4215117583164458887e-7
                                                )
                                                * t + 1.8463183175100546818e-5
                                            )
                                            * t + 7.868691311456132591e-4
                                        )
                                        * t + 0.0148753612908506148525
                                    )
                                    * t + 0.13692988092273580531
                                )
                                * t + 0.59983220655588793769
                            )
                            * t + 1.0
                        );
        }

        if ( q < 0.0 ) z = -z;
    }

    return z;
}

/*
 from OpenOffice Source.
 \sc\source\core\tool\interpr3.cxx
 begin
 */

var maxGammaArgument = 171.624376956302;

function lcl_getLanczosSum( fZ ) {
    var num = [
            23531376880.41075968857200767445163675473,
            42919803642.64909876895789904700198885093,
            35711959237.35566804944018545154716670596,
            17921034426.03720969991975575445893111267,
            6039542586.35202800506429164430729792107,
            1439720407.311721673663223072794912393972,
            248874557.8620541565114603864132294232163,
            31426415.58540019438061423162831820536287,
            2876370.628935372441225409051620849613599,
            186056.2653952234950402949897160456992822,
            8071.672002365816210638002902272250613822,
            210.8242777515793458725097339207133627117,
            2.506628274631000270164908177133837338626
        ],
        denom = [
            0,
            39916800,
            120543840,
            150917976,
            105258076,
            45995730,
            13339535,
            2637558,
            357423,
            32670,
            1925,
            66,
            1
        ];
    // Horner scheme
    var sumNum, sumDenom, i, zInv;
    if ( fZ <= 1.0 ) {
        sumNum = num[12];
        sumDenom = denom[12];
        for ( i = 11; i >= 0; --i ) {
            sumNum *= fZ;
            sumNum += num[i];
            sumDenom *= fZ;
            sumDenom += denom[i];
        }
    }
    else
    // Cancel down with fZ^12; Horner scheme with reverse coefficients
    {
        zInv = 1 / fZ;
        sumNum = num[0];
        sumDenom = denom[0];
        for ( i = 1; i <= 12; ++i ) {
            sumNum *= zInv;
            sumNum += num[i];
            sumDenom *= zInv;
            sumDenom += denom[i];
        }
    }
    return sumNum / sumDenom;
}

/** You must ensure fZ>0; fZ>171.624376956302 will overflow. */
function lcl_GetGammaHelper( fZ ) {
    var gamma = lcl_getLanczosSum( fZ ),
        fg = 6.024680040776729583740234375,
        zgHelp = fZ + fg - 0.5;
    // avoid intermediate overflow
    var halfpower = Math.pow( zgHelp, fZ / 2 - 0.25 );
    gamma *= halfpower;
    gamma /= Math.exp( zgHelp );
    gamma *= halfpower;
    if ( fZ <= 20 && fZ == Math.floor( fZ ) )
        gamma = Math.round( gamma );
    return gamma;
}

/** You must ensure fZ>0 */
function lcl_GetLogGammaHelper( fZ ) {
    var _fg = 6.024680040776729583740234375, zgHelp = fZ + _fg - 0.5;
    return Math.log( lcl_getLanczosSum( fZ ) ) + (fZ - 0.5) * Math.log( zgHelp ) - zgHelp;
}

function getLogGamma( fZ ) {
    if ( fZ >= maxGammaArgument )
        return lcl_GetLogGammaHelper( fZ );
    if ( fZ >= 0 )
        return Math.log( lcl_GetGammaHelper( fZ ) );
    if ( fZ >= 0.5 )
        return Math.log( lcl_GetGammaHelper( fZ + 1 ) / fZ );
    return lcl_GetLogGammaHelper( fZ + 2 ) - Math.log( fZ + 1 ) - Math.log( fZ );
}