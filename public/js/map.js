/* eslint-disable */

export function addMap(locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZG9jZW50Y2FmZWRyeSIsImEiOiJjbHVudmtuajgxaW1jMnBsbTRvMmh3MmRzIn0.HEnDE6EROVSGcHnmGlcbhw';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [locations[0].coordinates[0], locations[0].coordinates[1]], // starting position [lng, lat]
    zoom: 9, // starting zoom
    interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker(el, { anchor: 'bottom' })
      .setLngLat(location.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 30 }) // add popups
          .setHTML(`<h3>${location.description}</h3>`)
      )
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      right: 150,
      left: 150,
    },
  });
}
