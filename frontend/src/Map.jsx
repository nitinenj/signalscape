import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-76.9426, 38.9897], // UMD College Park coords
      zoom: 13,
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
};

export default Map;
