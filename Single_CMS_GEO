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

let imgURL;
let imgElement;
let imgIcon;
let places = [];

const geocodeAddress = (address, callback) => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const coordinates = data.features[0].center;
                const [longitude, latitude] = coordinates;
                callback(latitude, longitude);
            } else {
                console.error('Geocoding failed. Address not found.');
            }
        })
        .catch(error => {
            console.error('Geocoding failed:', error);
        });
};

const getCardData = () => {
    const cardLinks = document.querySelectorAll('.location-listings #listing_card');
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
        const currentZoom = map.getZoom();

        if (currentIconPopup) {
            currentIconPopup.remove();
            currentIconPopup = null;
        }

        if (currentCardPopup) {
            currentCardPopup.remove();
            currentCardPopup = null;
        }

        const minZoomToZoomIn = 14;

        if (currentZoom < minZoomToZoomIn) {
            map.flyTo({ center: coordinates, zoom: minZoomToZoomIn, speed: 0.6 });
        } else {
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
        
        const price = element.getAttribute('data-price');
        const bed = element.getAttribute('data-bed');
        const bath = element.getAttribute('data-bath');
				const name = element.getAttribute('data-name'); 
        const address = element.getAttribute('data-addy'); 
        
        imgElement = element.querySelector('#popupImg img');
        imgURL = imgElement ? imgElement.getAttribute('src') : '';

        icon = element.querySelector('#iconImg');
        imgIcon = icon ? icon.getAttribute('src') : '';

        const slug = element.getAttribute('data-link');
				
                const description = `
            <a href= "for-sale/${slug}" target="_blank" style="outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;">
                <div class="divBox" style="outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;">
                    <img src="${imgURL}" loading="eager" alt="thumbnail" class="popup-image" style="max-height: 170px; max-width: 250px;">
                    <div class="lAddress" data-content="${name}" style="line-height: 0.7; padding: 5px"; outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;>
                        <strong>${name}</strong>
                    </div>
                    <p class="p1" style="line-height: 0.7; padding: 5px">${price}</p>
                </div>
            </a>
        `;
        geocodeAddress(address, (latitude, longitude) => {
            places.push({ id, lat: latitude, lng: longitude, address, price, imgElement, imgURL, imgIcon, description });
        });
    });

    return places;
};

const updateMapData = () => {
    places = getLocationData();

    map.loadImage(imgIcon, (error, customImage) => {
        if (error) throw error;

        if (map.hasImage('custom-icon')) {
            map.removeImage('custom-icon');
        }

        map.addImage('custom-icon', customImage);

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
                    icon: 'custom-icon'
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
            const currentZoom = map.getZoom();

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

            const minZoomToZoomIn = 14;

            if (currentZoom < minZoomToZoomIn) {
                map.flyTo({ center: coordinates, zoom: minZoomToZoomIn, speed: 0.7 });
            } else {
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

const handleTextContentChange = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target === listingsCountElement) {
            updateMapData();
        }
    }
};

const observer = new MutationObserver(handleTextContentChange);

const observerConfig = { childList: true, subtree: true };

observer.observe(listingsCountElement, observerConfig);



