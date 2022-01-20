mapboxgl.accessToken = "pk.eyJ1IjoiaGVucnk5MTIyOSIsImEiOiJja3lrdTgxOGwyNnNqMzNxaGJ2cDc0ZGVnIn0.cUTZYaZJRBiQU8_ZC0Pn2g";
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-113.98096259497586, 51.08807858426377], // starting position [lng, lat]
    zoom: 13 // starting zoom    
});
// map.addControl(new mapboxgl.NavigationControl())

const pin = new mapboxgl.Marker()
    .setLngLat([-113.98096259497586, 51.08807858426377])
    .addTo(map)