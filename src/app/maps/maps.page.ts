
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  private dataService = inject(DataService);
  private router = inject(Router);

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
        this.map = L.map('map').setView(
          [-7.7956, 110.3695],
          13
        );

        // Basemap OpenStreetMap
        const osm = L.tileLayer(
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

      }, 200);
    }
  }

  async loadPoints() {
    const points: any = await this.dataService.getPoints();

    if (!points) return;

    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];

        const coordinates = point.coordinates
          .split(',')
          .map((c: string) => parseFloat(c));

        const marker = L.marker(
          coordinates as L.LatLngExpression
        ).addTo(this.map);

        // Popup nama, keterangan, Edit, dan Delete
        marker.bindPopup(`
          <div class="point-popup">
            <strong>${point.name || 'Tanpa Nama'}</strong>

           ${point.description ? `<p class="point-description">${point.description}</p>` : ''}

            <div class="popup-actions">
              <button class="edit-link" data-key="${key}" title="Edit">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>

              <button class="delete-link" data-key="${key}" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `);
      }
    }

    // Event tombol pada popup
    this.map.on('popupopen', (e) => {
      const popup = e.popup;
      const popupElement = popup.getElement();

      if (!popupElement) return;

      const editButton =
        popupElement.querySelector<HTMLButtonElement>('.edit-link');

      const deleteButton =
        popupElement.querySelector<HTMLButtonElement>('.delete-link');

      // Tombol Edit
      editButton?.addEventListener('click', () => {
        const key = editButton.dataset['key'];

        if (key) {
          this.router.navigate(['/editpoint', key]);
        }
      });

      // Tombol Delete
      deleteButton?.addEventListener('click', async (event) => {
        event.preventDefault();

        const key = deleteButton.dataset['key'];

        if (key) {
          await this.deletePoint(key, popup.getLatLng());
          this.map.closePopup();
        }
      });
    });
  }

  async deletePoint(
    key: string,
    latLng: L.LatLng | undefined
  ) {
    await this.dataService.deletePoint(key);

    if (latLng) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          if (layer.getLatLng().equals(latLng)) {
            this.map.removeLayer(layer);
          }
        }
      });
    }
  }
}
