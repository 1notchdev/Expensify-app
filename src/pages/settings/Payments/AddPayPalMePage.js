import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Text from '../../../components/Text';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
import TextInput from '../../../components/TextInput';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as User from '../../../libs/actions/User';
import paypalMeDataPropTypes from '../../../components/paypalMeDataPropTypes';

const propTypes = {
    /** Account details for PayPal.Me */
    payPalMeData: paypalMeDataPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeData: {},
};

class AddPayPalMePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            payPalMeUsername: props.payPalMeData.description,
            payPalMeUsernameError: false,
        };
        this.setPayPalMeUsername = this.setPayPalMeUsername.bind(this);
        this.focusPayPalMeInput = this.focusPayPalMeInput.bind(this);
    }

    /**
     * Sets the payPalMeUsername for the current user
     */
    setPayPalMeUsername() {
        const isValid = ValidationUtils.isValidPaypalUsername(this.state.payPalMeUsername);
        if (!isValid) {
            this.setState({payPalMeUsernameError: true});
            return;
        }
        this.setState({payPalMeUsernameError: false});
        User.addPaypalMeAddress(this.state.payPalMeUsername);

        Growl.show(this.props.translate('addPayPalMePage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
    }

    focusPayPalMeInput() {
        if (!this.payPalMeInputRef) {
            return;
        }

        this.payPalMeInputRef.focus();
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={this.focusPayPalMeInput}>
                <HeaderWithCloseButton
                    title={this.props.translate('common.payPalMe')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <View style={[styles.flex1]}>
                        <Text style={[styles.mb4]}>
                            {this.props.translate('addPayPalMePage.enterYourUsernameToGetPaidViaPayPal')}
                        </Text>
                        <TextInput
                            ref={el => this.payPalMeInputRef = el}
                            label={this.props.translate('addPayPalMePage.payPalMe')}
                            autoCompleteType="off"
                            autoCorrect={false}
                            value={this.state.payPalMeUsername}
                            placeholder={this.props.translate('addPayPalMePage.yourPayPalUsername')}
                            onChangeText={text => this.setState({payPalMeUsername: text, payPalMeUsernameError: false})}
                            returnKeyType="done"
                            hasError={this.state.payPalMeUsernameError}
                            errorText={this.state.payPalMeUsernameError ? this.props.translate('addPayPalMePage.formatError') : ''}
                        />
                    </View>
                </View>
                <FixedFooter>
                    <Button
                        success
                        onPress={this.setPayPalMeUsername}
                        pressOnEnter
                        style={[styles.mt3]}
                        isDisabled={this.state.payPalMeUsername === this.props.payPalMeData.description}
                        text={this.props.payPalMeData.description
                            ? this.props.translate('addPayPalMePage.editPayPalAccount')
                            : this.props.translate('addPayPalMePage.addPayPalAccount')}
                    />
                </FixedFooter>
            </ScreenWrapper>
        );
    }
}

AddPayPalMePage.propTypes = propTypes;
AddPayPalMePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        payPalMeData: {
            key: ONYXKEYS.PAYPAL,
        },
    }),
)(AddPayPalMePage);
