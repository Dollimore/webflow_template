// Initialize Mapbox GL

mapboxgl.accessToken = 'your token here';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [173.011002, -41.110100],
    zoom: 4.9
});

// Declare places array globally
let places = [];

// Declare a variable to store the current card id being hovered
let currentCardId = null;

// Declare a variable to store the current card popup
let currentCardPopup = null;

// Declare a variable to store the current map icon popup
let currentIconPopup = null;

let imgElement;

// Function to get card data
const getCardData = () => {
    const cardLinks = document.querySelectorAll('.location-list #Card');
    const cards = [];

    cardLinks.forEach(link => {
        const id = link.getAttribute('data-id');
        cards.push({ id });
    });

    return cards;
};

// Function to handle card hover
const handleCardHover = (id) => {
    // Find the corresponding location data by id
    const location = places.find(place => place.id === id);
    if (location) {
        const coordinates = [location.lng, location.lat];
        const description = location.description;

        // Close the current map icon popup if it's open
        if (currentIconPopup) {
            currentIconPopup.remove();
            currentIconPopup = null;
        }

        // Close the current card popup if it's open
        if (currentCardPopup) {
            currentCardPopup.remove();
            currentCardPopup = null;
        }

        // Create and display the card popup
        const popup = new mapboxgl.Popup({ maxWidth: '300px' })
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);

        // Fly to the clicked location with animation
        map.flyTo({ center: coordinates, zoom: 12, speed: 0.5 });

        // Store the current card id and popup
        currentCardId = id;
        currentCardPopup = popup;
    }
};

// Function to handle card mouseleave
const handleCardMouseLeave = () => {
    // Close the current card popup if it's open
    if (currentCardPopup) {
        currentCardPopup.remove();
        currentCardPopup = null;
        currentCardId = null;
    }
};

// Function to handle map icon popup close
const handleMapIconPopupClose = () => {
    if (currentIconPopup) {
        currentIconPopup.remove();
        currentIconPopup = null;
    }
};

// Call the getCardData function
const cardsData = getCardData();

// Now you can use the cardsData array
// console.log(cardsData);

let prprtyLnk;

// Function to get location data
const getLocationData = () => {
    const locationElements = document.querySelectorAll('#location-data .location');
    places = [];

    locationElements.forEach(element => {
        const id = element.getAttribute('data-id');
        const lat = element.getAttribute('data-lat'); // Keep as string
        const lng = element.getAttribute('data-lng'); // Keep as string
        const address = element.getAttribute('data-addy'); // String type
        const price = element.getAttribute('data-price');
        const city = element.getAttribute('data-city');
        imgElement = element.querySelector('#popup-img img'); // Select the image element
        const imgURL = imgElement ? imgElement.getAttribute('src') : ''; // Get the image URL

        prprtyLnk = element.getAttribute('data-link');
        
        const description = `
            <div>
                <img src="${imgURL}" alt="Image Alt Text" class="popup-image" style="max-height: 190px; max-width: 240px;">
                <div class="lAddress" data-content="${address}" style="line-height: 0.7; padding: 5px"; outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;>
                    <strong><a href="${prprtyLnk}" target="_blank">${address}</a></strong>
                </div>
                <p class="p1" style="line-height: 0.7; padding: 5px">${price}</p>
                <p class="p1" style="line-height: 0.7; padding: 5px; margin-bottom: 20px">${city}</p>
            </div>
        `;

        if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            places.push({ id, lat, lng, address, price, city, imgElement, imgURL, prprtyLnk, description });
        }
    });
    return places;
};
console.log(imgElement);

// Add data to the map when it loads
map.on('load', () => {
    places = getLocationData();
    // console.log('places:', places); // Log places to check if data is present

    map.addSource('places', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: places.map(place => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [place.lng, place.lat]
                },
                properties: {
                    description: place.description,
                    icon: "border-dot-13" // Use the "icon" property from the location data
                }
            }))
        }
    });

    map.addLayer({
        id: 'places-layer',
        type: 'symbol',
        source: 'places',
        layout: {
            'icon-image': ['get', 'icon'],
            'icon-allow-overlap': true,
            'icon-size': 2.5
        }
    });

    map.on('click', 'places-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        const isPopup = e.originalEvent.target.classList.contains('mapboxgl-popup-content');

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Close the current card popup if it's open
        if (currentCardPopup) {
            currentCardPopup.remove();
            currentCardPopup = null;
            currentCardId = null;
        }

        // Create and display the map icon popup
        const popup = new mapboxgl.Popup({ maxWidth: '300px' })
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);

        // Store the current map icon popup and add a close event listener
        currentIconPopup = popup;
        popup.on('close', () => {
            currentIconPopup = null;
        });

        // Fly to the clicked location
        map.flyTo({ center: coordinates, zoom: 12 });
    });

    const handleCardClick = (id) => {
        // Find the corresponding location data by id
        const location = places.find(place => place.id === id);
        if (location) {
            const prprtyLnk = location.prprtyLnk;
            if (prprtyLnk) {
                // Open the property link in a new tab or window
                window.open(prprtyLnk, '_blank', 'noopener noreferrer');
            }
        }
    };
    
    // Add hover event listeners to cards
    const cardLinks = document.querySelectorAll('.location-list #Card');
    cardLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const id = link.getAttribute('data-id');
            handleCardHover(id);
        });

        link.addEventListener('mouseleave', () => {
            handleCardMouseLeave();
        });

        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default click behavior
            const id = link.getAttribute('data-id');
            handleCardClick(id);
        });
    });
});

        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: places.map(place => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [place.lng, place.lat]
                },
                properties: {
                    description: place.description,
                    icon: "border-dot-13" // Use the "icon" property from the location data
                }
            }))
        }
    });

    map.addLayer({
        id: 'places-layer',
        type: 'symbol',
        source: 'places',
        layout: {
            'icon-image': ['get', 'icon'],
            'icon-allow-overlap': true,
            'icon-size': 2.5
        }
    });

    map.on('click', 'places-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        const isPopup = e.originalEvent.target.classList.contains('mapboxgl-popup-content');

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Close the current card popup if it's open
        if (currentCardPopup) {
            currentCardPopup.remove();
            currentCardPopup = null;
            currentCardId = null;
        }

        // Create and display the map icon popup
        const popup = new mapboxgl.Popup({ maxWidth: '300px' })
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);

        // Store the current map icon popup and add a close event listener
        currentIconPopup = popup;
        popup.on('close', () => {
            currentIconPopup = null;
        });

            // Fly to the clicked location
            map.flyTo({ center: coordinates, zoom: 12 });
        });

    const handleCardClick = (id) => {
        // Find the corresponding location data by id
        const location = places.find(place => place.id === id);
        if (location) {
            const prprtyLnk = location.prprtyLnk;
            if (prprtyLnk) {
                // Open the property link in a new tab or window
                window.open(prprtyLnk, '_blank', 'noopener noreferrer');
            }
        }
    };
    
    // Add hover event listeners to cards
    const cardLinks = document.querySelectorAll('.location-list #Card');
    cardLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const id = link.getAttribute('data-id');
            handleCardHover(id);
        });

        link.addEventListener('mouseleave', () => {
            handleCardMouseLeave();
        });

        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default click behavior
            const id = link.getAttribute('data-id');
            handleCardClick(id);
        });
    });
});
