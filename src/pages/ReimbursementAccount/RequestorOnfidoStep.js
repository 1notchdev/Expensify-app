import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import Growl from '../../libs/Growl';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import CONST from '../../CONST';

const propTypes = {
    /** Bank account currently in setup */
    /* eslint-disable-next-line react/no-unused-prop-types */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /** The draft values of the bank account being setup */
    /* eslint-disable-next-line react/no-unused-prop-types */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes.isRequired,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string.isRequired,

    /** A callback to call once the user completes the Onfido flow */
    onComplete: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {};

class RequestorOnfidoStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    submit(onfidoData) {
        BankAccounts.verifyIdentityForBankAccount(
            ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0),
            onfidoData,
        );
        this.props.onComplete();
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.flex1}>
                <Onfido
                    sdkToken={this.props.onfidoToken}
                    onUserExit={() => {
                        // We're taking the user back to the company step. They will need to come back to the requestor step to make the Onfido flow appear again.
                        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                    }}
                    onError={() => {
                        // In case of any unexpected error we log it to the server, show a growl, and return the user back to the company step so they can try again.
                        Growl.error(this.props.translate('onfidoStep.genericError'), 10000);
                        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                    }}
                    onSuccess={(onfidoData) => {
                        this.submit(onfidoData);
                    }}
                />
            </ScrollView>
        );
    }
}

RequestorOnfidoStep.propTypes = propTypes;
RequestorOnfidoStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        onfidoToken: {
            key: ONYXKEYS.ONFIDO_TOKEN,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
    }),
)(RequestorOnfidoStep);
