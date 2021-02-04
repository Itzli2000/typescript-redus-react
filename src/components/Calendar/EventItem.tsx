/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useEffect, useRef, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { addZero } from '../../lib/utils';
import { deleteUserEvent, updateUserEvent, UserEvent } from '../../redux/user-events';

interface Props {
  event: UserEvent;
}

const EventItem: React.FC<Props> = ({ event }) => {
  const dispatch = useDispatch();
  const hanldeDelete = () => {
    dispatch(deleteUserEvent(event.id));
  };

  const [editable, setEditable] = useState(false);
  const clickHandler = () => {
    setEditable(true);
  };

  const [title, setTitle] = useState(event.title);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const updateTitle = () => {
    if (title !== event.title) {
      dispatch(updateUserEvent({ ...event, title }));
    }
    setEditable(false);
  };

  const getDuration = ():string => {
    const hourStar = new Date(event.dateStart).getHours();
    const minutesStart = new Date(event.dateStart).getMinutes();
    const secondsStar = new Date(event.dateStart).getSeconds();
    const hourEnd = new Date(event.dateEnd).getHours();
    const minutesEnd = new Date(event.dateEnd).getMinutes();
    const secondsEnd = new Date(event.dateEnd).getSeconds();

    return `${addZero(hourStar)}:${addZero(minutesStart)}:${addZero(secondsStar)} - ${addZero(hourEnd)}:${addZero(minutesEnd)}:${addZero(secondsEnd)}`;
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);

  const [duration, setDuration] = useState<undefined | string>(undefined);
  useEffect(() => {
    if (!duration) {
      const durationString = getDuration;
      setDuration(durationString);
    }
  }, [duration]);

  return (
    <div className="calendar-event">
      <div className="calendar-event-info">
        <div className="calendar-event-time">
          {duration}
        </div>
        <div className="calendar-event-title">
          {
            editable
              ? <input onChange={handleChange} onBlur={updateTitle} ref={inputRef} type="text" value={title} />
              : <span onClick={clickHandler}>{event.title}</span>
          }
        </div>
      </div>
      <button onClick={hanldeDelete} type="button" className="calendar-event-delete-button">&times;</button>
    </div>
  );
};

export default EventItem;
