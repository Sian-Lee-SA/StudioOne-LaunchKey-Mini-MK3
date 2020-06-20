function debug_determineName( obj )
{
    if( obj.name )
        return obj.name;

    if( obj.prototype && obj.prototype.name )
        return obj.prototype.name;

    if( obj.constructor &&  obj.constructor.name )
        return obj.constructor.name;

    return "UNKNOWN";
}

function log_write(filename, text)
{
    var path = Host.Url("local://$USERCONTENT/debug/" + filename + ".txt");
    let textFile = Host.IO.createTextFile(path);
    if (textFile)
    {
        textFile.writeLine(text);
        textFile.close();
    }
}

function log_param_names(func)
{
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
        result = "No Params";
    else
        result = result.join(" | ");

    Host.Console.writeLine(result);
}

function list_methods(obj)
{
    for( let method in Object.getOwnPropertyNames(obj) )
        Host.Console.writeLine("method: "+method);
}

function log_obj( obj, skipValues )
{
    if( obj == null )
    {
        Host.Console.writeLine ("DEBUG OBJ: Undefined");
        return;
    }

    if( typeof obj == 'string' || typeof obj == 'number')
        return Host.Console.writeLine( "DEBUG: ("+ typeof obj+") " + String(obj) );

    Host.Console.writeLine( "DEBUG: " + debug_determineName(obj) + " (" + typeof obj + ") {" );

    if( skipValues )
        Host.Console.writeLine( String(obj.toSource()) );

    do {
        let prop = Object.getOwnPropertyNames(obj);
        for( let key in prop )
        {
            if( ! obj.hasOwnProperty(prop[key]) || skipValues )
            {
                Host.Console.writeLine( "   " + prop[key] );
                continue;
            }

            let descriptor = Object.getOwnPropertyDescriptor(obj, prop[key]);

            let value;
            if( descriptor.value == null ) {
                value = "null";
            } else if( typeof descriptor.value == "function" ) {
                value = descriptor.value.toSource();
            } else {
                value = "["+typeof descriptor.value+"] " + descriptor.value.toString().replace((/  |\r\n|\n|\r/gm),"");
            }
            Host.Console.writeLine( "   " + prop[key] + ": " + value );
        }
    } while (obj = Object.getPrototypeOf(obj));

    Host.Console.writeLine("}");
}

function log( obj, skipValues )
{
    log_obj(obj, skipValues);
}
