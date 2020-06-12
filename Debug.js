
function Debug(device)
{
    Debug.Instance = this;
    this.device = device;

    this.determineType = function( obj )
    {
        return typeof obj;
    }

    this.determineName = function( obj )
    {
        if( obj.name )
            return obj.name;

        if( obj.prototype && obj.prototype.name )
            return obj.prototype.name;

        if( obj.constructor &&  obj.constructor.name )
            return obj.constructor.name;

        return "UNKNOWN";
    }

    this.write = function(filename, text)
    {
        var path = Host.Url("local://$USERCONTENT/debug/" + filename + ".txt");
        let textFile = Host.IO.createTextFile(path);
        if (textFile)
        {
            textFile.writeLine(text);
            textFile.close();
        }
    }

    this.logParamNames = function(func) {
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var ARGUMENT_NAMES = /([^\s,]+)/g;
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if(result === null)
            result = "No Params";
        else
            result = result.join(" | ");

        this.device.log(result);
    }

    this.listMethods = function(obj)
    {
        for( let method in Object.getOwnPropertyNames(obj) )
            this.device.log("method: "+method);
    }

    this.log = function( obj, skipValues )
    {
        if( obj == null )
        {
            this.device.log( "DEBUG OBJ: Undefined");
            return;
        }

        if( typeof obj == 'string' || typeof obj == 'number')
            return this.device.log( "DEBUG: ("+this.determineType(obj)+") " + String(obj) );

        this.device.log( "DEBUG: " + this.determineName(obj) + " (" + this.determineType(obj) + ") {" );

        if( skipValues )
            this.device.log( String(obj.toSource()) );

        do {
            let prop = Object.getOwnPropertyNames(obj);
            for( let key in prop )
            {
                if( ! obj.hasOwnProperty(prop[key]) || skipValues )
                {
                    this.device.log( "   " + prop[key] );
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
                this.device.log( "   " + prop[key] + ": " + value );
            }
        } while (obj = Object.getPrototypeOf(obj));

        this.device.log("}");
    }
}

function log( obj, skipValues )
{
    Debug.Instance.log(obj, skipValues);
}
