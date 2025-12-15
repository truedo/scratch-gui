import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import GreenFlag from '../green-flag/green-flag.jsx';
import StopAll from '../stop-all/stop-all.jsx';
import TurboMode from '../turbo-mode/turbo-mode.jsx';

import styles from './controls.css';

import chainIcon from './icon--chain.svg';
import chainOffIcon from './icon--chain-off.svg';
// import greenFlagIcon from './icon--green-flag.svg';


const messages = defineMessages({
    goTitle: {
        id: 'gui.controls.go',
        defaultMessage: 'Go',
        description: 'Green flag button title'
    },
    stopTitle: {
        id: 'gui.controls.stop',
        defaultMessage: 'Stop',
        description: 'Stop button title'
    }
});

const Controls = function (props) {
    const {
        active,
        className,
        intl,
        onGreenFlagClick,
        onStopAllClick,
        turbo,

        connectionStatus,   // ★ 추가

        ...componentProps
    } = props;
    return (
        <div className={classNames(styles.controlsWrapper)}>

            <div
                className={classNames(styles.controlsContainer, className)}
                {...componentProps}
            >
                <GreenFlag
                    active={active}
                    title={intl.formatMessage(messages.goTitle)}
                    onClick={onGreenFlagClick}
                />
                <StopAll
                    active={active}
                    title={intl.formatMessage(messages.stopTitle)}
                    onClick={onStopAllClick}
                />
                {turbo ? (
                    <TurboMode />
                ) : null}

            </div>

                {/* 내가 추가한 버튼 */}
                <div className={styles.myButtonWrapper}>
                    <img
                        src={
                            connectionStatus === 'ok'
                                ? chainIcon
                                : chainOffIcon
                        }
                        className={styles.connectionIcon}
                        draggable={false}
                        title={
                            connectionStatus === 'ok'
                                ? 'Connected'
                                : 'Disconnected'
                        }
                    />
                </div>

         </div>

    );
};

Controls.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    onGreenFlagClick: PropTypes.func.isRequired,
    onStopAllClick: PropTypes.func.isRequired,
    turbo: PropTypes.bool
};

Controls.defaultProps = {
    active: false,
    turbo: false
};

export default injectIntl(Controls);
