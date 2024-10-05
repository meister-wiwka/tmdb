import React, { Component } from 'react';
import { Alert, Tabs } from 'antd';

import TMDBservice from '../../services/TMDBservice';
import RatingContext from '../../contexts/RatingContext';
import SearchTab from '../SearchTab';
import MovieList from '../MovieList';
import Spinner from '../Spinner';

export default class TabsView extends Component {
  tmdbService = new TMDBservice();

  state = {
    ratedMovies: null,
    loading: true,
    ratingList: {},
    activeTab: '1',
    hasError: false,
    errorMessage: null,
  };

  componentDidMount() {
    this.initGuestData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeTab !== this.state.activeTab && this.state.activeTab === '2') {
      this.getRatedMovies(this.state.ratedMovies?.page || 1);
    }
  }

  initGuestData = () => {
    if (!JSON.parse(localStorage.getItem('guest_session_id'))) {
      this.tmdbService
        .newGuestSession()
        .then((id) => {
          localStorage.setItem('guest_session_id', JSON.stringify(id));
          this.getRatedMovies(1);
        })
        .catch((error) => {
          this.setState({
            hasError: true,
            errorMessage: error.message,
            loading: false,
          });
        });
    } else {
      this.getRatedMovies(1);
    }
  };

  getRatedMovies = (page = 1) => {
    this.setState({ loading: true });
    this.tmdbService
      .getRatedMovies(page)
      .then((res) => {
        if (res.total_results === 0) {
          this.setState({
            hasError: true,
            errorMessage: 'You havent rated any movies yet',
            loading: false,
          });
        }
        if (res.total_pages === 1) {
          this.getRatingList(res);
          this.setState({
            ratedMovies: res,
            loading: false,
          });
        } else {
          this.getAllRatedMovies(res);
        }
      })
      .catch((error) => {
        this.setState({
          hasError: true,
          errorMessage: `${error.message}. The service may not be available in your country.`,
          loading: false,
        });
      });
  };

  getAllRatedMovies = (res) => {
    const promises = [];
    const ratedMovies = res;

    for (let i = 2; i <= res.total_pages; i++) {
      promises.push(this.tmdbService.getRatedMovies(i));
    }
    Promise.all(promises)
      .then((response) => {
        response.forEach((elem) => {
          ratedMovies.results.push(...elem.results);
        });
        this.getRatingList(ratedMovies);
        this.setState({
          ratedMovies,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          hasError: true,
          errorMessage: `${error.message}. The service may not be available in your country.`,
          loading: false,
        });
      });
  };

  getRatingList = (ratedMovies) => {
    const res = ratedMovies.results.reduce((total, elem) => {
      total[elem.id] = elem.rating;
      return total;
    }, {});
    this.setState({
      ratingList: res,
    });
  };

  onChangePage = (page) => {
    this.setState({
      ratedMovies: { ...this.state.ratedMovies, page },
    });
  };

  onChangeRating = (movie, value) => {
    this.tmdbService.postRating(movie.id, value).catch((error) => console.log(error));
    if (!this.state.ratingList[movie.id]) {
      const newArr = [movie, ...this.state.ratedMovies.results];
      this.setState({
        ratedMovies: { ...this.state.ratedMovies, results: newArr },
        ratingList: { ...this.state.ratingList, [movie.id]: value },
        hasError: false,
      });
    } else {
      this.setState({
        ratingList: { ...this.state.ratingList, [movie.id]: value },
      });
    }
  };

  render() {
    const { ratedMovies, loading, ratingList, hasError, errorMessage } = this.state;

    const hasData = !(loading || hasError);
    const spinner = loading ? <Spinner /> : null;
    const content = hasData ? <MovieList movies={ratedMovies} onChangePage={this.onChangePage} /> : null;
    const error = hasError ? <Alert type="error" message={errorMessage} /> : null;

    const items = [
      {
        label: 'Search',
        key: '1',
        children: <SearchTab />,
      },
      {
        label: 'Rated',
        key: '2',
        children: (
          <>
            {spinner}
            {error}
            {content}
          </>
        ),
      },
    ];

    return (
      <RatingContext.Provider
        value={{
          ratingList,
          onChangeRating: this.onChangeRating,
        }}
      >
        <Tabs
          onChange={(key) => this.setState({ activeTab: key })}
          defaultActiveKey="1"
          items={items}
          centered
          tabBarStyle={{ marginLeft: 'auto', marginRight: 'auto' }}
        />
      </RatingContext.Provider>
    );
  }
}
