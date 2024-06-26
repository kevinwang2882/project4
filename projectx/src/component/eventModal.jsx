import React, { useState, useEffect } from 'react';
import { deleteEvent, updateEvent,createLike } from '../api/event';
import {createComment,getComment} from '../api/comment'
import { FaStar } from "react-icons/fa";
import '../Style/eventModel.css';
import { useCommentContext } from './comment';


const EventModal = React.forwardRef((props, ref) => {
  const { content, setContent } = useCommentContext();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [like, setlike] = useState(0);
  const [dislike, setdislike] = useState(0);
  const [likeactive, setlikeactive] = useState(false);
  const [dislikeactive, setdislikeactive] = useState(false);

  const handleLike = async () => {
    try {
      // Pass true to indicate a like action
      const response = await createLike(props.details._id, props.user.user._id, 'like');
  
      if (response.message === 'Action saved successfully') {
        if (likeactive) {
          setlikeactive(false);
          setlike(like - 1);
        } else {
          setlikeactive(true);
          setlike(like + 1);
          if (dislikeactive) {
            setdislikeactive(false);
            setdislike(dislike - 1);
          }
        }
      } else {
        // Handle error, such as displaying a message to the user
        console.error('Error liking event:', response.message);
      }
    } catch (error) {
      console.error('Error liking event:', error);
    }
  };
  
  const handleDislike = async () => {
    try {
      // Pass true to indicate a like action
      const response = await createLike(props.details._id, props.user.user._id, 'dislike');
  
      if (response.message === 'Action saved successfully') {
        if (dislikeactive) {
          setdislikeactive(false);
          setdislike(dislike - 1);
        } else {
          setdislikeactive(true);
          setdislike(dislike + 1);
          if (likeactive) {
            setlikeactive(false);
            setlike(like - 1);
          }
        }
      } else {
        // Handle error, such as displaying a message to the user
        console.error('Error disliking event:', response.message);
      }
    } catch (error) {
      console.error('Error disliking event:', error);
    }
  };


  const handleAddComment = async (event) => {
    event.preventDefault();
    if (newComment.trim() === '') {
      return;
    }

    try {
      // Create new comment
      const commentId = await createComment(props.details._id, props.user.user._id, newComment, props.user.user.userName);
      
      // Update local comments state by adding the new comment
      setComments((prevComments) => [
        ...prevComments,
        { id: commentId, userName: props.user.user.userName, content: [newComment] },
      ]);
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (props.details && Array.isArray(props.details.comments) && props.details.comments.length > 0) {
        const commentsData = [];
        for (const commentId of props.details.comments) {
          try {
            const comment = await getComment(commentId);
            commentsData.push(comment);
          } catch (error) {
            console.error(`Error fetching comment ${commentId} for event ${props.details._id}:`, error)
          }
        }
        setComments(commentsData.flat());
      }
    };

    setComments([]); // Clear comments before fetching new comments for the new event
    fetchComments();
  }, [props.details]);


  const details = props.details;
  
  

  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    imageUrl: "",
    rate: 0,
    description: "",
    like:'',
    dislike:''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateEvent(props.details._id, editForm)
    setTimeout(() => {
      props.updateNewEvents(true)
    }, 1500)
    props.set(false)
  };

  const handleDelete = () => {
    deleteEvent(props.details._id, props.user.user._id)
    setTimeout(() => {
      props.updateNewEvents(true)
    }, 1500)
    props.set(false)
  };

  const loaded = () => {
    const renderStars = (rating) => {
      const stars = [];
      for (let i = 0; i < rating; i++) {
        stars.push(<FaStar key={i} />);
      }
      return stars;
    };


    return (
      <>
        <h1>{details.name}</h1>
        <div className='show-button'>
        <button onClick={handleLike} className='like-button'> Like ({like}) </button>
        <button onClick={handleDislike} className='dislike-button'>Dislike ({dislike}) </button>
        </div>
        <h2>{details.address}</h2>
        <img
          className="form-image"
          src={details.imageUrl}
          alt={details.name}
        />
        <h2>{details.description}</h2>
        <div className="rate">{renderStars(details.rate)}</div>
        <div>
      
    </div>

    <div className="comment-section">
        <h3>Comments:</h3>
        {comments.map((comment, index) => (
          <div key={index} className="content">
            <p>{comment.userName}: {comment.content[0]}</p>
          </div>
        ))}
        <form onSubmit={handleAddComment}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button className='add-button' type="submit">ADD</button>
        </form>
        </div>
      </>
    );
  };

  const loading = () => {
    return <h1>Loading ...</h1>;
  };

  useEffect(() => {
    if (details) {
      setEditForm(details);
    }
  }, [details]);

  if (!props.show) {
    return null;
  }

  return (
    <div className="event-container" ref={ref}>
      {details ? loaded() : loading()}
      {props.user.user._id === props.details.userId && (
        <>
          <button id="delete" onClick={handleDelete}>
            DELETE
          </button>
          <form onSubmit={handleSubmit}>
            <h3>EventName:</h3>
            <input
              type="text"
              value={editForm.name}
              name="name"
              placeholder="name"
              onChange={handleChange}
            />
            <h3>Address:</h3>
            <input
              type="text"
              value={editForm.address}
              name="address"
              placeholder="address"
              onChange={handleChange}
            />
            <h3>Description:</h3>
            <input
              type="text"
              value={editForm.description}
              name="description"
              placeholder="description"
              onChange={handleChange}
            />
            <input
              type="hidden"
              value={editForm.rate}
              name="rate"
            />
            <h3>Rating:</h3>
            <div className='show-rating'>
              <select
                value={editForm.rate}
                onChange={(e) => setEditForm((prevState) => ({ ...prevState, rate: parseInt(e.target.value) }))}
              >
                <option value="">Select a rating</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <input type="submit" value="Update Event" />
          </form>
        </>
      )}
    </div>
  );
});



EventModal.displayName = 'EventModal'; 
export default EventModal;
