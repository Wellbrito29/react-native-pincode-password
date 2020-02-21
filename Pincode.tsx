import React, { Component } from 'react'
import { Text, View, TextInput } from 'react-native'
import { codePinStyles } from './pin-code-style';

interface State {
    error: any;
    number: number;
    code: any;
    edit: any;
    reset: boolean;
    autoFill: boolean;


}

interface Props {
    code: String;
    success: Function;
    number: number;
    checkPinCode: Function;
    autoFocusFirst: boolean;
    obfuscation: boolean;
    pinSquareStyle: Object;
    containerPinStyle: Object;
    containerStyle: Object;
    textStyle: Object;
    errorStyle: Object;
    error: String;
    text: String;
    obfuscationSymbol: number;

}


export class Pincode extends Component<Props, State>  {

    private textInputsRefs;

    constructor(props) {
        super(props);

        const codeLength = props.number || props.code.length;

        this.state = {
            error: '',
            number: codeLength,
            code: new Array(codeLength).fill(''),
            edit: null,
            reset: false,
            autoFill: false
        };

        this.textInputsRefs = [];

        this.clean = this.clean.bind(this);
        this.focus = this.focus.bind(this);
        this.isFocus = this.isFocus.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }


    public static defaultProps = {
        code: '',
        number: 4,
        checkPinCode: null,
        autoFocusFirst: true,
        obfuscation: false,
        text: 'Pin code',
        error: 'Bad pin code.',
        Square: {},
        containerPinStyle: {},
        containerStyle: {},
        textStyle: {},
        errorStyle: {},
        obfuscationSymbol: 0
    };

    static getDerivedStateFromProps(props, state) {


        // console.log("================STATE =====")
        // console.log(state)

        // console.log("================PROPS =====")


        // console.log(props)


        const codeLength = props.number || props.code.length;


        if (props.number !== state.number) {
            return {
                number: codeLength,
                edit: null
            };
        }
        return null;
    }

    clean() {
        this.setState(prevState => {
            return {
                code: new Array(prevState.number).fill(''),
                edit: null,
                reset: true
            };
        });
        this.focus(0);
    }

    focus(id) {
        // Check to ensure that input exists. This is important in the case of autofill.
        if (this.textInputsRefs[id]) this.textInputsRefs[id].focus();
    }

    isFocus(id) {
        let newCode = this.state.code.slice();

        for (let i = 0; i < newCode.length; i++) if (i >= id) newCode[i] = '';

        this.setState({
            code: newCode,
            edit: id
        });
    }

    // shouldComponentUpdate = (nextProps, nextState) => {
    //   console.log(nextProps)
    //   console.log(nextState)
    //   console.log(this.props)
    //   console.log(this.state)
    //   return false
    // }

    handleEdit(number, id) {

        let newCode = this.state.code.slice();


        // Detecting if the entire code has been pasted or autofilled into
        // the first field , .
        if ((number == undefined || number == '' || number == null) && number !== 0 && number !== '0') {

            setTimeout(() => {
                this.setState({ autoFill: false });
            }, 20)

            return this.setState({ autoFill: true })
        }

        if (this.state.autoFill && number.length < 4) {
            return
        }

        const hasAutofilled =
            number.length > 1 && number.length === this.props.number && id === 0;

        if (hasAutofilled) {
            newCode = number.split('');


            console.log("NOVO NUMERO")
            console.log(newCode)

            // Need to update state so UI updates.
            this.setState({
                code: newCode,
                edit: this.props.number - 1,
                reset: false
            });
        } else {
            newCode[id] = number[0];
        }

        // console.log(this.state);

        // User filling the last pin ?
        if (id === this.state.number - 1 || hasAutofilled) {
            // console.log('ÉNTREI')
            this.focus(0);

            // App pass a checkPinCode function
            if (this.props.checkPinCode) {
                this.props.checkPinCode(newCode.join(''), success => {
                    // App say it's different than code
                    if (!success) {
                        this.setState({
                            error: this.props.error,
                            code: new Array(this.state.number).fill(''),
                            edit: 0,
                            reset: true
                        });
                    } else {
                        // Is Okey !!!
                        this.setState(
                            prevState => ({
                                edit: prevState.edit + 1,
                                code: newCode,
                                reset: true
                            }),
                            () => this.props.success
                        );
                    }
                });

                return;
            }

            // no checkPinCode function
            // But it's different than code
            if (this.props.code !== newCode.join('')) {
                this.setState({
                    error: this.props.error,
                    code: new Array(this.state.number).fill(''),
                    edit: 0,
                    reset: true
                });

                return;
            }

            this.setState(
                prevState => ({
                    edit: prevState.edit + 1,
                    code: newCode,
                    reset: true
                }),
                () => this.props.success
            );

            return;
        }


        this.focus(this.state.edit + 1);

        this.setState(prevState => {
            return {
                error: '',
                code: newCode,
                edit: prevState.edit + 1,
                reset: false
            };
        });
    }

    onKeyPress(e) {
        if (e.nativeEvent.key === 'Backspace') {
            const edit = this.state.edit;
            const toFocus = edit > 0 ? edit - 1 : 0;
            this.focus(toFocus);
        }
    }



    render() {
        const {
            text,
            success,
            pinSquareStyle,
            textStyle,
            errorStyle,
            obfuscation,
            containerStyle,
            containerPinStyle,
            obfuscationSymbol,
            ...props
        } = this.props;

        let pins = [];
        for (let index = 0; index < this.state.number; index++) {
            const id = index;
            const value = this.state.code[id]
                ? obfuscation
                    ? obfuscationSymbol == 0 ? '*' : 'x'

                    : this.state.code[id].toString()
                : '';

            pins.push(
                <TextInput
                    key={id + value + this.state.reset} // force to re-render on update
                    ref={ref => (this.textInputsRefs[id] = ref)}
                    onChangeText={text => this.handleEdit(text, id)}
                    onFocus={() => this.isFocus(id)}
                    value={value}
                    maxLength={id === 0 ? this.props.number : 1}
                    style={[codePinStyles.pin, pinSquareStyle]}
                    returnKeyType={'done'}
                    autoCapitalize={'sentences'}
                    autoCorrect={false}
                    autoFocus={
                        (id === 0 &&
                            this.state.edit === null &&
                            this.props.autoFocusFirst) ||
                        id === this.state.edit
                    }
                    onKeyPress={this.onKeyPress}
                    {...this.props}
                />
            );
        }

        const error = this.state.error ? (
            <Text style={[codePinStyles.error, errorStyle]}>{this.state.error}</Text>
        ) : null;

        return (
            <View style={[codePinStyles.container, containerStyle]}>
                <Text style={[codePinStyles.text, textStyle]}>{text}</Text>

                {error}

                <View style={[codePinStyles.containerPin, containerPinStyle]}>
                    {pins}
                </View>
            </View>
        );
    }
}

export default Pincode
