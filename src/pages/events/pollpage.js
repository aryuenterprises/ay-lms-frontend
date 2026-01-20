// App.js
import React, { useState, useEffect } from 'react';
import Poll from '../../components/events/Poll';
import { pollQuestions, getInitialPollState } from './pollQuestions';
import 'assets/css/Poll.css';

function PollPage() {
  const [polls, setPolls] = useState(getInitialPollState());
  const [showResults, setShowResults] = useState({});

  // Simulate loading existing votes (from API or localStorage)
  useEffect(() => {
    const savedVotes = localStorage.getItem('pollVotes');
    if (savedVotes) {
      setPolls(JSON.parse(savedVotes));
    }
  }, []);

  // Save votes to localStorage
  useEffect(() => {
    localStorage.setItem('pollVotes', JSON.stringify(polls));
  }, [polls]);

  const handleVote = ({ pollId, selectedOption, optionIndex }) => {
    setPolls((prev) => {
      const poll = { ...prev[pollId] };
      const allowMultiple = poll.allowMultiple;

      if (allowMultiple) {
        // For multiple selection
        poll.userVotes = { ...poll.userVotes };
        selectedOption.forEach((optIndex) => {
          poll.userVotes[optIndex] = (poll.userVotes[optIndex] || 0) + 1;
        });
      } else {
        // For single selection
        if (selectedOption !== null) {
          poll.userVotes[optionIndex] = (poll.userVotes[optionIndex] || 0) + 1;
        }
      }

      return {
        ...prev,
        [pollId]: poll
      };
    });
  };

  const toggleResults = (pollId) => {
    setShowResults((prev) => ({
      ...prev,
      [pollId]: !prev[pollId]
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Voting Polls</h1>
        <p>Click on options to vote. Each poll can have different settings.</p>
      </header>

      <main className="polls-container">
        {pollQuestions.map((poll) => (
          <div key={poll.id} className="poll-wrapper">
            <Poll
              pollId={poll.id}
              question={poll.question}
              options={poll.options.map((opt) => opt.text)}
              onVote={handleVote}
              userVotes={polls[poll.id]?.userVotes || {}}
              showResults={showResults[poll.id] || false}
              allowMultiple={poll.allowMultiple}
              theme={poll.theme}
            />

            <div className="poll-controls">
              <button className="results-toggle-btn" onClick={() => toggleResults(poll.id)}>
                {showResults[poll.id] ? 'Hide Results' : 'Show Results'}
              </button>

              <div className="poll-type-badge">{poll.allowMultiple ? 'Multiple Choice' : 'Single Choice'}</div>
            </div>
          </div>
        ))}
      </main>

      <div className="app-footer">
        <p>Total Polls: {pollQuestions.length}</p>
      </div>
    </div>
  );
}

export default PollPage;
