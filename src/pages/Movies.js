import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import UserContext from "../UserContext";

export default function Movies() {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const isAdmin = localStorage.getItem("isAdmin") === "true"; 

  const [newMovie, setNewMovie] = useState({ title: "", director: "", genre: "", year: "", description: "" });
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch("https://movieapp-api-lms1.onrender.com/movies/getMovies", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.movies) setMovies(data.movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleChange = (e) => {
    setNewMovie({ ...newMovie, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setSelectedMovie({ ...selectedMovie, [e.target.name]: e.target.value });
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Access Denied: Only admins can add movies.");
    setLoading(true);

    try {
      const res = await fetch("https://movieapp-api-lms1.onrender.com/movies/addMovie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newMovie),
      });

      if (!res.ok) throw new Error("Failed to add movie");

      alert("Movie added successfully!");
      setShowAddModal(false);
      setNewMovie({ title: "", director: "", genre: "", year: "", description: "" });
      fetchMovies();
    } catch (error) {
      console.error("Error adding movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId) => {
    if (!isAdmin) return alert("Access Denied: Only admins can delete movies.");
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`https://movieapp-api-lms1.onrender.com/movies/deleteMovie/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Failed to delete movie");

      alert("Movie deleted successfully!");
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleEditClick = (movie) => {
    setSelectedMovie(movie);
    setShowEditModal(true);
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Access Denied: Only admins can update movies.");

    try {
      const res = await fetch(`https://movieapp-api-lms1.onrender.com/movies/updateMovie/${selectedMovie._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(selectedMovie),
      });

      if (!res.ok) throw new Error("Failed to update movie");

      alert("Movie updated successfully!");
      setShowEditModal(false);
      fetchMovies();
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  };

  return (
      <Container className="my-5">
        <h1 className="text-center mb-4">Movie Catalogue</h1>

        {isAdmin && (
          <Container className="mb-5 text-center">
            <Button variant="success" onClick={() => setShowAddModal(true)}>Add Movie</Button>
          </Container>
        )}

        {user.id ? (
          <Row>
            {movies.length > 0 ? (
              movies.map((movie) => (
                <Col md={4} key={movie._id} className="mb-4">
                  <Card>
                    <Card.Body>
                      <Card.Title>{movie.title}</Card.Title>
                      <Card.Text>{movie.genre} - {movie.year}</Card.Text>
                      <Button as={Link} to={`/movies/getMovie/${movie._id}`} variant="primary">
                        View Movie
                      </Button>
                      {isAdmin && (
                        <>
                          <Button onClick={() => handleEditClick(movie)} variant="warning" className="ms-2">
                            Edit
                          </Button>
                          <Button onClick={() => handleDelete(movie._id)} variant="danger" className="ms-2">
                            Delete
                          </Button>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-center">No movies available</p>
            )}
          </Row>
        ) : (
          <p className="text-center">Please log in to view movies.</p>
        )}

        {/* ✅ Add Movie Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add a New Movie</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddMovie}>
              {["title", "director", "genre", "year", "description"].map((field) => (
                <Form.Group key={field}>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control type="text" name={field} value={newMovie[field]} onChange={handleChange} required />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="success" onClick={handleAddMovie} disabled={loading}>
              {loading ? "Adding..." : "Add Movie"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Edit Movie Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Movie</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdateMovie}>
              {["title", "director", "genre", "year", "description"].map((field) => (
                <Form.Group key={field}>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control type="text" name={field} value={selectedMovie?.[field] || ""} onChange={handleEditChange} required />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="warning" onClick={handleUpdateMovie}>Update Movie</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }

