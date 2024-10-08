import React, { useState, useCallback } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Chip, Button } from '@mui/material';
import CategoryButtons from './Buttons';

const categoryButtonsWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const headerStyle = {
  backgroundImage: `url('/icons/nyc.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100%',
  height: '400px',
  display: 'flex',
  padding: '20px',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  color: 'black',
  fontSize: '2em',
  backgroundColor: 'black'
};

const searchContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'flex-end',
  alignItems: 'flex-start',
  width: '100%',
  marginTop: 'auto',
};

const textFieldStyle = {
  backgroundColor: 'white',
  borderRadius: '4px',
};

const selectStyle = {
  backgroundColor: 'white',
  borderRadius: '4px',
};

const Header = ({ appName, onSearch, websites, onWebsiteSelect, articleTypes, onTypeSelect, onStateFilterChange, onCategoryChange }) => {
  const debouncedOnSearch = useCallback((inputValue) => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onSearch(inputValue);
      }, 500);
    };
  }, [onSearch]);

  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  const handleStateButtonClick = (state) => {
    setSelectedState(state);
    onStateFilterChange(state);
  };

  const handleClearStateFilter = () => {
    setSelectedState('');
    onStateFilterChange('');
  };

  const handleWebsiteChange = (event) => {
    const newSelectedWebsites = event.target.value;
    setSelectedWebsites(newSelectedWebsites);
    onWebsiteSelect(newSelectedWebsites);
  };

  const handleCategoryChange = (category) => {
    setSelectedState('');
    onCategoryChange(category);
  };

  const renderChips = (selected) => selected.map((value) => <Chip key={value} label={value} />);

  return (
    <header style={headerStyle}>
      {appName}

      <div style={categoryButtonsWrapperStyle}>
        <CategoryButtons onCategorySelect={handleCategoryChange} />
      </div>

      <div style={searchContainerStyle}>
        <TextField 
          fullWidth
          label="Search articles..."
          variant="outlined"
          onChange={(e) => debouncedOnSearch(e.target.value)()}
          style={textFieldStyle}
          sx={{ mb: 4, maxWidth: 400 }}
        /> 
        <FormControl fullWidth style={selectStyle} sx={{ mb: 4, maxWidth: 400 }}>
          <InputLabel id="websites-label">Websites</InputLabel>
          <Select
            labelId="websites-label"
            multiple
            value={selectedWebsites}
            onChange={handleWebsiteChange}
            renderValue={renderChips}
          >
            {websites.map((website) => (
              <MenuItem key={website} value={website}>
                {website}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {['Urgent', 'Reading List', 'Archive', 'Toolbox'].map((state) => (
            <Button
              key={state}
              onClick={() => handleStateButtonClick(state)}
              sx={{
                color: 'black',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                },
              }}
              variant={selectedState === state ? "contained" : "outlined"}
            >
              {state}
            </Button>
          ))}
          <Button
            onClick={handleClearStateFilter}
            sx={{
              color: 'black',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:active': {
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
              },
            }}
            variant="outlined"
          >
            Clear
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;