import { Card, Image, Typography, Progress } from 'antd';
import { format } from 'date-fns';
import React from 'react';

import Rating from '../Rating';
import Genres from '../Genres';
import Spinner from '../Spinner';

import noPoster from './no-poster.svg';

import './MovieCard.css';

const { Title, Text, Paragraph } = Typography;

const setColor = (value) => {
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

export default function MovieCard({ movie, getPoster }) {
  const [poster, setPoster] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (movie.poster_path) {
      getPoster(movie.poster_path)
        .then((res) => {
          setPoster(URL.createObjectURL(res));
          setLoading(false);
        })
        .catch(() => {
          setPoster(noPoster);
          setLoading(false);
        });
    } else {
      setPoster(noPoster);
      setLoading(false);
    }
  }, [movie.poster_path, getPoster]);

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
        trailColor={setColor(vote_average)}
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
