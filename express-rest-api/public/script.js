document.addEventListener('DOMContentLoaded', () => {
    const movieContainer = document.getElementById('movie-container');
    const messageContainer = document.getElementById('message-container');
    const filterCheckboxes = document.querySelectorAll('.sidebar input[type="checkbox"]');
    const applyFiltersButton = document.getElementById('apply-filters');

    let allMovies = [];

    // Enhanced message display function
    const showMessage = (msg, type = 'info') => {
        messageContainer.textContent = msg;
        messageContainer.className = `show ${type}`;

        if (type !== 'error') {
            setTimeout(() => {
                messageContainer.className = '';
            }, 5000);
        }
    };

    const fetchMovies = (genres = []) => {
        // Check if genres are passed and format the URL
        const url = genres.length ? `/movies?genre=${encodeURIComponent(genres.join(','))}` : '/movies';
        showMessage('⌛ Loading movies...', 'info');

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(movies => {
                allMovies = movies;
                renderMovies(movies);
                if (movies.length === 0) {
                    showMessage('No movies found matching your criteria', 'warning');
                } else {
                    messageContainer.className = ''; // Clear loading message
                }
            })
            .catch(err => {
                console.error('Error fetching movies:', err);
                showMessage('⚠️ Failed to load movies. Please try again later.', 'error');
            });
    };

    const renderMovies = moviesToRender => {
        movieContainer.innerHTML = '';

        // Create a single container for all movies
        const moviesWrapper = document.createElement('div');
        moviesWrapper.className = 'movies';

        moviesToRender.forEach(({ id, title, actors, price, imageUrl, genre }) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p class="genre">${genre}</p>
                    <p class="actors">${actors.join(', ')}</p>
                    <div class="movie-meta">
                        <span class="price">₱${price}</span>
                    </div>
                    <button class="buy-ticket-btn" 
                            data-movie-id="${id}" 
                            data-movie-title="${title}">
                        Buy Tickets
                    </button>
                </div>
            `;
            moviesWrapper.appendChild(card);
        });

        movieContainer.appendChild(moviesWrapper);

        // Add event listeners to buy buttons
        document.querySelectorAll('.buy-ticket-btn').forEach(btn => {
            btn.addEventListener('click', handleBuyTicket);
        });
    };

    const handleBuyTicket = ({ target }) => {
        const { movieId, movieTitle } = target.dataset;

        const modal = document.getElementById('booking-modal');
        const modalTitle = document.getElementById('modal-movie-title');
        const nameInput = document.getElementById('customer-name');
        const confirmBtn = document.getElementById('confirm-booking-btn');
        const closeBtn = document.querySelector('.close-button');
        const modalMsg = document.getElementById('modal-message');

        modalTitle.textContent = movieTitle;
        nameInput.value = '';
        modalMsg.textContent = '';
        modalMsg.className = '';
        modal.style.display = 'block';

        const closeModal = () => {
            modal.style.display = 'none';
        };

        const handleBookingResponse = (response) => {
            modalMsg.textContent = response.message;
            modalMsg.className = 'show success';
            setTimeout(closeModal, 2000);
        };

        const handleBookingError = (error) => {
            console.error('Booking error:', error);
            modalMsg.textContent = error?.error || error?.message || 'Booking failed';
            modalMsg.className = 'show error';
        };

        confirmBtn.onclick = () => {
            const customerName = nameInput.value.trim();
            if (!customerName) {
                modalMsg.textContent = '⚠️ Please enter your name';
                modalMsg.className = 'show warning';
                return;
            }

            fetch('/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    movieId: parseInt(movieId), 
                    customerName 
                })
            })
            .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
            .then(handleBookingResponse)
            .catch(handleBookingError);
        };

        closeBtn.onclick = closeModal;
        window.onclick = e => e.target === modal && closeModal();
    };

    applyFiltersButton.addEventListener('click', () => {
        const selectedGenres = Array.from(filterCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Now call fetchMovies with the selected genres for backend filtering
        fetchMovies(selectedGenres);
    });

    // Initial load
    fetchMovies();
});
