/*
 StartbitV2 package
 my version
*/
//% weight=10 icon="\uf013" color=#2896ff
namespace StartbitV2 {

    export enum startbit_CmdType {
        //% block="Invalid command"
        NO_COMMAND = 0,
        //% block="car run"
        CAR_RUN = 1,
        //% block="robot run"   
        ROBOT_RUN = 1,
        //% block="Servo"
        SERVO = 2,
        //% block="Ultrasonic distance"
        ULTRASONIC = 3,
        //% block="Temperature"
        TEMPERATURE = 4,
        //% block="Light"
        LIGHT = 6,
        //% block="Voltage"
        BAT = 7,
        //% block="Rgb light"
        RGB_LIGHT = 8,
        //% block="Honk horn"
        DIDI = 9,
        //% block="Read firmware version"
        VERSION = 10,
        //% block="Read angle"
        READ_ANGLE = 11,
        //% block="Light belt"        
        RGB_BELT = 12,
        //% block="WIFI mode"
        WIFI_MODE = 13,
        //% block="Get mac"
        GET_MAC = 14,
        //% block="Get hand cmd"
        GET_HAND_CMD = 15
     }

    export enum startbit_CarRunCmdType {
        //% block="Stop"
        STOP = 0,
        //% block="Go ahead"
        GO_AHEAD,
        //% block="Back"
        GO_BACK,
        //% block="Turn left"
        TURN_LEFT,
        //% block="Turn right"
        TURN_RIGHT,
        //% block="Go ahead slowly"
        GO_AHEAD_SLOW,
        //% block="Turn left slowly"
        TURN_LEFT_SLOW,
        //% block="Turn right slowly"
        TURN_RIGHT_SLOW,
        //% block="Invalid command"
        COMMAND_ERRO
    }

    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }


    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }

    /**
    * Resolve the Bluetooth that phone APP send command type, the total of nine types of commands: tank display command, servo debug command, obtaining the distance of ultrasonic command, obtaining temperature command, obtain sound size rank orders, to obtain the light level command, set the color lights command, honking command, firmware version information command.
    */
    //% weight=99 blockId=startbit_analyzeBluetoothCmd block="Get bluetooth command type %str"
    //% subcategory=Bluetooth
    export function startbit_analyzeBluetoothCmd(str: string): number {
        if (str.length > 6) {
            let cmdHead = str.substr(0, 3);

            if (cmdHead == "CMD") {
                let cmdTypeStr: string = str.substr(4, 2);
                let cmdType = strToNumber(cmdTypeStr);
                if (cmdType > startbit_CmdType.GET_HAND_CMD || cmdType < 0) {
                    return startbit_CmdType.NO_COMMAND;
                }
                else {
                    return cmdType;
                }
            }
            else {
                return startbit_CmdType.NO_COMMAND;
            }
        }
        else {
            return startbit_CmdType.NO_COMMAND;
        }
    }
    /**
     * Resolve the parameters that the phone APP send the command,there are 3 parameters of servo debug command,the other command has just one parameter.
     */
    //% weight=98  blockId=startbit_cgetArgs block="Get bluetooth command|%str|argument at %index"
    //% index.min=1 index.max=3
    //% subcategory=Bluetooth
    export function startbit_getArgs(str: string, index: number): number {
        let cmdType = startbit_analyzeBluetoothCmd(str);
        if (cmdType == startbit_CmdType.NO_COMMAND) {
            return startbit_CarRunCmdType.COMMAND_ERRO;
        }
        else {
            let dataIndex = 7;
            let subLegth = 2;
            if (index == 2) {
                dataIndex = 10;
                subLegth = 2;
            }
            else if (index == 3) {
                dataIndex = 13;
                subLegth = 4;
            }
            if (cmdType == startbit_CmdType.SERVO) {
                if (str.length < 17) {
                    return startbit_CmdType.NO_COMMAND;
                }
            }
            if ((index == 1 && str.length < 10) || (index == 2 && str.length < 13) || (index == 3 && str.length < 17)) {
                return 0;
            }
            let strArgs = str.substr(dataIndex, subLegth);
            let arg = strToNumber(strArgs);
            if (arg == -1)
                return 0;
            return arg;
        }
    }

    /**
     * Returns the enumeration of the command type, which can be compared with this module after obtaining the bluetooth command type sent by the mobile phone APP.
     */
    //% weight=97 blockId=startbit_getBluetoothCmdtype block="Bluetooth command type %type"
    //% subcategory=Bluetooth
    export function startbit_getBluetoothCmdtype(type: startbit_CmdType): number {
        return type;
    }

    /**
     * The command type of the tank is stop, go ahead, back, turn left, turn right, slow down, turn left slowly, turn right slowly.
     */
    //% weight=96 blockId=startbit_getRunCarType block="Car run type %type"
    //% subcategory=Bluetooth
    export function startbit_getRunCarType(type: startbit_CarRunCmdType): number {
        return type;
    }

    /**
     * The distance from the ultrasonic obstacle is the standard command, which is sent to the mobile phone. The APP will indicate the distance of the ultrasonic obstacle.
     */
    //% weight=95 blockId=startbit_convertUltrasonic block="Convert ultrasonic distance %data"
    //% subcategory=Bluetooth
    export function startbit_convertUltrasonic(data: number): string {
        let cmdStr: string = "CMD|03|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * The conversion temperature value to standard command, sent to the mobile phone, and the APP displays the current temperature.
     */
    //% weight=94 blockId=startbit_convertTemperature block="Convert temperature %data"
    //% subcategory=Bluetooth
    export function startbit_convertTemperature(data: number): string {
        let cmdStr: string = "CMD|04|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * Convert the light value to the standard command and send it to the mobile phone. The APP displays the current light level (0~255).
     */
    //% weight=93 blockId=startbit_convertLight block="Convert light %data"
    //% subcategory=Bluetooth
    export function startbit_convertLight(data: number): string {
        let cmdStr: string = "CMD|06|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * Convert the battery value to the standard command and send it to the mobile phone. The APP displays the current voltage.
     */
    //% weight=92 blockId=startbit_convertBattery blockGap=50 block="Convert battery %data"
    //% subcategory=Bluetooth
    export function startbit_convertBattery(data: number): string {
        let cmdStr: string = "CMD|07|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * Convert the hand cmd to phone app
     */
    //% weight=51 blockId=startbit_convertHandCmd blockGap=50 block="Convert uHand:bit %data"
    export function startbit_convertHandCmd(data: number): string {
        let cmdStr: string = "CMD|15|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }
}
