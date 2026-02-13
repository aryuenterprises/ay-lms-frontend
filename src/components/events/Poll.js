import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/Poll.css';
import PropTypes from 'prop-types';

const Poll = ({
  question,
  options = [],
  pollId,
  onVote,
  selectedOption: externalSelectedOption,
  disabled = false,
  showResults = false,
  userVotes = {},
  allowMultiple = false,
  theme = 'default'
}) => {
  const [selectedOptions, setSelectedOptions] = useState(
    externalSelectedOption !== undefined ? (allowMultiple ? externalSelectedOption : [externalSelectedOption]) : []
  );

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionRefs = useRef([]);

  // Calculate total votes
  const totalVotes = Object.values(userVotes).reduce((sum, count) => sum + count, 0);

  // Handle keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  const handleVote = (optionIndex) => {
    if (disabled || showResults) return;

    let newSelected;

    if (allowMultiple) {
      // Toggle option in array for multiple selection
      newSelected = selectedOptions.includes(optionIndex)
        ? selectedOptions.filter((opt) => opt !== optionIndex)
        : [...selectedOptions, optionIndex];
    } else {
      // Single selection
      newSelected = selectedOptions.includes(optionIndex) ? [] : [optionIndex];
    }

    setSelectedOptions(newSelected);

    // Callback to parent component
    if (onVote) {
      onVote({
        pollId,
        selectedOption: allowMultiple ? newSelected : newSelected[0] || null,
        optionIndex
      });
    }
  };

  const handleKeyDown = (e, optionIndex) => {
    if (disabled || showResults) return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        handleVote(optionIndex);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
      default:
        break;
    }
  };

  const handleOptionClick = (e, optionIndex) => {
    e.preventDefault();
    handleVote(optionIndex);
  };

  const handleOptionFocus = (index) => {
    setFocusedIndex(index);
  };

  // Calculate percentage for each option
  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className={`poll-container poll-theme-${theme} ${showResults ? 'show-results' : ''}`}>
      <h3 className="poll-question">{question}</h3>

      <div className="poll-options" role="radiogroup" aria-label={question}>
        {options.map((option, index) => {
          const votes = userVotes[index] || 0;
          const percentage = calculatePercentage(votes);
          const isSelected = selectedOptions.includes(index);
          const optionId = `${pollId}-option-${index}`;

          return (
            <div
              key={index}
              ref={(el) => (optionRefs.current[index] = el)}
              id={optionId}
              className={`poll-option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={(e) => handleOptionClick(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => handleOptionFocus(index)}
              tabIndex={disabled || showResults ? -1 : 0}
              role={allowMultiple ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              aria-disabled={disabled || showResults}
              aria-label={`${option.text || option}. ${showResults ? `${percentage}% of votes` : ''}`}
              aria-describedby={showResults ? `${optionId}-results` : undefined}
            >
              <div className="poll-option-content">
                {showResults && (
                  <div className="vertical-bar-container">
                    <div className="vertical-bar" style={{ height: `${percentage}%` }} aria-hidden="true" />
                    <span className="vertical-percentage">{percentage}%</span>
                  </div>
                )}

                <div className="poll-option-text">
                  {!showResults && (
                    <span className="poll-checkbox" aria-hidden="true">
                      {allowMultiple ? (
                        <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>{isSelected && '✓'}</div>
                      ) : (
                        <div className={`custom-radio ${isSelected ? 'checked' : ''}`} />
                      )}
                    </span>
                  )}
                  <span className="option-label">{option.text || option}</span>
                </div>

                {showResults && (
                  <div className="poll-results" id={`${optionId}-results`}>
                    <div className="poll-stats">
                      <span className="votes">
                        {votes} vote{votes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showResults && totalVotes > 0 && (
        <div className="poll-total-votes" aria-live="polite" aria-atomic="true">
          Total votes: {totalVotes}
        </div>
      )}
    </div>
  );
};

Poll.propTypes = {
  pollId: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  userVotes: PropTypes.arrayOf(PropTypes.number).isRequired,
  totalVotes: PropTypes.number.isRequired,
  onVote: PropTypes.func,
  allowMultiple: PropTypes.bool,
  disabled: PropTypes.bool,
  showResults: PropTypes.bool,
  theme: PropTypes.string,
  selectedOption: PropTypes.array
};

export default Poll;
