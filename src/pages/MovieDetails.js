import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, ListGroup, Form, Alert, Spinner } from "react-bootstrap";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMovieDetails();
    fetchMovieComments();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const res = await fetch(`https://movieapp-api-lms1.onrender.com/movies/getMovie/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch movie details. Status: ${res.status}`);

      const data = await res.json();
      setMovie(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieComments = async () => {
    try {
      const res = await fetch(`https://movieapp-api-lms1.onrender.com/movies/getComments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch comments. Status: ${res.status}`);

      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    setCommentError(null);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setCommentError("You must be logged in to add comments.");
      return;
    }

    try {
      const res = await fetch(`https://movieapp-api-lms1.onrender.com/movies/addComment/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, comment: newComment }),
      });

      if (!res.ok) throw new Error(`Failed to add comment. Status: ${res.status}`);

      const data = await res.json();
      setComments([...data.updatedMovie.comments]);
      setNewComment("");
    } catch (error) {
      setCommentError(error.message);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Loading movie details...</p>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger" className="text-center mt-5">{error}</Alert>;
  }

  return (
    <Container className="my-5">
      <Card>
        <Card.Body>
          {movie ? (
            <>
              <Card.Title>{movie.title}</Card.Title>
              <Card.Text><strong>Genre:</strong> {movie.genre}</Card.Text>
              <Card.Text><strong>Director:</strong> {movie.director}</Card.Text>
              <Card.Text><strong>Release Year:</strong> {movie.year}</Card.Text>
              <Card.Text><strong>Description:</strong> {movie.description}</Card.Text>
            </>
          ) : (
            <p className="text-center mt-5">Movie details are loading...</p>
          )}
        </Card.Body>
      </Card>

      <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
        Go Back
      </Button>

      <h2 className="mt-4">Comments</h2>
      <ListGroup>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <ListGroup.Item key={index}>{comment?.comment || "No text provided"}</ListGroup.Item>
          ))
        ) : (
          <p>No comments available</p>
        )}
      </ListGroup>

      {commentError && <Alert variant="danger" className="mt-3">{commentError}</Alert>}

      <Form onSubmit={addComment} className="mt-4">
        <Form.Group>
          <Form.Label>Add a Comment</Form.Label>
          <Form.Control
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-2">Submit</Button>
      </Form>
    </Container>
  );
}
