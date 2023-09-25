mapboxgl.accessToken = 'your code here';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [173.011002, -41.110100],
    zoom: 4.5
});

let places = [];

let currentCardId = null;

let currentCardPopup = null;

let currentIconPopup = null;

let imgElement;

const getCardData = () => {
    const cardLinks = document.querySelectorAll('.location-list #Card');
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

        if (currentIconPopup) {
            currentIconPopup.remove();
            currentIconPopup = null;
        }

        if (currentCardPopup) {
            currentCardPopup.remove();
            currentCardPopup = null;
        }

        const popup = new mapboxgl.Popup({ maxWidth: '300px' })
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);

        map.flyTo({ center: coordinates, zoom: 12, speed: 0.5 });

        currentCardId = id;
        currentCardPopup = popup;
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

// console.log(cardsData);

let prprtyLnk;

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
            <a href="${prprtyLnk}" target="_blank" style="outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;">
                <div class="divBox" style="outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;">
                    <img src="${imgURL}" alt="Image Alt Text" class="popup-image" style="max-height: 190px; max-width: 240px;">
                    <div class="lAddress" data-content="${address}" style="line-height: 0.7; padding: 5px"; outline: 0 !important; box-shadow: 0 0 0 0 rgba(0, 0, 0, 0) !important;>
                        <strong>${address}</strong>
                    </div>
                    <p class="p1" style="line-height: 0.7; padding: 5px">${price}</p>
                    <p class="p1" style="line-height: 0.7; padding: 5px; margin-bottom: 20px">${city}</p>
                </div>
            </a>
        `;


        if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            places.push({ id, lat, lng, address, price, city, imgElement, imgURL, prprtyLnk, description });
        }
    });
    return places;
};

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
                    icon: "border-dot-13" 
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

        map.flyTo({ center: coordinates, zoom: 12 });
    });

    const handleCardClick = (id) => {
        const location = places.find(place => place.id === id);
        if (location) {
            const prprtyLnk = location.prprtyLnk;
            if (prprtyLnk) {
                window.open(prprtyLnk, '_blank', 'noopener noreferrer');
            }
        }
    };

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
            e.preventDefault(); 
            const id = link.getAttribute('data-id');
            handleCardClick(id);
        });
    });
});
