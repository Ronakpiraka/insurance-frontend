

import React, { Component } from 'react';
import './App.css';

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numAdults: 1,
      numChildren: 0,
      ages: [],
      cityTier: 'tier-1',
      tenure: '1-year',
      coverage: '500000',
    };
  }

  handleCalculatePremium = async () => {
    try {
      const { numAdults, numChildren, ages, cityTier, tenure, coverage } = this.state;
      const response = await fetch('http://localhost:5000/api/calculate-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numAdults,
          numChildren,
          ages,
          cityTier,
          tenure,
          coverage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      this.setState({ premium: data.premium });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  
  
  handleAgeValidation = (age, index, numAdults) => {
    console.log('Validating age:', age, 'Index:', index, 'NumAdults:', numAdults);
    age = parseInt(age);
    if (age < 18 || age > 90) {
      alert('Age for adults should be between 18 and 90.');
      this.handleAgeChange(index, '');
    } // Clear the age field
  };

  handleChildAgeValidation = (age, index, numAdults) => {
    console.log('Validating age:', age, 'Index:', index, 'NumAdults:', numAdults);
    age = parseInt(age);
    if (age < 0 || age > 18) {
      alert('Age for children should be between 0 and 18.');
      this.handleAgeChange(index, '');
    }
  };

  handleAdultChange = (numAdults) => {
    this.setState({ numAdults }, () => this.updateLocalStorage());
  };

  handleChildChange = (numChildren) => {
    this.setState({ numChildren }, () => this.updateLocalStorage());
  };

  handleAgeChange = (index, age) => {
    const { ages } = this.state;
    ages[index] = age;
    this.setState({ ages }, () => this.updateLocalStorage());
  };
  // Existing validation and change handlers

  updateLocalStorage = () => {
    const { numAdults, numChildren, ages, cityTier, tenure, coverage } = this.state;
    const identifier = numChildren > 0 ? `${numAdults}a,${numChildren}c` : `${numAdults}a`;
    localStorage.setItem('selectedIdentifier', identifier);
    localStorage.setItem('selectedAges', JSON.stringify(ages));
    localStorage.setItem('selectedTier', cityTier);
    localStorage.setItem('selectedTenure', tenure);
    localStorage.setItem('selectedCoverage', coverage);
  };

  componentDidMount() {
    const selectedIdentifier = localStorage.getItem('selectedIdentifier');
    if (selectedIdentifier) {
      const numAdults = parseInt(selectedIdentifier);
      const numChildren = selectedIdentifier.includes('c') ? parseInt(selectedIdentifier.split('c')[1]) : 0;
      this.setState({ numAdults, numChildren });
    }

    const selectedAges = localStorage.getItem('selectedAges');
    if (selectedAges) {
      this.setState({ ages: JSON.parse(selectedAges) });
    }

    const selectedTier = localStorage.getItem('selectedTier');
    if (selectedTier) {
      this.setState({ cityTier: selectedTier });
    }

    const selectedTenure = localStorage.getItem('selectedTenure');
    if (selectedTenure) {
      this.setState({ tenure: selectedTenure });
    }

    const selectedCoverage = localStorage.getItem('selectedCoverage');
    if (selectedCoverage) {
      this.setState({ coverage: selectedCoverage });
    }
  }

  render() {
    const { numAdults, numChildren, ages, cityTier, tenure, coverage, premium } = this.state;

    return (
      <div className="App">
        <h2>Health Insurance Premium Calculator</h2>
        <div>
          <label>Number of Adults:</label>
          <select value={numAdults} onChange={(e) => this.handleAdultChange(e.target.value)}>
            {Array.from({ length: 5 }, (_, index) => (
              <option key={index} value={index + 1}>{index + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Number of Children:</label>
          <select value={numChildren} onChange={(e) => this.handleChildChange(e.target.value)}>
            {Array.from({ length: 6 }, (_, index) => (
              <option key={index} value={index}>{index}</option>
            ))}
          </select>
        </div>

        {Array.from({ length: numAdults }, (_, index) => (
          <div key={index}>
            <label>Age of Adult {index + 1}:</label>
            <input
              type="number"
              value={ages[index] || ''}
              min={18}
              max={90}
              onChange={(e) => this.handleAgeChange(index, e.target.value)}
              onBlur={(e) => this.handleAgeValidation(e.target.value, index, numAdults)}
            />
          </div>
        ))
          .concat(
            numChildren > 0
              ? Array.from({ length: numChildren }, (_, index) => (
                <div key={index + numAdults}>
                  <label>Age of Child {index + 1}:</label>
                  <input
                    type="number"
                    value={ages[index + numAdults] || ''}
                    min={0}
                    max={18}
                    onChange={(e) => this.handleAgeChange(index + numAdults, e.target.value)}
                    onBlur={(e) => this.handleChildAgeValidation(e.target.value, index + numAdults, numAdults)}
                  />
                </div>
              ))
              : []
          )}

        <div>
          Select tier of your City:
          <select value={cityTier} onChange={(e) => this.setState({ cityTier: e.target.value })}>
            {['tier-1', 'tier-2'].map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Tenure:</label>
          <select value={tenure} onChange={(e) => this.setState({ tenure: e.target.value })}>
            {['1-year', '2-year', '3-year', '4-year', '5-year', '10-year'].map((tenure) => (
              <option key={tenure} value={tenure}>{tenure}</option>
            ))}
          </select>
        </div>


        <div>
          <label>Coverage: </label>
          <select value={coverage} onChange={(e) => this.setState({ coverage: e.target.value })}>
            {['500000', '700000', '1000000', '1500000', '2000000', '2500000', '3000000', '4000000', '5000000', '6000000', '7500000'].map((coverage) => (
              <option key={coverage} value={coverage}>{coverage}</option>
            ))}
          </select>
        </div>

        <button onClick={this.handleCalculatePremium}>Calculate Premium</button>
        {premium !== null && <p>Premium: {premium}</p>}
      </div>
    );
  }
}

export default Checkout;
