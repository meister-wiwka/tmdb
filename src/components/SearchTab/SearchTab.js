import { Alert, Col, Input, Row } from 'antd';
import React, { Component } from 'react';
import debounce from 'lodash.debounce';

import TMDBservice from '../../services/TMDBservice';
import MovieList from '../MovieList';
import Spinner from '../Spinner';

export default class SearchTab extends Component {
  tmdbService = new TMDBservice();

  state = {
    request: '',
    page: 1,
    movieList: null,
    error: <Alert type="info" message="please enter movie name" />,
    loading: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const { request, page } = this.state;

    if (prevState.request !== request || prevState.page !== page) {
      this.setState({
        loading: true,
        error: null,
      });
      this.getMovies();
    }
  }

  getMovies = () => {
    const { request, page } = this.state;
    this.tmdbService
      .getMovies(request, page)
      .then((movieList) => {
        if (movieList.total_results === 0) {
          this.setState({
            error: <Alert type="info" message={`No results were found for "${request}"`} />,
          });
        }
        this.setState({
          movieList,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error: (
            <Alert
              type="error"
              message={error.name}
              description={`${error.message}. The service may not be available in your country.`}
            />
          ),
          loading: false,
        });
      });
  };

  onChangeRequest = (event) => {
    if (event.target.value.length === 0) {
      this.setState({
        error: (
          <Alert
            type="info"
            message="
                please enter movie name"
          />
        ),
      });
    } else {
      this.setState({
        request: event.target.value.trim(),
        page: 1,
      });
    }
  };

  onChangePage = (page) => {
    this.setState({
      page,
    });
  };

  render() {
    const { movieList, error, loading } = this.state;

    const hasData = !(loading || error);
    const spinner = loading ? <Spinner /> : null;
    const content = hasData ? <MovieList movies={movieList} onChangePage={this.onChangePage} /> : null;

    return (
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Input placeholder="Type to search..." onChange={debounce(this.onChangeRequest, 1000)} />
        </Col>
        <Col span={24}>
          {spinner}
          {error}
          {content}
        </Col>
      </Row>
    );
  }
}
