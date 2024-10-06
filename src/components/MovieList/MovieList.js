import { List } from 'antd';
import React from 'react';

import MovieCard from '../MovieCard';
import TMDBservice from '../../services/TMDBservice'; // Импортируем сервис

const MovieList = ({ movies, onChangePage }) => {
  const { results, total_pages, page } = movies;

  const getPoster = (path) => {
    const tmdbService = new TMDBservice();
    return tmdbService.getPoster(path);
  };

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 2,
        xxl: 2,
      }}
      dataSource={results}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <MovieCard movie={item} vote_average={item.vote_average} getPoster={getPoster} />
        </List.Item>
      )}
      pagination={{
        showSizeChanger: false,
        hideOnSinglePage: true,
        pageSize: 20,
        current: page,
        total: total_pages * 20,
        onChange: onChangePage,
        style: { textAlign: 'center' },
      }}
    />
  );
};

export default MovieList;
