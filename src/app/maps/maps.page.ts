import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {

  map!: L.Map;

  constructor() { }

  ngOnInit() {

    // Konfigurasi ikon marker
    const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
    const iconUrl = 'assets/icon/marker-icon.png';
    const shadowUrl = 'assets/icon/marker-shadow.png';

    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;

    if (!this.map) {
      setTimeout(() => {

        // Membuat peta
        this.map = L.map('map').setView([-7.7956, 110.3695], 13);

        // Basemap OpenStreetMap
        var osm = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors'
          }
        );

        osm.addTo(this.map);

        // Marker Yogyakarta
        L.marker([-7.7956, 110.3695])
          .addTo(this.map)
          .bindPopup('Yogyakarta')
          .openPopup();

        this.loadPoints();

      });
    }
  }

  private dataService = inject(DataService);
  async loadPoints() {
    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates =
          point.coordinates.split(',').map((c: string) =>
            parseFloat(c));
        const marker = L.marker(coordinates as
          L.LatLngExpression).addTo(this.map);
        marker.bindPopup(`${point.name}`);
      }
    }
    this.map.on('popupopen', (e) => {
      const popup = e.popup;
    });
  }
}
