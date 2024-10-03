import { Card, Image, Typography, Progress } from 'antd';
import { format } from 'date-fns';
import React, { Component } from 'react';

import TMDBservice from '../../services/TMDBservice';
import Rating from '../Rating';
import Genres from '../Genres';
import Spinner from '../Spinner';

import noPoster from './no-poster.svg';

import './MovieCard.css';

const { Title, Text, Paragraph } = Typography;

export default class MovieCard extends Component {
  tmdbService = new TMDBservice();

  state = {
    poster: null,
    loading: true,
    error: false,
  };

  componentDidMount() {
    if (this.props.movie.poster_path) {
      this.getPoster(this.props.movie.poster_path);
    } else {
      this.setState({
        poster: noPoster,
        loading: false,
      });
    }
  }

  getPoster = (path) => {
    this.tmdbService
      .getPoster(path)
      .then((res) => {
        this.setState({
          poster: URL.createObjectURL(res),
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          poster: noPoster,
          loading: false,
        });
      });
  };

  setColor = (value) => {
    if (value < 3) {
      return '#E90000';
    } else if (value > 3 && value < 5) {
      return '#E97E00';
    } else if (value > 5 && value < 7) {
      return '#E9D100';
    } else {
      return '#66E900';
    }
  };

  render() {
    const { poster, loading } = this.state;
    const { movie } = this.props;
    const { title, vote_average, release_date, genre_ids, overview } = movie;

    const date = release_date ? format(new Date(release_date), 'LLLL d, y') : 'release date unknown';
    const spinner = (
      <div className="card__image">
        <Spinner />
      </div>
    );
    const moviePoster = <Image src={poster} preview={false} rootClassName="card__image" alt={title} />;
    const content = loading ? spinner : moviePoster;

    return (
      <Card className="card">
        {content}
        <Title level={4} ellipsis={{ rows: 2 }} className="card__title">
          {title}
        </Title>
        <Progress
          type="circle"
          format={() => vote_average.toFixed(1)}
          width={40}
          trailColor={this.setColor(vote_average)}
          className="card__progress"
        />
        <Text className="card__date">{date}</Text>
        <Genres genre_ids={genre_ids} />
        <Paragraph ellipsis={{ rows: 3 }} className="card__overview">
          {overview}
        </Paragraph>
        <Rating movie={movie} />
      </Card>
    );
  }
}
