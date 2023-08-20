import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numAdults: 1,
      numChildren: 0,
      ages: [],
      cityTier: 'tier-1',
      tenure: '1-year',
      coverage: '500000',
      premium: {}, // Your premium data
      totalPremium: 0, // Total premium amount
      isAddedToCart: false,
      isPurchased: false,
      isPremiumCalculated: false,
    };
  }


  handleredirectcheckoutpage = () => {
    
    const totalPremium = this.state.premium;
    this.setState({ isAddedToCart: true })
    if (totalPremium !== 0) {
      console.log("Total Premium:", totalPremium);
      
    }
  };

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
      const premiumData = {};
      const updatedPremiumData = {}; // To store updated premium with discounts
      let totalPremium = 0;
      const maxAge = Math.max(...ages.filter(age => age !== null)); // Find the maximum age
      console.log(maxAge, "yeh aa rhi hai")
      data.forEach(([age, premium], index) => {
        const premiumEntry = {};
        const updatedPremiumEntry = {};

        if (age == maxAge) {
          const floaterDiscount = 0;
          premiumEntry.floaterDiscount = floaterDiscount;
          premiumEntry.discountedRate = premium * (100 - floaterDiscount) / 100;
          premiumEntry.premium = premium
        }
        else {
          const floaterDiscount = 50;
          premiumEntry.floaterDiscount = floaterDiscount;
          premiumEntry.discountedRate = premium * (100 - floaterDiscount) / 100;
          premiumEntry.premium = premium
        }

        premiumData[age] = premiumEntry;
        updatedPremiumData[age] = premium - (premiumEntry.discountedRate); // Update premium with discount
        totalPremium += premiumEntry.discountedRate;

      })
      this.setState({
        premium: premiumData,
        updatedPremium: updatedPremiumData,
        totalPremium,
        isAddedToCart: false,
        isPremiumCalculated: true,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  handlePurchase = () => {
    
    this.setState({ isPurchased: true });
    
    setTimeout(() => {
      this.setState({
        isAddedToCart: false,
        isPurchased: false,
        totalPremium: 0, // Reset total premium
        
      });
      window.location.reload()
    }, 5000);
  };

  

  handleChildValidation = (age, index, numChildren) => {
    console.log('Validating age:', age, 'Index:', index, 'NumChildren:', numChildren);
    age = parseInt(age);
    if (age < 0 || age > 18) {
      alert('Age for Children should be between 0 and 18.');
      this.handleChildChange(index, '');
    }
  };

  handleAdultChange = (numAdults) => {
    this.setState({ numAdults }, () => this.updateLocalStorage());
  };

  handleAgeValidation = (age, index, numAdults) => {
    console.log('Validating age:', age, 'Index:', index, 'NumAdults:', numAdults);
    age = parseInt(age);
    if (age < 18 || age > 90) {
      alert('Age for adults should be between 18 and 90.');
      this.handleAgeChange(index, '');
    }
  };

  handleChildChange = (numChildren) => {
    this.setState({ numChildren }, () => this.updateLocalStorage());
  };



  handleAgeChange = (index, age) => {
    const { ages } = this.state;
    ages[index] = age !== '' ? age : null;
    this.setState({ ages }, () => this.updateLocalStorage());
  };

  updateLocalStorage = () => {
    const { numAdults, numChildren, ages, cityTier, tenure, coverage } = this.state;
    const identifier = numChildren > 0 ? `${numAdults}a,${numChildren}c` : `${numAdults}a`;
    const filteredAges = ages.filter(age => age !== null);
    localStorage.setItem('selectedIdentifier', identifier);
    localStorage.setItem('selectedAges', JSON.stringify(ages));
    localStorage.setItem('selectedTier', cityTier);
    localStorage.setItem('selectedTenure', tenure);
    localStorage.setItem('selectedCoverage', coverage);
  };



  componentDidMount() {
    localStorage.removeItem('selectedAges');
    localStorage.removeItem('selectedIdentifier');

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
    const { numAdults, numChildren, ages, cityTier, tenure, coverage, premium, isPremiumCalculated } = this.state;
    const ageRow = [];
    const premiumRow = [];
    const floaterDiscountRow = [];
    const discountedRateRow = [];

    for (const age in this.state.premium) {
      const premiumEntry = this.state.premium[age];
      const updatedPremiumEntry = this.state.updatedPremium[age];
      const { premium, floaterDiscount, discountedRate } = premiumEntry;

      ageRow.push(<td key={age}>{age}</td>);
      premiumRow.push(<td key={age}>{premiumEntry.premium}</td>);
      floaterDiscountRow.push(<td key={age}>{(discountedRate/premium)*100}%</td>);

      discountedRateRow.push(<td key={age}>{premiumEntry.discountedRate}</td>);
    }


    return (
      
      <div className="App">
        
        <h2>Health Insurance Premium Calculator</h2>
        <table align='CENTER'>
          {/* <thead> */}
          {/* </thead> */}
          <tbody align='LEFT'>
            <tr>
              <td>
                <label>Number of Adults:</label>
              </td>
              <td>
                <select value={numAdults} onChange={(e) => this.handleAdultChange(e.target.value)}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <option key={index} value={index + 1}>{index + 1}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <label>Number of Children:</label>
              </td>
              <td>
                <select value={numChildren} onChange={(e) => this.handleChildChange(e.target.value)}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <option key={index} value={index}>{index}</option>
                  ))}
                </select>
              </td>
            </tr>
            {Array.from({ length: numAdults }, (_, index) => (
              <tr key={index}>
                <td>
                  <label>Age of Adult {index + 1}:</label>
                </td>
                <td>
                  <input
                    type="number"
                    value={ages[index] || ''}
                    min={18}
                    max={90}
                    onChange={(e) => this.handleAgeChange(index, e.target.value)}
                    onBlur={(e) => this.handleAgeValidation(e.target.value, index, numAdults)}
                  />
                </td>
              </tr>
            ))}
            {Array.from({ length: numChildren }, (_, index) => (
              <tr key={index + numAdults}>
                <td>
                  <label>Age of Child {index + 1}:</label>
                </td>
                <td>
                  <input
                    type="number"
                    value={ages[index + + numAdults] || ''}
                    min={0}
                    max={18}
                    onChange={(e) => this.handleAgeChange(index + + numAdults, e.target.value)}
                    onBlur={(e) => this.handleChildValidation(e.target.value, index + + numAdults, numChildren)}
                  />
                </td>
              </tr>
            ))}

            <tr>
              <td>
                <label>Select tier of your City:</label>
              </td>
              <td>
                <select value={cityTier} onChange={(e) => this.setState({ cityTier: e.target.value })}>
                  {['tier-1', 'tier-2'].map((tier) => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <label>Tenure:</label>
              </td>

              <td>
                <select value={tenure} onChange={(e) => this.setState({ tenure: e.target.value })}>
                  {['1-year', '2-year', '3-year', '4-year', '5-year', '10-year'].map((tenure) => (
                    <option key={tenure} value={tenure}>{tenure}</option>
                  ))}
                </select></td>
            </tr>


            <tr>
              <td>
                <label>Coverage: </label>
              </td>
              <td>
                <select value={coverage} onChange={(e) => this.setState({ coverage: e.target.value })}>
                  {['500000', '700000', '1000000', '1500000', '2000000', '2500000', '3000000', '4000000', '5000000', '6000000', '7500000'].map((coverage) => (
                    <option key={coverage} value={coverage}>{coverage}</option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
                    <br/>
        <div>
          <button onClick={this.handleCalculatePremium}>Calculate Premium</button><br/><br/>
          {isPremiumCalculated && (
          <table align='center'>
            <thead ></thead>
            <tbody align='left'>

              <tr>
                <td><b>Age</b></td>
                {ageRow}
              </tr>
              <tr>
                <td><b>Premium</b></td>
                {premiumRow}
              </tr>
              <tr>
                <td><b>Floater Discount</b></td>
                {floaterDiscountRow}
              </tr>
              <tr>
                <td><b>Discounted rate</b></td>
                {discountedRateRow}
              </tr>
              <tr>
                <td><b>Total Premium</b></td>
                <td>{this.state.totalPremium.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          )}
        </div>

        <br/>
        {this.state.totalPremium > 0 && (
          <button onClick={this.handleredirectcheckoutpage}>
            Add to cart
          </button>
        )}<br/>
        {this.state.isAddedToCart && (
          <div>
            <p>
              Your insurance has been added to the cart for {this.state.numAdults} adults and {this.state.numChildren} children
              for an amount of {this.state.totalPremium}. <br/>
              If you wish to purchase the same, please click on the purchase button below.
            </p>
            {!this.state.isPurchased ? (
              <button onClick={this.handlePurchase}>Purchase Insurance</button>
            ) : (
              <p><b style={{ color: 'red' }}>Thank you for purchasing the Insurance. you will now be Redirected to home page....</b></p>
            )}
            
          </div>
        )}
      </div >
    );
  }
}

export default App;
