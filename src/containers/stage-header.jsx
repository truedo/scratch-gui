import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import {STAGE_SIZE_MODES} from '../lib/layout-constants';
import {setStageSize} from '../reducers/stage-size';
import {setFullScreen} from '../reducers/mode';

import {connect} from 'react-redux';

import StageHeaderComponent from '../components/stage-header/stage-header.jsx';

// eslint-disable-next-line react/prefer-stateless-function
class StageHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            connectionStatus: "no" // 기본값
        };

        bindAll(this, [
            'handleKeyPress',
            'handleConnectionStatus'
        ]);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPress);

        // ★ VM 이벤트 등록
        if (this.props.vm && this.props.vm.runtime) {
            this.props.vm.runtime.on('CONNECTION_STATUS', this.handleConnectionStatus);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPress);

        // ★ VM 이벤트 해제
        if (this.props.vm && this.props.vm.runtime) {
            this.props.vm.runtime.off('CONNECTION_STATUS', this.handleConnectionStatus);
        }
    }

    // ★ VM이 전달하는 상태 값 처리
    handleConnectionStatus(status) {
        this.setState({
            connectionStatus: status
        });
    }

    handleKeyPress(event) {
        if (event.key === 'Escape' && this.props.isFullScreen) {
            this.props.onSetStageUnFull(false);
        }
    }

    render() {
        const {
            ...props
        } = this.props;

        return (
            <StageHeaderComponent
                {...props}
                onKeyPress={this.handleKeyPress}

                // ★ Controls로 넘어가는 값
                connectionStatus={this.state.connectionStatus}
            />
        );
    }
}


StageHeader.propTypes = {
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    onSetStageUnFull: PropTypes.func.isRequired,
    showBranding: PropTypes.bool,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    stageSizeMode: state.scratchGui.stageSize.stageSize,
    showBranding: state.scratchGui.mode.showBranding,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly
});

const mapDispatchToProps = dispatch => ({
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
    onSetStageSmall: () => dispatch(setStageSize(STAGE_SIZE_MODES.small)),
    onSetStageFull: () => dispatch(setFullScreen(true)),
    onSetStageUnFull: () => dispatch(setFullScreen(false))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StageHeader);
