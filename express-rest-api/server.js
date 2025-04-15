const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

let movies = [
    { id: 1, title: 'Toy Story', genre: 'Animation', price: 299, actors: ['Tom Hanks', 'Tim Allen'], imageUrl: '/images/Toy_Story.jpg' },
    { id: 2, title: '10 Things I Hate About You', genre: 'Romantic Comedy', price: 349, actors: ['Heath Ledger', 'Julia Stiles'], imageUrl: '/images/10 Things I Hate About You.jpg' },
    { id: 3, title: 'Blade Runner 2049', genre: 'Science Fiction', price: 399, actors: ['Ryan Gosling', 'Harrison Ford'], imageUrl: '/images/Blade Runner 2049.jpg' },
    { id: 4, title: 'How to Lose a Guy in 10 Days', genre: 'Romantic Comedy', price: 299, actors: ['Kate Hudson', 'Matthew McConaughey'], imageUrl: '/images/How to Lose a Guy in 10 Days.jpg' },
    { id: 5, title: 'Up', genre: 'Animation', price: 249, actors: ['Ed Asner', 'Jordan Nagai'], imageUrl: '/images/Up.jpg' },
    { id: 6, title: 'Inception', genre: 'Science Fiction', price: 449, actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'], imageUrl: '/images/Inception.jpg' },
    { id: 7, title: 'Pretty Woman', genre: 'Romantic Comedy', price: 349, actors: ['Richard Gere', 'Julia Roberts'], imageUrl: '/images/Pretty Woman.jpg' },
    { id: 8, title: 'Frozen', genre: 'Animation', price: 349, actors: ['Idina Menzel', 'Kristen Bell'], imageUrl: '/images/Frozen.jpg' },
    { id: 9, title: 'Interstellar', genre: 'Science Fiction', price: 449, actors: ['Matthew McConaughey', 'Anne Hathaway'], imageUrl: '/images/Interstellar.jpg' },
    { id: 10, title: 'Finding Nemo', genre: 'Animation', price: 299, actors: ['Albert Brooks', 'Ellen DeGeneres'], imageUrl: '/images/Finding Nemo.jpg' },
    { id: 11, title: 'Notting Hill', genre: 'Romantic Comedy', price: 399, actors: ['Julia Roberts', 'Hugh Grant'], imageUrl: '/images/Notting Hill.jpg' },
    { id: 12, title: 'The Matrix', genre: 'Science Fiction', price: 349, actors: ['Keanu Reeves', 'Laurence Fishburne'], imageUrl: '/images/The-Matrix.jpg' },
    { id: 13, title: 'Coco', genre: 'Animation', price: 349, actors: ['Anthony Gonzalez', 'Gael García Bernal'], imageUrl: '/images/Coco.jpeg' },
    { id: 14, title: 'La La Land', genre: 'Romantic Comedy', price: 449, actors: ['Emma Stone', 'Ryan Gosling'], imageUrl: '/images/La La Land.jpg' },
    { id: 15, title: 'The Martian', genre: 'Science Fiction', price: 399, actors: ['Matt Damon', 'Jessica Chastain'], imageUrl: '/images/The Martian.jpg' },
  ];

  movies = movies.map(movie => ({ ...movie, seatsAvailable: 10 }));


let bookings = [];
let nextBookingId = 1;

// GET /movies: List available movies (with optional genre filtering)
app.get('/movies', (req, res) => {
    const { genre } = req.query;

    let filteredMovies = movies;
    if (genre) {
        const genreList = genre.split(',').map(g => g.trim()); 
        filteredMovies = movies.filter(m => genreList.includes(m.genre));
    }

    res.json(filteredMovies);
});


// POST /book: Book a ticket
app.post('/book', (req, res) => {
    const { movieId, customerName } = req.body;

    // Validate required fields
    if (!movieId || !customerName) {
        return res.status(400).json({ error: 'Movie ID and customer name are required' });
    }

    // Ensure movieId is an integer
    const movieIdInt = parseInt(movieId);
    if (isNaN(movieIdInt)) {
        return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const movie = movies.find(m => m.id === movieIdInt);

    // Check if movie exists
    if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
    }

    // Prevent duplicate bookings for the same movie and customer
    const existingBooking = bookings.find(b => b.movieId === movieIdInt && b.customerName === customerName);
    if (existingBooking) {
        return res.status(400).json({ error: 'Customer has already booked this movie' });
    }

    // Check if seats are available
    if (movie.seatsAvailable > 0) {
        bookings.push({ id: nextBookingId++, movieId: movieIdInt, customerName, bookingDate: new Date() });
        movie.seatsAvailable--;
        res.json({ message: `Booked ${movie.title} for Customer: ${customerName}` });
    } else {
        res.status(400).json({ error: 'No seats available for this movie' });
    }
});


// GET /bookings: View all booked tickets
app.get('/bookings', (req, res) => {
    const bookingDetails = bookings.map(booking => {
        const movie = movies.find(m => m.id === booking.movieId);
        return {
            id: booking.id,
            movieTitle: movie ? movie.title : 'Unknown Movie',
            customerName: booking.customerName,
            bookingDate: booking.bookingDate
        };
    });
    res.json(bookingDetails);
});


// DELETE /cancel/:id: Cancel a booking
app.delete('/cancel/:id', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    const cancelledBooking = bookings.splice(bookingIndex, 1)[0];
    const movie = movies.find(m => m.id === cancelledBooking.movieId);
    if (movie) {
        movie.seatsAvailable++;
    }

    res.json({ message: `Booking ${bookingId} cancelled successfully` });
});

// --- Serve the HTML page ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});