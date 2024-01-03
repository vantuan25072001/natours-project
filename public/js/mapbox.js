/* eslint-disable no-undef */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = process.env.YOUR_MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

console.log(map);
