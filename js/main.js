// Global state variables
let page = 1;                 // Track the current page (default = 1)
const perPage = 10;           // Constant value: how many listings per page
let searchName = null;        // Current search value; null means no predefined search

// Base URL for our published API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://lab01-howtokys-projects.vercel.app";

// Function: loadListingsData()
// This function makes a fetch request to our API to obtain listings data based on
// the current page, perPage, and searchName values.
function loadListingsData() {
    let url = `${API_BASE_URL}/api/listings?page=${page}&perPage=${perPage}`;
    if (searchName) {
        url += `&name=${encodeURIComponent(searchName)}`;
    }

    fetch(url)
        .then(res => {
            console.log("Response Status:", res.status); // Log response status
            return res.ok ? res.json() : Promise.reject(res.status);
        })
        .then(data => {
            console.log("Fetched Data:", data); // Log fetched data
            const tbody = document.querySelector("#listingsTable tbody");
            tbody.innerHTML = ""; // Clear existing rows

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(listing => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', listing._id);
                    row.innerHTML = `
                        <td>${listing.name}</td>
                        <td>${listing.room_type}</td>
                        <td>${listing.address ? `${listing.address.street}, ${listing.address.city}, ${listing.address.country}` : "N/A"}</td>
                        <td>
                            ${listing.summary ? listing.summary : ""}<br><br>
                            <strong>Accommodates:</strong> ${listing.accommodates}<br>
                            <strong>Rating:</strong> ${listing.review_scores && listing.review_scores.review_scores_rating ? listing.review_scores.review_scores_rating : "N/A"} (${listing.number_of_reviews})
                        </td>
                    `;
                    // Add click event listener to the row
                    row.addEventListener('click', () => showListingDetails(listing));
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="4"><strong>No data available</strong></td></tr>`;
                if (page > 1) {
                    page--; // Prevent going to a non-existent page
                }
            }
            document.getElementById("current-page").innerText = `Page ${page}`;
        })
        .catch(err => {
            console.error("Error fetching listings data:", err);
            const tbody = document.querySelector("#listingsTable tbody");
            tbody.innerHTML = `<tr><td colspan="4"><strong>Error fetching data</strong></td></tr>`;
        });
}

// Function to show listing details
function showListingDetails(listing) {
    // Populate the modal with listing details
    const detailsSection = document.getElementById("listingDetails");
    detailsSection.innerHTML = `
        <h2>${listing.name}</h2>
        <img src="${listing.images.picture_url}" alt="${listing.name}" style="width: 100%; height: auto; max-height: 500px; margin-bottom: 15px;">
        <p>${listing.neighborhood_overview ? listing.neighborhood_overview : "No neighborhood overview available."}</p>
        <p><strong>Price:</strong> $${listing.price.toFixed(2)}</p>
        <p><strong>Room Type:</strong> ${listing.room_type}</p>
        <p><strong>Bed Type:</strong> ${listing.bed_type} (${listing.beds} beds)</p>
        <p><strong>Accommodates:</strong> ${listing.accommodates}</p>
    `;

    // Show the modal using Bootstrap's modal method
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show(); // Show the modal
}

// Ensure the DOM is loaded before adding event listeners and invoking our functions.
document.addEventListener("DOMContentLoaded", function () {
    // Initial load of listings data.
    loadListingsData();

    // Event listener for search form submission:
    document.getElementById("searchForm").addEventListener("submit", function (event) {
        event.preventDefault();
        searchName = document.getElementById("name").value.trim() || null;
        page = 1;
        loadListingsData();
    });

    // Event listener for "Clear" button:
    document.getElementById("clearForm").addEventListener("click", function () {
        document.getElementById("name").value = "";
        searchName = null;
        page = 1;
        loadListingsData();
    });

    // Pagination - Previous page button:
    document.getElementById("previous-page").addEventListener("click", function (event) {
        event.preventDefault();
        if (page > 1) {
            page--;
            loadListingsData();
        }
    });

    // Pagination - Next page button:
    document.getElementById("next-page").addEventListener("click", function (event) {
        event.preventDefault();
        page++;
        loadListingsData();
    });
});