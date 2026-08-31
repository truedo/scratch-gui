// src/lib/lessons/index.js

const buildLessonsForLocale = locale => {
    const metaContext = require.context('./', true, /meta\.json$/);
    const stepContext = require.context('./', true, /steps\/.*\.json$/);
    console.log('전체 스텝 파일 경로:', stepContext.keys());  // 추가

    const localePrefix = `./${locale}/`;

    return metaContext.keys()
        .filter(path => path.startsWith(localePrefix))
        .map(metaPath => {
            const lessonDir = metaPath.replace('/meta.json', '');
            const meta = metaContext(metaPath);

            const steps = stepContext.keys()
                .filter(stepPath => stepPath.startsWith(`${lessonDir}/steps/`))
                .sort()
                .map(stepPath => stepContext(stepPath));

            return {...meta, steps};
        });
};

const lessonsByLocale = {
    ko: buildLessonsForLocale('ko'),
    en: buildLessonsForLocale('en')
};

export const getLessons = locale => {           // ← named export, 이 줄이 있는지 확인
    return locale === 'ko' ? lessonsByLocale.ko : lessonsByLocale.en;
};

export default lessonsByLocale;                  // default export는 별개