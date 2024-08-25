import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import LinkCard from './Card';
import Header from './header';
import FilterComponent from './FilterComponent';
import Pagination from '@mui/material/Pagination';
import ResponsiveAppBar from './menu';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import SortIcon from '@mui/icons-material/Sort';
import Logos from './Logos';
import { config } from './config';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [uniqueWebsites, setUniqueWebsites] = useState([]);
  const [itemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSubFilters, setCurrentSubFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('BI');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedState, setSelectedState] = useState('');
  const [subFilterLogic, setSubFilterLogic] = useState('OR');

  const isInitialMount = useRef(true);
  const fetchTimeoutRef = useRef(null);

  const categorySubFilters = useMemo(() => ({
    Analytics: [
      ['Python'], 
      ['Pandas'], 
      ['Jupyter'], 
      ['Polars']
    ],
    BI: [
      ['Power BI', 'powerbi', 'POWERBI', 'PowerBI', 'power bi'], 
      ['Snowflake'], 
      ['Dynamics 365', 'D365'], 
      ['Dashboard', 'dashboard'], 
      ['DAX', 'dax'], 
      ['Power Query', 'Power Query', 'PowerQuery', 'powerquery', 'power query']
    ],
    Cloud: [
      ['Azure Fabric', 'AzureFabric', 'azure'], 
      ['BigQuery', 'Big Query'], 
      ['Synapse'], 
      ['AWS'], 
      ['Data Factory']
    ],
    'Machine Learning': [
      ['Scikit-Learn', 'Scikit Learn', 'ScikitLearn'], 
      ['R', 'R Language', 'R Programming'], 
      ['AutoML'], 
      ['Colab'], 
      ['TensorFlow'], 
      ['Keras']
    ],
  }), []);

  const keywordVariationsMap = useMemo(() => {
    const map = {};
    Object.values(categorySubFilters).forEach(subFilters => {
      subFilters.forEach(subFilterArray => {
        map[subFilterArray[0]] = subFilterArray;
      });
    });
    return map;
  }, [categorySubFilters]);

  const fetchArticlesConsideringAllFilters = useCallback(async () => {
    console.log('Fetching articles with:', { currentCategory, selectedFilters, selectedWebsites, selectedState, sortOrder, searchQuery, subFilterLogic });
    const queryParameters = new URLSearchParams();

    if (currentCategory !== 'All Articles') {
      queryParameters.append('field', currentCategory);
    }

    if (selectedFilters.length > 0) {
      const combinedQuery = selectedFilters.map(group => group.join('|')).join(subFilterLogic === 'OR' ? '|' : ' ');
      queryParameters.append('curedKeyword', combinedQuery);
    }

    if (selectedWebsites.length > 0) {
      queryParameters.append('website', selectedWebsites.join(','));
    }

    if (searchQuery) {
      queryParameters.append('curedName', searchQuery);
    }

    if (selectedState) {
      queryParameters.append('state', selectedState);
    }

    queryParameters.append('sortOrder', sortOrder);

    const requestUrl = `${config.apiUrl}/api/articles?${queryParameters.toString()}`;


    try {
      const response = await fetch(requestUrl);
      const data = await response.json();
      setArticles(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  }, [currentCategory, selectedFilters, selectedWebsites, selectedState, sortOrder, searchQuery, subFilterLogic]);

  const debouncedFetchArticles = useCallback(() => {
    console.log('Debounced fetch triggered');
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchArticlesConsideringAllFilters();
    }, 300);
  }, [fetchArticlesConsideringAllFilters]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  }, []);

  const handleStateFilterChange = useCallback((state) => {
    console.log('State filter changed:', state);
    setSelectedState(state);
  }, []);

  const handleFilterSelection = useCallback((selectedPrimaryKeywords) => {
    console.log('Filter selection changed:', selectedPrimaryKeywords);
    const allVariations = selectedPrimaryKeywords.map(
      keyword => keywordVariationsMap[keyword] || [keyword]
    );
    setSelectedFilters(allVariations);
  }, [keywordVariationsMap]);

  const handleWebsiteSelect = useCallback((websites) => {
    console.log('Website selection changed:', websites);
    setSelectedWebsites(websites);
  }, []);

  const handleSearch = useCallback((query) => {
    console.log('Search query changed:', query);
    setSearchQuery(query);
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);

  const onCategoryChange = useCallback((category) => {
    console.log('Category changed:', category);
    setCurrentCategory(category);
    setSelectedState('');
    setSelectedFilters([]);
    setSelectedWebsites([]);

    if (category === 'All Articles') {
      setCurrentSubFilters([]);
    } else {
      const newSubFilters = categorySubFilters[category] || [];
      setCurrentSubFilters(newSubFilters);
    }

    fetch(`${config.apiUrl}/api/websites?field=${encodeURIComponent(category)}`)

      .then(response => response.json())
      .then(websitesData => setUniqueWebsites(websitesData))
      .catch(error => console.error('Error fetching websites:', error));

  }, [categorySubFilters]);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Initial mount, fetching initial data');
      isInitialMount.current = false;
      onCategoryChange(currentCategory);
    } else {
      console.log('State changed, triggering debounced fetch');
      debouncedFetchArticles();
    }
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [currentCategory, selectedFilters, selectedWebsites, selectedState, sortOrder, searchQuery, debouncedFetchArticles, onCategoryChange]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setDisplayedArticles(articles.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, itemsPerPage, articles]);

  const primaryKeywords = useMemo(() => currentSubFilters.map(subFilterGroup => subFilterGroup[0]), [currentSubFilters]);

  const paginationContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  };

  return (
    <>
      <ResponsiveAppBar onCategoryChange={onCategoryChange} />
      <Logos />
      <Header
        onSearch={handleSearch}
        websites={uniqueWebsites}
        onWebsiteSelect={handleWebsiteSelect}
        onStateFilterChange={handleStateFilterChange}
        onCategoryChange={onCategoryChange}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
      />
      <IconButton variant="contained" onClick={toggleSortOrder} aria-label="sort">
        <SortIcon />
        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
      </IconButton>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '20%', minWidth: '200px' }}>
          <FilterComponent 
            subFilters={primaryKeywords} 
            onFilterSelect={handleFilterSelection}   
            subFilterLogic={subFilterLogic} 
            setSubFilterLogic={setSubFilterLogic} 
          />
        </div>
        <Grid container spacing={2} style={{ flex: 1, padding: 20 }}>
          {displayedArticles.map((article, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <LinkCard
                title={article.cured_name || 'No Title'}
                content={article.lastmod ? new Date(article.lastmod).toLocaleDateString() : 'No Date'}
                link={article.loc}
                website={article.website}
                date={new Date(article.lastmod)}
                daysAgo={article.daysAgo}
                id={article._id}
                state={article.state}
              />
            </Grid>
          ))}
        </Grid>
      </div>
      <div style={paginationContainerStyle}>
        <Pagination
          count={Math.ceil(articles.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </div>
    </>
  );
};

export default React.memo(App);