import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './lesson-panel.css';
// import React, {useState, useEffect, useCallback} from 'react';
// import classNames from 'classnames';
import React, {useState, useEffect, useCallback, useRef} from 'react';


const MIN_WIDTH = 240;
// const MAX_WIDTH = 600;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 320;

const buildImageUrl = (lessonId, filename) =>
    `/static/lessons/${lessonId}/img/${filename}`;

const buildExampleUrl = (lessonId, filename) =>
    `/static/lessons/${lessonId}/example/${filename}`;

const ContentBlock = ({block, lessonId, onLoadExample}) => {
    switch (block.type) {

    case 'text': {
        const variant = block.variant || 'body';
        const variantClass = {
            heading: styles.textHeading,
            body: styles.textBody,
            emphasis: styles.textEmphasis,
            warning: styles.textWarning
        }[variant] || styles.textBody;

        if (variant === 'heading') {
            return <h3 className={variantClass}>{block.value}</h3>;
        }

        return <p className={variantClass}>{block.value}</p>;
    }

    case 'image':
        console.log('현재 경로:', buildImageUrl(lessonId, block.src));
        return (
            <img
                className={styles.lessonImage}
                src={buildImageUrl(lessonId, block.src)}
                alt={block.alt || ''}
            />
        );

    case 'video':
        return (
            <div className={styles.videoWrapper}>
                <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    height="100%"
                    src={`https://www.youtube.com/embed/${block.youtubeId}`}
                    title="lesson video"
                    width="100%"
                />
            </div>
        );

    case 'example':
        console.log('현재 경로:', buildExampleUrl(lessonId, block.src));
        return (
            <button
                className={styles.exampleButton}
                onClick={() => onLoadExample(buildExampleUrl(lessonId, block.src))}
            >
                {block.label || '예시 코드 불러오기'}
            </button>
        );

    case 'link':
        return (
            <a
                className={styles.lessonLink}
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {block.label || block.url}
            </a>
        );

    default:
        return null;
    }
};

ContentBlock.propTypes = {
    block: PropTypes.object.isRequired,
    lessonId: PropTypes.string.isRequired,
    onLoadExample: PropTypes.func
};

ContentBlock.propTypes = {
    block: PropTypes.object.isRequired,
    onLoadExample: PropTypes.func
};

const LessonPanel = ({
    isVisible, onToggle,
    lesson, lessons, currentLessonIndex, onGoToLesson,
    steps, currentStepIndex, currentStep,
    hasNext, hasPrev, onNext, onPrev, onGoToStep,
    onLoadExample
}) => {
    const [isStepListOpen, setStepListOpen] = useState(false);
    const [isLessonListOpen, setLessonListOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);

    const contentRef = useRef(null);   // 추가

    // 스텝이 바뀔 때마다 스크롤을 맨 위로
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [currentLessonIndex, currentStepIndex]);   // 레슨이 바뀔 때도 같이 처리


    const handleResizeStart = useCallback(e => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = e => {
            // 패널이 좌측에 있다고 가정: 마우스 x좌표가 곧 패널 너비
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
            setPanelWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return (
        <div
            className={classNames(styles.lessonPanelWrapper, {[styles.isCollapsed]: !isVisible})}
            style={{
                '--lesson-color': lesson.color,
                flexBasis: isVisible ? `${panelWidth}px` : undefined
            }}
        >

            <button className={styles.toggleButton} onClick={onToggle}>
                {isVisible ? '◀' : '▶'}
            </button>

            {isVisible && (
                <div className={styles.lessonPanelContent} ref={contentRef}>


                    {/* <button
                        className={styles.lessonListToggle}
                        onClick={() => setLessonListOpen(!isLessonListOpen)}
                    >
                        📚 전체 레슨 목록 {isLessonListOpen ? '▲' : '▼'}
                    </button> */}


                    <button
                        className={styles.lessonListToggle}
                        onClick={() => setLessonListOpen(!isLessonListOpen)}
                    >
                        <span>전체 레슨 목록</span>
                        <span className={classNames(styles.lessonListChevron, {[styles.isOpen]: isLessonListOpen})}>
                            ▼
                        </span>
                    </button>

                    {isLessonListOpen && (
                        <ul className={styles.lessonList}>
                            {lessons.map((l, i) => (
                                <li key={l.id} style={{'--item-color': l.color}}>
                                    <button
                                        className={classNames(styles.lessonListItem, {
                                            [styles.lessonListItemActive]: i === currentLessonIndex
                                        })}
                                        onClick={() => {
                                            onGoToLesson(i);
                                            setLessonListOpen(false);
                                        }}
                                    >
                                        <span className={styles.lessonListItemNumber}>{i + 1}</span>
                                        {l.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}






                    {/* 현재 레슨 타이틀 */}
                    <h2>{lesson.title}</h2>



                    {/* 진행률 표시 */}
                    <div className={styles.progressRow}>
                        <span className={styles.progressText}>
                            {currentStepIndex + 1} / {steps.length}
                        </span>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{width: `${((currentStepIndex + 1) / steps.length) * 100}%`}}
                            />
                        </div>
                    </div>



                    {/* 스텝 목록 (자유 이동) */}
                    <button
                        className={styles.stepListToggle}
                        onClick={() => setStepListOpen(!isStepListOpen)}
                    >
                        <span>{currentStep.stepTitle}</span>
                        <span className={classNames(styles.stepListChevron, {[styles.isOpen]: isStepListOpen})}>
                            ▼
                        </span>
                    </button>

                    {isStepListOpen && (
                        <ul className={styles.stepList}>
                            {steps.map((step, i) => (
                                <li key={step.id}>
                                    <button
                                        className={classNames(styles.stepListItem, {
                                            [styles.stepListItemActive]: i === currentStepIndex
                                        })}
                                        onClick={() => {
                                            onGoToStep(i);
                                            setStepListOpen(false);
                                        }}
                                    >
                                        {i + 1}. {step.stepTitle}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}





                    {/* 현재 스텝 콘텐츠 */}
                    {currentStep.content.map((block, i) => (
                        <ContentBlock
                            key={i}
                            block={block}
                            lessonId={lesson.id}
                            onLoadExample={onLoadExample}
                        />
                    ))}

                    {/* {currentStep.exampleProjectUrl && (
                        <button className={styles.exampleButton} onClick={onLoadExample}>
                            해당 레슨의 예시코드
                        </button>
                    )} */}

                    <div className={styles.navRow}>
                        {hasPrev && (
                            <button
                                className={classNames(styles.navButton, styles.navButtonPrev)}
                                onClick={onPrev}
                            >
                                {'< 이전'}
                            </button>
                        )}
                        {hasNext && (
                            <button
                                className={classNames(styles.navButton, styles.navButtonNext)}
                                onClick={onNext}
                            >
                                {'다음 >'}
                            </button>
                        )}
                    </div>


                   {/* 리사이즈 핸들 */}
                    <div
                        className={classNames(styles.resizeHandle, {[styles.isResizing]: isResizing})}
                        onMouseDown={handleResizeStart}
                    />

                </div>


            )}
        </div>
    );
};

LessonPanel.propTypes = {
    isVisible: PropTypes.bool,
    onToggle: PropTypes.func,
    lesson: PropTypes.object,
    steps: PropTypes.array,
    currentStepIndex: PropTypes.number,
    currentStep: PropTypes.object,
    hasNext: PropTypes.bool,
    hasPrev: PropTypes.bool,
    onNext: PropTypes.func,
    onPrev: PropTypes.func,
    onGoToStep: PropTypes.func,
    onLoadExample: PropTypes.func
};

export default LessonPanel;