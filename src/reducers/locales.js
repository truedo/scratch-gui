import {addLocaleData} from 'react-intl';

import {localeData, isRtl} from 'scratch-l10n';
import editorMessages from 'scratch-l10n/locales/editor-msgs';
import customMessages from '../lib/custom-l10n-messages';

addLocaleData(localeData);

// 어떤 messagesByLocale이 들어오든 커스텀 ko 메시지를 항상 덧씌우는 헬퍼
const withCustomMessages = messagesByLocale => Object.assign({}, messagesByLocale, {
    ko: Object.assign({}, messagesByLocale.ko, customMessages.ko)
});

const UPDATE_LOCALES = 'scratch-gui/locales/UPDATE_LOCALES';
const SELECT_LOCALE = 'scratch-gui/locales/SELECT_LOCALE';

const initialState = {
    isRtl: false,
    locale: 'en',
    messagesByLocale: withCustomMessages(editorMessages),
    messages: withCustomMessages(editorMessages).en
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SELECT_LOCALE:
        return Object.assign({}, state, {
            isRtl: isRtl(action.locale),
            locale: action.locale,
            messagesByLocale: state.messagesByLocale,
            messages: state.messagesByLocale[action.locale]
        });
    case UPDATE_LOCALES:
        return Object.assign({}, state, {
            isRtl: state.isRtl,
            locale: state.locale,
            messagesByLocale: withCustomMessages(action.messagesByLocale), // 👈 여기서도 재병합
            messages: withCustomMessages(action.messagesByLocale)[state.locale]
        });
    default:
        return state;
    }
};

const selectLocale = function (locale) {
    return {
        type: SELECT_LOCALE,
        locale: locale
    };
};

const setLocales = function (localesMessages) {
    return {
        type: UPDATE_LOCALES,
        messagesByLocale: localesMessages
    };
};
const initLocale = function (currentState, locale) {
    if (Object.prototype.hasOwnProperty.call(currentState.messagesByLocale, locale)) {
        return Object.assign(
            {},
            currentState,
            {
                isRtl: isRtl(locale),
                locale: locale,
                messagesByLocale: currentState.messagesByLocale,
                messages: currentState.messagesByLocale[locale]
            }
        );
    }
    // don't change locale if it's not in the current messages
    return currentState;
};
export {
    reducer as default,
    initialState as localesInitialState,
    initLocale,
    selectLocale,
    setLocales
};
