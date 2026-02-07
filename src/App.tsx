import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.scss';
import { Person } from './types/Person';
import { peopleFromServer } from './data/people';
import debounce from 'lodash.debounce';

export const App: React.FC = () => {
  //const { name, born, died } = peopleFromServer[0];
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyQuery = useMemo(
  () =>
    debounce((value: string) => {
      setAppliedQuery(value);
    }, 300),
  [],
);
  useEffect(() => {
    return () => {
      applyQuery.cancel();
    };
  }, [applyQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestion = useMemo(() => {
    if (isOpen && query.trim() === '') {
      return peopleFromServer;
    }

    if (!appliedQuery.trim()) {
      return [];
    }

    return peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(appliedQuery.toLowerCase()),
    );
  }, [appliedQuery, query, isOpen]);

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;

    if (newQuery === query) {
      return;
    }
    setQuery(newQuery);
    setSelected(null);
    //onSelected(null);
    setIsOpen(true);
    applyQuery(newQuery);
  };
  const handleSelect = (person: Person) => {
    setSelected(person);
    setQuery(person.name);
    setIsOpen(false);
    //onSelected(person);
  };


  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selected
            ? `${selected.name} (${selected.born} - ${selected.died})`
            : 'No selected person'}
        </h1>

        <div className={`dropdown ${isOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <input
              ref = {inputRef}
              type="text"
              className="input"
              placeholder="Enter a part of the name"
              value={query}
              data-cy="search-input"
              onChange={handleQueryChange}
              onFocus={() => setIsOpen(true)}
            />
          </div>

          <div className="dropdown-menu"
          role="menu"
          >
            <div className="dropdown-content"
            data-cy="suggestions-list">
              {suggestion.map((person) => (
                <div
                  key={person.slug}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onClick={() => handleSelect(person)}
                >
                  <p className="has-text-link">{person.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isOpen && query !== '' && suggestion.length === 0 && (
          <div
          className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
          role="alert"
          data-cy="no-suggestions-message"
        >
          <p className="has-text-danger">No matching suggestions</p>
        </div>
        )}
      </main>
    </div>
  );
}
