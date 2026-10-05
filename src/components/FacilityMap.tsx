import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { useFacilities } from '../hooks/queries';
import { QueryState } from './QueryState';

const US_CENTER: [number, number] = [39.5, -98.35];

export function FacilityMap() {
  const query = useFacilities();
  const facilities = query.data ?? [];
  const mapped = facilities.filter((f) => f.latitude != null && f.longitude != null);

  return (
    <section aria-labelledby="facilities-title">
      <h2 id="facilities-title">Detention facilities</h2>
      <p className="lede">
        Facilities listed on ICE's{' '}
        <a href="https://www.ice.gov/detention-facilities" target="_blank" rel="noopener noreferrer">
          detention facilities
        </a>{' '}
        page. Select a marker for its address and field office.
      </p>
      <QueryState query={query}>
        <div className="card map-card">
          <MapContainer center={US_CENTER} zoom={4} scrollWheelZoom={false} className="map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapped.map((f) => (
              <CircleMarker
                key={f.id}
                center={[f.latitude!, f.longitude!]}
                radius={6}
                // A direct prop, not pathOptions: Leaflet only applies className at creation, not via setStyle().
                className="map-marker"
              >
                <Popup>
                  <strong>{f.name}</strong>
                  <br />
                  {f.address}
                  <br />
                  {[f.city, f.state].filter(Boolean).join(', ')} {f.zip}
                  {f.field_office && (
                    <>
                      <br />
                      <span className="muted">{f.field_office}</span>
                    </>
                  )}
                  {f.phone && (
                    <>
                      <br />
                      {f.phone}
                    </>
                  )}
                  <br />
                  <a href={f.source_url} target="_blank" rel="noopener noreferrer">
                    ICE facility page ↗
                  </a>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        {mapped.length < facilities.length && (
          <p className="muted small">
            {facilities.length - mapped.length} of {facilities.length} facilities aren't on the map yet because their
            addresses haven't been geocoded.
          </p>
        )}
      </QueryState>
    </section>
  );
}
