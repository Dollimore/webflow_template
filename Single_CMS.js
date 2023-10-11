mapboxgl.accessToken = 'pk.eyJ1IjoiZG9sbGltb3JlIiwiYSI6ImNsbHN4OTZqbzB5eXczb25yM3E3Zjl5cmcifQ.qBDX98UCpc4gkJ_mSIcNig';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dollimore/cln78fz56007501puejoo5bke',
    center: [153.0260, -27.4705],
    zoom: 9.5,
    preserveDrawingBuffer: true
});

let currentCardId = null;
let currentCardPopup = null;
let currentIconPopup = null;

let imgURL
let imgElement;
let imgIcon;
let places = [];

const getCardData = () => {
    const cardLinks = document.querySelectorAll('.location-list #listing_card');
    const cards = [];

    cardLinks.forEach(link => {
        const id = link.getAttribute('data-id');
        cards.push({ id });
    });

    return cards;
};

const handleCardHover = (id) => {
    const location = places.find(place => place.id === id);
    if (location) {
        const coordinates = [location.lng, location.lat];
        const description = location.description;
        const currentZoom = map.getZoom(); // Get the current zoom level

        if (currentIconPopup) {
            currentIconPopup.remove();
            currentIconPopup = null;
        }

        if (currentCardPopup) {
            currentCardPopup.remove();
            currentCardPopup = null;
        }

        // Specify the minimum zoom level at which you want to zoom in
        const minZoomToZoomIn = 14;

        if (currentZoom < minZoomToZoomIn) {
            // Zoom in to the specified level and then fly to the location
            map.flyTo({ center: coordinates, zoom: minZoomToZoomIn, speed: 0.6 });
        } else {
            // Just fly to the location without changing the zoom level
            map.flyTo({ center: coordinates, speed: 0.6 });
        }

        currentCardId = id;
        currentCardPopup = new mapboxgl.Popup({ maxWidth: '300px' })
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    }
};

const handleCardMouseLeave = () => {
    if (currentCardPopup) {
        currentCardPopup.remove();
        currentCardPopup = null;
        currentCardId = null;
    }
};

const handleMapIconPopupClose = () => {
    if (currentIconPopup) {
        currentIconPopup.remove();
        currentIconPopup = null;
    }
};

const cardsData = getCardData();

const getLocationData = () => {
    const locationElements = document.querySelectorAll('.location-listings #listing_card');
    places = [];

    locationElements.forEach(element => {
        const id = element.getAttribute('data-id');
        const lat = element.getAttribute('data-lat'); // Keep as string
        const lng = element.getAttribute('data-lng'); // Keep as string
        const address = element.getAttribute('data-addy'); // String type
        const price = element.getAttribute('data-price');
        const bed = element.getAttribute('data-bed');
        const bath = element.getAttribute('data-bath');
        
        imgElement = element.querySelector('#popupImg img'); // Select the image element
        imgURL = imgElement ? imgElement.getAttribute('src') : ''; // Get the image URL

        icon = element.querySelector('#iconImg'); 
        imgIcon = icon ? icon.getAttribute('src') : '';
        
        const slug = element.getAttribute('data-link');
        
        const description = `
            <a href= "for-sale/${slug}" target="_blank" style="outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;">
                <div class="divBox" style="outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;">
                    <img src="${imgURL}" loading="eager" alt="thumbnail" class="popup-image" style="max-height: 190px; max-width: 240px;">
                    <div class="lAddress" data-content="${address}" style="line-height: 0.7; padding: 5px"; outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;>
                        <strong>${address}</strong>
                    </div>
                    <p class="p1" style="line-height: 0.7; padding: 5px">${price}</p>
                </div>
            </a>
        `;

        if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            places.push({ id, lat, lng, address, price, imgElement, imgURL, description, imgIcon });
        }
    });
    return places;
};

const updateMapData = () => {
    places = getLocationData();

    // Load the image using the imgIcon URL
    map.loadImage(imgIcon, (error, customImage) => {
        if (error) throw error;

        // Remove the existing 'custom-icon' image if it already exists
        if (map.hasImage('custom-icon')) {
            map.removeImage('custom-icon');
        }

        // Add the updated image with the same name 'custom-icon'
        map.addImage('custom-icon', customImage);

        // Update the 'places' source data to use the updated image
        map.getSource('places').setData({
            type: 'FeatureCollection',
            features: places.map(place => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [place.lng, place.lat]
                },
                properties: {
                    description: place.description,
                    icon: 'custom-icon' // Use the updated 'custom-icon'
                }
            }))
        });
    });
};


map.on('load', () => {
    places = getLocationData();

    map.loadImage(imgIcon, (error, customImage) => {
        if (error) throw error;

        map.addImage('custom-icon', customImage);

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
                        icon: 'custom-icon' 
                    }
                }))
            }
        });

        map.addLayer({
            id: 'custom-marker-layer',
            type: 'symbol',
            source: 'places', 
            layout: {
                'icon-image': ['get', 'icon'],
                'icon-allow-overlap': true,
                'icon-size': 0.25
            }
        });

        map.on('click', 'custom-marker-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            const isPopup = e.originalEvent.target.classList.contains('mapboxgl-popup-content');
            const currentZoom = map.getZoom(); // Get the current zoom level

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            if (currentCardPopup) {
                currentCardPopup.remove();
                currentCardPopup = null;
                currentCardId = null;
            }

            const popup = new mapboxgl.Popup({ maxWidth: '300px' })
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);

            currentIconPopup = popup;
            popup.on('close', () => {
                currentIconPopup = null;
            });

            // Specify the minimum zoom level at which you want to zoom in
            const minZoomToZoomIn = 14;

            if (currentZoom < minZoomToZoomIn) {
                // Zoom in to the specified level and then fly to the location
                map.flyTo({ center: coordinates, zoom: minZoomToZoomIn, speed: 0.7 });
            } else {
                // Just fly to the location without changing the zoom level
                map.flyTo({ center: coordinates, speed: 0.7 });
            }
        });


        const cardLinks = document.querySelectorAll('.location-listings #listing_card');
        cardLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const id = link.getAttribute('data-id');
                handleCardHover(id);
            });
            link.addEventListener('mouseleave', () => {
                handleCardMouseLeave();
            });

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('data-id');
                handleCardClick(id);
            });
        });
    });
});

const listingsCountElement = document.getElementById('resultsCount');

// Function to handle changes in the text content
const handleTextContentChange = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target === listingsCountElement) {
            updateMapData();
        }
    }
};

// Create a MutationObserver instance
const observer = new MutationObserver(handleTextContentChange);

// Configure the observer to watch for changes in the text content
const observerConfig = { childList: true, subtree: true };

// Start observing the target element
observer.observe(listingsCountElement, observerConfig);
