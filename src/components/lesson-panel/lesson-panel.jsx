import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './lesson-panel.css';
// import React, {useState, useEffect, useCallback} from 'react';
// import classNames from 'classnames';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {FormattedMessage} from 'react-intl';   // 이 줄 추가

const MIN_WIDTH = 240;
// const MAX_WIDTH = 600;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 320;

const buildImageUrl = (lessonId, filename) =>
    `/static/lessons/${lessonId}/img/${filename}`;

const buildExampleUrl = (lessonId, filename) =>
    `/static/lessons/${lessonId}/example/${filename}`;


const QuizBlock = ({block}) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const isAnswered = selectedIndex !== null;
    const isCorrect = selectedIndex === block.answerIndex;

    const correctMessage = block.correctMessage || 'Correct!';
    const incorrectMessage = block.incorrectMessage || 'Try again.';

    const handleSelect = index => {
        if (isAnswered) return; // 한번 답을 고르면 다른 답으로 못 바꾸게 (재도전은 별도 버튼으로)
        setSelectedIndex(index);
    };

    const handleRetry = () => {
        setSelectedIndex(null);
    };

    return (
        <div className={styles.quizBlock}>
            <p className={styles.quizQuestion}>{block.question}</p>

            <ul className={styles.quizOptions}>
                {block.options.map((option, i) => {
                    const isSelected = i === selectedIndex;
                    const isThisCorrect = i === block.answerIndex;

                    return (
                        <li key={i}>
                            <button
                                className={classNames(styles.quizOption, {
                                    [styles.quizOptionSelected]: isSelected && !isAnswered,
                                    [styles.quizOptionCorrect]: isAnswered && isThisCorrect && isCorrect,      // isCorrect 조건 추가
                                    [styles.quizOptionIncorrect]: isAnswered && isSelected && !isCorrect,
                                    [styles.quizOptionDisabled]: isAnswered && !isSelected && !(isThisCorrect && isCorrect)  // 여기도 같이 수정
                                })}
                                disabled={isAnswered}
                                onClick={() => handleSelect(i)}
                            >
                                {option}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {isAnswered && (
                <div className={classNames(styles.quizFeedback, {
                    [styles.quizFeedbackCorrect]: isCorrect,
                    [styles.quizFeedbackIncorrect]: !isCorrect
                })}>
                    <p>{isCorrect ? correctMessage : incorrectMessage}</p>
                    {!isCorrect && (
                    <button className={styles.quizRetryButton} onClick={handleRetry}>
                        <FormattedMessage
                            defaultMessage="Retry"
                            description="Button to retry a quiz question"
                            id="gui.lessonPanel.retry"
                        />
                    </button>
                    )}
                </div>
            )}
        </div>
    );
};

QuizBlock.propTypes = {
    block: PropTypes.object.isRequired
};

const HintBlock = ({block, lessonId, onLoadExample}) => {
    const [isAnswerVisible, setAnswerVisible] = useState(false);

    const showLabel = block.showLabel || 'Show Answer';
    const hideLabel = block.hideLabel || 'Hide Answer';

    return (
        <div className={styles.hintBlock}>
            <p className={styles.hintPrompt}>{block.prompt}</p>

            <button
                className={classNames(styles.hintToggleButton, {
                    [styles.hintToggleButtonOpen]: isAnswerVisible
                })}
                onClick={() => setAnswerVisible(!isAnswerVisible)}
            >
                <span>{isAnswerVisible ? hideLabel : showLabel}</span>
                <span className={classNames(styles.hintChevron, {
                    [styles.isOpen]: isAnswerVisible
                })}>
                    ▼
                </span>
            </button>

            {isAnswerVisible && (
                <div className={styles.hintAnswerBox}>
                    {block.answer.map((answerBlock, i) => (
                        <ContentBlock
                            key={i}
                            block={answerBlock}
                            lessonId={lessonId}
                            onLoadExample={onLoadExample}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

HintBlock.propTypes = {
    block: PropTypes.object.isRequired,
    lessonId: PropTypes.string.isRequired,
    onLoadExample: PropTypes.func
};

const ContentBlock = ({block, lessonId, onLoadExample, onImageClick}) => {
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
        // console.log('현재 경로:', buildImageUrl(lessonId, block.src));
    return (
        <img
            className={styles.lessonImage}
            src={buildImageUrl(lessonId, block.src)}
            alt={block.alt || ''}
            loading="lazy"
            onClick={() => onImageClick(buildImageUrl(lessonId, block.src))}
        />
    );

    case 'example':
        // console.log('현재 경로:', buildExampleUrl(lessonId, block.src));
        return (
            <button
                className={styles.exampleButton}
                onClick={() => onLoadExample(buildExampleUrl(lessonId, block.src))}
            >
                {block.label || 'Load Example Code'}
            </button>
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

    case 'hint':
        return (
            <HintBlock
                block={block}
                lessonId={lessonId}
                onLoadExample={onLoadExample}
            />
        );

    case 'quiz':
        return <QuizBlock block={block} />;


    case 'divider':
        return <hr className={styles.lessonDivider} />;


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
    isVisible, onToggle, shouldPulse,
    lesson, lessons, currentLessonIndex, onGoToLesson,
    steps, currentStepIndex, currentStep,
    hasNext, hasPrev, onNext, onPrev, onGoToStep,
    onLoadExample, completedSteps, onToggleComplete
}) => {
    const [isStepListOpen, setStepListOpen] = useState(false);
    const [isLessonListOpen, setLessonListOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const [isPulsing, setIsPulsing] = useState(shouldPulse);
    const [lightboxImage, setLightboxImage] = useState(null);

    const isCurrentStepDone = (completedSteps[lesson.id] || []).includes(currentStep.id);

    const contentRef = useRef(null);   // 추가


    // 스텝이 바뀔 때마다 스크롤을 맨 위로
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [currentLessonIndex, currentStepIndex]);   // 레슨이 바뀔 때도 같이 처리

    useEffect(() => {
        if (!shouldPulse) return;

        setIsPulsing(true);
        const timer = setTimeout(() => setIsPulsing(false), 3000);

        return () => clearTimeout(timer);
    }, [shouldPulse]);


    const handleToggleClick = () => {
        onToggle();

        // CSS transition(flex-basis 0.2s)이 끝난 뒤에 resize 이벤트 발생
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 250); // transition 시간(0.2s)보다 살짝 여유있게
    };

    const handleResizeStart = useCallback(e => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const getClientX = e => {
            // 터치 이벤트와 마우스 이벤트의 좌표 위치가 다름
            return e.touches ? e.touches[0].clientX : e.clientX;
        };

        const handleMove = e => {
            const clientX = getClientX(e);
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, clientX));
            setPanelWidth(newWidth);
        };

        const handleEnd = () => {
            setIsResizing(false);
            window.dispatchEvent(new Event('resize'));
        };

        // 마우스 + 터치 둘 다 등록
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, {passive: false});
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isResizing]);

    return (
        <div
            className={classNames(styles.lessonPanelWrapper, {
                [styles.isCollapsed]: !isVisible,
                [styles.pulseWrapper]: isPulsing
                })}
            style={{
                '--lesson-color': lesson.color,
                flexBasis: isVisible ? `${panelWidth}px` : undefined
            }}
        >

            {/* <button className={styles.toggleButton} onClick={handleToggleClick}>
                {isVisible ? '◀' : '▶'}
            </button> */}
            <button
                className={classNames(styles.toggleButton, {[styles.pulse]: isPulsing})}
                onClick={handleToggleClick}
            >
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
                        <span>
                            <FormattedMessage
                                defaultMessage="All Lessons"
                                description="Button to toggle the full lesson list"
                                id="gui.lessonPanel.allLessons"
                            />
                        </span>
                        <span className={classNames(styles.lessonListChevron, {[styles.isOpen]: isLessonListOpen})}>
                            ▼
                        </span>
                    </button>

                    {isLessonListOpen && (
                        <ul className={styles.lessonList}>
                            {lessons.map((l, i) => {
                                const doneCount = (completedSteps[l.id] || []).length;
                                const totalCount = l.steps.length;
                                const isComplete = doneCount === totalCount;

                                return (
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
                                            <span className={styles.lessonListItemTitle}>{l.title}</span>
                                            <span className={classNames(styles.lessonProgressBadge, {
                                                [styles.lessonProgressBadgeComplete]: isComplete
                                            })}>
                                                {isComplete ? (
                                                    <FormattedMessage
                                                        defaultMessage="Done"
                                                        description="Badge shown when all steps in a lesson are completed"
                                                        id="gui.lessonPanel.lessonDone"
                                                    />
                                                ) : `${doneCount}/${totalCount}`}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
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
                            {steps.map((step, i) => {
                                const isDone = (completedSteps[lesson.id] || []).includes(step.id);

                                return (
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
                                            {isDone && <span className={styles.stepCheckmark}>✓</span>}
                                            {i + 1}. {step.stepTitle}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}




                    {lightboxImage && (
                        <div
                            className={styles.lightboxOverlay}
                            onClick={() => setLightboxImage(null)}
                        >
                            <img
                                className={styles.lightboxImage}
                                src={lightboxImage}
                                alt=""
                                onClick={e => e.stopPropagation()}  // 이미지 자체 클릭은 안 닫히게
                            />
                            <button
                                className={styles.lightboxClose}
                                onClick={() => setLightboxImage(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}




                    {/* 현재 스텝 콘텐츠 */}
                    {currentStep.content.map((block, i) => (
                        <ContentBlock
                            key={i}
                            block={block}
                            lessonId={lesson.id}
                            onLoadExample={onLoadExample}
                            onImageClick={setLightboxImage}   // 상태 setter를 그대로 넘김
                        />
                    ))}

                    <label className={styles.understandCheckbox}>
                        <input
                            type="checkbox"
                            checked={isCurrentStepDone}
                            onChange={onToggleComplete}
                        />
                        <span>
                            <FormattedMessage
                                defaultMessage="I understand"
                                description="Checkbox label to mark a step as understood"
                                id="gui.lessonPanel.understand"
                            />
                        </span>
                    </label>


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
                                <FormattedMessage
                                    defaultMessage="< Prev"
                                    description="Button to go to the previous step"
                                    id="gui.lessonPanel.prevStep"
                                />
                            </button>
                        )}
                        {hasNext && (
                            <button
                                className={classNames(styles.navButton, styles.navButtonNext)}
                                onClick={onNext}
                            >
                                <FormattedMessage
                                    defaultMessage="Next >"
                                    description="Button to go to the next step"
                                    id="gui.lessonPanel.nextStep"
                                />
                            </button>
                        )}
                    </div>


                   {/* 리사이즈 핸들 */}
                    <div
                        className={classNames(styles.resizeHandle, {[styles.isResizing]: isResizing})}
                        onMouseDown={handleResizeStart}
                        onTouchStart={handleResizeStart}   // 추가
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